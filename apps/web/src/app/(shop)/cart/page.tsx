'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { User, Address, Book, Order } from '@bookmarket/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, Plus, Minus, ArrowLeft, MapPin, Compass, Loader2,
  AlertCircle, X, Check, ChevronDown, Tag, Share2, ShieldCheck,
  Clock, ChevronRight, Sparkles, Zap, Package, BadgeCheck,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

// ──────────────────────────────────────────────────────────────────────────────
// Razorpay loader
// ──────────────────────────────────────────────────────────────────────────────
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// ──────────────────────────────────────────────────────────────────────────────
// Small helper: shared input class
// ──────────────────────────────────────────────────────────────────────────────
const inputCls =
  'w-full h-11 px-4 rounded-2xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary font-medium';

// ──────────────────────────────────────────────────────────────────────────────
// Order Summary rows — shared between desktop card + mobile sheet
// ──────────────────────────────────────────────────────────────────────────────
function SummaryRows({
  items, subtotal, appliedCoupon, couponDiscountAmount, shippingFee, estimatedTax, savings, total,
}: {
  items: { quantity: number }[];
  subtotal: number; appliedCoupon: string | null; couponDiscountAmount: number;
  shippingFee: number; estimatedTax: number; savings: number; total: number;
}) {
  return (
    <div className="space-y-3 text-sm font-sans">
      <div className="flex justify-between text-muted-foreground">
        <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
        <span className="font-bold text-foreground">₹{subtotal.toFixed(2)}</span>
      </div>
      {appliedCoupon && (
        <div className="flex justify-between text-success font-bold">
          <span>Coupon ({appliedCoupon})</span>
          <span>−₹{couponDiscountAmount.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between text-muted-foreground">
        <span>Shipping</span>
        <span className={`font-bold ${shippingFee === 0 ? 'text-success' : 'text-foreground'}`}>
          {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}
        </span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>Estimated GST (8%)</span>
        <span className="font-bold text-foreground">₹{estimatedTax.toFixed(2)}</span>
      </div>
      {savings > 0 && (
        <div className="flex justify-between px-3 py-2.5 rounded-2xl bg-success/10 border border-success/20 text-success font-extrabold text-xs">
          <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" />Total Savings</span>
          <span>₹{savings.toFixed(2)}</span>
        </div>
      )}
      <div className="border-t border-border pt-3 flex justify-between font-extrabold text-base text-foreground">
        <span>Total Amount</span>
        <span>₹{total.toFixed(2)}</span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────────────────────────
export default function CartPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { items, isLoading: isCartLoading, updateQuantity, removeItem, fetchCart } = useCartStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [addressLabel, setAddressLabel] = useState('Home');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street1, setStreet1] = useState('');
  const [street2, setStreet2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');
  const [makeDefault, setMakeDefault] = useState(false);

  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [formValidationErrors, setFormValidationErrors] = useState<Record<string, string>>({});

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCouponExpanded, setIsCouponExpanded] = useState(false);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);
  const [validatedDiscountAmount, setValidatedDiscountAmount] = useState(0);

  const { data: profile, isLoading: isProfileLoading } = useQuery<User>({
    queryKey: ['user-profile'],
    queryFn: () => apiClient('/users/profile'),
    enabled: isAuthenticated,
  });

  const { data: recommendedBooksData = { books: [] } } = useQuery<{ books: Book[] }>({
    queryKey: ['cart-recommendations'],
    queryFn: () => apiClient('/books?limit=8'),
  });

  const addToCartMutation = useMutation({
    mutationFn: (book: Book) => useCartStore.getState().addItem(isAuthenticated, book, 1),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cart'] }); fetchCart(isAuthenticated); },
  });

  useEffect(() => { fetchCart(isAuthenticated); }, [isAuthenticated, fetchCart]);

  useEffect(() => {
    if (profile?.addresses) {
      const def = profile.addresses.find((a) => a.isDefault);
      if (def?._id) setSelectedAddressId(def._id);
      else if (profile.addresses[0]?._id) setSelectedAddressId(profile.addresses[0]._id);
    }
  }, [profile]);

  const addAddressMutation = useMutation({
    mutationFn: (data: Omit<Address, '_id' | 'isDefault'> & { isDefault?: boolean }) =>
      apiClient('/users/addresses', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      const newAddr = updatedUser.addresses?.[updatedUser.addresses.length - 1];
      if (newAddr?._id) setSelectedAddressId(newAddr._id);
      setShowAddressForm(false);
      resetAddressForm();
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
      const order = await apiClient<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddress: { street: address.street, city: address.city, state: address.state, zipCode: address.zipCode, country: address.country },
          couponCode: appliedCoupon || undefined,
        }),
      });
      const paymentIntent = await apiClient<{ id: string; clientSecret: string; keyId?: string; amount?: number; currency?: string }>(
        '/payments/create-intent', { method: 'POST', body: JSON.stringify({ orderId: order.id }) }
      );
      if (paymentIntent?.keyId) {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) throw new Error('Razorpay SDK failed to load.');
        return new Promise<{ order: Order; verifyRes: unknown }>((resolve, reject) => {
          const options = {
            key: paymentIntent.keyId, amount: paymentIntent.amount,
            currency: paymentIntent.currency || 'INR', name: 'BookFry',
            description: 'Purchase Books', image: '/logo.jpeg',
            order_id: paymentIntent.id,
            handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
              try {
                const verifyRes = await apiClient('/payments/verify', { method: 'POST', body: JSON.stringify({ orderId: order.id, ...response }) });
                resolve({ order, verifyRes });
              } catch (e) { reject(e); }
            },
            prefill: { name: user?.name || '', email: user?.email || '' },
            theme: { color: '#1A3B5C' },
            modal: { ondismiss: () => reject(new Error('Payment cancelled by user.')) },
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        });
      } else {
        const verifyRes = await apiClient('/payments/verify', {
          method: 'POST',
          body: JSON.stringify({ orderId: order.id, razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 10)}` }),
        });
        return { order, verifyRes };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      useCartStore.getState().fetchCart(true);
      setPlacedOrder(data.order);
      setIsCheckoutModalOpen(true);
      setIsMobileSummaryOpen(false);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Checkout failed. Please try again.';
      alert(msg);
    },
  });

  const resetAddressForm = () => {
    setAddressLabel('Home'); setFullName(''); setPhone(''); setStreet1('');
    setStreet2(''); setCity(''); setState(''); setZipCode(''); setCountry('India');
    setMakeDefault(false); setGpsError(''); setFormValidationErrors({});
  };

  const handleQtyChange = async (itemKey: string, currentQty: number, change: number, stock: number) => {
    const newQty = currentQty + change;
    if (newQty < 1 || newQty > stock) return;
    try { await updateQuantity(isAuthenticated, itemKey, newQty); } catch { }
  };

  const handleRemove = async (itemKey: string) => {
    try { await removeItem(isAuthenticated, itemKey); } catch { }
  };

  const handleGPSAutofill = () => {
    if (!navigator.geolocation) { setGpsError('Geolocation not supported.'); return; }
    setIsLocating(true); setGpsError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await apiClient(`/users/reverse-geocode?lat=${latitude}&lon=${longitude}`);
          if (res) { setStreet1(res.street || ''); setCity(res.city || ''); setState(res.state || ''); setZipCode(res.zipCode || ''); setCountry(res.country || 'India'); }
        } catch { setGpsError('Failed to fetch address.'); }
        finally { setIsLocating(false); }
      },
      (err) => { setIsLocating(false); setGpsError(err.code === err.PERMISSION_DENIED ? 'Location permission denied.' : 'Could not get GPS.'); },
      { timeout: 8000 }
    );
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = 'Full name required';
    if (!phone.trim()) errors.phone = 'Phone required';
    if (!street1.trim()) errors.street = 'Street required';
    if (!city.trim()) errors.city = 'City required';
    if (!state.trim()) errors.state = 'State required';
    if (!zipCode.trim()) errors.zipCode = 'Pincode required';
    if (Object.keys(errors).length > 0) { setFormValidationErrors(errors); return; }
    const labelPrefix = `[${addressLabel}] ${fullName.trim()} (Phone: ${phone.trim()})`;
    const fullStreetLine = `${labelPrefix} - ${street1.trim()}${street2.trim() ? ', ' + street2.trim() : ''}`;
    addAddressMutation.mutate({ street: fullStreetLine, city: city.trim(), state: state.trim(), zipCode: zipCode.trim(), country: country.trim(), isDefault: makeDefault });
  };

  const handleApplyCoupon = async (codeToApply: string) => {
    const cleanCode = codeToApply.trim().toUpperCase();
    if (!cleanCode) return;
    setCouponError(null);
    try {
      const res = await apiClient<{ valid: boolean; coupon: { code: string; discountAmount: number } }>('/coupons/validate', {
        method: 'POST', body: JSON.stringify({ code: cleanCode, subtotal }),
      });
      if (res?.valid && res.coupon) { setAppliedCoupon(res.coupon.code); setValidatedDiscountAmount(res.coupon.discountAmount); }
    } catch {
      if (cleanCode === 'BOOKFRYNEW') { setAppliedCoupon('BOOKFRYNEW'); setValidatedDiscountAmount(parseFloat((subtotal * 0.1).toFixed(2))); }
      else if (cleanCode === 'FESTIVE20') { setAppliedCoupon('FESTIVE20'); setValidatedDiscountAmount(parseFloat((subtotal * 0.2).toFixed(2))); }
      else { setCouponError('Invalid coupon code.'); setAppliedCoupon(null); setValidatedDiscountAmount(0); }
    }
  };

  const handleProceedCheckout = () => {
    if (!activeAddress) { setIsAddressModalOpen(true); return; }
    checkoutMutation.mutate(activeAddress);
  };

  const handleShareCart = () => {
    const summary = items.map((i) => `${i.bookDetail?.title || 'Book'} x ${i.quantity}`).join('\n');
    if (navigator.clipboard) { navigator.clipboard.writeText(`My BookFry Cart:\n${summary}`); alert('Cart copied!'); }
  };

  const subtotal = items.reduce((acc, i) => acc + i.quantity * i.priceSnapshot, 0);
  const couponDiscountAmount = appliedCoupon ? validatedDiscountAmount : 0;
  const shippingFee = subtotal > 499 || subtotal === 0 ? 0 : 49;
  const estimatedTax = Math.max(0, subtotal - couponDiscountAmount) * 0.08;
  const savings = couponDiscountAmount + subtotal * 0.15;
  const total = Math.max(0, subtotal - couponDiscountAmount + shippingFee + estimatedTax);
  const activeAddress = profile?.addresses?.find((a) => a._id === selectedAddressId);
  const freeShippingThreshold = 499;
  const progressPercent = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remaining = freeShippingThreshold - subtotal;

  const parseAddr = (str: string) => {
    const parts = str.split(' - ');
    return parts.length > 1 ? { labelName: parts[0], streetOnly: parts.slice(1).join(' - ') } : { labelName: 'Shipping Address', streetOnly: str };
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Navbar />

      <main className="flex-grow w-full max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 py-6">

        {/* ── Page Header ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Link href="/books" className="h-10 w-10 flex items-center justify-center rounded-2xl bg-muted border border-border hover:bg-card hover:border-border/60 transition-all active:scale-95">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-extrabold text-foreground leading-none">
                Shopping Cart
              </h1>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                {items.length} {items.length === 1 ? 'item' : 'items'} · Save up to 80% on textbooks
              </p>
            </div>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleShareCart}
              className="flex items-center gap-1.5 h-9 px-4 rounded-2xl border border-border bg-card hover:bg-muted text-xs font-bold text-muted-foreground transition-all active:scale-95"
            >
              <Share2 className="h-3.5 w-3.5 text-secondary" />
              <span className="hidden sm:inline">Share Cart</span>
            </button>
          )}
        </div>

        {/* ── Empty State ─────────────────────────────────────────────── */}
        {items.length === 0 ? (
          <div className="text-center py-20 max-w-lg mx-auto space-y-6">
            <div className="mx-auto h-32 w-32 rounded-3xl bg-muted border border-border flex items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground/40" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-xl font-extrabold text-foreground">Your cart is empty</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Study must never stop! Find pre-owned, verified textbooks starting at just ₹99.
              </p>
            </div>
            <Link href="/books" className="inline-flex items-center gap-2 h-12 px-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-sm rounded-2xl shadow-md transition-all active:scale-95">
              <ArrowLeft className="h-4 w-4" /> Continue Shopping
            </Link>
            {recommendedBooksData.books.length > 0 && (
              <div className="pt-8 space-y-4 text-left">
                <h3 className="font-serif text-base font-extrabold text-foreground">Popular Books For You</h3>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4">
                  {recommendedBooksData.books.map((book) => (
                    <RecommendedBookCard key={book.id} book={book} onAdd={() => addToCartMutation.mutate(book)} isAdding={addToCartMutation.isPending} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── Left Column: Items + Extras ──────────────────────── */}
            <div className="flex-grow w-full min-w-0 space-y-4">

              {/* Free Shipping Progress */}
              <div className="rounded-3xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  {shippingFee === 0 ? (
                    <span className="flex items-center gap-2 text-sm font-extrabold text-success">
                      <Sparkles className="h-4 w-4 animate-pulse" /> Free shipping unlocked! 🎉
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground font-medium">
                      Add <span className="font-extrabold text-secondary">₹{remaining.toFixed(0)}</span> more for <span className="font-extrabold text-foreground">FREE Shipping</span>
                    </span>
                  )}
                  <span className="text-xs font-bold text-muted-foreground">{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-secondary rounded-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground font-medium mt-2.5">
                  Standard delivery: <span className="font-bold text-foreground">2–4 business days</span>
                </p>
              </div>

              {/* Coupon Section */}
              <div className="rounded-3xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setIsCouponExpanded(!isCouponExpanded)}
                  className="w-full flex items-center justify-between px-5 py-4 text-sm font-extrabold text-foreground"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="h-8 w-8 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                      <Tag className="h-4 w-4 text-secondary" />
                    </span>
                    {appliedCoupon ? (
                      <span className="text-success flex items-center gap-1.5">
                        <BadgeCheck className="h-4 w-4" /> Coupon &ldquo;{appliedCoupon}&rdquo; Applied
                      </span>
                    ) : 'Apply Coupon / Promo Code'}
                  </span>
                  <motion.span animate={{ rotate: isCouponExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isCouponExpanded && (
                    <motion.div
                      key="coupon-panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                        {/* Input row */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="ENTER PROMO CODE"
                            className="flex-1 h-11 px-4 rounded-2xl border border-border bg-background text-xs font-extrabold uppercase text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary tracking-widest"
                          />
                          <button
                            onClick={() => handleApplyCoupon(couponCode)}
                            className="h-11 px-5 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-95 shrink-0"
                          >
                            Apply
                          </button>
                        </div>

                        {couponError && (
                          <p className="flex items-center gap-1.5 text-xs font-bold text-danger">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {couponError}
                          </p>
                        )}
                        {appliedCoupon && (
                          <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-2xl text-success text-xs font-extrabold">
                            <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> &ldquo;{appliedCoupon}&rdquo; applied!</span>
                            <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); setValidatedDiscountAmount(0); }} className="text-danger hover:underline font-extrabold text-[10px]">Remove</button>
                          </div>
                        )}

                        {/* Available coupons */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Available Offers</p>
                          {[
                            { code: 'BOOKFRYNEW', label: '10% off', desc: 'Flat 10% on your first order' },
                            { code: 'FESTIVE20', label: '20% off', desc: '20% on orders above ₹499' },
                          ].map(({ code, label, desc }) => (
                            <button
                              key={code}
                              onClick={() => { setCouponCode(code); handleApplyCoupon(code); }}
                              className="w-full flex items-center justify-between p-3.5 border border-dashed border-secondary/40 bg-secondary/5 hover:bg-secondary/10 rounded-2xl transition-all text-left group"
                            >
                              <div className="space-y-0.5">
                                <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-[10px] font-extrabold uppercase">{code}</span>
                                <p className="text-xs text-muted-foreground font-medium mt-1">{desc}</p>
                              </div>
                              <div className="text-right shrink-0 ml-3">
                                <span className="text-sm font-extrabold text-secondary">{label}</span>
                                <ChevronRight className="h-3.5 w-3.5 text-secondary ml-auto mt-0.5" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart Items */}
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {items.map((item) => {
                    const itemKey = item.listingId || item.bookId || '';
                    const book = item.listingDetail?.catalog || item.bookDetail;
                    const condition = item.listingDetail?.condition || item.bookDetail?.condition || 'good';
                    const stock = item.listingDetail?.stock || item.bookDetail?.stock || 1;
                    if (!book) return null;
                    const imageUrl = book.images?.[0]?.url || '';
                    const itemTotal = item.priceSnapshot * item.quantity;
                    const strikePrice = itemTotal * 1.25;

                    return (
                      <motion.div
                        key={itemKey}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, overflow: 'hidden', marginBottom: 0 }}
                        transition={{ duration: 0.22 }}
                        className="rounded-3xl border border-border bg-card overflow-hidden"
                      >
                        <div className="p-4 sm:p-5 flex gap-4">
                          {/* Book Cover */}
                          <Link href={`/books/${book.slug}`} className="shrink-0">
                            <div className="h-28 w-20 sm:h-32 sm:w-24 rounded-2xl overflow-hidden border border-border bg-muted shadow-sm group">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={imageUrl}
                                alt={book.title}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/100x150/1A3B5C/fff?text=${encodeURIComponent(book.title)}`; }}
                              />
                            </div>
                          </Link>

                          {/* Details */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
                            <div className="space-y-1.5">
                              <Link href={`/books/${book.slug}`} className="text-sm font-extrabold text-foreground hover:text-secondary transition-colors line-clamp-2 leading-snug">
                                {book.title}
                              </Link>
                              <p className="text-xs text-muted-foreground font-medium">by {book.author}</p>
                              <div className="flex flex-wrap gap-2 pt-0.5">
                                <span className="px-2.5 py-0.5 bg-secondary/10 border border-secondary/20 text-secondary rounded-full text-[10px] font-extrabold uppercase">
                                  {condition.replace('_', ' ')}
                                </span>
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-bold">
                                  <ShieldCheck className="h-3 w-3 text-success" /> Verified
                                </span>
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-bold">
                                  <Clock className="h-3 w-3 text-primary" /> 2–4 Days
                                </span>
                              </div>
                            </div>

                            {/* Price + Controls row */}
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              {/* Price */}
                              <div>
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-base font-extrabold text-foreground">₹{itemTotal.toFixed(0)}</span>
                                  <span className="text-xs text-muted-foreground line-through">₹{strikePrice.toFixed(0)}</span>
                                  <span className="text-[10px] font-extrabold text-success bg-success/10 px-1.5 py-0.5 rounded-full">20% OFF</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground font-medium">₹{item.priceSnapshot.toFixed(0)} each</p>
                              </div>

                              {/* Stepper + Delete */}
                              <div className="flex items-center gap-2">
                                <div className="flex items-center border border-border rounded-2xl overflow-hidden bg-background">
                                  <button
                                    onClick={() => handleQtyChange(itemKey, item.quantity, -1, stock)}
                                    disabled={item.quantity <= 1 || isCartLoading}
                                    className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 active:scale-90"
                                  >
                                    <Minus className="h-3.5 w-3.5" />
                                  </button>
                                  <span className="w-8 text-center text-sm font-extrabold text-foreground">{item.quantity}</span>
                                  <button
                                    onClick={() => handleQtyChange(itemKey, item.quantity, 1, stock)}
                                    disabled={item.quantity >= stock || isCartLoading}
                                    className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 active:scale-90"
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => handleRemove(itemKey)}
                                  disabled={isCartLoading}
                                  className="h-9 w-9 flex items-center justify-center rounded-2xl border border-border text-muted-foreground hover:bg-danger/10 hover:text-danger hover:border-danger/30 transition-all active:scale-90"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Recommended Books */}
              {recommendedBooksData.books.length > 0 && (
                <div className="rounded-3xl border border-border bg-card p-5 space-y-4">
                  <h3 className="font-serif text-base font-extrabold text-foreground">Frequently Bought Together</h3>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5">
                    {recommendedBooksData.books.map((book) => (
                      <RecommendedBookCard key={book.id} book={book} onAdd={() => addToCartMutation.mutate(book)} isAdding={addToCartMutation.isPending} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Column: Order Summary ───────────────────────── */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 lg:sticky lg:top-24">

              {/* Delivery Address Card */}
              {isAuthenticated && (
                <div className="rounded-3xl border border-border bg-card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-foreground">
                      <MapPin className="h-4 w-4 text-secondary" /> Delivery Details
                    </h4>
                    <button onClick={() => setIsAddressModalOpen(true)} className="text-xs font-extrabold text-secondary hover:underline">
                      {activeAddress ? 'Change' : 'Add Address'}
                    </button>
                  </div>

                  {isProfileLoading ? (
                    <div className="h-16 animate-pulse bg-muted rounded-2xl" />
                  ) : activeAddress ? (
                    <div className="p-3.5 rounded-2xl bg-muted/50 border border-border space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-extrabold text-foreground">{parseAddr(activeAddress.street).labelName}</p>
                        {activeAddress.isDefault && (
                          <span className="px-1.5 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 text-[9px] font-extrabold text-secondary uppercase">Default</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed">{parseAddr(activeAddress.street).streetOnly}</p>
                      <p className="text-xs text-muted-foreground font-medium">{activeAddress.city}, {activeAddress.state} – {activeAddress.zipCode}</p>
                    </div>
                  ) : (
                    <div className="text-center py-5 border border-dashed border-border rounded-2xl bg-muted/30">
                      <p className="text-xs font-bold text-muted-foreground mb-3">No shipping address yet</p>
                      <button
                        onClick={() => { resetAddressForm(); setShowAddressForm(true); setIsAddressModalOpen(true); }}
                        className="px-5 py-2 bg-secondary text-secondary-foreground font-extrabold text-xs rounded-2xl hover:bg-secondary/90 transition-all active:scale-95"
                      >
                        Add Address
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Order Summary Card — visible only on desktop */}
              <div className="hidden lg:block rounded-3xl bg-primary border border-primary overflow-hidden">
                <div className="px-6 py-5 border-b border-primary-foreground/10">
                  <h3 className="font-serif text-lg font-extrabold text-primary-foreground">Order Summary</h3>
                </div>
                <div className="px-6 py-5 space-y-5">
                  <SummaryRows
                    items={items} subtotal={subtotal} appliedCoupon={appliedCoupon}
                    couponDiscountAmount={couponDiscountAmount} shippingFee={shippingFee}
                    estimatedTax={estimatedTax} savings={savings} total={total}
                  />

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleProceedCheckout}
                    disabled={checkoutMutation.isPending}
                    className="w-full h-13 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-sm uppercase tracking-wider rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {checkoutMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <><Zap className="h-4 w-4" /> Proceed to Checkout</>
                    )}
                  </motion.button>

                  <p className="text-[10px] text-center text-primary-foreground/40 font-medium">
                    By proceeding, you agree to BookFry&apos;s terms & conditions
                  </p>

                  {/* Trust badges */}
                  <div className="flex items-center justify-center gap-5 pt-1 border-t border-primary-foreground/10">
                    {[
                      { icon: ShieldCheck, label: 'Secure' },
                      { icon: Package, label: 'Tracked' },
                      { icon: BadgeCheck, label: 'Verified' },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-1.5 text-[11px] text-primary-foreground/50 font-bold">
                        <Icon className="h-3.5 w-3.5" /> {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Mobile Sticky Checkout Bar ────────────────────────────────── */}
      {items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur border-t border-border px-4 py-3 flex items-center gap-3 shadow-[0_-4px_24px_rgba(0,0,0,0.1)]" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
          <button onClick={() => setIsMobileSummaryOpen(true)} className="flex-1 text-left">
            <p className="flex items-center gap-1 text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
              <ChevronUp className="h-3 w-3 text-secondary animate-bounce" /> Total Amount
            </p>
            <p className="text-base font-extrabold text-foreground">₹{total.toFixed(2)}</p>
            {savings > 0 && <p className="text-[10px] font-extrabold text-success">You saved ₹{savings.toFixed(0)}</p>}
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleProceedCheckout}
            disabled={checkoutMutation.isPending}
            className="flex-1 h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-60"
          >
            {checkoutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Zap className="h-4 w-4" /> Place Order</>}
          </motion.button>
        </div>
      )}

      {/* ── Mobile Summary Bottom Sheet ───────────────────────────────── */}
      <AnimatePresence>
        {isMobileSummaryOpen && (
          <>
            <motion.div
              key="sheet-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsMobileSummaryOpen(false)}
            />
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl border-t border-border p-6 space-y-5 lg:hidden shadow-2xl"
              style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
            >
              <div className="flex items-center justify-between">
                <div className="mx-auto w-10 h-1 rounded-full bg-muted-foreground/30 absolute left-1/2 -translate-x-1/2 top-3" />
                <h3 className="font-serif text-base font-extrabold text-foreground">Order Summary</h3>
                <button onClick={() => setIsMobileSummaryOpen(false)} className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <SummaryRows
                items={items} subtotal={subtotal} appliedCoupon={appliedCoupon}
                couponDiscountAmount={couponDiscountAmount} shippingFee={shippingFee}
                estimatedTax={estimatedTax} savings={savings} total={total}
              />
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleProceedCheckout}
                disabled={checkoutMutation.isPending}
                className="w-full h-13 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-sm uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {checkoutMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Zap className="h-4 w-4" /> Place Order</>}
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Address Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddressModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.22 }}
              className="relative w-full max-w-lg bg-background border border-border rounded-3xl shadow-2xl z-10 flex flex-col max-h-[90vh]"
              role="dialog"
              aria-modal="true"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                <h3 className="font-serif text-base font-extrabold text-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-secondary" /> Choose Delivery Address
                </h3>
                <button onClick={() => setIsAddressModalOpen(false)} className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center hover:bg-card transition-all">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                {showAddressForm ? (
                  <form onSubmit={handleSaveAddress} className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-extrabold text-sm text-foreground">New Address</h4>
                      <button
                        type="button"
                        onClick={handleGPSAutofill}
                        disabled={isLocating}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-extrabold hover:bg-primary/15 transition-all disabled:opacity-50"
                      >
                        {isLocating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Compass className="h-3.5 w-3.5" />}
                        {isLocating ? 'Locating...' : 'Use GPS'}
                      </button>
                    </div>

                    {gpsError && (
                      <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-2xl text-danger text-xs font-bold">
                        <AlertCircle className="h-4 w-4 shrink-0" /> {gpsError}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-extrabold text-muted-foreground mb-1.5">Label</label>
                        <select value={addressLabel} onChange={(e) => setAddressLabel(e.target.value)} className={inputCls}>
                          {['Home', 'Work', 'College', 'Other'].map((l) => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold text-muted-foreground mb-1.5">Full Name *</label>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Recipient name" className={inputCls} />
                        {formValidationErrors.fullName && <span className="text-[10px] text-danger font-bold">{formValidationErrors.fullName}</span>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-muted-foreground mb-1.5">Phone *</label>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit number" className={inputCls} />
                      {formValidationErrors.phone && <span className="text-[10px] text-danger font-bold">{formValidationErrors.phone}</span>}
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-muted-foreground mb-1.5">Address Line 1 *</label>
                      <input type="text" value={street1} onChange={(e) => setStreet1(e.target.value)} placeholder="Flat, House no., Street" className={inputCls} />
                      {formValidationErrors.street && <span className="text-[10px] text-danger font-bold">{formValidationErrors.street}</span>}
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-muted-foreground mb-1.5">Address Line 2</label>
                      <input type="text" value={street2} onChange={(e) => setStreet2(e.target.value)} placeholder="Landmark, Area (optional)" className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-extrabold text-muted-foreground mb-1.5">City *</label>
                        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className={inputCls} />
                        {formValidationErrors.city && <span className="text-[10px] text-danger font-bold">{formValidationErrors.city}</span>}
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold text-muted-foreground mb-1.5">State *</label>
                        <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className={inputCls} />
                        {formValidationErrors.state && <span className="text-[10px] text-danger font-bold">{formValidationErrors.state}</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-extrabold text-muted-foreground mb-1.5">Pincode *</label>
                        <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="ZIP Code" className={inputCls} />
                        {formValidationErrors.zipCode && <span className="text-[10px] text-danger font-bold">{formValidationErrors.zipCode}</span>}
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold text-muted-foreground mb-1.5">Country</label>
                        <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" id="make-default" checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} className="rounded accent-secondary" />
                      <span className="text-xs font-bold text-muted-foreground">Set as default address</span>
                    </label>

                    <div className="flex gap-2 pt-2">
                      <button type="submit" disabled={addAddressMutation.isPending} className="flex-1 h-11 bg-secondary text-secondary-foreground font-extrabold text-sm rounded-2xl hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 active:scale-95">
                        {addAddressMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save Address
                      </button>
                      <button type="button" onClick={() => { setShowAddressForm(false); resetAddressForm(); }} className="h-11 px-5 border border-border text-muted-foreground font-bold text-sm rounded-2xl hover:bg-muted transition-all">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    {profile?.addresses && profile.addresses.length > 0 ? profile.addresses.map((address) => (
                      <button
                        key={address._id}
                        onClick={() => setSelectedAddressId(address._id || null)}
                        className={`w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${selectedAddressId === address._id ? 'border-secondary bg-secondary/5 ring-1 ring-secondary/20' : 'border-border hover:border-border/60 bg-card'}`}
                      >
                        <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddressId === address._id ? 'border-secondary' : 'border-muted-foreground'}`}>
                          {selectedAddressId === address._id && <div className="h-2 w-2 rounded-full bg-secondary" />}
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-extrabold text-foreground">{parseAddr(address.street).labelName}</p>
                            {address.isDefault && <span className="px-1.5 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 text-[9px] font-extrabold text-secondary uppercase">Default</span>}
                          </div>
                          <p className="text-xs text-muted-foreground font-medium leading-relaxed">{parseAddr(address.street).streetOnly}</p>
                          <p className="text-xs text-muted-foreground font-medium">{address.city}, {address.state} – {address.zipCode}</p>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          {!address.isDefault && (
                            <button onClick={(e) => { e.stopPropagation(); setAddressDefaultMutation.mutate(address._id!); }} className="text-[10px] font-extrabold text-secondary hover:underline">Default</button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); deleteAddressMutation.mutate(address._id!); }} className="text-[10px] font-extrabold text-danger hover:underline">Delete</button>
                        </div>
                      </button>
                    )) : (
                      <div className="text-center py-10 border border-dashed border-border rounded-2xl bg-muted/30">
                        <MapPin className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-xs font-bold text-muted-foreground">No addresses saved yet</p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowAddressForm(true)}
                      className="w-full h-11 flex items-center justify-center gap-2 border border-dashed border-secondary/40 text-secondary font-extrabold text-sm rounded-2xl hover:bg-secondary/5 transition-all"
                    >
                      <Plus className="h-4 w-4" /> Add New Address
                    </button>

                    <div className="flex gap-2 pt-2">
                      <button onClick={() => setIsAddressModalOpen(false)} className="flex-1 h-11 bg-secondary text-secondary-foreground font-extrabold text-sm rounded-2xl hover:bg-secondary/90 transition-all active:scale-95">
                        Confirm Address
                      </button>
                      <button onClick={() => setIsAddressModalOpen(false)} className="h-11 px-5 border border-border text-muted-foreground font-bold text-sm rounded-2xl hover:bg-muted transition-all">
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Order Success Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        <Dialog
          isOpen={isCheckoutModalOpen}
          onClose={() => { setIsCheckoutModalOpen(false); router.push('/account/orders'); }}
          title="Order Placed Successfully! 🎉"
          size="sm"
        >
          <div className="flex flex-col items-center text-center space-y-5 font-sans py-2">
            <div className="h-20 w-20 bg-success/10 border border-success/20 rounded-3xl flex items-center justify-center">
              <Check className="h-10 w-10 text-success" />
            </div>
            <div className="space-y-2 w-full">
              {placedOrder && (
                <p className="text-xs font-extrabold text-primary uppercase tracking-wider bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-2xl">
                  Order: {placedOrder.orderNumber}
                </p>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed">
                Thank you! Your order is confirmed and is being processed. Track your delivery status in your account dashboard.
              </p>
            </div>
            <Button
              variant="primary"
              fullWidth
              onClick={() => { setIsCheckoutModalOpen(false); router.push('/account/orders'); }}
              className="py-3 rounded-2xl font-extrabold"
            >
              Track My Order
            </Button>
          </div>
        </Dialog>
      </AnimatePresence>

      <Footer />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Recommended Book Card sub-component
// ──────────────────────────────────────────────────────────────────────────────
function RecommendedBookCard({ book, onAdd, isAdding }: { book: Book; onAdd: () => void; isAdding: boolean }) {
  return (
    <div className="w-36 shrink-0 bg-card border border-border rounded-3xl p-3 flex flex-col gap-2 hover:shadow-md hover:border-border/60 transition-all">
      <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden border border-border bg-muted relative group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={book.images?.[0]?.url || 'https://placehold.co/100x150'}
          alt={book.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="space-y-0.5">
        <h4 className="text-[11px] font-extrabold text-foreground truncate leading-snug">{book.title}</h4>
        <p className="text-[10px] text-muted-foreground truncate font-medium">by {book.author}</p>
        <div className="flex items-baseline gap-1 pt-0.5">
          <span className="text-sm font-extrabold text-secondary">₹{book.price}</span>
          <span className="text-[10px] text-muted-foreground line-through">₹{(book.price * 1.3).toFixed(0)}</span>
        </div>
      </div>
      <button
        onClick={onAdd}
        disabled={isAdding}
        className="w-full h-8 bg-secondary/10 hover:bg-secondary hover:text-secondary-foreground text-secondary font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all active:scale-95"
      >
        Add to Cart
      </button>
    </div>
  );
}
