'use client';

import React, { useState } from 'react';
import { ShoppingBag, ShieldCheck, Check, Store, MapPin } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { Book } from '@bookmarket/types';

export interface SellerOffer {
  id: string; // Listing ID
  sellerId: string;
  sellerName: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'acceptable' | string;
  price: number;
  discountPrice?: number;
  stock: number;
  status: string;
  createdAt: string;
}

interface SellerOffersListProps {
  catalogBook: Book;
  offers: SellerOffer[];
}

export function SellerOffersList({ catalogBook, offers = [] }: SellerOffersListProps) {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [addedListingId, setAddedListingId] = useState<string | null>(null);
  const [isAddingListingId, setIsAddingListingId] = useState<string | null>(null);

  if (!offers || offers.length <= 1) {
    return null; // Single seller or default buy box is sufficient
  }

  const handleAddOfferToCart = async (offer: SellerOffer, e: React.MouseEvent) => {
    e.preventDefault();
    if (offer.stock === 0 || isAddingListingId === offer.id) return;

    setIsAddingListingId(offer.id);
    try {
      // Create book payload with seller listing specifics
      const targetBook: Book = {
        ...catalogBook,
        id: offer.id, // Target specific listing ID
        price: offer.price,
        discountPrice: offer.discountPrice,
        condition: offer.condition as Book['condition'],
        sellerId: offer.sellerId,
        stock: offer.stock,
      };

      await addItem(isAuthenticated, targetBook, 1);
      setAddedListingId(offer.id);
      setTimeout(() => setAddedListingId(null), 2500);
    } catch (err) {
      console.error('Failed to add seller offer to cart', err);
    } finally {
      setIsAddingListingId(null);
    }
  };

  const conditionLabels: Record<string, string> = {
    new: 'New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
    acceptable: 'Acceptable',
  };

  const conditionBadges: Record<string, string> = {
    new: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
    like_new: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
    good: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
    fair: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
    acceptable: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300',
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center space-x-2">
          <Store className="h-5 w-5 text-secondary" />
          <h3 className="font-serif text-lg font-bold text-text-primary">
            Other Offers from Verified Sellers ({offers.length})
          </h3>
        </div>
        <span className="text-xs font-bold text-secondary bg-secondary/10 px-2.5 py-1 rounded-full border border-secondary/20">
          Peer-to-Peer Marketplace
        </span>
      </div>

      <div className="divide-y divide-border">
        {offers.map((offer) => {
          const isAdded = addedListingId === offer.id;
          const isAdding = isAddingListingId === offer.id;
          const conditionLabel = conditionLabels[offer.condition] || 'Good';
          const conditionBadge = conditionBadges[offer.condition] || conditionBadges.good;

          return (
            <div key={offer.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Seller & Condition Info */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-text-primary flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-secondary" />
                    {offer.sellerName}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${conditionBadge}`}>
                    {conditionLabel}
                  </span>
                </div>
                <p className="text-xs text-text-muted flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>Ships via BookFry Express Doorstep Pickup</span>
                </p>
              </div>

              {/* Price & Action */}
              <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-border">
                <div className="text-right">
                  <span className="text-lg font-bold font-mono text-text-primary block">
                    ₹{offer.price.toFixed(2)}
                  </span>
                  {offer.discountPrice && offer.discountPrice > offer.price && (
                    <span className="text-xs text-text-muted line-through block">
                      ₹{offer.discountPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => handleAddOfferToCart(offer, e)}
                  disabled={offer.stock === 0 || isAdding}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-xs ${
                    isAdded
                      ? 'bg-success text-white'
                      : 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isAdded ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>Buy from Seller</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SellerOffersList;
