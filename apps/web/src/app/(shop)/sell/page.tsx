'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { sellBookSchema, SellBookFormData } from '@/lib/validations/sell-form.schema';
import { BookConditionCardGroup } from '@/components/sell/book-condition-card';
import { ImageUploader } from '@/components/sell/image-uploader';
import { EarningsCalculatorCard } from '@/components/sell/earnings-calculator-card';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
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
  ShieldCheck,
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Book Details', icon: BookOpen },
  { id: 2, title: 'Pricing & Payout', icon: DollarSign },
  { id: 3, title: 'Seller Details', icon: User },
  { id: 4, title: 'Pickup Location', icon: MapPin },
  { id: 5, title: 'Terms & Review', icon: CheckCircle2 },
];

const BOOK_CATEGORIES = [
  { id: 'engineering', label: 'Engineering & Technology' },
  { id: 'medical', label: 'Medical & Healthcare' },
  { id: 'school', label: 'School Textbooks (K-12)' },
  { id: 'college', label: 'College & University Degrees' },
  { id: 'novel', label: 'Novels & Fiction' },
  { id: 'exams', label: 'Competitive Exams & Test Prep' },
  { id: 'programming', label: 'Programming & CS' },
  { id: 'commerce', label: 'Commerce, CA & Business' },
  { id: 'other', label: 'Other Literature' },
];

