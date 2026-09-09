'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Loader2, Clock, Sparkles, ChevronDown, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/lib/api-client';
import { Book } from '@bookmarket/types';

const SEARCH_CATEGORIES = [
  { id: 'all', label: 'All Books' },
  { id: 'college', label: 'College / Tech' },
  { id: 'exams', label: 'Exam Prep' },
  { id: 'fiction', label: 'Fiction & Novels' },
  { id: 'school', label: 'School (K-12)' },
];

const TRENDING_SEARCHES = [
  'HC Verma Physics',
  'NCERT Class 12',
  'UPSC Laxmikanth',
  'GATE Computer Science',
  'Engineering Mathematics',
];

interface NavbarSearchProps {
  variant?: 'desktop' | 'compact' | 'mobile';
  className?: string;
  onSelectAction?: () => void;
}

export function NavbarSearch({
  variant = 'desktop',
  className = '',
  onSelectAction,
}: NavbarSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(SEARCH_CATEGORIES[0]);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bookfry_recent_searches');
      if (stored) setRecentSearches(JSON.parse(stored).slice(0, 5));
    } catch {}
  }, []);

  const saveRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('bookfry_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== term);
      try {
        localStorage.setItem('bookfry_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Keyboard shortcut (Cmd+K / Ctrl+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'k' && (e.metaKey || e.ctrlKey)) ||
        (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setCategoryMenuOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // TanStack Query for live matching books
  const { data: searchResults = [], isFetching } = useQuery<Book[]>({
    queryKey: ['navbar-search', query, selectedCategory.id],
    queryFn: async () => {
      if (query.trim().length < 2) return [];
      const catParam = selectedCategory.id !== 'all' ? `&category=${selectedCategory.id}` : '';
      const res = await apiClient<{ books: Book[] }>(
        `/books?search=${encodeURIComponent(query.trim())}&limit=5${catParam}`
      );
      return res.books || [];
    },
    enabled: query.trim().length >= 2,
    staleTime: 60 * 1000,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    saveRecentSearch(query);
    setIsOpen(false);
    const catQuery = selectedCategory.id !== 'all' ? `&category=${selectedCategory.id}` : '';
    router.push(`/books?search=${encodeURIComponent(query.trim())}${catQuery}`);
    if (onSelectAction) onSelectAction();
  };

  const handleSelectQuery = (term: string) => {
    setQuery(term);
    saveRecentSearch(term);
    setIsOpen(false);
    router.push(`/books?search=${encodeURIComponent(term)}`);
    if (onSelectAction) onSelectAction();
  };

  const isDesktop = variant === 'desktop';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form
        onSubmit={handleSubmit}
        role="search"
        className={`relative flex items-center w-full rounded-2xl bg-card border border-border/80 hover:border-secondary/40 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 shadow-2xs transition-all ${
          isDesktop ? 'h-11' : 'h-10'
        }`}
      >
        {/* Category Scope Trigger (Desktop only) */}
        {isDesktop && (
          <div className="relative shrink-0 h-full">
            <button
              type="button"
              onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
              className="flex items-center gap-1.5 h-full px-3.5 text-xs font-semibold text-muted-foreground hover:text-foreground border-r border-border/80 hover:bg-muted/50 rounded-l-2xl transition-colors select-none"
            >
              <span className="truncate max-w-[95px]">{selectedCategory.label}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
            </button>
            {categoryMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-44 rounded-xl bg-card border border-border shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {SEARCH_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCategoryMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold transition-colors flex items-center justify-between ${
                      selectedCategory.id === cat.id
                        ? 'bg-secondary/15 text-secondary font-bold'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {selectedCategory.id === cat.id && <span className="w-1.5 h-1.5 rounded-full bg-secondary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Icon */}
        <div className={`flex items-center pointer-events-none pl-3.5 text-muted-foreground shrink-0 ${isDesktop ? '' : 'pl-3'}`}>
          <Search className="w-4 h-4" />
        </div>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={isDesktop ? 'Search by title, author, syllabus, or ISBN...' : 'Search books, authors, ISBN...'}
          className="w-full h-full px-2.5 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/80 focus:outline-none font-medium"
          autoComplete="off"
          aria-label="Search BookFry catalog"
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors mr-1"
            aria-label="Clear search input"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Keyboard shortcut hint badge (Desktop only) */}
        {isDesktop && !query && (
          <div className="hidden xl:flex items-center gap-1 pr-3 shrink-0 select-none pointer-events-none">
            <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold text-muted-foreground bg-muted border border-border rounded">
              ⌘K
            </kbd>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          aria-label="Submit search"
          className="flex items-center justify-center h-full px-4 rounded-r-2xl bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors shrink-0 font-bold text-xs"
        >
          {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </form>

      {/* Suggestion & Dropdown Overlay Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-card border border-border/90 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {query.trim().length >= 2 ? (
            /* Live query match results */
            <div className="p-2 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Matching Textbooks</span>
                {isFetching && <Loader2 className="w-3 h-3 animate-spin text-secondary" />}
              </div>
              {searchResults.length > 0 ? (
                searchResults.map((book) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.slug || book.id}`}
                    onClick={() => {
                      saveRecentSearch(book.title);
                      setIsOpen(false);
                      if (onSelectAction) onSelectAction();
                    }}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/70 transition-colors group"
                  >
                    <div className="relative w-10 h-13 rounded-lg overflow-hidden bg-muted border border-border shrink-0">
                      {book.images?.[0]?.url ? (
                        <Image
                          src={book.images[0].url}
                          alt={book.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-primary/10 text-primary">
                          <BookOpen className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate group-hover:text-secondary transition-colors">
                        {book.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {book.author ? `by ${book.author}` : 'Verified syllabus'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-foreground">₹{book.price}</p>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-secondary/15 text-secondary">
                        {book.condition || 'Pre-owned'}
                      </span>
                    </div>
                  </Link>
                ))
              ) : !isFetching ? (
                <div className="py-6 px-4 text-center">
                  <p className="text-xs font-semibold text-foreground">No books found for &quot;{query}&quot;</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Try searching by author name or standard course code</p>
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-secondary hover:bg-secondary/10 rounded-xl transition-colors border-t border-border/60 mt-1"
              >
                <span>View all catalog results for &quot;{query}&quot;</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Empty input: Recent & Trending searches */
            <div className="p-3.5 space-y-4">
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setRecentSearches([]);
                        try {
                          localStorage.removeItem('bookfry_recent_searches');
                        } catch {}
                      }}
                      className="text-[10px] font-bold text-muted-foreground hover:text-danger transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term) => (
                      <span
                        key={term}
                        onClick={() => handleSelectQuery(term)}
                        className="group inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted/80 hover:bg-muted text-foreground text-xs font-medium cursor-pointer border border-border/60 transition-colors"
                      >
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(e, term)}
                          className="text-muted-foreground hover:text-foreground ml-0.5"
                          aria-label={`Remove ${term}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending searches */}
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">
                  <Sparkles className="w-3 h-3 text-secondary" />
                  Trending Searches
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleSelectQuery(term)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-semibold border border-secondary/25 transition-colors"
                    >
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NavbarSearch;
