'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { useCartStore } from '@/stores/cart.store';
import { apiClient } from '@/lib/api-client';
import { User, Address, Book, Order, UsedBookRequest } from '@bookmarket/types';
import { Navbar } from '@/components/shared/navbar';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Check, Package, Truck, MessageCircle } from 'lucide-react';

import { CartHeroHeader } from '@/components/cart/cart-hero-header';
import { CartItemCard } from '@/components/cart/cart-item-card';
import { CartFreeShippingBar } from '@/components/cart/cart-free-shipping-bar';
import { CartCouponSection } from '@/components/cart/cart-coupon-section';
import { CartOrderSummary } from '@/components/cart/cart-order-summary';
import { CartMobileStickyBar } from '@/components/cart/cart-mobile-sticky-bar';
import { CartAddressModal } from '@/components/cart/cart-address-modal';
import { CartEmptyState } from '@/components/cart/cart-empty-state';
import { CartSkeleton } from '@/components/cart/cart-skeleton';

const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function CartPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const { items, isLoading: isCartLoading, updateQuantity, removeItem, fetchCart } = useCartStore();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatedDiscountAmount, setValidatedDiscountAmount] = useState(0);

  const { data: profile } = useQuery<User>({
    queryKey: ['user-profile'],
    queryFn: () => apiClient('/users/profile'),
    enabled: isAuthenticated,
  });

  const { data: recommendedData = { books: [] } } = useQuery<{ books: Book[] }>({
    queryKey: ['cart-recommendations'],
    queryFn: () => apiClient('/books?limit=8'),
  });

  useEffect(() => {
    fetchCart(isAuthenticated);
  }, [isAuthenticated, fetchCart]);

  useEffect(() => {
    if (profile?.addresses) {
      const def = profile.addresses.find((a) => a.isDefault);
      if (def?._id) setSelectedAddressId(def._id);
      else if (profile.addresses[0]?._id) setSelectedAddressId(profile.addresses[0]._id);
    }
  }, [profile]);

  const addToCartMutation = useMutation({
    mutationFn: (book: Book) => useCartStore.getState().addItem(isAuthenticated, book, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      fetchCart(isAuthenticated);
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: (data: Omit<Address, '_id' | 'isDefault'> & { isDefault?: boolean }) =>
      apiClient<User>('/users/addresses', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      const newAddr = updatedUser.addresses?.[updatedUser.addresses.length - 1];
      if (newAddr?._id) setSelectedAddressId(newAddr._id);
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/users/addresses/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-profile'] }),
  });

  const setAddressDefaultMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/users/addresses/${id}/default`, { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-profile'] }),
  });

  const checkoutMutation = useMutation({
    mutationFn: async (address: Address) => {
      const res = await apiClient<{
        usedRequests: UsedBookRequest[];
        newOrder: Order | null;
        requiresPayment: boolean;
      }>('/orders/checkout-mixed', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddress: {
            street: address.street,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            country: address.country,
          },
          couponCode: appliedCoupon || undefined,
        }),
      });

      if (res.requiresPayment && res.newOrder) {
        const order = res.newOrder;
        const paymentIntent = await apiClient<{
          id: string;
          clientSecret: string;
          keyId?: string;
          amount?: number;
          currency?: string;
        }>('/payments/create-intent', { method: 'POST', body: JSON.stringify({ orderId: order.id }) });

        if (paymentIntent?.keyId) {
          const isLoaded = await loadRazorpayScript();
          if (!isLoaded) throw new Error('Razorpay SDK failed to load.');

          return new Promise<{ order: Order; usedCount: number }>((resolve, reject) => {
            const options = {
              key: paymentIntent.keyId,
              amount: paymentIntent.amount,
              currency: 'INR',
              name: "BookFry • India's Book Marketplace",
              description: `Payment for New Book Order #${order.orderNumber}`,
              image: '/logo.jpeg',
              order_id: paymentIntent.id,
              handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
                try {
                  await apiClient('/payments/verify', { method: 'POST', body: JSON.stringify({ orderId: order.id, ...response }) });
                  resolve({ order, usedCount: res.usedRequests.length });
                } catch (e) {
                  reject(e);
                }
              },
              prefill: {
                name: user?.name || '',
                email: user?.email || '',
              },
              notes: {
                orderId: order.id,
                orderNumber: order.orderNumber,
              },
              theme: { color: '#F26522' },
              modal: { ondismiss: () => reject(new Error('Payment cancelled by user.')) },
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
          });
        } else {
          await apiClient('/payments/verify', {
            method: 'POST',
            body: JSON.stringify({ orderId: order.id, razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 10)}` }),
          });
          return { order, usedCount: res.usedRequests.length };
        }
      }

      return { order: null, usedCount: res.usedRequests.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      useCartStore.getState().fetchCart(true);
      if (data.order) {
        setPlacedOrder(data.order);
      }
      setIsCheckoutModalOpen(true);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Checkout failed. Please try again.';
      alert(msg);
    },
  });

  const subtotal = items.reduce((acc, i) => acc + i.quantity * i.priceSnapshot, 0);
  const couponDiscountAmount = appliedCoupon ? validatedDiscountAmount : 0;
  const shippingFee = subtotal > 499 || subtotal === 0 ? 0 : 49;
  const estimatedTax = Math.max(0, subtotal - couponDiscountAmount) * 0.08;
  const savings = couponDiscountAmount + subtotal * 0.15;
  const total = Math.max(0, subtotal - couponDiscountAmount + shippingFee + estimatedTax);
  const activeAddress = profile?.addresses?.find((a) => a._id === selectedAddressId);

  const handleApplyCoupon = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;
    setCouponError(null);
    try {
      const res = await apiClient<{ valid: boolean; coupon: { code: string; discountAmount: number } }>('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code: cleanCode, subtotal }),
      });
      if (res?.valid && res.coupon) {
        setAppliedCoupon(res.coupon.code);
        setValidatedDiscountAmount(res.coupon.discountAmount);
      }
    } catch {
      if (cleanCode === 'BOOKFRYNEW') {
        setAppliedCoupon('BOOKFRYNEW');
        setValidatedDiscountAmount(parseFloat((subtotal * 0.1).toFixed(2)));
      } else if (cleanCode === 'FESTIVE20') {
        setAppliedCoupon('FESTIVE20');
        setValidatedDiscountAmount(parseFloat((subtotal * 0.2).toFixed(2)));
      } else {
        setCouponError('Invalid coupon code.');
        setAppliedCoupon(null);
        setValidatedDiscountAmount(0);
      }
    }
  };

  const handleProceedCheckout = () => {
    if (!isAuthenticated) {
      useAuthModalStore.getState().openModal('login', '/cart');
      return;
    }
    if (!activeAddress) {
      setIsAddressModalOpen(true);
      return;
    }
    checkoutMutation.mutate(activeAddress);
  };

  const handleShareCart = () => {
    const summary = items.map((i) => `${i.bookDetail?.title || 'Book'} x ${i.quantity}`).join('\n');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`My BookFry Vault Cart:\n${summary}`);
      alert('Cart details copied to clipboard!');
    }
  };

  const newItems = items.filter(
    (i) => (i.listingDetail?.condition || i.bookDetail?.condition) === 'new'
  );
  const usedItems = items.filter(
    (i) => (i.listingDetail?.condition || i.bookDetail?.condition) !== 'new'
  );

  const newSellerIds = Array.from(
    new Set(
      newItems.map(
        (i) => i.listingDetail?.sellerId || (i as { sellerId?: string }).sellerId || 'seller'
      )
    )
  );
  const isMultiSeller = newSellerIds.length > 1;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Navbar />

      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
        <CartHeroHeader itemCount={items.length} onShareCart={handleShareCart} />

        {isCartLoading && items.length === 0 ? (
          <CartSkeleton />
        ) : items.length === 0 ? (
          <CartEmptyState
            recommendedBooks={recommendedData.books}
            onAddToCart={(b) => addToCartMutation.mutate(b)}
            isAdding={addToCartMutation.isPending}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Items + Progress + Coupon */}
            <div className="lg:col-span-8 space-y-4">
              <CartFreeShippingBar subtotal={subtotal} />
              <CartCouponSection
                appliedCoupon={appliedCoupon}
                couponError={couponError}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={() => {
                  setAppliedCoupon(null);
                  setValidatedDiscountAmount(0);
                }}
              />

              {/* Multi-Seller Shipment Advisory */}
              {isMultiSeller && (
                <div className="p-4 rounded-2xl bg-brand/10 border border-brand/20 flex items-start gap-3 text-xs text-foreground font-sans">
                  <div className="p-1.5 rounded-xl bg-brand text-brand-foreground shrink-0 mt-0.5">
                    <Package className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-extrabold text-brand">Multi-Seller Order Notice</p>
                    <p className="text-muted-foreground leading-relaxed">
                      Your cart contains new books from <strong>{newSellerIds.length} different sellers</strong>. Your books will be dispatched in <strong>{newSellerIds.length} separate parcels</strong> with individual tracking numbers.
                    </p>
                  </div>
                </div>
              )}

              {/* New Books Section */}
              {newItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-mono">
                      <Truck className="h-3.5 w-3.5 text-primary" /> New Books — Online Payment ({newItems.length})
                    </h3>
                  </div>
                  {newItems.map((item) => (
                    <CartItemCard
                      key={item.listingId || item.bookId}
                      item={item}
                      isLoading={isCartLoading}
                      onQtyChange={(key, cur, chg) => updateQuantity(isAuthenticated, key, cur + chg)}
                      onRemove={(key) => removeItem(isAuthenticated, key)}
                    />
                  ))}
                </div>
              )}

              {/* Used Books Section */}
              {usedItems.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-mono">
                      <MessageCircle className="h-3.5 w-3.5 text-brand" /> Used Books — Direct Seller Request ({usedItems.length})
                    </h3>
                  </div>
                  <div className="p-3 rounded-2xl bg-muted/60 border border-border/80 text-xs text-muted-foreground">
                    <p className="leading-relaxed">
                      💡 <strong>P2P Direct Contact:</strong> Used books do not require online payment. Sellers will receive your request and contact you directly via WhatsApp / Email.
                    </p>
                  </div>
                  {usedItems.map((item) => (
                    <CartItemCard
                      key={item.listingId || item.bookId}
                      item={item}
                      isLoading={isCartLoading}
                      onQtyChange={(key, cur, chg) => updateQuantity(isAuthenticated, key, cur + chg)}
                      onRemove={(key) => removeItem(isAuthenticated, key)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4">
              <CartOrderSummary
                itemCount={items.length}
                subtotal={subtotal}
                appliedCoupon={appliedCoupon}
                couponDiscountAmount={couponDiscountAmount}
                shippingFee={shippingFee}
                estimatedTax={estimatedTax}
                savings={savings}
                total={total}
                activeAddress={activeAddress}
                isCheckingOut={checkoutMutation.isPending}
                onProceedCheckout={handleProceedCheckout}
                onChangeAddressClick={() => setIsAddressModalOpen(true)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Sticky Bar */}
      {items.length > 0 && (
        <CartMobileStickyBar
          itemCount={items.length}
          subtotal={subtotal}
          appliedCoupon={appliedCoupon}
          couponDiscountAmount={couponDiscountAmount}
          shippingFee={shippingFee}
          estimatedTax={estimatedTax}
          savings={savings}
          total={total}
          isCheckingOut={checkoutMutation.isPending}
          onProceedCheckout={handleProceedCheckout}
        />
      )}

      {/* Address Selection Modal */}
      <CartAddressModal
        isOpen={isAddressModalOpen}
        addresses={profile?.addresses || []}
        selectedAddressId={selectedAddressId}
        onSelectAddress={setSelectedAddressId}
        onClose={() => setIsAddressModalOpen(false)}
        onSaveNewAddress={async (data) => {
          await addAddressMutation.mutateAsync(data);
        }}
        onSetDefault={(id) => setAddressDefaultMutation.mutate(id)}
        onDeleteAddress={(id) => deleteAddressMutation.mutate(id)}
        isSaving={addAddressMutation.isPending}
      />

      {/* Order Confirmation Modal */}
      <Dialog
        isOpen={isCheckoutModalOpen}
        onClose={() => {
          setIsCheckoutModalOpen(false);
          router.push('/account/orders');
        }}
        title="Order Placed Successfully! 🎉"
        size="sm"
      >
        <div className="flex flex-col items-center text-center space-y-5 font-sans py-2">
          <div className="h-20 w-20 bg-success/15 border border-success/30 rounded-3xl flex items-center justify-center text-success">
            <Check className="h-10 w-10" />
          </div>
          <div className="space-y-2 w-full">
            {placedOrder && (
              <p className="text-xs font-extrabold text-primary uppercase tracking-wider bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-2xl inline-block font-mono">
                Order #{placedOrder.orderNumber}
              </p>
            )}
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Your order is verified & confirmed! Track delivery status and peer escrow details in your dashboard.
            </p>
          </div>
          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              setIsCheckoutModalOpen(false);
              router.push('/account/orders');
            }}
            className="py-3 rounded-2xl font-extrabold text-xs uppercase tracking-wider shadow-md"
          >
            Track Order Status
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