export default function SellBookPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingIsbn, setIsFetchingIsbn] = useState(false);
  const [isbnFoundMsg, setIsbnFoundMsg] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);

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

  // Restore draft from localStorage
  useEffect(() => {
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
  }, [reset]);

  // Auto-save draft on value change
  useEffect(() => {
    if (formValues.title || formValues.price > 0) {
      localStorage.setItem('bookfry_sell_draft', JSON.stringify(formValues));
    }
  }, [formValues]);

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
        setIsbnFoundMsg(`Book details auto-filled for "${bookData.title}"!`);
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
      // Post book listing to backend API
      await apiClient('/books', {
        method: 'POST',
        body: JSON.stringify({
          title: data.title,
          author: data.author,
          isbn: data.isbn || '9780000000000',
          description: `Condition: ${data.condition}. Seller: ${data.sellerName}. Pincode: ${data.pincode}`,
          category: '678d59178ef99f471e98bb4b', // Fallback or map selected category ID
          condition: data.condition === 'excellent' ? 'like_new' : data.condition,
          price: data.price,
          stock: data.quantity,
          language: 'English',
          publisher: data.publisher,
          edition: data.edition,
        }),
      });

      localStorage.removeItem('bookfry_sell_draft');
      alert('Congratulations! Your book listing is live on BookFry.');
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
    <div className="flex flex-col min-h-screen bg-background text-text-primary font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-6 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-1">
              Marketplace Seller Portal
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary flex items-center space-x-3">
              <span>Post Your Book For Sale</span>
              <Sparkles className="h-6 w-6 text-accent animate-pulse" />
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              List in under 2 minutes. Connect with verified buyers nationwide.
            </p>
          </div>

          {draftRestored && (
            <div className="flex items-center space-x-2 bg-brand/10 border border-brand/20 px-3 py-1.5 rounded-full text-xs text-brand font-semibold">
              <span>Restored draft listing</span>
              <button
                onClick={clearDraft}
                className="text-text-muted hover:text-danger underline ml-1"
                title="Discard saved draft"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Unauthenticated Sign In Banner */}
        {!isAuthenticated && (
          <div className="p-4 bg-brand/10 border border-brand/20 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-sans">
            <div className="space-y-1">
              <span className="font-bold text-brand block uppercase tracking-wider">Authentication Required</span>
              <p className="text-text-secondary font-medium">
                You are currently browsing as a guest. Please sign in to publish your book listing to the marketplace.
              </p>
            </div>
            <button
              onClick={() => router.push('/login?redirectTo=/sell')}
              className="px-4 py-2 bg-brand text-white font-bold rounded-md hover:bg-brand-hover transition-colors shadow shrink-0"
            >
              Sign In to Post Book
            </button>
          </div>
        )}

        {/* Responsive Mobile Top Progress Bar */}
        <div className="lg:hidden w-full bg-surface border border-border rounded-lg p-4 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-text-primary">
            <span>
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </span>
            <span className="text-brand font-mono">{Math.round((currentStep / STEPS.length) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-background-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main 2-Column Wizard Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
          {/* Desktop Left Step Progress Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0 sticky top-24 bg-surface border border-border rounded-lg p-6 shadow-sm space-y-6">
            <h3 className="font-serif text-sm font-bold text-text-primary uppercase tracking-wider">
              Listing Progress
            </h3>

            <div className="space-y-4 relative">
              {STEPS.map((step) => {
                const IconComp = step.icon;
                const active = currentStep === step.id;
                const completed = currentStep > step.id;
                return (
                  <div
                    key={step.id}
                    onClick={() => completed && setCurrentStep(step.id)}
                    className={`flex items-center space-x-3 text-xs font-semibold p-2.5 rounded-md transition-all ${
                      completed
                        ? 'cursor-pointer text-brand hover:bg-brand/10'
                        : active
                        ? 'bg-brand text-white shadow-sm'
                        : 'text-text-muted opacity-70'
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center font-bold ${
                        completed
                          ? 'bg-brand/20 text-brand'
                          : active
                          ? 'bg-white/20 text-white'
                          : 'bg-background-subtle text-text-muted'
                      }`}
                    >
                      {completed ? <CheckCircle2 className="h-4 w-4 text-brand" /> : <IconComp className="h-4 w-4" />}
                    </div>
                    <span>{step.title}</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-border text-[11px] text-text-muted space-y-2">
              <span className="flex items-center gap-1 font-bold text-text-primary">
                <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Seller Protection
              </span>
              <p>Instant payouts, buyer verification, and zero listing fee to post.</p>
            </div>
          </aside>

          {/* Form Step Container */}
          <div className="flex-1 w-full min-w-0 bg-surface border border-border rounded-lg p-6 sm:p-8 shadow-sm space-y-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  {/* STEP 1: BOOK DETAILS */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="border-b border-border pb-4">
                        <h2 className="font-serif text-xl font-bold text-text-primary">Step 1: Book Details</h2>
                        <p className="text-xs text-text-secondary mt-1">
                          Provide basic book title, condition, and clear photos.
                        </p>
                      </div>

                      {/* Source Selection & ISBN Auto Fetch */}
                      <div className="p-4 bg-background-subtle border border-border rounded-lg space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <label className="text-xs font-bold uppercase tracking-wider text-text-primary">
                            Data Entry Source
                          </label>
                          <div className="flex space-x-4 text-xs font-semibold">
                            <label className="flex items-center space-x-1.5 cursor-pointer">
                              <input
                                type="radio"
                                value="auto"
                                {...register('source')}
                                className="text-brand focus:ring-brand"
                              />
                              <span>Auto Fetch via ISBN (Recommended)</span>
                            </label>
                            <label className="flex items-center space-x-1.5 cursor-pointer">
                              <input
                                type="radio"
                                value="manual"
                                {...register('source')}
                                className="text-brand focus:ring-brand"
                              />
                              <span>Manual Entry</span>
                            </label>
                          </div>
                        </div>

                        {formValues.source === 'auto' && (
                          <div className="space-y-2 pt-2 border-t border-border/60">
                            <label className="text-xs font-semibold text-text-secondary block">
                              13-Digit or 10-Digit ISBN Number
                            </label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <input
                                  type="text"
                                  placeholder="e.g. 9780143127741"
                                  {...register('isbn')}
                                  className="w-full pl-3 pr-3 py-2 text-sm bg-surface border border-border rounded-md text-text-primary"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={handleFetchIsbnDetails}
                                disabled={isFetchingIsbn}
                                className="px-4 py-2 bg-brand text-white text-xs font-bold rounded-md hover:bg-brand-hover transition-colors flex items-center space-x-1 shrink-0"
                              >
                                {isFetchingIsbn ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                <span>Fetch Details</span>
                              </button>
                            </div>
                            {isbnFoundMsg && (
                              <p className="text-xs font-semibold text-success flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" /> {isbnFoundMsg}
                              </p>
                            )}
                            {errors.isbn && <p className="text-xs text-danger">{errors.isbn.message}</p>}
                          </div>
                        )}
                      </div>

                      {/* Ad Title */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                          Ad Title <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Engineering Mathematics 3rd Edition (H.K. Dass)"
                          {...register('title')}
                          className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-md text-text-primary focus:ring-2 focus:ring-brand"
                        />
                        {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
                      </div>

                      {/* Author & Publisher */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                            Author Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. James Clear"
                            {...register('author')}
                            className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-text-primary"
                          />
                          {errors.author && <p className="text-xs text-danger">{errors.author.message}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                            Publisher / Edition (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Penguin Books, 2nd Edition"
                            {...register('publisher')}
                            className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-text-primary"
                          />
                        </div>
                      </div>

                      {/* Category Dropdown */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                          Book Category / Genre <span className="text-danger">*</span>
                        </label>
                        <select
                          {...register('category')}
                          className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-md text-text-primary focus:ring-2 focus:ring-brand"
                        >
                          <option value="">-- Select Category --</option>
                          {BOOK_CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                        {errors.category && <p className="text-xs text-danger">{errors.category.message}</p>}
                      </div>

                      {/* Condition Radio Group */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                          Book Condition <span className="text-danger">*</span>
                        </label>
                        <Controller
                          name="condition"
                          control={control}
                          render={({ field }) => (
                            <BookConditionCardGroup value={field.value} onChange={field.onChange} />
                          )}
                        />
                        {errors.condition && <p className="text-xs text-danger">{errors.condition.message}</p>}
                      </div>

                      {/* Upload Images */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                          Upload Book Photos (Max 4) <span className="text-danger">*</span>
                        </label>
                        <Controller
                          name="images"
                          control={control}
                          render={({ field }) => (
                            <ImageUploader images={field.value} onChange={field.onChange} maxImages={4} />
                          )}
                        />
                        {errors.images && <p className="text-xs text-danger">{errors.images.message}</p>}
                      </div>

                      {/* Quantity */}
                      <div className="space-y-1 w-36">
                        <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          {...register('quantity')}
                          className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-text-primary font-mono font-bold"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: PRICING DETAILS */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="border-b border-border pb-4">
                        <h2 className="font-serif text-xl font-bold text-text-primary">Step 2: Pricing & Payout</h2>
                        <p className="text-xs text-text-secondary mt-1">
                          Set your price and configure direct bank / UPI payout method.
                        </p>
                      </div>

                      {/* Selling Price input */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                            Your Selling Price (₹) <span className="text-danger">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top.1/2 top-2.5 text-sm font-bold text-text-muted">₹</span>
                            <input
                              type="number"
                              placeholder="e.g. 450"
                              {...register('price')}
                              className="w-full pl-8 pr-4 py-2.5 text-lg font-bold font-mono bg-surface border border-border rounded-md text-text-primary focus:ring-2 focus:ring-brand"
                            />
                          </div>
                          {errors.price && <p className="text-xs text-danger">{errors.price.message}</p>}
                        </div>

                        {/* Shipping option */}
                        <div className="space-y-2 pt-2">
                          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                            Shipping Options
                          </label>
                          <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer p-3 border border-border rounded-md bg-surface">
                            <input
                              type="checkbox"
                              {...register('freeShipping')}
                              className="text-brand focus:ring-brand rounded"
                            />
                            <span>Offer Free Shipping to Buyer (Recommended)</span>
                          </label>
                        </div>
                      </div>

                      {/* Real-time Earnings Calculator Card */}
                      <EarningsCalculatorCard
                        price={Number(formValues.price) || 0}
                        freeShipping={formValues.freeShipping}
                        shippingFee={Number(formValues.shippingFee) || 0}
                      />

                      {/* Preferred Payment Method */}
                      <div className="space-y-4 pt-4 border-t border-border">
                        <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                          Preferred Payout Method <span className="text-danger">*</span>
                        </label>

                        <div className="flex space-x-6 text-xs font-semibold">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              value="upi"
                              {...register('preferredPayment')}
                              className="text-brand focus:ring-brand"
                            />
                            <span>UPI Direct Transfer</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              value="bank"
                              {...register('preferredPayment')}
                              className="text-brand focus:ring-brand"
                            />
                            <span>Bank Account (NEFT/IMPS)</span>
                          </label>
                        </div>

                        {/* UPI Fields */}
                        {formValues.preferredPayment === 'upi' && (
                          <div className="space-y-1 max-w-md p-4 bg-background-subtle border border-border rounded-md">
                            <label className="text-xs font-bold text-text-primary block">
                              UPI ID (e.g. mobile@upi or name@okicici)
                            </label>
                            <input
                              type="text"
                              placeholder="yourname@upi"
                              {...register('upiId')}
                              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-text-primary"
                            />
                            {errors.upiId && <p className="text-xs text-danger">{errors.upiId.message}</p>}
                          </div>
                        )}

                        {/* Bank Fields */}
                        {formValues.preferredPayment === 'bank' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-background-subtle border border-border rounded-md">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-text-primary block">Account Holder Name</label>
                              <input
                                type="text"
                                placeholder="e.g. Rahul Sharma"
                                {...register('accountHolder')}
                                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-text-primary"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-text-primary block">Bank Name</label>
                              <input
                                type="text"
                                placeholder="e.g. HDFC Bank"
                                {...register('bankName')}
                                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-text-primary"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-text-primary block">Account Number</label>
                              <input
                                type="text"
                                placeholder="e.g. 50100239102"
                                {...register('accountNumber')}
                                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-text-primary"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-text-primary block">IFSC Code</label>
                              <input
                                type="text"
                                placeholder="e.g. HDFC0000240"
                                {...register('ifscCode')}
                                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-text-primary uppercase"
                              />
                            </div>
                            {errors.ifscCode && (
                              <p className="text-xs text-danger col-span-2">{errors.ifscCode.message}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: SELLER DETAILS */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="border-b border-border pb-4">
                        <h2 className="font-serif text-xl font-bold text-text-primary">Step 3: Seller Contact Details</h2>
                        <p className="text-xs text-text-secondary mt-1">
                          Verified contact details ensure smooth buyer communication.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                            Full Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Your full name"
                            {...register('sellerName')}
                            className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-text-primary"
                          />
                          {errors.sellerName && <p className="text-xs text-danger">{errors.sellerName.message}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                            Email Address <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            placeholder="name@domain.com"
                            {...register('sellerEmail')}
                            className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-text-primary"
                          />
                          {errors.sellerEmail && <p className="text-xs text-danger">{errors.sellerEmail.message}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                            WhatsApp / Mobile Number <span className="text-danger">*</span>
                          </label>
                          <input
                            type="tel"
                            placeholder="10-digit mobile number"
                            {...register('sellerPhone')}
                            className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-text-primary"
                          />
                          {errors.sellerPhone && <p className="text-xs text-danger">{errors.sellerPhone.message}</p>}
                        </div>

                        <div className="space-y-1 pt-6">
                          <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              {...register('hidePhone')}
                              className="text-brand focus:ring-brand rounded"
                            />
                            <span>Hide my phone number from public ad view</span>
                          </label>
                        </div>
                      </div>

                      {/* Location Pincode & City */}
                      <div className="pt-4 border-t border-border space-y-4">
                        <h4 className="font-serif text-sm font-bold text-text-primary">Item Location</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                              Pincode <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="6-digit pincode"
                              {...register('pincode')}
                              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-text-primary font-mono"
                            />
                            {errors.pincode && <p className="text-xs text-danger">{errors.pincode.message}</p>}
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                              City <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Auto-filled city"
                              {...register('city')}
                              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-text-primary"
                            />
                            {errors.city && <p className="text-xs text-danger">{errors.city.message}</p>}
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                              State <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Auto-filled state"
                              {...register('state')}
                              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-text-primary"
                            />
                            {errors.state && <p className="text-xs text-danger">{errors.state.message}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: PICKUP LOCATION */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="border-b border-border pb-4">
                        <h2 className="font-serif text-xl font-bold text-text-primary">Step 4: Pickup & Shipping Location</h2>
                        <p className="text-xs text-text-secondary mt-1">
                          Provide your pickup address for courier pickup or local buyer meeting.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                          Detailed Pickup Address (Optional)
                        </label>
                        <textarea
                          rows={4}
                          placeholder="House/Flat No, Street, Landmark..."
                          {...register('pickupAddress')}
                          className="w-full p-3 text-sm bg-surface border border-border rounded-md text-text-primary focus:ring-2 focus:ring-brand"
                        />
                        <p className="text-[11px] text-text-muted">
                          Your complete address is kept private and shared only after order confirmation.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: TERMS & REVIEW */}
                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <div className="border-b border-border pb-4">
                        <h2 className="font-serif text-xl font-bold text-text-primary">Step 5: Review & Post Listing</h2>
                        <p className="text-xs text-text-secondary mt-1">
                          Final review of your listing details before going live.
                        </p>
                      </div>

                      {/* Listing Summary Preview Box */}
                      <div className="p-4 bg-background-subtle border border-border rounded-lg space-y-3 text-xs">
                        <div className="flex justify-between border-b border-border/50 pb-2">
                          <span className="font-bold text-text-primary">Book Title:</span>
                          <span className="font-semibold text-brand">{formValues.title}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/50 pb-2">
                          <span className="font-bold text-text-primary">Selling Price:</span>
                          <span className="font-bold font-mono text-sm text-text-primary">₹{formValues.price}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/50 pb-2">
                          <span className="font-bold text-text-primary">Condition:</span>
                          <span className="uppercase font-semibold text-text-secondary">{formValues.condition}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold text-text-primary">Location:</span>
                          <span className="font-semibold text-text-secondary">
                            {formValues.city}, {formValues.state} ({formValues.pincode})
                          </span>
                        </div>
                      </div>

                      {/* Checkboxes */}
                      <div className="space-y-3 pt-2">
                        <label className="flex items-start space-x-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            {...register('confirmOwnership')}
                            className="mt-0.5 text-brand focus:ring-brand rounded"
                          />
                          <span>I confirm that this book belongs to me and matches the condition specified.</span>
                        </label>
                        {errors.confirmOwnership && (
                          <p className="text-xs text-danger">{errors.confirmOwnership.message}</p>
                        )}

                        <label className="flex items-start space-x-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            {...register('agreePolicy')}
                            className="mt-0.5 text-brand focus:ring-brand rounded"
                          />
                          <span>I agree to BookFry marketplace selling policies and fee terms.</span>
                        </label>
                        {errors.agreePolicy && (
                          <p className="text-xs text-danger">{errors.agreePolicy.message}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step Navigation Controls */}
                  <div className="pt-6 border-t border-border flex justify-between items-center">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-5 py-2.5 border border-border rounded-md text-xs font-bold text-text-primary hover:bg-background-subtle transition-colors flex items-center space-x-1"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    {currentStep < STEPS.length ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-6 py-2.5 bg-brand text-white text-xs font-bold rounded-md hover:bg-brand-hover transition-colors shadow flex items-center space-x-1"
                      >
                        <span>Continue</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-secondary text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-secondary-600 transition-all shadow-md flex items-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Posting Listing...</span>
                          </>
                        ) : (
                          <>
                            <span>Post Book For Sale</span>
                            <Sparkles className="h-4 w-4 text-accent" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
