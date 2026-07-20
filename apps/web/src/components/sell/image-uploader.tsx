'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon, Sparkles } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({ images, onChange, maxImages = 4 }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) return;

    const filesArray = Array.from(files).slice(0, availableSlots);

    filesArray.forEach((file) => {
      // Basic image size check (< 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 5MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onChange([...images, e.target.result as string].slice(0, maxImages));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Upload Zone */}
      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all duration-150 ${
            isDragging
              ? 'border-brand bg-brand/10'
              : 'border-border bg-surface hover:border-brand/50 hover:bg-background-subtle'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <div className="mx-auto h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-3">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-text-primary">
            Drag & drop book photos here, or <span className="text-brand underline">browse</span>
          </p>
          <p className="text-xs text-text-muted mt-1">
            Upload up to {maxImages} photos (JPEG, PNG, WebP up to 5MB each). First image is your cover image.
          </p>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {images.map((imgUrl, idx) => (
            <div
              key={idx}
              className="relative aspect-[2/3] rounded-md border border-border overflow-hidden bg-background-subtle group shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgUrl} alt={`Book image ${idx + 1}`} className="w-full h-full object-cover" />

              {/* Cover Badge for first image */}
              {idx === 0 && (
                <span className="absolute top-2 left-2 bg-brand text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Cover
                </span>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-danger text-white shadow hover:bg-danger/90 transition-opacity"
                title="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {/* Add More Tile */}
          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[2/3] rounded-md border-2 border-dashed border-border bg-surface hover:bg-background-subtle flex flex-col items-center justify-center text-text-muted hover:text-brand transition-colors"
            >
              <ImageIcon className="h-6 w-6 mb-1" />
              <span className="text-xs font-semibold">+ Add Photo</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
