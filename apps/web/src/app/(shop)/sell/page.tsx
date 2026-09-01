'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { sellBookSchema, SellBookFormData } from '@/lib/validations/sell-form.schema';
import { BookConditionCardGroup } from '@/components/sell/book-condition-card';
import { ImageUploader } from '@/components/sell/image-uploader';
import { EarningsCalculatorCard } from '@/components/sell/earnings-calculator-card';
import { CategorySearchSelect } from '@/components/sell/category-search-select';
import { SellHero } from '@/components/sell/sell-hero';
import { SellProgressSidebar } from '@/components/sell/sell-progress-sidebar';
import { SellTipsSidebar } from '@/components/sell/sell-tips-sidebar';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Book } from '@bookmarket/types';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  DollarSign,
  User,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Search,
  Bookmark,
  ShieldAlert,
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Book Details', icon: BookOpen },
  { id: 2, title: 'Pricing & Payout', icon: DollarSign },
  { id: 3, title: 'Seller Details', icon: User },
  { id: 4, title: 'Pickup Location', icon: MapPin },
  { id: 5, title: 'Terms & Review', icon: CheckCircle2 },
];

function SellBookPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get('slug');
  const isEditMode = !!editSlug;

  const { isAuthenticated, user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingIsbn, setIsFetchingIsbn] = useState(false);
  const [isbnFoundMsg, setIsbnFoundMsg] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);

  const { data: editBook } = useQuery<Book>({
    queryKey: ['sell-edit-book', editSlug],
    queryFn: () => apiClient(`/books/${editSlug}`),
    enabled: isEditMode && isAuthenticated,
  });

  // Query backend database categories
  const { data: categories = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['categories'],
    queryFn: () => apiClient('/categories'),
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors },
  } = useForm<SellBookFormData>({
    resolver: zodResolver(sellBookSchema),
    defaultValues: {
      source: 'auto',
      title: '',
      author: '',
      isbn: '',
      publisher: '',
      edition: '',
      category: '',
      condition: 'good',
      images: [],
      quantity: 1,
      price: 0,
      freeShipping: true,
      shippingFee: 0,
      preferredPayment: 'upi',
      upiId: '',
      accountHolder: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      sellerName: user?.name || '',
      sellerEmail: user?.email || '',
      sellerPhone: '',
      hidePhone: false,
      pincode: '',
      city: '',
      state: '',
      pickupAddress: '',
      confirmOwnership: true,
      agreePolicy: true,
    },
  });

  const formValues = watch();

  // Restore draft from localStorage (only if not in edit mode)
  useEffect(() => {
    if (isEditMode) return;
    const savedDraft = localStorage.getItem('bookfry_sell_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        reset(parsed);
        setDraftRestored(true);
      } catch (err) {
        console.error('Failed to parse sell draft', err);
      }
    }
  }, [reset, isEditMode]);

  // Auto-save draft on value change (only if not in edit mode)
  useEffect(() => {
    if (isEditMode) return;
    if (formValues.title || formValues.price > 0) {
      localStorage.setItem('bookfry_sell_draft', JSON.stringify(formValues));
    }
  }, [formValues, isEditMode]);

  // Load edit book details when they are available
  useEffect(() => {
    if (editBook) {
      reset({
        source: editBook.isbn && editBook.isbn !== '9780000000000' ? 'auto' : 'manual',
        title: editBook.title,
        author: editBook.author,
        isbn: editBook.isbn === '9780000000000' ? '' : editBook.isbn || '',
        publisher: editBook.publisher || '',
        edition: editBook.edition || '',
        category: editBook.category || '',
        condition: editBook.condition === 'like_new' ? 'excellent' : (editBook.condition as 'excellent' | 'good' | 'fair' | 'poor'),
        images: editBook.images.map((img) => img.url),
        quantity: editBook.stock,
        price: editBook.price,
        freeShipping: true,
        shippingFee: 0,
        preferredPayment: 'upi',
        upiId: '',
        accountHolder: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        sellerName: user?.name || '',
        sellerEmail: user?.email || '',
        sellerPhone: '',
        hidePhone: false,
        pincode: '',
        city: '',
        state: '',
        pickupAddress: '',
        confirmOwnership: true,
        agreePolicy: true,
      });
    }
  }, [editBook, reset, user]);

  // Auto-fill City & State on Pincode entry
  useEffect(() => {
    if (formValues.pincode && formValues.pincode.length === 6) {
      fetch(`https://api.postalpincode.in/pincode/${formValues.pincode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data[0] && data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            setValue('city', postOffice.District, { shouldValidate: true });
            setValue('state', postOffice.State, { shouldValidate: true });
          }
        })
        .catch((err) => console.error('Pincode fetch failed', err));
    }
  }, [formValues.pincode, setValue]);

  // ISBN Auto Fetch Helper
  const handleFetchIsbnDetails = async () => {
    if (!formValues.isbn || formValues.isbn.length < 10) {
      alert('Please enter a valid 10 or 13 digit ISBN first.');
      return;
    }
    setIsFetchingIsbn(true);
    setIsbnFoundMsg(null);
    try {
      const cleanIsbn = formValues.isbn.replace(/[^0-9X]/gi, '');

      // 1. Try fetching from internal BookFry catalog first
      try {
        const localRes = await apiClient<{ books: Book[] }>(`/books?search=${cleanIsbn}`);
        const existingLocalBook = localRes?.books?.find(
          (b) => b.isbn.replace(/[^0-9X]/gi, '') === cleanIsbn
        );

        if (existingLocalBook) {
          setValue('title', existingLocalBook.title, { shouldValidate: true });
          setValue('author', existingLocalBook.author, { shouldValidate: true });
          if (existingLocalBook.publisher) setValue('publisher', existingLocalBook.publisher);
          if (existingLocalBook.edition) setValue('edition', existingLocalBook.edition);
          if (existingLocalBook.category) setValue('category', existingLocalBook.category);
          if (existingLocalBook.images?.length > 0) {
            setValue(
              'images',
              existingLocalBook.images.map((img) => img.url),
              { shouldValidate: true }
            );
          }
          setIsbnFoundMsg(
            `Matched existing BookFry Catalog item "${existingLocalBook.title}"! Your copy will be listed under this book.`
          );
          setIsFetchingIsbn(false);
          return;
        }
      } catch (err) {
        console.warn('Local ISBN lookup skipped:', err);
      }

      // 2. Fallback to OpenLibrary API
      const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`);
      const data = await res.json();
      const bookData = data[`ISBN:${cleanIsbn}`];

      if (bookData) {
        setValue('title', bookData.title || formValues.title, { shouldValidate: true });
        if (bookData.authors && bookData.authors[0]) {
          setValue('author', bookData.authors[0].name || formValues.author, { shouldValidate: true });
        }
        if (bookData.publishers && bookData.publishers[0]) {
          setValue('publisher', bookData.publishers[0].name, { shouldValidate: true });
        }
        if (bookData.cover?.medium) {
          setValue('images', [bookData.cover.medium], { shouldValidate: true });
        }
        setIsbnFoundMsg(`Book details auto-filled from OpenLibrary for "${bookData.title}"!`);
      } else {
        alert('No bibliographic record found for this ISBN. Please enter details manually.');
      }
    } catch (err) {
      console.error('ISBN fetch error:', err);
      alert('Failed to fetch ISBN metadata. Please enter details manually.');
    } finally {
      setIsFetchingIsbn(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof SellBookFormData)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ['title', 'author', 'category', 'condition', 'images', 'quantity'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['price', 'preferredPayment', 'upiId', 'accountHolder', 'bankName', 'accountNumber', 'ifscCode'];
    } else if (currentStep === 3) {
      fieldsToValidate = ['sellerName', 'sellerEmail', 'sellerPhone', 'pincode', 'city', 'state'];
    } else if (currentStep === 4) {
      fieldsToValidate = ['pickupAddress'];
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: SellBookFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('author', data.author);
      formData.append('isbn', data.isbn || '9780000000000');
      formData.append('description', `Condition: ${data.condition}. Seller: ${data.sellerName}. Pincode: ${data.pincode}`);
      formData.append('category', data.category);
      formData.append('condition', data.condition === 'excellent' ? 'like_new' : data.condition);
      formData.append('price', String(data.price));
      formData.append('stock', String(data.quantity));
      formData.append('language', 'English');
      if (data.city) formData.append('city', data.city);
      if (data.state) formData.append('state', data.state);
      if (data.pincode) formData.append('pincode', data.pincode);
      if (data.pickupAddress) formData.append('pickupAddress', data.pickupAddress);
      if (data.publisher) formData.append('publisher', data.publisher);
      if (data.edition) formData.append('edition', data.edition);

      if (data.images && data.images.length > 0) {
        data.images.forEach((img) => {
          if (img instanceof File) {
            formData.append('images', img);
          } else if (typeof img === 'string') {
            formData.append('existingImages', img);
          }
        });
      }

      if (isEditMode && editBook) {
        formData.append('status', 'pending');
        await apiClient(`/books/${editBook.id}`, {
          method: 'PATCH',
          body: formData,
        });

        alert('Congratulations! Your book listing has been resubmitted for review.');
      } else {
        await apiClient('/books', {
          method: 'POST',
          body: formData,
        });

        localStorage.removeItem('bookfry_sell_draft');
        alert('Congratulations! Your book listing has been submitted for review.');
      }

      router.push('/seller/dashboard');
    } catch (err: unknown) {
      console.error('Listing creation error:', err);
      const apiErr = err as { status?: number; code?: string; message?: string };
      if (apiErr.status === 401 || apiErr.code === 'UNAUTHORIZED' || !isAuthenticated) {
        alert('Please sign in to publish your book listing to the marketplace.');
        router.push('/login?redirectTo=/sell');
      } else {
        alert(apiErr.message || 'Failed to post book listing. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('bookfry_sell_draft');
    reset();
    setDraftRestored(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-grow max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* BRAND HERO SECTION BANNER */}
        <SellHero isEditMode={isEditMode} />

        {/* Unauthenticated Banner */}
        {!isAuthenticated && (
          <div className="p-5 bg-card border border-secondary/30 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-sans shadow-xl">
            <div className="space-y-1">
              <span className="font-extrabold text-secondary flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldAlert className="h-4 w-4" />
                <span>Authentication Required</span>
              </span>
              <p className="text-muted-foreground font-medium">
                You are currently browsing as a guest. Please sign in to publish your book listing to the marketplace.
              </p>
            </div>
            <button
              onClick={() => router.push(`/login?redirectTo=/sell`)}
              className="px-5 py-2.5 bg-secondary text-secondary-foreground font-bold rounded-2xl hover:bg-secondary/90 transition-all shadow-md shrink-0 active:scale-95"
            >
              Sign In to Post Book
            </button>
          </div>
        )}

        {/* Mobile Top Progress Bar */}
        <div className="lg:hidden w-full bg-card border border-border/80 rounded-3xl p-5 shadow-xl space-y-2 font-sans">
          <div className="flex justify-between items-center text-xs font-bold text-foreground">
            <span>
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </span>
            <span className="text-secondary font-mono">{Math.round((currentStep / STEPS.length) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Three Column Split Layout Wrapper */}
        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
          
          {/* 1. Left Column Sidebar: LISTING PROGRESS */}
          <SellProgressSidebar
            steps={STEPS}
            currentStep={currentStep}
            onSelectStep={(stepId) => setCurrentStep(stepId)}
          />

          {/* 2. Center Column: Form Wizard Content Panel */}
          <div className="flex-1 min-w-0 bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 font-sans">
            
            <div className="flex items-start justify-between border-b border-border/60 pb-4 gap-4">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                  {isEditMode ? 'Modify Book Details' : 'Add Your Book'}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Provide accurate details to attract more buyers.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('bookfry_sell_draft', JSON.stringify(formValues));
                    alert('Listing draft saved locally!');
                  }}
                  className="px-4 py-2 border border-border/80 hover:bg-muted rounded-2xl flex items-center gap-1.5 text-xs font-bold text-foreground shadow-xs transition-all active:scale-95"
                >
                  <Bookmark className="h-3.5 w-3.5 text-secondary" />
                  <span className="hidden sm:inline">Save as Draft</span>
                </button>
              </div>
            </div>

            {/* Draft notice banner */}
            {draftRestored && (
              <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-2xl flex items-center justify-between text-xs text-secondary font-bold">
                <span>Restored listing draft details</span>
                <button
                  onClick={clearDraft}
                  className="text-[10px] text-rose-500 hover:underline font-extrabold uppercase"
                >
                  Discard Draft
                </button>
              </div>
            )}

            {/* Form Steps fields */}
            <form onSubmit={handleSubmit(onSubmit, (errs) => {
              console.error('Form validation errors:', errs);
              const errMsg = Object.keys(errs)
                .map((key) => {
                  const error = errs[key as keyof typeof errs];
                  return `- ${error?.message || 'Invalid value'}`;
                })
                .join('\n');
              alert(`Please check the following validation errors before publishing:\n\n${errMsg}`);
            })}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  {/* STEP 1: BOOK DETAILS */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      
                      {/* ISBN Fetch Section */}
                      <div className="p-5 bg-muted/30 border border-border/80 rounded-3xl space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <label className="text-xs font-black uppercase tracking-wider text-foreground">
                            Data Entry Source
                          </label>
                          
                          <div className="flex space-x-6 text-xs font-bold text-muted-foreground select-none">
                            <label className="flex items-center space-x-2 cursor-pointer hover:text-foreground">
                              <input
                                type="radio"
                                value="auto"
                                {...register('source')}
                                className="accent-secondary"
                              />
                              <span>Auto Fetch via ISBN (Recommended)</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer hover:text-foreground">
                              <input
                                type="radio"
                                value="manual"
                                {...register('source')}
                                className="accent-secondary"
                              />
                              <span>Manual Entry</span>
                            </label>
                          </div>
                        </div>

                        {formValues.source === 'auto' && (
                          <div className="space-y-2.5 pt-3.5 border-t border-border/60">
                            <label className="text-xs font-bold text-muted-foreground block">
                              13-Digit or 10-Digit ISBN Number
                            </label>
                            <div className="flex gap-3">
                              <input
                                type="text"
                                placeholder="e.g. 9780143127741"
                                {...register('isbn')}
                                className="flex-grow px-4 py-2.5 text-xs border border-border/80 rounded-2xl bg-background text-foreground focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={handleFetchIsbnDetails}
                                disabled={isFetchingIsbn}
                                className="px-5 py-2.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs font-bold rounded-2xl transition-all shadow-md flex items-center gap-1.5 shrink-0 active:scale-95"
                              >
                                {isFetchingIsbn ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Search className="h-4 w-4" />}
                                <span>Fetch Details</span>
                              </button>
                            </div>
                            {isbnFoundMsg && (
                              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <span>{isbnFoundMsg}</span>
                              </p>
                            )}
                            {errors.isbn && <p className="text-xs text-rose-500 font-bold">{errors.isbn.message}</p>}
                          </div>
                        )}
                      </div>

                      {/* Condition selectors */}
                      <div className="space-y-3">
                        <label className="text-xs font-black text-foreground uppercase tracking-wider block">
                          Book Condition <span className="text-rose-500">*</span>
                        </label>
                        <Controller
                          name="condition"
                          control={control}
                          render={({ field }) => (
                            <BookConditionCardGroup value={field.value} onChange={field.onChange} />
                          )}
                        />
                        {errors.condition && <p className="text-xs text-rose-500 font-bold">{errors.condition.message}</p>}
                      </div>

                      {/* Photos Uploader */}
                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="text-xs font-black text-foreground uppercase tracking-wider block">
                            Upload Book Photos (Max 4) <span className="text-rose-500">*</span>
                          </label>
                          <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">First image will be your cover photo.</p>
                        </div>
                        
                        <Controller
                          name="images"
                          control={control}
                          render={({ field }) => (
                            <ImageUploader images={field.value} onChange={field.onChange} maxImages={4} />
                          )}
                        />
                        {errors.images && <p className="text-xs text-rose-500 font-bold">{errors.images.message}</p>}
                      </div>

                      {/* Book Title field */}
                      <div className="space-y-2 pt-2">
                        <label className="text-xs font-black text-foreground uppercase tracking-wider block">
                          Ad Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Engineering Mathematics 3rd Edition (H.K. Dass)"
                          {...register('title')}
                          className="w-full px-4 py-3 text-xs border border-border/80 rounded-2xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40"
                        />
                        {errors.title && <p className="text-xs text-rose-500 font-bold">{errors.title.message}</p>}
                      </div>

                      {/* Author & Publisher inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-foreground uppercase tracking-wider block">
                            Author Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. James Clear"
                            {...register('author')}
                            className="w-full px-4 py-3 text-xs border border-border/80 rounded-2xl bg-background text-foreground focus:outline-none"
                          />
                          {errors.author && <p className="text-xs text-rose-500 font-bold">{errors.author.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-foreground uppercase tracking-wider block">
                            Publisher / Edition (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Penguin Books, 2nd Edition"
                            {...register('publisher')}
                            className="w-full px-4 py-3 text-xs border border-border/80 rounded-2xl bg-background text-foreground focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Searchable Category Select */}
                      <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                          <CategorySearchSelect
                            categories={categories}
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.category?.message}
                          />
                        )}
                      />

                      {/* Quantity */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-foreground uppercase tracking-wider block">
                          Quantity <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          {...register('quantity')}
                          className="w-full max-w-[200px] px-4 py-3 text-xs border border-border/80 rounded-2xl bg-background text-foreground focus:outline-none font-mono font-bold"
                        />
                        <p className="text-[10px] text-muted-foreground font-medium">Available quantity of this book</p>
                      </div>

                    </div>
                  )}

                  {/* STEP 2: PRICING DETAILS */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="border-b border-border/60 pb-4">
                        <h3 className="font-serif text-lg font-bold text-foreground">Step 2: Pricing & Payout</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Set your selling price and configure direct bank / UPI payout method.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-foreground uppercase tracking-wider block">
                            Your Selling Price (₹) <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-3 text-sm font-bold text-muted-foreground">₹</span>
                            <input
                              type="number"
                              placeholder="e.g. 450"
                              {...register('price')}
                              className="w-full pl-9 pr-4 py-3 text-base font-bold font-mono bg-background border border-border/80 rounded-2xl text-foreground focus:outline-none"
                            />
                          </div>
                          {errors.price && <p className="text-xs text-rose-500 font-bold">{errors.price.message}</p>}
                        </div>

                        <div className="space-y-2 pt-2">
                          <label className="text-xs font-black text-foreground uppercase tracking-wider block">
                            Shipping Options
                          </label>
                          <label className="flex items-center space-x-2.5 text-xs font-semibold cursor-pointer p-4 border border-border/80 rounded-2xl bg-muted/30 select-none">
                            <input
                              type="checkbox"
                              {...register('freeShipping')}
                              className="accent-secondary rounded"
                            />
                            <span>Offer Free Shipping to Buyer (Recommended)</span>
                          </label>
                        </div>
                      </div>

                      <EarningsCalculatorCard
                        price={Number(formValues.price) || 0}
                        freeShipping={formValues.freeShipping}
                        shippingFee={Number(formValues.shippingFee) || 0}
                      />

                      {/* Payment fields preferred */}
                      <div className="space-y-4 pt-4 border-t border-border/60">
                        <label className="text-xs font-black text-foreground uppercase tracking-wider block">
                          Preferred Payout Method <span className="text-rose-500">*</span>
                        </label>

                        <div className="flex space-x-6 text-xs font-bold text-muted-foreground select-none">
                          <label className="flex items-center space-x-2 cursor-pointer hover:text-foreground">
                            <input
                              type="radio"
                              value="upi"
                              {...register('preferredPayment')}
                              className="accent-secondary"
                            />
                            <span>UPI Direct Transfer</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer hover:text-foreground">
                            <input
                              type="radio"
                              value="bank"
                              {...register('preferredPayment')}
                              className="accent-secondary"
                            />
                            <span>Bank Account (NEFT)</span>
                          </label>
                        </div>

                        {formValues.preferredPayment === 'upi' && (
                          <div className="space-y-2 max-w-md p-5 bg-muted/30 border border-border/80 rounded-3xl">
                            <label className="text-xs font-bold text-foreground block">
                              UPI ID (e.g. mobile@upi)
                            </label>
                            <input
                              type="text"
                              placeholder="yourname@upi"
                              {...register('upiId')}
                              className="w-full px-4 py-2.5 text-xs border border-border/80 rounded-2xl bg-background text-foreground focus:outline-none"
                            />
                            {errors.upiId && <p className="text-xs text-rose-500 font-bold">{errors.upiId.message}</p>}
                          </div>
                        )}

                        {formValues.preferredPayment === 'bank' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-muted/30 border border-border/80 rounded-3xl">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-foreground block">Account Holder Name</label>
                              <input
                                type="text"
                                placeholder="e.g. Rahul Sharma"
                                {...register('accountHolder')}
                                className="w-full px-4 py-2.5 text-xs border border-border/80 rounded-2xl bg-background text-foreground focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-foreground block">Bank Name</label>
                              <input
                                type="text"
                                placeholder="e.g. HDFC Bank"
                                {...register('bankName')}
                                className="w-full px-4 py-2.5 text-xs border border-border/80 rounded-2xl bg-background text-foreground focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-foreground block">Account Number</label>
                              <input
                                type="text"
                                placeholder="e.g. 50100239102"
                                {...register('accountNumber')}
                                className="w-full px-4 py-2.5 text-xs border border-border/80 rounded-2xl bg-background text-foreground focus:outline-none font-mono"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-foreground block">IFSC Code</label>
                              <input
                                type="text"
                                placeholder="e.g. HDFC0000240"
                                {...register('ifscCode')}
                                className="w-full px-4 py-2.5 text-xs border border-border/80 rounded-2xl bg-background text-foreground focus:outline-none font-mono uppercase"
                              />
                            </div>
                            {errors.ifscCode && (
                              <p className="text-xs text-rose-500 font-bold col-span-2">{errors.ifscCode.message}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: SELLER DETAILS */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="border-b border-border/60 pb-4">
                        <h3 className="font-serif text-lg font-bold text-foreground">Step 3: Seller Details</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Verified details ensure quick checkout approvals.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-foreground uppercase tracking-wider block">
                            Full Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Your full name"
                            {...register('sellerName')}
                            className="w-full px-4 py-3 text-xs border border-border/80 rounded-2xl bg-background text-foreground focus:outline-none"
                          />
                          {errors.sellerName && <p className="text-xs text-rose-500 font-bold">{errors.sellerName.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-foreground uppercase tracking-wider block">
                            Email Address <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="email"
                            placeholder="name@domain.com"
                            {...register('sellerEmail')}
                            className="w-full px-4 py-3 text-xs border border-border/80 rounded-2xl bg-background text-foreground focus:outline-none"
                          />
                          {errors.sellerEmail && <p className="text-xs text-rose-500 font-bold">{errors.sellerEmail.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-foreground uppercase tracking-wider block">
                            WhatsApp / Mobile Number <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="tel"
                            placeholder="10-digit mobile number"
                            {...register('sellerPhone')}
                            className="w-full px-4 py-3 text-xs border border-border/80 rounded-2xl bg-background text-foreground focus:outline-none font-mono"
                          />
                          {errors.sellerPhone && <p className="text-xs text-rose-500 font-bold">{errors.sellerPhone.message}</p>}
                        </div>

                        <div className="space-y-2 pt-6">
                          <label className="flex items-center space-x-2.5 text-xs font-semibold cursor-pointer select-none">
                            <input
                              type="checkbox"
                              {...register('hidePhone')}
                              className="accent-secondary rounded"
                            />
                            <span>Hide my WhatsApp from public ad details</span>
                          </label>
                        </div>
                      </div>

                      {/* Location details */}
                      <div className="pt-4 border-t border-border/60 space-y-4">
                        <h4 className="font-serif text-sm font-bold text-foreground">Item Location</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-black text-foreground uppercase tracking-wider block">
                              Pincode <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="e.g. 110001"
                              {...register('pincode')}
                              className="w-full px-4 py-3 text-xs border border-border/80 rounded-2xl bg-background text-foreground focus:outline-none font-mono"
                            />
                            {errors.pincode && <p className="text-xs text-rose-500 font-bold">{errors.pincode.message}</p>}
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-black text-foreground uppercase tracking-wider block">
                              City <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Auto-filled city"
                              {...register('city')}
                              className="w-full px-4 py-3 text-xs border border-border/80 rounded-2xl bg-background text-foreground focus:outline-none"
                            />
                            {errors.city && <p className="text-xs text-rose-500 font-bold">{errors.city.message}</p>}
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-black text-foreground uppercase tracking-wider block">
                              State <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Auto-filled state"
                              {...register('state')}
                              className="w-full px-4 py-3 text-xs border border-border/80 rounded-2xl bg-background text-foreground focus:outline-none"
                            />
                            {errors.state && <p className="text-xs text-rose-500 font-bold">{errors.state.message}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: PICKUP LOCATION */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="border-b border-border/60 pb-4">
                        <h3 className="font-serif text-lg font-bold text-foreground">Step 4: Pickup Location</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Provide your pickup address for courier verification.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-foreground uppercase tracking-wider block">
                          Detailed Pickup Address (Optional)
                        </label>
                        <textarea
                          rows={4}
                          placeholder="House/Flat No, Street, Landmark..."
                          {...register('pickupAddress')}
                          className="w-full p-4 text-xs border border-border/80 rounded-2xl bg-background text-foreground focus:outline-none leading-relaxed"
                        />
                        <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                          Your pickup address is shared privately only with verified delivery couriers on order placements.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: TERMS & REVIEW */}
                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <div className="border-b border-border/60 pb-4">
                        <h3 className="font-serif text-lg font-bold text-foreground">Step 5: Terms & Review</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Verify details before publishing your listing.
                        </p>
                      </div>

                      <div className="p-5 bg-muted/30 border border-border/80 rounded-3xl space-y-3.5 text-xs font-medium font-sans">
                        <div className="flex justify-between border-b border-border/50 pb-2">
                          <span className="font-bold text-foreground">Book Title:</span>
                          <span className="font-bold text-secondary truncate max-w-[200px]">{formValues.title}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/50 pb-2">
                          <span className="font-bold text-foreground">Target price:</span>
                          <span className="font-bold font-mono text-foreground">₹{formValues.price}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/50 pb-2">
                          <span className="font-bold text-foreground">Condition:</span>
                          <span className="uppercase font-extrabold text-secondary">{formValues.condition}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold text-foreground">State Location:</span>
                          <span className="font-bold text-muted-foreground">
                            {formValues.city}, {formValues.state} ({formValues.pincode})
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3.5 pt-2 select-none">
                        <label className="flex items-start space-x-2.5 text-xs font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            {...register('confirmOwnership')}
                            className="accent-secondary rounded mt-0.5"
                          />
                          <span>I confirm that this book matches the conditions and descriptions specified.</span>
                        </label>
                        {errors.confirmOwnership && (
                          <p className="text-xs text-rose-500 font-bold">{errors.confirmOwnership.message}</p>
                        )}

                        <label className="flex items-start space-x-2.5 text-xs font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            {...register('agreePolicy')}
                            className="accent-secondary rounded mt-0.5"
                          />
                          <span>I agree to BookFry seller policies, payout schedules, and commission rates.</span>
                        </label>
                        {errors.agreePolicy && (
                          <p className="text-xs text-rose-500 font-bold">{errors.agreePolicy.message}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Navigation steps buttons */}
                  <div className="pt-6 border-t border-border/60 flex justify-between items-center">
                    {currentStep > 1 ? (
                      <Button
                        type="button"
                        onClick={prevStep}
                        variant="outline"
                        leftIcon={<ArrowLeft className="h-4 w-4" />}
                        className="px-5 py-2.5 rounded-2xl text-xs font-bold active:scale-95"
                      >
                        Back
                      </Button>
                    ) : (
                      <div />
                    )}

                    {currentStep < STEPS.length ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        variant="secondary"
                        rightIcon={<ArrowRight className="h-4 w-4" />}
                        className="px-6 py-2.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-2xl text-xs font-extrabold shadow-md active:scale-95"
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        loading={isSubmitting}
                        variant="secondary"
                        rightIcon={<Sparkles className="h-4 w-4 text-amber-300" />}
                        className="px-8 py-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-2xl text-xs font-extrabold uppercase tracking-wider shadow-lg active:scale-95"
                      >
                        Post Book For Sale
                      </Button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </form>

          </div>

          {/* 3. Right Column Sidebar: Tips & Benefits */}
          <SellTipsSidebar />

        </div>
      </main>
    </div>
  );
}

export default function SellBookPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-background justify-center items-center font-sans">
          <div className="animate-pulse text-sm font-semibold text-muted-foreground">Loading sell page...</div>
        </div>
      }
    >
      <SellBookPageInner />
    </Suspense>
  );
}
