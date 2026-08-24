"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { Navbar } from "@/components/shared/navbar";
import { apiClient } from "@/lib/api-client";
import {
  CreditCard,
  CheckCircle2,
  ChevronRight,
  MapPin,
  ShieldCheck,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { Order, UsedBookRequest } from "@bookmarket/types";
import { Button } from "@/components/ui/button";

const shippingSchema = z.object({
  street: z.string().min(3, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State/Province is required"),
  zipCode: z.string().min(3, "Zip/Postal code is required"),
  country: z.string().min(2, "Country is required"),
});

const paymentSchema = z.object({
  cardName: z.string().min(3, "Name on card is required"),
  cardNumber: z.string().regex(/^\d{16}$/, "Card number must be 16 digits"),
  cardExpiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry format must be MM/YY"),
  cardCvc: z.string().regex(/^\d{3}$/, "CVC must be 3 digits"),
});

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

export default function CheckoutPage() {
  const { user } = useAuthStore();
  const { items, clearCart } = useCartStore();

  const [step, setStep] = useState<"shipping" | "payment" | "success">(
    "shipping",
  );
  const [shippingData, setShippingData] = useState<z.infer<
    typeof shippingSchema
  > | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [appliedCoupon] = useState<string | null>(null);
  const [validatedDiscountAmount] = useState(0);

  const subtotal = items.reduce(
    (acc, item) => acc + item.quantity * item.priceSnapshot,
    0
  );

  const discountAmount = appliedCoupon ? validatedDiscountAmount : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const shippingFee = discountedSubtotal > 499 || discountedSubtotal === 0 ? 0 : 49;
  const estimatedTax = discountedSubtotal * 0.08;
  const total = Math.max(0, discountedSubtotal + shippingFee + estimatedTax);

  const {
    register: registerShipping,
    handleSubmit: handleShippingSubmit,
    formState: { errors: shippingErrors },
  } = useForm<z.infer<typeof shippingSchema>>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
    },
  });

  const {
    register: registerPayment,
    handleSubmit: handlePaymentSubmit,
    formState: { errors: paymentErrors },
  } = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardName: user?.name || "",
    },
  });

  const onShippingSubmit = (data: z.infer<typeof shippingSchema>) => {
    setShippingData(data);
    setStep("payment");
  };

  const onPaymentSubmit = async () => {
    if (!shippingData) return;
    setIsLoading(true);
    setCheckoutError(null);

    try {
      const mixedRes = await apiClient<{
        usedRequests: UsedBookRequest[];
        newOrder: Order | null;
        requiresPayment: boolean;
      }>('/orders/checkout-mixed', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddress: shippingData,
          couponCode: appliedCoupon || undefined,
        }),
      });

      if (!mixedRes.requiresPayment || !mixedRes.newOrder) {
        // Pure used books request flow — no payment needed
        clearCart();
        setStep('success');
        setIsLoading(false);
        return;
      }

      const orderRes = mixedRes.newOrder;
      setCreatedOrder(orderRes);

      const paymentIntent = await apiClient<{
        id: string;
        clientSecret: string;
        keyId?: string;
        amount?: number;
        currency?: string;
      }>('/payments/create-intent', {
        method: 'POST',
        body: JSON.stringify({
          orderId: orderRes.id,
        }),
      });

      if (paymentIntent && paymentIntent.keyId) {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          throw new Error(
            'Razorpay SDK failed to load. Please check your internet connection.'
          );
        }

        const options = {
          key: paymentIntent.keyId,
          amount: paymentIntent.amount,
          currency: 'INR',
          name: "BookFry • India's Book Marketplace",
          description: `Payment for Order #${orderRes.orderNumber}`,
          image: '/logo.jpeg',
          order_id: paymentIntent.id,
          handler: async function (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) {
            try {
              setIsLoading(true);
              await apiClient('/payments/verify', {
                method: 'POST',
                body: JSON.stringify({
                  orderId: orderRes.id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              clearCart();
              setStep('success');
            } catch (verifyErr: unknown) {
              const errMsg =
                verifyErr instanceof Error
                  ? verifyErr.message
                  : 'Payment verification failed.';
              setCheckoutError(errMsg);
            } finally {
              setIsLoading(false);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
          },
          notes: {
            orderId: orderRes.id,
            orderNumber: orderRes.orderNumber,
          },
          theme: {
            color: '#F26522',
          },
          config: {
            display: {
              blocks: {
                upi: {
                  name: 'Pay via UPI (GPay, PhonePe, Paytm, BHIM)',
                  instruments: [{ method: 'upi' }],
                },
                other: {
                  name: 'Cards, Netbanking & Wallets',
                  instruments: [
                    { method: 'card' },
                    { method: 'netbanking' },
                    { method: 'wallet' },
                  ],
                },
              },
              sequence: ['block.upi', 'block.other'],
              preferences: {
                show_default_blocks: true,
              },
            },
          },
          modal: {
            ondismiss: function () {
              setIsLoading(false);
            },
          },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Fallback simulated mock payment confirmation
        await apiClient('/payments/verify', {
          method: 'POST',
          body: JSON.stringify({
            orderId: orderRes.id,
            razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 10)}`,
          }),
        });

        clearCart();
        setStep('success');
        setIsLoading(false);
      }
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? err.message
          : 'Checkout failed. Please try again.';
      setCheckoutError(errMsg);
      setIsLoading(false);
    }
  };

  if (items.length === 0 && step !== "success") {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow max-w-md w-full mx-auto px-4 py-16 text-center space-y-6">
          <h2 className="font-serif text-2xl font-bold text-text-primary">
            No items to checkout
          </h2>
          <p className="text-text-secondary text-sm font-sans">
            Add some books to your cart first.
          </p>
          <Link
            href="/books"
            className="inline-block px-6 py-2.5 bg-brand text-white font-semibold rounded hover:bg-brand-hover font-sans"
          >
            Browse Books
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress indicator */}
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-text-muted mb-8 justify-center">
          <span
            className={step === "shipping" ? "text-brand" : "text-text-primary"}
          >
            Shipping
          </span>
          <ChevronRight className="h-3 w-3" />
          <span
            className={
              step === "payment"
                ? "text-brand"
                : step === "success"
                  ? "text-text-primary"
                  : "text-text-muted"
            }
          >
            Payment
          </span>
          <ChevronRight className="h-3 w-3" />
          <span
            className={step === "success" ? "text-brand" : "text-text-muted"}
          >
            Confirmation
          </span>
        </div>

        {step === "success" && createdOrder ? (
          <div className="max-w-2xl mx-auto border border-border bg-surface rounded-md p-8 text-center space-y-6 shadow-sm animate-scale">
            <div className="h-16 w-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h1 className="font-serif text-3xl font-bold text-text-primary">
                Thank you for your order!
              </h1>
              <p className="text-sm text-text-secondary font-sans">
                Your order{" "}
                <span className="font-mono font-bold text-text-primary">
                  {createdOrder.orderNumber}
                </span>{" "}
                has been placed successfully.
              </p>
            </div>

            <div className="border-t border-border pt-6 text-left space-y-4 font-sans">
              <h3 className="font-sans font-bold text-text-primary text-sm">
                Shipping details
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {shippingData?.street}
                <br />
                {shippingData?.city}, {shippingData?.state}{" "}
                {shippingData?.zipCode}
                <br />
                {shippingData?.country}
              </p>
            </div>

            <div className="border-t border-border pt-6 flex justify-between text-sm font-bold text-text-primary font-sans">
              <span>Total Paid</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4 font-sans">
              <Link
                href="/account/orders"
                className="w-full sm:w-1/2 py-2.5 border border-border text-text-primary rounded hover:bg-background-subtle text-sm font-semibold transition-colors"
              >
                Track Order
              </Link>
              <Link
                href="/books"
                className="w-full sm:w-1/2 py-2.5 bg-brand text-white rounded hover:bg-brand-hover text-sm font-semibold transition-all"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Form Section */}
            <div className="flex-grow">
              {step === "shipping" ? (
                <form
                  onSubmit={handleShippingSubmit(onShippingSubmit)}
                  className="space-y-6"
                >
                  <div className="border border-border bg-surface rounded-md p-6 space-y-4">
                    <h2 className="font-serif text-xl font-bold text-text-primary flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-brand" />
                      <span>Shipping Address</span>
                    </h2>

                    <div className="space-y-3 font-sans">
                      <div>
                        <label
                          htmlFor="street"
                          className="block text-xs font-semibold text-text-secondary uppercase mb-1"
                        >
                          Street Address
                        </label>
                        <input
                          id="street"
                          type="text"
                          {...registerShipping("street")}
                          className="w-full rounded border border-border px-3 py-2 text-sm bg-background text-text-primary focus:ring-brand focus:border-brand"
                        />
                        {shippingErrors.street && (
                          <p className="text-xs text-danger mt-1 font-sans">
                            {shippingErrors.street.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="city"
                            className="block text-xs font-semibold text-text-secondary uppercase mb-1"
                          >
                            City
                          </label>
                          <input
                            id="city"
                            type="text"
                            {...registerShipping("city")}
                            className="w-full rounded border border-border px-3 py-2 text-sm bg-background text-text-primary focus:ring-brand focus:border-brand"
                          />
                          {shippingErrors.city && (
                            <p className="text-xs text-danger mt-1 font-sans">
                              {shippingErrors.city.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="state"
                            className="block text-xs font-semibold text-text-secondary uppercase mb-1"
                          >
                            State / Province
                          </label>
                          <input
                            id="state"
                            type="text"
                            {...registerShipping("state")}
                            className="w-full rounded border border-border px-3 py-2 text-sm bg-background text-text-primary focus:ring-brand focus:border-brand"
                          />
                          {shippingErrors.state && (
                            <p className="text-xs text-danger mt-1 font-sans">
                              {shippingErrors.state.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="zipCode"
                            className="block text-xs font-semibold text-text-secondary uppercase mb-1"
                          >
                            Zip / Postal Code
                          </label>
                          <input
                            id="zipCode"
                            type="text"
                            {...registerShipping("zipCode")}
                            className="w-full rounded border border-border px-3 py-2 text-sm bg-background text-text-primary focus:ring-brand focus:border-brand"
                          />
                          {shippingErrors.zipCode && (
                            <p className="text-xs text-danger mt-1 font-sans">
                              {shippingErrors.zipCode.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="country"
                            className="block text-xs font-semibold text-text-secondary uppercase mb-1"
                          >
                            Country
                          </label>
                          <input
                            id="country"
                            type="text"
                            {...registerShipping("country")}
                            className="w-full rounded border border-border px-3 py-2 text-sm bg-background text-text-primary focus:ring-brand focus:border-brand"
                          />
                          {shippingErrors.country && (
                            <p className="text-xs text-danger mt-1 font-sans">
                              {shippingErrors.country.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    className="py-3 text-xs font-bold rounded-lg"
                  >
                    Proceed to Payment
                  </Button>
                </form>
              ) : (
                <form
                  onSubmit={handlePaymentSubmit(onPaymentSubmit)}
                  className="space-y-6"
                >
                  <div className="border border-border bg-surface rounded-md p-6 space-y-4">
                    <h2 className="font-serif text-xl font-bold text-text-primary flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-brand" />
                      <span>Payment Method</span>
                    </h2>

                    {checkoutError && (
                      <div className="p-3 bg-danger/5 border border-danger/20 rounded text-xs font-medium text-danger font-sans">
                        {checkoutError}
                      </div>
                    )}

                    <div className="space-y-3 font-sans">
                      <div>
                        <label
                          htmlFor="cardName"
                          className="block text-xs font-semibold text-text-secondary uppercase mb-1"
                        >
                          Name on Card
                        </label>
                        <input
                          id="cardName"
                          type="text"
                          {...registerPayment("cardName")}
                          className="w-full rounded border border-border px-3 py-2 text-sm bg-background text-text-primary focus:ring-brand focus:border-brand"
                        />
                        {paymentErrors.cardName && (
                          <p className="text-xs text-danger mt-1 font-sans">
                            {paymentErrors.cardName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="cardNumber"
                          className="block text-xs font-semibold text-text-secondary uppercase mb-1"
                        >
                          Card Number
                        </label>
                        <input
                          id="cardNumber"
                          type="text"
                          placeholder="4111222233334444"
                          {...registerPayment("cardNumber")}
                          className="w-full rounded border border-border px-3 py-2 text-sm bg-background text-text-primary focus:ring-brand focus:border-brand font-mono"
                        />
                        {paymentErrors.cardNumber && (
                          <p className="text-xs text-danger mt-1 font-sans">
                            {paymentErrors.cardNumber.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="cardExpiry"
                            className="block text-xs font-semibold text-text-secondary uppercase mb-1"
                          >
                            Expiration (MM/YY)
                          </label>
                          <input
                            id="cardExpiry"
                            type="text"
                            placeholder="12/28"
                            {...registerPayment("cardExpiry")}
                            className="w-full rounded border border-border px-3 py-2 text-sm bg-background text-text-primary focus:ring-brand focus:border-brand font-mono"
                          />
                          {paymentErrors.cardExpiry && (
                            <p className="text-xs text-danger mt-1 font-sans">
                              {paymentErrors.cardExpiry.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="cardCvc"
                            className="block text-xs font-semibold text-text-secondary uppercase mb-1"
                          >
                            CVC
                          </label>
                          <input
                            id="cardCvc"
                            type="text"
                            placeholder="123"
                            {...registerPayment("cardCvc")}
                            className="w-full rounded border border-border px-3 py-2 text-sm bg-background text-text-primary focus:ring-brand focus:border-brand font-mono"
                          />
                          {paymentErrors.cardCvc && (
                            <p className="text-xs text-danger mt-1 font-sans">
                              {paymentErrors.cardCvc.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 font-sans w-full">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("shipping")}
                      className="w-1/3 py-3 border border-border text-xs font-bold"
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      loading={isLoading}
                      variant="primary"
                      className="w-2/3 py-3 text-xs font-bold"
                      leftIcon={<ShieldCheck className="h-4 w-4" />}
                    >
                      Pay ₹{total.toFixed(2)}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Sidebar Summary */}
            <div className="w-full lg:w-96 shrink-0 space-y-6">
              <div className="border border-border rounded-md bg-surface p-6 space-y-6 shadow-sm">
                <h3 className="font-serif text-lg font-bold text-text-primary border-b border-border pb-4 flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-brand" />
                  <span>Order Summary</span>
                </h3>

                <div className="divide-y divide-border overflow-y-auto max-h-48 pr-2">
                  {items.map((item) => (
                    <div
                      key={item.bookId}
                      className="py-3 flex justify-between text-xs font-sans"
                    >
                      <div>
                        <p className="font-semibold text-text-primary line-clamp-1">
                          {item.bookDetail?.title}
                        </p>
                        <p className="text-text-muted mt-0.5 font-sans">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-text-primary shrink-0">
                        ₹{(item.priceSnapshot * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-3 text-xs font-sans">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className="font-semibold text-text-primary">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Shipping</span>
                    <span className="font-semibold text-text-primary">
                      {shippingFee === 0
                        ? "Free"
                        : `₹${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Estimated Tax</span>
                    <span className="font-semibold text-text-primary">
                      ₹{estimatedTax.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between text-sm font-bold text-text-primary">
                    <span>Order Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
