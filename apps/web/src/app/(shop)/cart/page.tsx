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
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  MapPin,
  Compass,
  Loader2,
  AlertCircle,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Tag,
  Share2,
  Heart,
  ShieldCheck,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CartPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { items, isLoading: isCartLoading, updateQuantity, removeItem, fetchCart } = useCartStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Address Selection States
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // New Address Form fields
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

  // GPS States
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [formValidationErrors, setFormValidationErrors] = useState<Record<string, string>>({});

  // Coupon Section State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCouponExpanded, setIsCouponExpanded] = useState(false);

  // Mobile Order Summary Drawer toggle state
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // Query User Profile for Addresses
  const {
    data: profile,
    isLoading: isProfileLoading,
  } = useQuery<User>({
    queryKey: ['user-profile'],
    queryFn: () => apiClient('/users/profile'),
    enabled: isAuthenticated,
  });

  // Query popular books for recommendations carousel
  const { data: recommendedBooksData = { books: [] } } = useQuery<{ books: Book[] }>({
    queryKey: ['cart-recommendations'],
    queryFn: () => apiClient('/books?limit=8'),
  });

  // Add Item to Cart Mutation (For recommendations carousel)
  const addToCartMutation = useMutation({
    mutationFn: (book: Book) => useCartStore.getState().addItem(isAuthenticated, book, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      fetchCart(isAuthenticated);
    },
  });

  useEffect(() => {
    fetchCart(isAuthenticated);
  }, [isAuthenticated, fetchCart]);

  // Set default address as active on load
  useEffect(() => {
    if (profile?.addresses) {
      const defaultAddr = profile.addresses.find((a) => a.isDefault);
      if (defaultAddr && defaultAddr._id) {
        setSelectedAddressId(defaultAddr._id);
      } else if (profile.addresses.length > 0 && profile.addresses[0]._id) {
        setSelectedAddressId(profile.addresses[0]._id);
      }
    }
  }, [profile]);

  // Address Mutations
  const addAddressMutation = useMutation({
    mutationFn: (data: Omit<Address, '_id' | 'isDefault'> & { isDefault?: boolean }) =>
      apiClient('/users/addresses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      const newAddr = updatedUser.addresses?.[updatedUser.addresses.length - 1];
      if (newAddr && newAddr._id) {
        setSelectedAddressId(newAddr._id);
      }
      setShowAddressForm(false);
      resetAddressForm();
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (addressId: string) =>
      apiClient(`/users/addresses/${addressId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  const setAddressDefaultMutation = useMutation({
    mutationFn: (addressId: string) =>
      apiClient(`/users/addresses/${addressId}/default`, {
        method: 'PATCH',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  // Checkout Mutation
  const checkoutMutation = useMutation({
    mutationFn: async (address: Address) => {
      // 1. Create order
      const order = await apiClient<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddress: {
            street: address.street,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            country: address.country,
          },
        }),
      });

      // 2. Create payment intent
      const paymentIntent = await apiClient<{
        id: string;
        clientSecret: string;
        keyId?: string;
        amount?: number;
        currency?: string;
      }>('/payments/create-intent', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.id,
        }),
      });

      // 3. Trigger Razorpay standard payment modal
      if (paymentIntent && paymentIntent.keyId) {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
        }

        return new Promise<{ order: Order; verifyRes: unknown }>((resolve, reject) => {
          const options = {
            key: paymentIntent.keyId,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency || 'INR',
            name: 'BookFry',
            description: 'Purchase Academic Textbooks',
            image: '/logo.jpeg',
            order_id: paymentIntent.id,
            handler: async function (response: {
              razorpay_order_id: string;
              razorpay_payment_id: string;
              razorpay_signature: string;
            }) {
              try {
                const verifyRes = await apiClient('/payments/verify', {
                  method: 'POST',
                  body: JSON.stringify({
                    orderId: order.id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                });
                resolve({ order, verifyRes });
              } catch (verifyErr) {
                reject(verifyErr);
              }
            },
            prefill: {
              name: user?.name || '',
              email: user?.email || '',
            },
            theme: {
              color: '#1A3B5C',
            },
            modal: {
              ondismiss: function () {
                reject(new Error('Payment cancelled by user.'));
              },
            },
          };

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        });
      } else {
        // Fallback simulated mock payment confirmation
        const verifyRes = await apiClient('/payments/verify', {
          method: 'POST',
          body: JSON.stringify({
            orderId: order.id,
            razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 10)}`,
          }),
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
      const errMsg = err instanceof Error ? err.message : 'Checkout failed. Please try again.';
      alert(errMsg);
    }
  });

  const resetAddressForm = () => {
    setAddressLabel('Home');
    setFullName('');
    setPhone('');
    setStreet1('');
    setStreet2('');
    setCity('');
    setState('');
    setZipCode('');
    setCountry('India');
    setMakeDefault(false);
    setGpsError('');
    setFormValidationErrors({});
  };

  const handleQtyChange = async (
    bookId: string,
    currentQty: number,
    change: number,
    stock: number
  ) => {
    const newQty = currentQty + change;
    if (newQty < 1 || newQty > stock) return;
    try {
      await updateQuantity(isAuthenticated, bookId, newQty);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (bookId: string) => {
    try {
      await removeItem(isAuthenticated, bookId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGPSAutofill = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await apiClient(
            `/users/reverse-geocode?lat=${latitude}&lon=${longitude}`
          );
          if (res) {
            setStreet1(res.street || '');
            setCity(res.city || '');
            setState(res.state || '');
            setZipCode(res.zipCode || '');
            setCountry(res.country || 'India');
          }
        } catch (err) {
          console.error(err);
          setGpsError('Failed to fetch address details for coordinates.');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError('Location permission denied. Please enter address manually.');
        } else {
          setGpsError('Could not retrieve GPS coordinates.');
        }
      },
      { timeout: 8000 }
    );
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!fullName.trim()) errors.fullName = 'Full Name is required';
    if (!phone.trim()) errors.phone = 'Phone number is required';
    if (!street1.trim()) errors.street = 'Street address is required';
    if (!city.trim()) errors.city = 'City is required';
    if (!state.trim()) errors.state = 'State is required';
    if (!zipCode.trim()) errors.zipCode = 'ZIP / Pincode is required';

    if (Object.keys(errors).length > 0) {
      setFormValidationErrors(errors);
      return;
    }

    const labelPrefix = `[${addressLabel}] ${fullName.trim()} (Phone: ${phone.trim()})`;
    const fullStreetLine = `${labelPrefix} - ${street1.trim()}${street2.trim() ? ', ' + street2.trim() : ''}`;

    addAddressMutation.mutate({
      street: fullStreetLine,
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      country: country.trim(),
      isDefault: makeDefault,
    });
  };

  const handleApplyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;
    if (['BOOKFRYNEW', 'FESTIVE20', 'FREEGIFT'].includes(cleanCode)) {
      setAppliedCoupon(cleanCode);
      setCouponError(null);
    } else {
      setCouponError('Invalid coupon code. Try BOOKFRYNEW or FESTIVE20.');
      setAppliedCoupon(null);
    }
  };

  const handleProceedCheckout = () => {
    if (!activeAddress) {
      setIsAddressModalOpen(true);
      return;
    }
    checkoutMutation.mutate(activeAddress);
  };

  const handleShareCart = () => {
    const cartSummary = items
      .map((item) => `${item.bookDetail?.title || 'Book'} x ${item.quantity}`)
      .join('\n');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`My BookFry Cart:\n${cartSummary}`);
      alert('Cart list copied to clipboard!');
    }
  };

  // Math totals Snapshots
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.priceSnapshot, 0);
  
  // Calculate discount dynamically based on applied coupon code
  let couponDiscountAmount = 0;
  if (appliedCoupon === 'BOOKFRYNEW') {
    couponDiscountAmount = subtotal * 0.1;
  } else if (appliedCoupon === 'FESTIVE20') {
    couponDiscountAmount = subtotal * 0.2;
  }

  const shippingFee = subtotal > 35 || subtotal === 0 ? 0 : 4.99;
  const estimatedTax = (subtotal - couponDiscountAmount) * 0.08;
  const savings = couponDiscountAmount + (subtotal * 0.15); // Mock overall savings
  const total = subtotal - couponDiscountAmount + shippingFee + estimatedTax;

  const activeAddress = profile?.addresses?.find((a) => a._id === selectedAddressId);

  const parseAddressDetails = (addressStr: string) => {
    const parts = addressStr.split(' - ');
    if (parts.length > 1) {
      return {
        labelName: parts[0],
        streetOnly: parts.slice(1).join(' - '),
      };
    }
    return {
      labelName: 'Shipping Address',
      streetOnly: addressStr,
    };
  };

  // Free shipping threshold parameters
  const freeShippingThreshold = 35;
  const progressPercent = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = freeShippingThreshold - subtotal;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FB] dark:bg-[#0B1320] transition-colors">
      <Navbar />

      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 font-sans">
        
        {/* Navigation title header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <Link
              href="/books"
              className="p-2 hover:bg-background-subtle rounded-full text-text-primary transition-all active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-text-primary">
                Shopping Cart
              </h1>
              <p className="text-[11px] font-semibold text-text-secondary">
                {items.length} {items.length === 1 ? 'Item' : 'Items'} • Save up to 80% on textbooks
              </p>
            </div>
          </div>
          
          {items.length > 0 && (
            <button
              onClick={handleShareCart}
              className="px-3.5 py-2 border border-border bg-white dark:bg-card hover:bg-background-subtle rounded-xl flex items-center gap-1.5 text-xs font-bold text-text-primary shadow-2xs transition-all active:scale-95"
            >
              <Share2 className="h-3.5 w-3.5 text-secondary" />
              <span className="hidden sm:inline">Share Cart</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Mascot-focused Empty State */
          <div className="text-center py-16 max-w-xl mx-auto space-y-6">
            <div className="mx-auto h-36 w-36 rounded-full overflow-hidden bg-background-subtle flex items-center justify-center border border-border shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/fox_reading_1784911486554.jpg"
                alt="Wise Fox mascot reading"
                className="w-full h-full object-cover select-none"
              />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-text-primary">
                Your BookFry cart is empty
              </h2>
              <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                Study must never stop! Check out pre-owned, verified textbooks and novel collections starting at just ₹99.
              </p>
            </div>
            <Link
              href="/books"
              className="inline-flex items-center space-x-2 rounded-xl bg-[#F26522] hover:bg-[#e05310] px-6 py-3 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Continue Shopping</span>
            </Link>

            {/* Recommendations Carousel inside Empty State */}
            {recommendedBooksData.books.length > 0 && (
              <div className="pt-10 space-y-4">
                <h3 className="font-serif text-base font-bold text-text-primary text-left">
                  Popular Books For You
                </h3>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 scroll-smooth">
                  {recommendedBooksData.books.map((book) => (
                    <div
                      key={book.id}
                      className="w-36 bg-card border border-border rounded-xl p-3 shrink-0 flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="aspect-[2/3] w-full rounded overflow-hidden border border-border bg-background-subtle">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={book.images?.[0]?.url || 'https://placehold.co/100x150'}
                          alt={book.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="mt-2 space-y-1 text-left">
                        <h4 className="text-[11px] font-bold text-text-primary truncate">{book.title}</h4>
                        <p className="text-[10px] text-text-secondary truncate">by {book.author}</p>
                        <p className="text-xs font-bold text-[#F26522]">₹{book.price}</p>
                      </div>
                      <button
                        onClick={() => addToCartMutation.mutate(book)}
                        disabled={addToCartMutation.isPending}
                        className="w-full mt-2.5 py-1.5 bg-secondary/10 hover:bg-secondary text-secondary hover:text-white font-bold rounded-lg text-[9px] uppercase tracking-wider transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Left Items Section Container */}
            <div className="flex-grow w-full min-w-0 space-y-5">
              
              {/* Delivery Progress Bar Card */}
              <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3 text-xs">
                  {shippingFee === 0 ? (
                    <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
                      <span>🎉 Congratulations! FREE shipping unlocked on this order!</span>
                    </span>
                  ) : (
                    <span className="font-semibold text-text-primary">
                      You are only <span className="font-bold text-[#F26522]">₹{remainingForFreeShipping.toFixed(2)}</span> away from <span className="font-bold">FREE SHIPPING</span>
                    </span>
                  )}
                  <span className="text-[10px] font-medium text-text-secondary">Pincode Check</span>
                </div>
                <div className="w-full bg-background-subtle h-2.5 rounded-full overflow-hidden border border-border/40 mb-3.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#F26522] to-amber-500 transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-text-secondary font-medium">
                  Standard delivery window: <span className="font-bold text-text-primary">2 - 4 business days</span>. Faster delivery available on checkout options.
                </p>
              </div>

              {/* Saved Coupons Box */}
              <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
                <button
                  onClick={() => setIsCouponExpanded(!isCouponExpanded)}
                  className="w-full flex items-center justify-between font-bold text-xs text-text-primary uppercase tracking-wider"
                >
                  <span className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-[#F26522]" />
                    <span>Apply Coupon / Offers</span>
                  </span>
                  {isCouponExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                
                {isCouponExpanded && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4 animate-fade-in font-sans">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter Promo Code"
                        className="flex-grow px-3 py-2 text-xs border border-border rounded-xl bg-background text-text-primary focus:outline-none focus:ring-1 focus:ring-secondary uppercase font-bold"
                      />
                      <button
                        onClick={() => handleApplyCoupon(couponCode)}
                        className="px-4 py-2 bg-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-secondary-600 transition-colors shadow-2xs"
                      >
                        Apply
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-[10px] font-bold text-danger flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{couponError}</span>
                      </p>
                    )}

                    {appliedCoupon && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-xs font-bold">
                        <span className="flex items-center gap-1.5">
                          <Check className="h-4 w-4 text-emerald-600" />
                          <span>Coupon &ldquo;{appliedCoupon}&rdquo; Applied Successfully!</span>
                        </span>
                        <button
                          onClick={() => {
                            setAppliedCoupon(null);
                            setCouponCode('');
                          }}
                          className="text-[10px] text-danger hover:underline font-extrabold"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">Available Coupons</p>
                      
                      <div
                        onClick={() => {
                          setCouponCode('BOOKFRYNEW');
                          handleApplyCoupon('BOOKFRYNEW');
                        }}
                        className="p-3 border border-dashed border-[#F26522]/40 bg-[#FFF9F6] rounded-xl flex justify-between items-center cursor-pointer hover:bg-[#FFEFE6] transition-colors"
                      >
                        <div>
                          <span className="px-2 py-0.5 bg-[#F26522] text-white rounded text-[9px] font-bold uppercase">BOOKFRYNEW</span>
                          <p className="text-[10px] font-medium text-text-primary mt-1">Get 10% Flat Discount on your first textbook bundle</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#F26522]" />
                      </div>

                      <div
                        onClick={() => {
                          setCouponCode('FESTIVE20');
                          handleApplyCoupon('FESTIVE20');
                        }}
                        className="p-3 border border-dashed border-[#F26522]/40 bg-[#FFF9F6] rounded-xl flex justify-between items-center cursor-pointer hover:bg-[#FFEFE6] transition-colors"
                      >
                        <div>
                          <span className="px-2 py-0.5 bg-[#F26522] text-white rounded text-[9px] font-bold uppercase">FESTIVE20</span>
                          <p className="text-[10px] font-medium text-text-primary mt-1">Get 20% Flat Discount on orders over ₹499</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#F26522]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {items.map((item) => {
                    const book = item.bookDetail;
                    if (!book) return null;
                    const imageUrl = book.images?.[0]?.url || '';

                    return (
                      <motion.div
                        key={item.bookId}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.2 }}
                        className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row gap-4 sm:gap-5"
                      >
                        {/* Left column: Image & Details */}
                        <div className="flex flex-grow gap-4 sm:gap-5 min-w-0">
                          {/* Book Image */}
                          <div className="h-28 w-20 sm:h-32 sm:w-22 bg-background-subtle rounded-xl overflow-hidden shrink-0 border border-border shadow-2xs group cursor-pointer relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imageUrl}
                              alt={book.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://placehold.co/100x150/16523d/ffffff?text=' +
                                  encodeURIComponent(book.title);
                              }}
                            />
                          </div>

                          {/* Book details */}
                          <div className="flex-grow flex flex-col justify-between min-w-0">
                            <div>
                              <Link
                                href={`/books/${book.slug}`}
                                className="font-sans text-xs sm:text-sm font-bold text-text-primary hover:text-secondary transition-colors line-clamp-2 leading-snug"
                              >
                                {book.title}
                              </Link>
                              <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5">
                                by {book.author}
                              </p>
                              
                              <div className="flex flex-wrap gap-2.5 items-center mt-2.5 select-none">
                                <span className="inline-flex items-center rounded-lg bg-[#FFF9F6] border border-[#F26522]/20 px-2 py-0.5 text-[9px] font-bold text-secondary uppercase">
                                  {book.condition.replace('_', ' ')}
                                </span>
                                <span className="text-[10px] text-text-secondary font-medium flex items-center gap-1">
                                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                  <span>Verified Seller</span>
                                </span>
                                <span className="text-[10px] text-text-secondary font-medium flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5 text-secondary" />
                                  <span>Delivered in 2-4 Days</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right column: Price & Actions */}
                        <div className="flex md:flex-col justify-between items-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-border md:pl-5 shrink-0 min-w-full md:min-w-[170px]">
                          {/* Price details */}
                          <div className="text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <span className="text-xs text-text-muted line-through font-medium">
                                ₹{(item.priceSnapshot * item.quantity * 1.25).toFixed(2)}
                              </span>
                              <span className="text-sm font-bold text-text-primary">
                                ₹{(item.priceSnapshot * item.quantity).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-end gap-1 mt-0.5">
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-1 rounded">20% OFF</span>
                              <span className="text-[9px] text-text-muted">
                                (₹{item.priceSnapshot.toFixed(2)} each)
                              </span>
                            </div>
                          </div>

                          {/* Stepper and Delete controls */}
                          <div className="flex items-center gap-3 w-full justify-between md:justify-end">
                            <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden">
                              <button
                                onClick={() =>
                                  handleQtyChange(item.bookId, item.quantity, -1, book.stock)
                                }
                                className="p-2 hover:bg-background-subtle text-text-secondary transition-colors disabled:opacity-30 active:scale-90"
                                disabled={item.quantity <= 1 || isCartLoading}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="px-2.5 text-xs font-bold text-text-primary min-w-[24px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQtyChange(item.bookId, item.quantity, 1, book.stock)
                                }
                                className="p-2 hover:bg-background-subtle text-text-secondary transition-colors disabled:opacity-30 active:scale-90"
                                disabled={item.quantity >= book.stock || isCartLoading}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={() => handleRemove(item.bookId)}
                              disabled={isCartLoading}
                              className="p-2 hover:bg-danger/10 rounded-xl text-text-muted hover:text-danger transition-colors shrink-0 border border-transparent hover:border-danger/20"
                              title="Remove Item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Recommended Carousel Section */}
              {recommendedBooksData.books.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                  <h3 className="font-serif text-base font-bold text-text-primary">
                    Frequently Bought Together
                  </h3>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4 scroll-smooth">
                    {recommendedBooksData.books.map((book) => (
                      <div
                        key={book.id}
                        className="w-36 bg-background border border-border rounded-xl p-3 shrink-0 flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="aspect-[2/3] w-full rounded-lg overflow-hidden border border-border bg-background-subtle relative group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={book.images?.[0]?.url || 'https://placehold.co/100x150'}
                            alt={book.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <button className="absolute right-1.5 top-1.5 p-1 bg-white hover:bg-slate-100 rounded-full shadow-xs text-text-secondary hover:text-danger transition-colors">
                            <Heart className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="mt-2.5 space-y-0.5 text-left">
                          <h4 className="text-[11px] font-bold text-text-primary truncate leading-snug">{book.title}</h4>
                          <p className="text-[10px] text-text-secondary truncate">by {book.author}</p>
                          
                          <div className="flex items-center space-x-1.5 pt-1">
                            <span className="text-xs font-bold text-secondary">₹{book.price}</span>
                            <span className="text-[9px] text-text-muted line-through">₹{(book.price * 1.3).toFixed(0)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => addToCartMutation.mutate(book)}
                          disabled={addToCartMutation.isPending}
                          className="w-full mt-3 py-2 bg-secondary hover:bg-secondary-600 text-white font-bold rounded-lg text-[9px] uppercase tracking-wider transition-all active:scale-95"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Order Summary Column (Sticky on Desktop, Bottom Sheet trigger on Mobile) */}
            <div className="w-full lg:w-[380px] xl:w-[400px] shrink-0 space-y-6 lg:sticky lg:top-24">
              
              {/* Deliver to address summary widget */}
              {isAuthenticated && (
                <div className="border border-border rounded-2xl bg-card p-4 sm:p-5 shadow-xs">
                  <div className="flex justify-between items-center mb-3.5 border-b border-border pb-3">
                    <h4 className="font-serif text-xs uppercase tracking-wider font-bold text-text-primary flex items-center space-x-1.5">
                      <MapPin className="h-4 w-4 text-[#F26522]" />
                      <span>Delivery Details</span>
                    </h4>
                    <button
                      onClick={() => setIsAddressModalOpen(true)}
                      className="text-xs font-bold text-secondary hover:underline"
                    >
                      {activeAddress ? 'Change' : 'Add Location'}
                    </button>
                  </div>

                  {isProfileLoading ? (
                    <div className="h-16 animate-pulse bg-background-subtle rounded-xl" />
                  ) : activeAddress ? (
                    <div className="space-y-1.5 text-xs text-text-secondary font-sans font-medium">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-text-primary">
                          {parseAddressDetails(activeAddress.street).labelName}
                        </span>
                        {activeAddress.isDefault && (
                          <span className="px-1.5 py-0.5 rounded-md bg-[#FFF9F6] border border-[#F26522]/30 text-[9px] font-bold text-secondary uppercase">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-text-primary leading-snug">
                        {parseAddressDetails(activeAddress.street).streetOnly}
                      </p>
                      <p>
                        {activeAddress.city}, {activeAddress.state} - {activeAddress.zipCode}
                      </p>
                      <p className="font-bold text-text-muted uppercase text-[9px]">
                        {activeAddress.country}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-border rounded-2xl bg-background-subtle">
                      <p className="text-xs font-bold text-text-secondary">No shipping address selected</p>
                      <button
                        onClick={() => {
                          resetAddressForm();
                          setShowAddressForm(true);
                          setIsAddressModalOpen(true);
                        }}
                        className="mt-3 px-4 py-2 bg-[#F26522] text-white font-bold rounded-lg text-xs hover:bg-[#e05310] transition-colors shadow-2xs"
                      >
                        Add Address
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Summary Card (Visible on Desktop, triggers Bottom Sheet on Mobile via bottom bar click) */}
              <div className="hidden lg:block border border-border rounded-2xl bg-card p-6 space-y-6 shadow-sm">
                <h3 className="font-serif text-lg font-bold text-text-primary border-b border-border pb-4">
                  Order Summary
                </h3>

                <div className="space-y-4 text-xs font-sans font-semibold text-text-secondary">
                  <div className="flex justify-between">
                    <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                    <span className="font-bold text-text-primary">₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Coupon Discount ({appliedCoupon})</span>
                      <span>- ₹{couponDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span className="font-bold text-text-primary">
                      {shippingFee === 0 ? <span className="text-emerald-600">FREE</span> : `₹${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated GST (8%)</span>
                    <span className="font-bold text-text-primary">₹{estimatedTax.toFixed(2)}</span>
                  </div>
                  
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 rounded-xl p-3 flex justify-between text-xs font-bold text-emerald-800">
                    <span>Your Total Savings</span>
                    <span>₹{savings.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-border pt-4 flex justify-between text-base font-bold text-text-primary">
                    <span>Total Amount</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleProceedCheckout}
                    loading={checkoutMutation.isPending}
                    variant="secondary"
                    fullWidth
                    rightIcon={<ChevronRight className="h-4 w-4" />}
                    className="py-3 rounded-xl text-xs font-bold"
                  >
                    Proceed to Checkout
                  </Button>
                  <p className="text-[10px] text-center text-text-muted mt-3">
                    By proceeding, you agree to BookFry terms & conditions
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* MOBILE STICKY BOTTOM CHECKOUT BAR (Visible only on mobile/tablet) */}
      {items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-40 flex items-center justify-between gap-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] font-sans">
          <div className="cursor-pointer" onClick={() => setIsMobileSummaryOpen(true)}>
            <p className="text-[10px] font-bold text-text-secondary flex items-center gap-0.5">
              <span>TOTAL AMOUNT</span>
              <ChevronUp className="h-3 w-3 text-secondary animate-bounce" />
            </p>
            <p className="text-base font-bold text-text-primary">₹{total.toFixed(2)}</p>
            {savings > 0 && <p className="text-[9px] font-bold text-emerald-600">Saved ₹{savings.toFixed(0)}</p>}
          </div>

          <button
            onClick={handleProceedCheckout}
            disabled={checkoutMutation.isPending}
            className="flex-1 py-3 bg-[#F26522] hover:bg-[#e05310] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm"
          >
            {checkoutMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <>
                <span>Place Order</span>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* MOBILE ORDER SUMMARY DRAWER / BOTTOM SHEET OVERLAY */}
      {isMobileSummaryOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center lg:hidden"
          onClick={() => setIsMobileSummaryOpen(false)}
        >
          <div
            className="w-full bg-card border-t border-border rounded-t-2xl p-6 space-y-6 shadow-2xl relative animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-serif text-base font-bold text-text-primary">Order Summary</h3>
              <button
                onClick={() => setIsMobileSummaryOpen(false)}
                className="p-1 rounded-full hover:bg-background-subtle text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-medium font-sans text-text-secondary">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-bold text-text-primary">₹{subtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon discount ({appliedCoupon})</span>
                  <span>- ₹{couponDiscountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-bold text-text-primary">
                  {shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST (8%)</span>
                <span className="font-bold text-text-primary">₹{estimatedTax.toFixed(2)}</span>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 p-3 rounded-xl flex justify-between text-emerald-800 font-bold">
                <span>Total Savings</span>
                <span>₹{savings.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-3.5 flex justify-between text-sm font-bold text-text-primary">
                <span>Total Amount</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <Button
             onClick={handleProceedCheckout}
             loading={checkoutMutation.isPending}
             variant="secondary"
             className="flex-1 py-3 rounded-xl text-xs uppercase tracking-wider"
             rightIcon={<ChevronRight className="h-4 w-4" />}
           >
             Place Order
           </Button>
          </div>
        </div>
      )}

      {/* STEP 2: ADDRESS CHANGE & ADD DIALOG MODAL */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddressModalOpen(false)}
              className="fixed inset-0 bg-primary-950/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-10 p-6 flex flex-col max-h-[90vh] my-auto"
              role="dialog"
            >
              <div className="flex justify-between items-center pb-4 border-b border-border mb-4">
                <h3 className="font-serif text-lg font-bold text-text-primary flex items-center space-x-1.5">
                  <MapPin className="h-5 w-5 text-brand" />
                  <span>Choose Delivery Destination</span>
                </h3>
                <button
                  onClick={() => setIsAddressModalOpen(false)}
                  className="p-1 rounded-full bg-background-subtle hover:bg-border text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="overflow-y-auto pr-1 flex-grow space-y-4 min-h-0">
                {showAddressForm ? (
                  /* Form to Add New Address */
                  <form onSubmit={handleSaveAddress} className="space-y-4 text-sm pt-2">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-semibold text-text-primary">Add Shipping Location</h4>
                      <button
                        type="button"
                        onClick={handleGPSAutofill}
                        disabled={isLocating}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand/10 border border-brand/20 text-brand rounded-full hover:bg-brand/15 text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {isLocating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
                        ) : (
                          <Compass className="h-3.5 w-3.5 text-brand" />
                        )}
                        <span>{isLocating ? 'Locating...' : 'Use Current Location'}</span>
                      </button>
                    </div>

                    {gpsError && (
                      <div className="p-3 bg-danger/10 border border-danger/20 rounded text-danger text-xs flex items-center space-x-2 font-medium">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{gpsError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-1">Address Label</label>
                        <select
                          value={addressLabel}
                          onChange={(e) => setAddressLabel(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium bg-background text-text-primary"
                        >
                          <option value="Home">Home</option>
                          <option value="Work">Work</option>
                          <option value="College">College</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-1">Full Name</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Recipient Name"
                          className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium text-text-primary"
                        />
                        {formValidationErrors.fullName && (
                          <span className="text-[10px] text-danger font-bold mt-1 block">{formValidationErrors.fullName}</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-text-secondary mb-1">Contact Phone</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="10-digit mobile number"
                          className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium text-text-primary"
                        />
                        {formValidationErrors.phone && (
                          <span className="text-[10px] text-danger font-bold mt-1 block">{formValidationErrors.phone}</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1">Address Line 1</label>
                      <input
                        type="text"
                        value={street1}
                        onChange={(e) => setStreet1(e.target.value)}
                        placeholder="Flat, House no., Building, Street"
                        className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium text-text-primary"
                      />
                      {formValidationErrors.street && (
                        <span className="text-[10px] text-danger font-bold mt-1 block">{formValidationErrors.street}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        value={street2}
                        onChange={(e) => setStreet2(e.target.value)}
                        placeholder="Landmark, Area, Sector"
                        className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium text-text-primary"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-1">City</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City"
                          className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium text-text-primary"
                        />
                        {formValidationErrors.city && (
                          <span className="text-[10px] text-danger font-bold mt-1 block">{formValidationErrors.city}</span>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-1">State</label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="State"
                          className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium text-text-primary"
                        />
                        {formValidationErrors.state && (
                          <span className="text-[10px] text-danger font-bold mt-1 block">{formValidationErrors.state}</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-1">Pincode / ZIP</label>
                        <input
                          type="text"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="ZIP Code"
                          className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium text-text-primary"
                        />
                        {formValidationErrors.zipCode && (
                          <span className="text-[10px] text-danger font-bold mt-1 block">{formValidationErrors.zipCode}</span>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-1">Country</label>
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium text-text-primary"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="checkbox"
                        id="form-default-address"
                        checked={makeDefault}
                        onChange={(e) => setMakeDefault(e.target.checked)}
                        className="rounded text-brand focus:ring-brand cursor-pointer"
                      />
                      <label htmlFor="form-default-address" className="text-xs font-bold text-text-secondary cursor-pointer">
                        Set as default shipping address
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={addAddressMutation.isPending}
                        className="px-4 py-2.5 bg-brand text-white font-semibold rounded text-xs hover:bg-brand-hover transition-colors flex items-center justify-center space-x-1.5"
                      >
                        {addAddressMutation.isPending && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                        )}
                        <span>Save Address</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          resetAddressForm();
                        }}
                        className="px-4 py-2.5 border border-border text-text-secondary hover:bg-background-subtle rounded text-xs transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Addresses list */
                  <div className="space-y-3 pt-2">
                    {profile?.addresses && profile.addresses.length > 0 ? (
                      profile.addresses.map((address) => (
                        <div
                          key={address._id}
                          onClick={() => setSelectedAddressId(address._id || null)}
                          className={`border rounded-lg p-4 flex justify-between items-start gap-4 transition-all cursor-pointer ${
                            selectedAddressId === address._id
                              ? 'border-brand bg-brand/5 shadow-xs'
                              : 'border-border bg-surface hover:bg-background-subtle'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <input
                              type="radio"
                              name="checkout-address"
                              checked={selectedAddressId === address._id}
                              onChange={() => setSelectedAddressId(address._id || null)}
                              className="text-brand focus:ring-brand mt-1 cursor-pointer"
                            />
                            <div className="space-y-1 text-xs text-text-secondary font-sans">
                              <div className="flex items-center space-x-2">
                                <p className="font-bold text-text-primary">
                                  {parseAddressDetails(address.street).labelName}
                                </p>
                                {address.isDefault && (
                                  <span className="px-1.5 py-0.5 rounded bg-brand/10 border border-brand/20 text-[9px] font-bold text-brand uppercase">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="font-medium text-text-primary">
                                {parseAddressDetails(address.street).streetOnly}
                              </p>
                              <p>
                                {address.city}, {address.state} - {address.zipCode}
                              </p>
                              <p className="text-[10px] text-text-muted font-bold uppercase">{address.country}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            {!address.isDefault && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAddressDefaultMutation.mutate(address._id!);
                                }}
                                className="px-2 py-1 border border-border hover:border-brand/35 text-[10px] font-bold text-text-secondary hover:text-brand bg-surface rounded transition-colors"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  deleteAddressMutation.mutate(address._id!);
                              }}
                              className="p-1.5 border border-border hover:border-danger/35 hover:bg-danger/5 text-text-muted hover:text-danger bg-surface rounded transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 border border-dashed border-border rounded-lg bg-background-subtle">
                        <MapPin className="h-10 w-10 text-text-muted mx-auto mb-2" />
                        <p className="text-xs font-bold text-text-secondary">No addresses registered yet.</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-border mt-6">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(true)}
                        className="px-4 py-2 bg-brand/10 border border-brand/25 text-brand font-bold rounded-full hover:bg-brand/15 text-xs transition-colors flex items-center space-x-1.5 mx-auto"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add New Address</span>
                      </button>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={() => setIsAddressModalOpen(false)}
                        className="flex-1 py-2.5 bg-brand text-white font-semibold rounded text-xs hover:bg-brand-hover transition-colors text-center"
                      >
                        Confirm Destination
                      </button>
                      <button
                        onClick={() => setIsAddressModalOpen(false)}
                        className="px-4 py-2.5 border border-border text-text-secondary hover:bg-background-subtle rounded text-xs transition-colors"
                      >
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

      {/* ORDER PLACED SUCCESSFULLY MODAL */}
      <AnimatePresence>
        <Dialog
          isOpen={isCheckoutModalOpen}
          onClose={() => {
            setIsCheckoutModalOpen(false);
            router.push('/account/orders');
          }}
          title="Order Placed Successfully! 🎉"
          size="sm"
        >
          <div className="flex flex-col items-center text-center space-y-4 font-sans">
            <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <Check className="h-6 w-6" />
            </div>

            <div className="space-y-2 w-full">
              {placedOrder && (
                <p className="text-xs font-bold text-primary uppercase tracking-wider bg-[#EFF6FC] border border-[#B8D7F2] px-2 py-1 rounded">
                  Order Number: {placedOrder.orderNumber}
                </p>
              )}
              <p className="text-xs text-text-secondary leading-relaxed">
                Thank you for your order! Your book request has been saved and is currently being processed. You can monitor its delivery status and timeline under your account profile dashboard.
              </p>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                setIsCheckoutModalOpen(false);
                router.push('/account/orders');
              }}
              className="py-2.5 text-xs font-semibold rounded-lg"
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
