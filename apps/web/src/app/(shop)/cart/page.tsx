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
import { User, Address } from '@bookmarket/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  MapPin,
  Compass,
  Loader2,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';

export default function CartPage() {
  const { isAuthenticated } = useAuthStore();
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

  // Query User Profile for Addresses
  const {
    data: profile,
    isLoading: isProfileLoading,
  } = useQuery<User>({
    queryKey: ['user-profile'],
    queryFn: () => apiClient('/users/profile'),
    enabled: isAuthenticated,
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
      // If no address was selected, set this one as selected
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
      const order = await apiClient('/orders', {
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

      // Trigger mock payment verification automatically in sandbox mode
      const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 10)}`;
      await apiClient('/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.id,
          razorpay_payment_id: mockPaymentId,
        }),
      });

      return order;
    },
    onSuccess: (res) => {
      // Invalidate cart state so cart icon count updates to 0 reactively!
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      // Update local storage/Zustand store cart if necessary
      useCartStore.getState().fetchCart(true);
      setPlacedOrder(res);
      setIsCheckoutModalOpen(true);
    },
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

  // Browser Geolocation reverse geocode API call
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

    // Combine label, full name, phone number, and street lines into the database street field
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

  const handleProceedCheckout = () => {
    if (!activeAddress) {
      setIsAddressModalOpen(true);
      return;
    }
    checkoutMutation.mutate(activeAddress);
  };

  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.priceSnapshot, 0);
  const shippingFee = subtotal > 35 || subtotal === 0 ? 0 : 4.99;
  const estimatedTax = subtotal * 0.08;
  const total = subtotal + shippingFee + estimatedTax;

  const activeAddress = profile?.addresses?.find((a) => a._id === selectedAddressId);

  // Address description parser for user summary
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
        <h1 className="font-serif text-3xl font-bold text-text-primary mb-8 flex items-center space-x-3">
          <ShoppingBag className="h-8 w-8 text-brand" />
          <span>Shopping Cart</span>
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-16 border border-border rounded-md bg-surface max-w-2xl mx-auto space-y-6">
            <div className="h-16 w-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-xl font-bold text-text-primary">
                Your cart is empty
              </h2>
              <p className="text-sm text-text-secondary max-w-sm mx-auto">
                Looks like you haven&apos;t added any books to your cart yet. Let&apos;s find some stories!
              </p>
            </div>
            <Link
              href="/books"
              className="inline-flex items-center space-x-2 rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover transition-all duration-120"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Browse Books</span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Items List */}
            <div className="flex-grow space-y-4 w-full">
              {items.map((item) => {
                const book = item.bookDetail;
                if (!book) return null;
                const imageUrl = book.images?.[0]?.url || '';

                return (
                  <div
                    key={item.bookId}
                    className="flex gap-4 p-4 border border-border bg-surface rounded-md hover:shadow-xs transition-shadow duration-120"
                  >
                    <div className="h-24 w-16 bg-background-subtle rounded overflow-hidden shrink-0 border border-border">
                      <img
                        src={imageUrl}
                        alt={book.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/100x150/16523d/ffffff?text=' +
                            encodeURIComponent(book.title);
                        }}
                      />
                    </div>

                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <Link
                          href={`/books/${book.slug}`}
                          className="font-sans text-sm font-bold text-text-primary hover:text-brand transition-colors line-clamp-1"
                        >
                          {book.title}
                        </Link>
                        <p className="text-xs text-text-secondary mt-0.5">
                          by {book.author}
                        </p>
                        <span className="inline-flex items-center rounded bg-brand/10 px-2 py-0.5 text-[9px] font-bold text-brand uppercase mt-2">
                          {book.condition.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-border rounded bg-background">
                          <button
                            onClick={() =>
                              handleQtyChange(item.bookId, item.quantity, -1, book.stock)
                            }
                            className="p-1 hover:bg-background-subtle text-text-secondary transition-colors"
                            disabled={item.quantity <= 1 || isCartLoading}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 text-xs font-semibold text-text-primary w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQtyChange(item.bookId, item.quantity, 1, book.stock)
                            }
                            className="p-1 hover:bg-background-subtle text-text-secondary transition-colors"
                            disabled={item.quantity >= book.stock || isCartLoading}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.bookId)}
                          className="text-text-muted hover:text-danger p-1 transition-colors"
                          title="Remove item"
                          disabled={isCartLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex flex-col justify-between items-end">
                      <span className="text-sm font-bold text-text-primary">
                        ₹{(item.priceSnapshot * item.quantity).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        ₹{item.priceSnapshot.toFixed(2)} each
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary & Address Sidebar */}
            <div className="w-full lg:w-[400px] shrink-0 space-y-6">
              {/* Shipping Destination Selector Card */}
              {isAuthenticated && (
                <div className="border border-border rounded-lg bg-surface p-5 shadow-xs">
                  <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
                    <h4 className="font-serif text-sm font-bold text-text-primary flex items-center space-x-1.5">
                      <MapPin className="h-4 w-4 text-brand" />
                      <span>Deliver to</span>
                    </h4>
                    <button
                      onClick={() => setIsAddressModalOpen(true)}
                      className="text-xs font-bold text-brand hover:underline"
                    >
                      {activeAddress ? 'Change' : 'Add Location'}
                    </button>
                  </div>

                  {isProfileLoading ? (
                    <div className="h-16 animate-pulse bg-background-subtle rounded-md" />
                  ) : activeAddress ? (
                    <div className="space-y-1.5 text-xs text-text-secondary">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-text-primary">
                          {parseAddressDetails(activeAddress.street).labelName}
                        </span>
                        {activeAddress.isDefault && (
                          <span className="px-1.5 py-0.5 rounded bg-brand/10 text-[9px] font-bold text-brand uppercase">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-text-primary">
                        {parseAddressDetails(activeAddress.street).streetOnly}
                      </p>
                      <p>
                        {activeAddress.city}, {activeAddress.state} - {activeAddress.zipCode}
                      </p>
                      <p className="font-semibold text-text-muted uppercase text-[10px]">
                        {activeAddress.country}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-border rounded-lg bg-background-subtle">
                      <p className="text-xs font-bold text-text-secondary">No shipping address selected</p>
                      <button
                        onClick={() => {
                          resetAddressForm();
                          setShowAddressForm(true);
                          setIsAddressModalOpen(true);
                        }}
                        className="mt-3 px-4 py-2 bg-brand text-white font-semibold rounded text-xs hover:bg-brand-hover transition-colors shadow-sm"
                      >
                        Add Address
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Order Summary Sidebar */}
              <div className="border border-border rounded-lg bg-surface p-6 space-y-6 shadow-sm">
                <h3 className="font-serif text-lg font-bold text-text-primary border-b border-border pb-4">
                  Order Summary
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className="font-semibold text-text-primary">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Shipping</span>
                    <span className="font-semibold text-text-primary">
                      {shippingFee === 0 ? 'Free' : `₹${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Estimated Tax</span>
                    <span className="font-semibold text-text-primary">
                      ₹{estimatedTax.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between text-base font-bold text-text-primary">
                    <span>Total Amount</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleProceedCheckout}
                    disabled={checkoutMutation.isPending}
                    className="w-full py-3 bg-brand text-white font-semibold rounded hover:bg-brand-hover shadow-sm transition-all duration-120 flex items-center justify-center space-x-2"
                  >
                    {checkoutMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span>Proceed to Checkout</span>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-text-muted mt-3">
                    Free shipping on orders over ₹200
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

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
              className="relative w-full max-w-xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-10 p-6 flex flex-col max-h-[90vh] my-auto"
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
                          className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium bg-background"
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
                          className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium"
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
                          className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium"
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
                        className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium"
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
                        className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium"
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
                          className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium"
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
                          className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium"
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
                          className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium"
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
                          className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand font-medium"
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
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
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
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsCheckoutModalOpen(false);
                router.push('/account/orders');
              }}
              className="fixed inset-0 bg-primary-950/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-md bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-10 p-6 flex flex-col items-center text-center space-y-4"
              role="dialog"
            >
              <div className="h-12 w-12 bg-brand/10 text-brand rounded-full flex items-center justify-center">
                <Check className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-lg font-bold text-text-primary">
                  Order Placed Successfully! 🎉
                </h3>
                {placedOrder && (
                  <p className="text-xs font-bold text-brand uppercase tracking-wider bg-brand/10 px-2 py-1 rounded">
                    Order Number: {placedOrder.orderNumber}
                  </p>
                )}
                <p className="text-xs text-text-secondary leading-relaxed">
                  Thank you for your order! Your book request has been saved and is currently being processed. You can monitor its delivery status and timeline under your account profile dashboard.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsCheckoutModalOpen(false);
                  router.push('/account/orders');
                }}
                className="w-full py-2.5 bg-brand text-white font-semibold rounded text-xs hover:bg-brand-hover shadow-sm transition-colors"
              >
                Track My Order
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
