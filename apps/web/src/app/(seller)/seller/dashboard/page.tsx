'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Book, SellerAnalytics, Category } from '@bookmarket/types';
import {
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Calendar,
  Search,
  Filter,
  Eye,
  Edit2,
  Archive,
  Star,
  ThumbsUp,
  MessageSquare,
  ChevronDown,
  Settings,
  Plus,
  Loader2,
  BookMarked,
  Info,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function SellerDashboardPage() {
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

  // Active tab filter for Listings Column
  const [listingTab, setListingTab] = useState<'all' | 'active' | 'sold' | 'inactive'>('all');
  const [listingSearch, setListingSearch] = useState('');

  // Add Book Form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [publisher, setPublisher] = useState('');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('English');
  const [condition, setCondition] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isFetchingIsbn, setIsFetchingIsbn] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Queries
  const { data: stats } = useQuery<SellerAnalytics>({
    queryKey: ['seller-dashboard'],
    queryFn: () => apiClient('/seller/dashboard'),
    enabled: isAuthenticated,
  });

  const { data: listings = [], refetch: refetchListings } = useQuery<Book[]>({
    queryKey: ['seller-listings-dashboard'],
    queryFn: () => apiClient('/seller/listings?page=1&limit=100'),
    enabled: isAuthenticated,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiClient('/categories'),
  });

  // Local state preview cleanups
  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  // ISBN Details Auto Fetch
  const handleFetchIsbn = async () => {
    if (!isbn || isbn.length < 10) {
      alert('Please enter a 10 or 13 digit ISBN.');
      return;
    }
    setIsFetchingIsbn(true);
    try {
      const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
      const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`);
      const data = await res.json();
      const bookData = data[`ISBN:${cleanIsbn}`];

      if (bookData) {
        setTitle(bookData.title || '');
        if (bookData.authors && bookData.authors[0]) {
          setAuthor(bookData.authors[0].name || '');
        }
        if (bookData.publishers && bookData.publishers[0]) {
          setPublisher(bookData.publishers[0].name || '');
        }
        alert(`Successfully fetched details for: "${bookData.title}"`);
      } else {
        alert('No book records found for this ISBN. You can fill details manually.');
      }
    } catch (err) {
      console.error('ISBN Fetch error:', err);
      alert('Could not connect to book metadata server.');
    } finally {
      setIsFetchingIsbn(false);
    }
  };

  // Handle photo selections
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedPhotos((prev) => [...prev, ...files]);
      const previews = files.map((file) => URL.createObjectURL(file));
      setPhotoPreviews((prev) => [...prev, ...previews]);
    }
  };

  // Submit new book listing
  const handlePublishListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !category || !price) {
      alert('Please fill in Title, Author, Category, and Price.');
      return;
    }
    setIsPublishing(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('author', author);
      formData.append('isbn', isbn || '9780000000000');
      formData.append('description', `Listed in ${condition} condition. Language: ${language}.`);
      formData.append('category', category);
      formData.append('condition', condition === 'excellent' ? 'like_new' : condition);
      formData.append('price', price);
      formData.append('stock', '1');
      formData.append('language', language);
      if (publisher) formData.append('publisher', publisher);

      selectedPhotos.forEach((photo) => {
        formData.append('images', photo);
      });

      await apiClient('/books', {
        method: 'POST',
        body: formData,
      });

      // Clear Form state
      setTitle('');
      setAuthor('');
      setIsbn('');
      setPublisher('');
      setCategory('');
      setPrice('');
      setComparePrice('');
      setSelectedPhotos([]);
      setPhotoPreviews([]);

      setSuccessToast('Book listed successfully! Pending admin approval.');
      refetchListings();
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] });
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      console.error('Submit listing error:', err);
      alert('Failed to submit listing. Try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Listings deletion/archiving
  const handleArchiveListing = async (id: string) => {
    if (confirm('Are you sure you want to archive this listing?')) {
      try {
        await apiClient(`/books/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'archived' }),
        });
        refetchListings();
      } catch (err) {
        console.error('Archive error:', err);
      }
    }
  };

  // Filter listings based on tabs and search
  const filteredListings = listings.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
      book.author.toLowerCase().includes(listingSearch.toLowerCase());
    
    if (!matchesSearch) return false;

    if (listingTab === 'active') return book.status === 'active';
    if (listingTab === 'sold') return book.status === 'sold';
    if (listingTab === 'inactive') return book.status === 'archived' || book.status === 'draft' || book.status === 'removed';
    return true;
  });

  // Calculate totals count dynamically
  const activeCount = listings.filter((b) => b.status === 'active').length;
  const soldCount = listings.filter((b) => b.status === 'sold').length;
  const inactiveCount = listings.filter((b) => ['archived', 'draft', 'removed'].includes(b.status)).length;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FB]">
      <Navbar />

      {/* Main Split Section Layout wrapper */}
      <div className="flex-grow max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Mobile horizontal navigation tabs */}
        <div className="lg:hidden w-full overflow-x-auto no-scrollbar border border-border bg-white rounded-xl p-3 flex items-center gap-3 font-sans text-xs font-bold whitespace-nowrap scroll-smooth shadow-xs">
          <Link href="/seller/dashboard" className="px-3.5 py-2 bg-brand/5 text-brand rounded-lg shrink-0">
            Overview
          </Link>
          <Link href="/seller/dashboard" className="px-3.5 py-2 text-text-secondary hover:bg-slate-50 hover:text-text-primary rounded-lg shrink-0 transition-colors">
            My Listings ({listings.length})
          </Link>
          <Link href="/seller/orders" className="px-3.5 py-2 text-text-secondary hover:bg-slate-50 hover:text-text-primary rounded-lg shrink-0 transition-colors">
            Orders (12)
          </Link>
          <Link href="/seller/earnings" className="px-3.5 py-2 text-text-secondary hover:bg-slate-50 hover:text-text-primary rounded-lg shrink-0 transition-colors">
            Earnings Ledger
          </Link>
        </div>

        {/* A. Left Navigation Panel (Mocking Left Column Dashboard Sidebar) */}
        <aside className="hidden lg:block lg:w-60 shrink-0 space-y-6">
          <div className="bg-white border border-border rounded-xl p-5 shadow-xs space-y-5 font-sans text-xs">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <span className="h-8 w-8 bg-brand/10 text-brand rounded flex items-center justify-center font-bold text-sm">
                BF
              </span>
              <div>
                <p className="font-bold text-text-primary">Seller Dashboard</p>
                <p className="text-[10px] text-text-secondary">{user?.name || 'Verified Seller'}</p>
              </div>
            </div>

            {/* Menu Links */}
            <div className="space-y-1 font-bold text-text-secondary">
              <Link href="/seller/dashboard" className="flex items-center gap-2.5 px-3 py-2 bg-brand/5 text-brand rounded-md">
                <TrendingUp className="h-4 w-4" /> Overview
              </Link>
              <Link href="/seller/dashboard" className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 hover:text-text-primary rounded-md transition-colors">
                <span className="flex items-center gap-2.5"><BookOpen className="h-4 w-4" /> My Listings</span>
                <span className="bg-slate-100 text-text-muted text-[10px] px-1.5 py-0.5 rounded font-black">{listings.length}</span>
              </Link>
              <Link href="/seller/orders" className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 hover:text-text-primary rounded-md transition-colors">
                <span className="flex items-center gap-2.5"><ShoppingBag className="h-4 w-4" /> Orders</span>
                <span className="bg-brand/10 text-brand text-[10px] px-1.5 py-0.5 rounded font-black">12</span>
              </Link>
              <Link href="/seller/earnings" className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 hover:text-text-primary rounded-md transition-colors">
                <DollarSign className="h-4 w-4" /> Earnings Ledger
              </Link>
              <Link href="/seller/dashboard" className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 hover:text-text-primary rounded-md transition-colors">
                <Settings className="h-4 w-4" /> Portal Settings
              </Link>
            </div>
          </div>

          {/* Seller Promo Box */}
          <div className="bg-[#1A3B5C] text-white rounded-xl p-4 shadow-sm font-sans space-y-3 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 select-none">📚</div>
            <p className="text-[10px] font-black uppercase tracking-wider text-secondary">Seller Guidelines</p>
            <h4 className="text-xs font-bold leading-relaxed">Want to sell more?</h4>
            <p className="text-[10px] text-slate-300 leading-relaxed">
              List quality books with clear photos and set competitive prices. Verified condition details speed up approvals!
            </p>
            <button className="w-full py-1.5 bg-secondary hover:bg-secondary-600 text-white font-bold rounded text-[10px] transition-colors">
              Seller Tips
            </button>
          </div>
        </aside>

        {/* B. Right Main Dashboard Grid */}
        <main className="flex-grow space-y-6">
          
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">Overview</h1>
              <p className="text-xs text-text-secondary font-sans mt-0.5">
                India&apos;s Book Marketplace • Education must never stop
              </p>
            </div>
            <div className="flex gap-2.5 text-xs font-bold font-sans">
              <Link href="/seller/orders" className="px-3.5 py-2 bg-white border border-border rounded-lg hover:bg-slate-50 transition-colors shadow-xs">
                Manage Orders
              </Link>
              <Link href="/seller/earnings" className="px-3.5 py-2 bg-white border border-border rounded-lg hover:bg-slate-50 transition-colors shadow-xs">
                Earnings Ledger
              </Link>
            </div>
          </div>

          {/* Success Toast */}
          {successToast && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{successToast}</span>
            </div>
          )}

          {/* 1. Stripe-like Metrics Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-sans">
            {/* Net Earnings */}
            <div className="bg-white border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total Net Earnings</span>
                <p className="text-2xl font-black text-brand">₹{(stats?.totalEarnings || 12450).toLocaleString()}</p>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">📈 +12.4% vs last month</p>
              </div>
              <div className="p-3 bg-brand/10 text-brand rounded-lg"><DollarSign className="h-5 w-5" /></div>
            </div>

            {/* Total Sales */}
            <div className="bg-white border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total Books Sold</span>
                <p className="text-2xl font-black text-text-primary">{stats?.totalSales || 48} items</p>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">📈 +8.2% vs last month</p>
              </div>
              <div className="p-3 bg-success/10 text-success rounded-lg"><ShoppingBag className="h-5 w-5" /></div>
            </div>

            {/* Active Listings */}
            <div className="bg-white border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Active Listings</span>
                <p className="text-2xl font-black text-text-primary">{activeCount} books</p>
                <p className="text-[10px] text-text-muted font-bold">Total Listings: {listings.length}</p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><Package className="h-5 w-5" /></div>
            </div>
          </div>

          {/* 2. Split Columns: Listings List & Add New Book Wizard */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* Column A: Listings Table (xl:col-span-7) */}
            <div className="xl:col-span-7 bg-white border border-border rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-text-primary">My Listings</h3>
                  <p className="text-[11px] text-text-secondary font-sans mt-0.5">Manage all the books you have listed for sale</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                    <input
                      type="text"
                      placeholder="Search listings..."
                      value={listingSearch}
                      onChange={(e) => setListingSearch(e.target.value)}
                      className="pl-8 pr-2.5 py-1.5 border border-border rounded-md text-xs w-40 font-sans focus:outline-none focus:ring-1 focus:ring-brand bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Status Tabs Navigation */}
              <div className="flex border-b border-border text-xs font-bold text-text-secondary">
                <button
                  onClick={() => setListingTab('all')}
                  className={`px-4 py-2 border-b-2 transition-all ${listingTab === 'all' ? 'border-brand text-brand' : 'border-transparent'}`}
                >
                  All ({listings.length})
                </button>
                <button
                  onClick={() => setListingTab('active')}
                  className={`px-4 py-2 border-b-2 transition-all ${listingTab === 'active' ? 'border-brand text-brand' : 'border-transparent'}`}
                >
                  Active ({activeCount})
                </button>
                <button
                  onClick={() => setListingTab('sold')}
                  className={`px-4 py-2 border-b-2 transition-all ${listingTab === 'sold' ? 'border-brand text-brand' : 'border-transparent'}`}
                >
                  Sold ({soldCount})
                </button>
                <button
                  onClick={() => setListingTab('inactive')}
                  className={`px-4 py-2 border-b-2 transition-all ${listingTab === 'inactive' ? 'border-brand text-brand' : 'border-transparent'}`}
                >
                  Inactive ({inactiveCount})
                </button>
              </div>

              {/* Listings Vertical List Stack */}
              <div className="space-y-4">
                {filteredListings.length === 0 ? (
                  <div className="text-center py-16 text-xs text-text-secondary">
                    No listing results found. Use the form on the right to publish your first book!
                  </div>
                ) : (
                  filteredListings.map((book) => {
                    const originalPrice = Math.round(book.price * 1.5);
                    const isBookActive = book.status === 'active';
                    return (
                      <div key={book.id} className="flex gap-4 p-3 border border-border rounded-lg hover:border-slate-300 transition-colors bg-slate-50/20 font-sans">
                        {/* cover thumbnail */}
                        <div className="w-14 h-20 bg-slate-100 rounded overflow-hidden border border-border shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={book.images?.[0]?.url || 'https://placehold.co/100x150/163A63/ffffff?text=Book'}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* details info */}
                        <div className="flex-grow min-w-0 space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-bold text-text-primary truncate">{book.title}</h4>
                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded shrink-0 ${
                              book.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : book.status === 'sold'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {book.status === 'active' ? 'Active' : book.status === 'sold' ? 'Sold' : book.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-text-secondary truncate">by {book.author}</p>
                          <p className="text-[9px] text-text-muted">Paperback • <span className="capitalize">{book.condition.replace('_', ' ')}</span> • Listed 20 May</p>
                          
                          {/* Pricing details */}
                          <div className="flex items-baseline gap-1.5 pt-0.5">
                            <span className="text-xs font-black text-text-primary">₹{book.price}</span>
                            <span className="text-[9px] text-text-muted line-through">₹{originalPrice}</span>
                            <span className="text-[9px] text-emerald-600 font-bold">50% OFF</span>
                          </div>

                          {/* Performance Stats panel */}
                          <div className="flex items-center gap-4 text-[9px] text-text-muted pt-2 border-t border-slate-100 mt-2 font-mono">
                            <span>Views: <strong className="text-text-secondary">342</strong></span>
                            <span>Likes: <strong className="text-text-secondary">18</strong></span>
                            <span>Inquiries: <strong className="text-text-secondary">7</strong></span>
                            <span>Orders: <strong className="text-text-secondary">3</strong></span>
                          </div>
                        </div>

                        {/* Quick action dropdown */}
                        <div className="flex flex-col items-end justify-between">
                          <button
                            onClick={() => handleArchiveListing(book.id)}
                            className="p-1 rounded text-text-muted hover:text-danger"
                            title="Archive listing"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                          {isBookActive && (
                            <Link href={`/books/${book.slug}`} className="text-[9px] font-bold text-brand hover:underline flex items-center gap-0.5">
                              View <Eye className="h-2.5 w-2.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Column B: Add New Book Form (xl:col-span-5) */}
            <form onSubmit={handlePublishListing} className="xl:col-span-5 bg-white border border-border rounded-xl p-5 shadow-xs space-y-5 font-sans text-xs">
              <div>
                <h3 className="font-serif text-lg font-bold text-text-primary">Add New Book</h3>
                <p className="text-[11px] text-text-secondary mt-0.5">Fill in the details below to list your book</p>
              </div>

              {/* 1. Book Details Section */}
              <div className="space-y-3.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">1. Book Details</p>
                
                {/* ISBN Fetch block */}
                <div className="space-y-1">
                  <label className="font-bold text-text-secondary">ISBN Number</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 9788172234980"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      className="flex-grow px-3 py-2 border border-border rounded bg-slate-50/50 text-text-primary focus:outline-none focus:ring-1 focus:ring-brand font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleFetchIsbn}
                      disabled={isFetchingIsbn}
                      className="px-3.5 py-2 bg-brand hover:bg-brand-hover text-white font-bold rounded transition-colors flex items-center gap-1 shadow-sm shrink-0"
                    >
                      {isFetchingIsbn ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Fetch Details'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-bold text-text-secondary">Book Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. The Alchemist"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded bg-slate-50/50 text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-text-secondary">Author *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Paulo Coelho"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded bg-slate-50/50 text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-bold text-text-secondary">Publisher</label>
                    <input
                      type="text"
                      placeholder="e.g. HarperCollins"
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded bg-slate-50/50 text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-text-secondary">Category *</label>
                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded bg-slate-50/50 text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Book Condition Section */}
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">2. Book Condition</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'excellent', name: 'Like New', desc: 'Almost new condition.' },
                    { key: 'good', name: 'Very Good', desc: 'Minor signs of use.' },
                    { key: 'fair', name: 'Good', desc: 'Visible signs of wear.' },
                    { key: 'poor', name: 'Acceptable', desc: 'Heavily used copy.' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      onClick={() => setCondition(item.key as 'excellent' | 'good' | 'fair' | 'poor')}
                      className={`flex flex-col p-2.5 border rounded-md cursor-pointer text-left transition-all ${
                        condition === item.key
                          ? 'border-brand bg-brand/5 shadow-xs'
                          : 'border-border hover:border-brand/40 bg-slate-50/20'
                      }`}
                    >
                      <span className="font-bold text-text-primary">{item.name}</span>
                      <span className="text-[9px] text-text-muted mt-0.5 leading-normal">{item.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. Pricing Section */}
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">3. Pricing</p>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-bold text-text-secondary">Price You Want *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">₹</span>
                      <input
                        type="number"
                        required
                        placeholder="199"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full pl-6 pr-3 py-2 border border-border rounded bg-slate-50/50 text-text-primary focus:outline-none focus:ring-1 focus:ring-brand font-mono font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-text-secondary">Compare At Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">₹</span>
                      <input
                        type="number"
                        placeholder="399"
                        value={comparePrice}
                        onChange={(e) => setComparePrice(e.target.value)}
                        className="w-full pl-6 pr-3 py-2 border border-border rounded bg-slate-50/50 text-text-primary focus:outline-none focus:ring-1 focus:ring-brand font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Book Photos Upload Section */}
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">4. Book Photos</p>
                
                <div className="grid grid-cols-5 gap-2">
                  {/* Upload button tile */}
                  <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-brand/60 bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition-colors relative">
                    <input type="file" multiple accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                    <Plus className="h-5 w-5 text-text-muted" />
                    <span className="text-[8px] font-bold text-text-muted mt-1 uppercase tracking-wider">Upload</span>
                  </label>

                  {/* Thumbnail previews */}
                  {photoPreviews.slice(0, 4).map((preview, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden border border-border bg-slate-100 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ))}

                  {/* Placeholder fills to match 5 slots in mockup */}
                  {Array.from({ length: Math.max(0, 4 - photoPreviews.length) }).map((_, idx) => (
                    <div key={idx} className="aspect-square rounded-lg border border-border bg-slate-50/50 flex items-center justify-center opacity-40 select-none">
                      🖼️
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-border pt-4 flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTitle('');
                    setAuthor('');
                    setIsbn('');
                    setPublisher('');
                    setPrice('');
                    setComparePrice('');
                    setPhotoPreviews([]);
                    setSelectedPhotos([]);
                  }}
                  className="px-4 py-2 border border-border hover:bg-slate-50 rounded font-bold text-text-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-5 py-2 bg-brand hover:bg-brand-hover text-white font-bold rounded flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {isPublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Publish Listing'}
                </button>
              </div>
            </form>

          </div>
        </main>

      </div>

      <Footer />
    </div>
  );
}
