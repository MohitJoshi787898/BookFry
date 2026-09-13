'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { sellBookSchema, SellBookFormData } from '@/lib/validations/sell-form.schema';
import { ListingProgressTabs, LISTING_TABS } from '@/components/sell/listing-progress-tabs';
import { BasicInfoTab } from '@/components/sell/tabs/basic-info-tab';
import { ConditionTab } from '@/components/sell/tabs/condition-tab';
import { PricingTab } from '@/components/sell/tabs/pricing-tab';
import { InventoryTab } from '@/components/sell/tabs/inventory-tab';
import { ImagesTab } from '@/components/sell/tabs/images-tab';
import { ReviewTab } from '@/components/sell/tabs/review-tab';
import { ListingPreviewCard } from '@/components/sell/listing-preview-card';
import { SellHero } from '@/components/sell/sell-hero';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { Book } from '@bookmarket/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { toast } from '@/stores/toast.store';
import { normalizeApiError } from '@/lib/error-normalizer';


const STEP_VALIDATION_FIELDS: Record<string, (keyof SellBookFormData)[]> = {
  basic: ['title', 'author', 'category'],
  condition: ['condition'],
  pricing: ['price'],
  inventory: ['quantity', 'sellerName', 'sellerEmail', 'sellerPhone', 'pincode', 'city', 'state', 'pickupAddress'],
  images: ['images'],
  review: ['confirmOwnership', 'agreePolicy'],
};

function SellBookPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get('slug');
  const isEditMode = !!editSlug;

  const { isAuthenticated, user } = useAuthStore();
  const { openModal } = useAuthModalStore();

  const [currentTab, setCurrentTab] = useState<string>('basic');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [tabErrors, setTabErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingIsbn, setIsFetchingIsbn] = useState(false);
  const [isbnFoundMsg, setIsbnFoundMsg] = useState<string | null>(null);

  const { data: editBook } = useQuery<Book>({
    queryKey: ['sell-edit-book', editSlug],
    queryFn: () => apiClient(`/books/${editSlug}`),
    enabled: isEditMode && isAuthenticated,
  });

  const { data: categories = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['categories'],
    queryFn: () => apiClient('/categories'),
  });

  const form = useForm<SellBookFormData>({
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
      conditionNotes: '',
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

  const { watch, reset, trigger, setValue, handleSubmit } = form;
  const formValues = watch();

  // Restore draft or populate from editBook
  useEffect(() => {
    if (isEditMode) return;
    const savedDraft = localStorage.getItem('bookfry_sell_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        reset(parsed);
      } catch (err) {
        console.error('Failed to parse sell draft', err);
      }
    }
  }, [reset, isEditMode]);

  useEffect(() => {
    if (isEditMode) return;
    if (formValues.title || (formValues.price && formValues.price > 0)) {
      localStorage.setItem('bookfry_sell_draft', JSON.stringify(formValues));
    }
  }, [formValues, isEditMode]);

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
        condition: (editBook.condition as SellBookFormData['condition']) || 'good',
        conditionNotes: editBook.conditionNotes || '',
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

  // Pincode lookup
  useEffect(() => {
    if (formValues.pincode && formValues.pincode.length === 6) {
      fetch(`https://api.postalpincode.in/pincode/${formValues.pincode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.[0]?.Status === 'Success') {
            const po = data[0].PostOffice[0];
            setValue('city', po.District, { shouldValidate: true });
            setValue('state', po.State, { shouldValidate: true });
          }
        })
        .catch((err) => console.error('Pincode fetch error:', err));
    }
  }, [formValues.pincode, setValue]);

  // ISBN Auto-lookup
  const handleFetchIsbn = async () => {
    if (!formValues.isbn || formValues.isbn.length < 10) {
      toast.warning('Please enter a valid 10 or 13 digit ISBN.', {
        title: 'Invalid ISBN',
      });
      return;
    }
    setIsFetchingIsbn(true);
    setIsbnFoundMsg(null);
    try {
      const cleanIsbn = formValues.isbn.replace(/[^0-9X]/gi, '');
      const localRes = await apiClient<{ books: Book[] }>(`/books?search=${cleanIsbn}`).catch(() => null);
      const existing = localRes?.books?.find((b) => b.isbn.replace(/[^0-9X]/gi, '') === cleanIsbn);

      if (existing) {
        setValue('title', existing.title, { shouldValidate: true });
        setValue('author', existing.author, { shouldValidate: true });
        if (existing.publisher) setValue('publisher', existing.publisher);
        if (existing.edition) setValue('edition', existing.edition);
        if (existing.category) setValue('category', existing.category);
        if (existing.images?.length > 0) setValue('images', existing.images.map((img) => img.url), { shouldValidate: true });
        setIsbnFoundMsg(`Catalog match: "${existing.title}". Your listing will attach to this book.`);
        toast.success(`Matched catalog record for "${existing.title}".`, {
          title: 'Catalog Match Found',
        });
        return;
      }

      const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`);
      const data = await res.json();
      const bookData = data[`ISBN:${cleanIsbn}`];
      if (bookData) {
        setValue('title', bookData.title || formValues.title, { shouldValidate: true });
        if (bookData.authors?.[0]?.name) setValue('author', bookData.authors[0].name, { shouldValidate: true });
        if (bookData.publishers?.[0]?.name) setValue('publisher', bookData.publishers[0].name, { shouldValidate: true });
        if (bookData.cover?.medium) setValue('images', [bookData.cover.medium], { shouldValidate: true });
        setIsbnFoundMsg(`Details retrieved from OpenLibrary for "${bookData.title}".`);
        toast.success(`Retrieved metadata for "${bookData.title}".`, {
          title: 'Book Details Retrieved',
        });
      } else {
        toast.info('No record found for this ISBN. Please enter details manually.', {
          title: 'Manual Entry',
        });
      }
    } catch (err) {
      console.error('ISBN fetch error:', err);
      toast.warning('ISBN lookup failed. Please enter book details manually.', {
        title: 'Lookup Notice',
      });
    } finally {
      setIsFetchingIsbn(false);
    }
  };

  const currentTabIdx = LISTING_TABS.findIndex((t) => t.id === currentTab);

  const validateCurrentTab = async () => {
    const fields = STEP_VALIDATION_FIELDS[currentTab] || [];
    const valid = await trigger(fields);
    setTabErrors((prev) => ({ ...prev, [currentTab]: !valid }));
    if (valid) {
      const stepNum = LISTING_TABS[currentTabIdx].stepNumber;
      if (!completedSteps.includes(stepNum)) setCompletedSteps((prev) => [...prev, stepNum]);
    }
    return valid;
  };

  const handleNext = async () => {
    const valid = await validateCurrentTab();
    if (valid && currentTabIdx < LISTING_TABS.length - 1) {
      setCurrentTab(LISTING_TABS[currentTabIdx + 1].id);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentTabIdx > 0) {
      setCurrentTab(LISTING_TABS[currentTabIdx - 1].id);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const onSubmit = async (data: SellBookFormData) => {
    if (!isAuthenticated) {
      openModal('login', '/sell');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('author', data.author);
      formData.append('isbn', data.isbn || '9780000000000');
      formData.append('category', data.category);
      formData.append('condition', data.condition);
      if (data.conditionNotes) formData.append('conditionNotes', data.conditionNotes);
      formData.append(
        'description',
        data.conditionNotes && data.conditionNotes.trim().length >= 10
          ? data.conditionNotes.trim()
          : `${data.title} by ${data.author} (${data.condition.toUpperCase()} condition). Available on BookFry.`
      );
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
          if (img instanceof File) formData.append('images', img);
          else if (typeof img === 'string') formData.append('existingImages', img);
        });
      }

      if (isEditMode && editBook) {
        await apiClient(`/books/${editBook.id}`, { method: 'PATCH', body: formData });
        toast.success('Your book listing has been updated successfully.', {
          title: 'Listing Updated',
        });
      } else {
        await apiClient('/books', { method: 'POST', body: formData });
        localStorage.removeItem('bookfry_sell_draft');
        toast.success('Your book is now listed on the BookFry marketplace!', {
          title: 'Book Listed',
        });
      }
      router.push('/seller/dashboard');
    } catch (err: unknown) {
      const apiErr = err as { status?: number; code?: string; message?: string };
      if (apiErr.status === 401 || !isAuthenticated) {
        openModal('login', '/sell');
      } else {
        const normalized = normalizeApiError(err);
        toast.error(normalized.message, {
          title: normalized.title || 'Could Not List Book',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />
      <SellHero />

      <main className="flex-1 w-full px-3.5 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-8">
        <div className="space-y-6 max-w-7xl mx-auto">
          <ListingProgressTabs
            currentTab={currentTab}
            completedStepNumbers={completedSteps}
            onSelectTab={(tabId) => {
              validateCurrentTab();
              setCurrentTab(tabId);
            }}
            tabErrors={tabErrors}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-7 xl:col-span-8 bg-card border border-border/80 rounded-3xl p-5 sm:p-8 lg:p-10 shadow-xs">
              <form onSubmit={handleSubmit(onSubmit)}>
                {currentTab === 'basic' && (
                  <BasicInfoTab
                    form={form}
                    categories={categories}
                    isFetchingIsbn={isFetchingIsbn}
                    isbnFoundMsg={isbnFoundMsg}
                    onFetchIsbn={handleFetchIsbn}
                  />
                )}
                {currentTab === 'condition' && <ConditionTab form={form} />}
                {currentTab === 'pricing' && <PricingTab form={form} />}
                {currentTab === 'inventory' && <InventoryTab form={form} />}
                {currentTab === 'images' && <ImagesTab form={form} />}
                {currentTab === 'review' && <ReviewTab form={form} />}

                {/* Form Action Controls Desktop */}
                <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentTabIdx === 0 || isSubmitting}
                    className="flex items-center gap-2 h-11 px-5 rounded-xl font-bold cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </Button>

                  {currentTabIdx < LISTING_TABS.length - 1 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground flex items-center gap-2 font-extrabold h-11 px-7 rounded-xl shadow-xs cursor-pointer active:scale-95"
                    >
                      <span>Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground flex items-center gap-2 font-extrabold h-11 px-8 rounded-xl shadow-md cursor-pointer active:scale-95"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Publishing Listing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>{isEditMode ? 'Update Listing' : 'Publish Book to Marketplace'}</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </div>

            <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-24">
              <ListingPreviewCard formValues={formValues} />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom Dock with Safe Area Support */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-card/95 backdrop-blur-md border-t border-border/80 z-40 flex items-center justify-between gap-3 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentTabIdx === 0 || isSubmitting}
          className="h-12 w-12 rounded-2xl border border-border/80 bg-background hover:bg-muted flex items-center justify-center text-foreground disabled:opacity-30 shrink-0 transition-all active:scale-90 cursor-pointer"
          aria-label="Previous step"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          {currentTabIdx < LISTING_TABS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <span>Continue (Step {currentTabIdx + 2} of {LISTING_TABS.length})</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 fill-current" />
                  <span>{isEditMode ? 'Update Listing' : 'Publish Book Now'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

export default function SellBookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      }
    >
      <SellBookPageInner />
    </Suspense>
  );
}
