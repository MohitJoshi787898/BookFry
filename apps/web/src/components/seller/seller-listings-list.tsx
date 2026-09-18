'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Eye, Archive, BookOpen } from 'lucide-react';
import { Book } from '@bookmarket/types';

interface SellerListingsListProps {
  listings: Book[];
  isLoading?: boolean;
  onArchive: (id: string) => void;
}

export function SellerListingsList({
  listings,
  isLoading = false,
  onArchive,
}: SellerListingsListProps) {
  const [tab, setTab] = useState<'all' | 'active' | 'sold' | 'inactive'>('all');
  const [search, setSearch] = useState('');

  const activeCount = listings.filter((b) => b.status === 'active').length;
  const soldCount = listings.filter((b) => b.status === 'sold').length;
  const inactiveCount = listings.filter((b) =>
    ['archived', 'draft', 'removed'].includes(b.status)
  ).length;

  const filtered = listings.filter((book) => {
    const q = search.trim().toLowerCase();
    const cleanQ = q.replace(/[^0-9x]/gi, '');
    const bookCleanIsbn = (book.isbn || '').replace(/[^0-9x]/gi, '').toLowerCase();

    const matchesSearch =
      !q ||
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      (cleanQ.length >= 3 && bookCleanIsbn.includes(cleanQ)) ||
      (book.isbn && book.isbn.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (tab === 'active') return book.status === 'active';
    if (tab === 'sold') return book.status === 'sold';
    if (tab === 'inactive') return ['archived', 'draft', 'removed'].includes(book.status);
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'sold':
        return 'bg-brand/10 text-brand dark:text-primary border-brand/20';
      case 'archived':
      case 'draft':
      default:
        return 'bg-muted text-text-muted border-border';
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 font-sans">
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-text-primary">
            My Listed Books
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage your listings, monitor views, and update availability
          </p>
        </div>

        <div className="relative min-w-[200px] sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by title, author, ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 border border-border rounded-xl text-xs bg-background text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs Navigation */}
      <div className="flex border-b border-border text-xs font-semibold text-text-secondary gap-2 overflow-x-auto no-scrollbar">
        {[
          { key: 'all', label: 'All Books', count: listings.length },
          { key: 'active', label: 'Active', count: activeCount },
          { key: 'sold', label: 'Sold', count: soldCount },
          { key: 'inactive', label: 'Inactive', count: inactiveCount },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key as typeof tab)}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              tab === item.key
                ? 'border-brand text-brand dark:text-primary font-bold'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>{item.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                tab === item.key
                  ? 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-primary'
                  : 'bg-muted text-text-muted'
              }`}
            >
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {/* Listings Body */}
      {isLoading ? (
        <div className="space-y-3.5 animate-pulse">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="h-28 border border-border bg-muted/40 rounded-xl p-3 flex gap-4"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 px-4 space-y-4 border border-dashed border-border rounded-2xl bg-muted/20">
          <BookOpen className="h-10 w-10 text-text-muted mx-auto" />
          <div className="space-y-1">
            <p className="font-serif font-bold text-sm text-text-primary">
              {search ? 'No matching books found' : 'No books in this tab'}
            </p>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              {search
                ? `No listings matched "${search}". Try checking for spelling or clear search filter.`
                : 'Publish your used or new books to reach thousands of student buyers across India!'}
            </p>
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="px-3.5 py-1.5 bg-card border border-border text-text-primary rounded-xl text-xs font-semibold hover:bg-muted transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5 max-h-[700px] overflow-y-auto pr-1">
          {filtered.map((book) => {
            const originalPrice = Math.round(book.price * 1.5);
            const isBookActive = book.status === 'active';
            const imageUrl =
              book.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300';

            return (
              <div
                key={book.id}
                className="flex gap-4 p-3.5 sm:p-4 border border-border rounded-2xl hover:border-brand/40 bg-card hover:bg-muted/10 transition-all duration-200 shadow-xs"
              >
                {/* Book Thumbnail */}
                <div className="w-16 h-24 sm:w-20 sm:h-28 bg-muted rounded-xl overflow-hidden border border-border shrink-0 relative">
                  <Image
                    src={imageUrl}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized
                  />
                </div>

                {/* Book Details */}
                <div className="flex-grow min-w-0 space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-text-primary truncate">
                      {book.title}
                    </h4>
                    <span
                      className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full border shrink-0 ${getStatusBadge(
                        book.status
                      )}`}
                    >
                      {book.status === 'active' ? 'Active' : book.status === 'sold' ? 'Sold' : book.status}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary truncate">by {book.author}</p>
                  <p className="text-[10px] text-text-muted">
                    Paperback •{' '}
                    <span className="capitalize font-semibold text-text-secondary">
                      {book.condition?.replace('_', ' ') || 'Good'}
                    </span>
                    {book.isbn ? ` • ISBN: ${book.isbn}` : ''}
                  </p>

                  {/* Pricing Details */}
                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className="text-sm font-black text-brand dark:text-primary font-mono">
                      ₹{book.price.toLocaleString('en-IN')}
                    </span>
                    {originalPrice > book.price && (
                      <>
                        <span className="text-[10px] text-text-muted line-through font-mono">
                          ₹{originalPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          33% OFF
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col items-end justify-between shrink-0 pl-2">
                  <button
                    onClick={() => onArchive(book.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                    title="Archive listing"
                    aria-label="Archive listing"
                  >
                    <Archive className="h-4 w-4" />
                  </button>

                  {isBookActive && (
                    <Link
                      href={`/books/${book.slug || book.id}`}
                      className="text-[10px] font-bold text-brand dark:text-primary hover:underline flex items-center gap-1 bg-brand/5 dark:bg-brand/20 px-2 py-1 rounded-lg"
                    >
                      <span>View</span>
                      <Eye className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
