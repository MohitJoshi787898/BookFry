'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Book } from '@bookmarket/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  variant: 'desktop' | 'tablet' | 'mobile';
  className?: string;
}

export function SearchBar({ variant, className }: SearchBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Click outside to close autosuggest
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autosuggest Query
  const { data: searchResults = [], isFetching } = useQuery<Book[]>({
    queryKey: ['navbar-search-autosuggest', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) return [];
      const res = await apiClient<{ books: Book[] }>(`/books?search=${encodeURIComponent(searchQuery)}&limit=5`);
      return res.books || [];
    },
    enabled: searchQuery.trim().length >= 2,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchFocused(false);
    }
  };

  if (variant === 'desktop') {
    return (
      <div ref={searchRef} className={cn('relative flex-grow max-w-2xl font-sans', className)}>
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center border border-border bg-background focus-within:ring-2 focus-within:ring-[#F26522]/20 focus-within:border-[#F26522] h-11 rounded-full overflow-hidden"
        >
          {/* Category Dropdown */}
          <div className="px-4 flex items-center gap-1 text-[11px] font-bold text-text-secondary border-r border-border hover:bg-background-subtle cursor-pointer select-none shrink-0 h-full">
            <span>All Categories</span>
            <ChevronDown className="h-3 w-3 text-text-muted" />
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder="Search by title, author, ISBN or keyword..."
            className="flex-grow pl-4 pr-3 text-xs bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none h-full"
          />

          {/* Search Button */}
          <button
            type="submit"
            className="bg-[#F26522] hover:bg-[#e05310] text-white font-bold text-xs px-6 flex items-center gap-1.5 h-full transition-colors shrink-0"
          >
            {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
            <span>Search</span>
          </button>
        </form>

        {/* Suggestion Dropdown */}
        {searchFocused && searchQuery.trim().length >= 2 && (
          <SuggestionsList
            results={searchResults}
            query={searchQuery}
            onClose={() => setSearchFocused(false)}
          />
        )}
      </div>
    );
  }

  // Tablet & Mobile variations
  return (
    <div ref={searchRef} className={cn('relative font-sans', className)}>
      <form
        onSubmit={handleSearchSubmit}
        className="flex items-center border border-border bg-background focus-within:ring-2 focus-within:ring-[#F26522]/20 focus-within:border-[#F26522] h-10 rounded-full overflow-hidden"
      >
        <div className="relative flex-grow flex items-center pl-3">
          <Search className="h-3.5 w-3.5 text-text-muted shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder="Search by title, author, ISBN..."
            className="w-full pl-2 pr-3 text-xs bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none h-full py-2.5"
          />
        </div>

        <button
          type="submit"
          className="bg-[#F26522] hover:bg-[#e05310] text-white p-2.5 flex items-center justify-center h-full transition-colors shrink-0"
        >
          {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
        </button>
      </form>

      {/* Suggestion Dropdown */}
      {searchFocused && searchQuery.trim().length >= 2 && (
        <SuggestionsList
          results={searchResults}
          query={searchQuery}
          onClose={() => setSearchFocused(false)}
        />
      )}
    </div>
  );
}

// Internal Sub-component for Suggestions to keep code clean and modular
interface SuggestionsListProps {
  results: Book[];
  query: string;
  onClose: () => void;
}

function SuggestionsList({ results, query, onClose }: SuggestionsListProps) {
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 divide-y divide-border">
      {results.length > 0 ? (
        <div className="py-2">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Matching Books
          </div>
          {results.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.slug}`}
              onClick={onClose}
              className="flex items-center space-x-3 px-3 py-2 hover:bg-background-subtle transition-colors"
            >
              <div className="h-10 w-7 bg-background-subtle rounded overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={book.images?.[0]?.url || 'https://placehold.co/100x150/1a3b5c/ffffff?text=Book'}
                  alt={book.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">{book.title}</p>
                <p className="text-[11px] text-text-muted truncate">by {book.author}</p>
              </div>
              <span className="text-xs font-bold text-text-primary">₹{book.price.toFixed(2)}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-xs text-text-muted">
          No books found matching &quot;{query}&quot;
        </div>
      )}
      <Link
        href={`/books?search=${encodeURIComponent(query)}`}
        onClick={onClose}
        className="block px-3 py-2 text-center text-xs font-bold text-[#F26522] hover:bg-background-subtle transition-colors"
      >
        View all search results →
      </Link>
    </div>
  );
}
