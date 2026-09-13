'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Book } from '@bookmarket/types';
import { Eye, ShieldCheck, X } from 'lucide-react';

export interface BookDetailGalleryProps {
  book: Book;
}

const CONDITION_COLORS: Record<string, string> = {
  new: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  like_new: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  good: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
  fair: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  acceptable: 'bg-secondary/15 text-secondary border-secondary/30',
};

function getImageUrl(img: unknown): string {
  if (typeof img === 'string') return img;
  if (img && typeof img === 'object' && 'url' in img && typeof (img as { url: unknown }).url === 'string') {
    return (img as { url: string }).url;
  }
  return '/assets/bookfry/bookfry-fox-reading.webp';
}

export function BookDetailGallery({ book }: BookDetailGalleryProps) {
  const images =
    book.images && book.images.length > 0
      ? book.images.map(getImageUrl)
      : ['/assets/bookfry/bookfry-fox-reading.webp'];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const activeImage = images[selectedImageIndex] || images[0];

  return (
    <div className="space-y-4 font-sans">
      {/* Primary Image Stage */}
      <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full rounded-2xl overflow-hidden bg-card border border-border/80 shadow-sm flex items-center justify-center p-6 group">
        <motion.div
          key={selectedImageIndex}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="relative w-full h-full"
        >
          <Image
            src={activeImage}
            alt={book.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 450px"
            className="object-contain drop-shadow-md group-hover:scale-103 transition-transform duration-300"
          />
        </motion.div>

        {/* Condition Ribbon */}
        {book.condition && (
          <div className="absolute top-4 left-4 z-10">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs ${
                CONDITION_COLORS[book.condition] || 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {book.condition.replace('_', ' ')}
            </span>
          </div>
        )}

        {/* Quick Preview Button */}
        <button
          onClick={() => setIsPreviewModalOpen(true)}
          className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-xl bg-card/90 hover:bg-card text-foreground border border-border/80 text-xs font-bold shadow-xs backdrop-blur-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5 text-secondary" />
          <span>Full Preview</span>
        </button>
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImageIndex(idx)}
              className={`relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                selectedImageIndex === idx
                  ? 'border-secondary shadow-xs scale-102'
                  : 'border-border/70 hover:border-secondary/40 opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={img} alt={`View ${idx + 1}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Verified Guarantee Badge */}
      <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-muted/40 border border-border/80 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>Physical pages &amp; binding quality checked by campus book verifiers.</span>
      </div>

      {/* Image Preview Lightbox Modal */}
      <AnimatePresence>
        {isPreviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewModalOpen(false)}
              className="fixed inset-0 bg-background/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative z-10 max-w-2xl w-full max-h-[85vh] rounded-3xl bg-card border border-border p-6 shadow-2xl flex flex-col items-center"
            >
              <div className="w-full flex items-center justify-between pb-4 border-b border-border mb-4">
                <h3 className="font-serif text-base font-bold text-foreground truncate">{book.title}</h3>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="relative w-full h-96 sm:h-[480px]">
                <Image
                  src={activeImage}
                  alt={book.title}
                  fill
                  sizes="600px"
                  className="object-contain"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BookDetailGallery;
