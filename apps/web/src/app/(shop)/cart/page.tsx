'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const { isAuthenticated } = useAuthStore();
  const { items, isLoading, updateQuantity, removeItem, fetchCart } = useCartStore();

  useEffect(() => {
    fetchCart(isAuthenticated);
  }, [isAuthenticated, fetchCart]);

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

  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.priceSnapshot, 0);
  const shippingFee = subtotal > 35 ? 0 : 4.99;
  const estimatedTax = subtotal * 0.08;
  const total = subtotal + shippingFee + estimatedTax;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-serif text-3xl font-bold text-text-primary mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16 border border-border rounded-md bg-surface max-w-2xl mx-auto space-y-6">
            <div className="h-16 w-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-xl font-bold text-text-primary font-serif">
                Your cart is empty
              </h2>
              <p className="text-sm text-text-secondary max-w-sm mx-auto font-sans">
                Looks like you haven&apos;t added any books to your cart yet. Let&apos;s find some
                stories for you!
              </p>
            </div>
            <Link
              href="/books"
              className="inline-flex items-center space-x-2 rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover transition-all duration-120 font-sans"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Browse Books</span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Items List */}
            <div className="flex-grow space-y-4">
              {items.map((item) => {
                const book = item.bookDetail;
                if (!book) return null;
                const imageUrl = book.images?.[0]?.url || '';

                return (
                  <div
                    key={item.bookId}
                    className="flex gap-4 p-4 border border-border bg-surface rounded-md hover:shadow-sm transition-shadow duration-120"
                  >
                    <div className="h-24 w-16 bg-background-subtle rounded overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
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

                    <div className="flex-grow flex flex-col justify-between font-sans">
                      <div>
                        <Link
                          href={`/books/${book.slug}`}
                          className="font-sans text-sm font-semibold text-text-primary hover:text-brand transition-colors line-clamp-1"
                        >
                          {book.title}
                        </Link>
                        <p className="text-xs text-text-secondary mt-0.5 font-sans">
                          by {book.author}
                        </p>
                        <span className="inline-flex items-center rounded-full bg-brand/5 px-2 py-0.5 text-[9px] font-bold text-brand uppercase tracking-wider mt-2 border border-brand/10 font-sans">
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
                            disabled={item.quantity <= 1 || isLoading}
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
                            disabled={item.quantity >= book.stock || isLoading}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.bookId)}
                          className="text-text-muted hover:text-danger p-1 transition-colors"
                          title="Remove item"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex flex-col justify-between items-end font-sans">
                      <span className="text-sm font-bold text-text-primary">
                        ${(item.priceSnapshot * item.quantity).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        ${item.priceSnapshot.toFixed(2)} each
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Checkout Summary sidebar */}
            <div className="w-full lg:w-96 shrink-0">
              <div className="border border-border rounded-md bg-surface p-6 space-y-6 shadow-sm sticky top-24">
                <h3 className="font-serif text-lg font-bold text-text-primary border-b border-border pb-4">
                  Order Summary
                </h3>

                <div className="space-y-4 text-sm font-sans">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className="font-semibold text-text-primary">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Shipping</span>
                    <span className="font-semibold text-text-primary">
                      {shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Estimated Tax</span>
                    <span className="font-semibold text-text-primary">
                      ${estimatedTax.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between text-base font-bold text-text-primary">
                    <span>Order Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 font-sans">
                  <button
                    onClick={() => {
                      alert('Checkout feature is scheduled for Phase 3 - Transactions.');
                    }}
                    className="w-full py-3 bg-brand text-white font-semibold rounded-md hover:bg-brand-hover shadow-sm transition-all duration-120 flex items-center justify-center space-x-2"
                  >
                    <span>Proceed to Checkout</span>
                  </button>
                  <p className="text-[10px] text-center text-text-muted mt-3">
                    Free shipping on orders over $35
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
