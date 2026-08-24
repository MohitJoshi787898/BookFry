'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Loader2, X, Sparkles } from 'lucide-react';
import { Category } from '@bookmarket/types';

interface SellerAddBookFormProps {
  categories: Category[];
  onSubmit: (formData: FormData) => Promise<void>;
  isPublishing: boolean;
}

export function SellerAddBookForm({
  categories,
  onSubmit,
  isPublishing,
}: SellerAddBookFormProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [publisher, setPublisher] = useState('');
  const [category, setCategory] = useState('');
  const [language] = useState('English');
  const [condition, setCondition] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isFetchingIsbn, setIsFetchingIsbn] = useState(false);

  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  const handleFetchIsbn = async () => {
    if (!isbn || isbn.length < 10) {
      alert('Please enter a 10 or 13 digit ISBN.');
      return;
    }
    setIsFetchingIsbn(true);
    try {
      const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
      const res = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`
      );
      const data = await res.json();
      const bookData = data[`ISBN:${cleanIsbn}`];

      if (bookData) {
        setTitle(bookData.title || '');
        if (bookData.authors?.[0]) setAuthor(bookData.authors[0].name || '');
        if (bookData.publishers?.[0]) setPublisher(bookData.publishers[0].name || '');
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

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedPhotos((prev) => [...prev, ...files]);
      const previews = files.map((file) => URL.createObjectURL(file));
      setPhotoPreviews((prev) => [...prev, ...previews]);
    }
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !category || !price) {
      alert('Please fill in Title, Author, Category, and Price.');
      return;
    }

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

    await onSubmit(formData);

    // Reset Form
    setTitle('');
    setAuthor('');
    setIsbn('');
    setPublisher('');
    setCategory('');
    setPrice('');
    setComparePrice('');
    setSelectedPhotos([]);
    setPhotoPreviews([]);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-6 font-sans text-xs"
    >
      <div>
        <h3 className="font-serif text-lg sm:text-xl font-bold text-text-primary">
          List a Book for Sale
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Enter details manually or use ISBN auto-fill for instant metadata
        </p>
      </div>

      {/* 1. Book Details Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-full bg-brand/10 text-brand dark:bg-brand/20 dark:text-primary flex items-center justify-center font-bold text-[10px]">
            1
          </span>
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            Book Information
          </p>
        </div>

        {/* ISBN Fetch Row */}
        <div className="space-y-1.5">
          <label className="font-semibold text-text-secondary">ISBN Number (Optional)</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 9788172234980"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              className="flex-grow px-3.5 py-2.5 border border-border rounded-xl bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-brand font-mono text-xs"
            />
            <button
              type="button"
              onClick={handleFetchIsbn}
              disabled={isFetchingIsbn}
              className="px-4 py-2.5 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs shrink-0 disabled:opacity-50"
            >
              {isFetchingIsbn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Auto-Fill</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Title and Author */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="font-semibold text-text-secondary">Book Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. The Alchemist"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-brand text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-semibold text-text-secondary">Author *</label>
            <input
              type="text"
              required
              placeholder="e.g. Paulo Coelho"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-brand text-xs"
            />
          </div>
        </div>

        {/* Publisher and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="font-semibold text-text-secondary">Publisher</label>
            <input
              type="text"
              placeholder="e.g. HarperCollins"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-brand text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-semibold text-text-secondary">Category *</label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-brand text-xs"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Book Condition */}
      <div className="border-t border-border pt-5 space-y-3.5">
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-full bg-brand/10 text-brand dark:bg-brand/20 dark:text-primary flex items-center justify-center font-bold text-[10px]">
            2
          </span>
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            Condition Rating
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {[
            { key: 'excellent', name: 'Like New', desc: 'No marks, crisp pages.' },
            { key: 'good', name: 'Very Good', desc: 'Minor reading creases.' },
            { key: 'fair', name: 'Good', desc: 'Visible notes/highlighting.' },
            { key: 'poor', name: 'Acceptable', desc: 'Worn but readable.' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setCondition(item.key as typeof condition)}
              className={`flex flex-col p-3 border rounded-xl cursor-pointer text-left transition-all ${
                condition === item.key
                  ? 'border-brand bg-brand/5 dark:bg-brand/20 shadow-xs ring-1 ring-brand'
                  : 'border-border hover:border-brand/40 bg-card'
              }`}
            >
              <span className="font-bold text-text-primary">{item.name}</span>
              <span className="text-[10px] text-text-muted mt-0.5">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Pricing */}
      <div className="border-t border-border pt-5 space-y-3.5">
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-full bg-brand/10 text-brand dark:bg-brand/20 dark:text-primary flex items-center justify-center font-bold text-[10px]">
            3
          </span>
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            Pricing
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="font-semibold text-text-secondary">Selling Price (₹) *</label>
            <input
              type="number"
              required
              placeholder="199"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-brand font-mono font-bold text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-semibold text-text-secondary">MRP / Original Price (₹)</label>
            <input
              type="number"
              placeholder="399"
              value={comparePrice}
              onChange={(e) => setComparePrice(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-brand font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* 4. Book Photos */}
      <div className="border-t border-border pt-5 space-y-3.5">
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-full bg-brand/10 text-brand dark:bg-brand/20 dark:text-primary flex items-center justify-center font-bold text-[10px]">
            4
          </span>
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            Photos (Cover, Back & Pages)
          </p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
          {/* Upload Button */}
          <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-brand bg-muted/30 hover:bg-muted/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
            <input type="file" multiple accept="image/*" onChange={handlePhotoSelect} className="hidden" />
            <Plus className="h-5 w-5 text-text-muted" />
            <span className="text-[9px] font-bold text-text-muted mt-1 uppercase">Upload</span>
          </label>

          {/* Photo Previews */}
          {photoPreviews.map((preview, index) => (
            <div
              key={index}
              className="aspect-square rounded-xl overflow-hidden border border-border bg-muted relative group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remove photo"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-border pt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setTitle('');
            setAuthor('');
            setIsbn('');
            setPublisher('');
            setCategory('');
            setPrice('');
            setComparePrice('');
            setSelectedPhotos([]);
            setPhotoPreviews([]);
          }}
          className="px-4 py-2.5 border border-border hover:bg-muted rounded-xl font-semibold text-text-secondary transition-colors"
        >
          Clear
        </button>
        <button
          type="submit"
          disabled={isPublishing}
          className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
        >
          {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Publish Listing'}
        </button>
      </div>
    </form>
  );
}
