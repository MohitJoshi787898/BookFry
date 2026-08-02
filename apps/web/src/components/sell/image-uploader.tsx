'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

type UploadableImage = string | File | { url: string };

interface ImageUploaderProps {
  images: UploadableImage[];
  onChange: (images: UploadableImage[]) => void;
  maxImages?: number;
}

function ImagePreview({ img }: { img: UploadableImage }) {
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    if (!img) {
      setPreview('');
      return;
    }

    if (typeof img === 'string') {
      setPreview(img);
      return;
    }

    if (typeof img === 'object' && 'url' in img && typeof img.url === 'string') {
      setPreview(img.url);
      return;
    }

    if (img instanceof Blob || img instanceof File) {
      try {
        const objectUrl = URL.createObjectURL(img);
        setPreview(objectUrl);

        return () => {
          URL.revokeObjectURL(objectUrl);
        };
      } catch (err) {
        console.error('Failed to create Object URL for image:', err);
      }
    }
  }, [img]);

  if (!preview) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={preview} alt="Book Preview" className="w-full h-full object-cover" />
  );
}

export function ImageUploader({ images, onChange, maxImages = 4 }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) return;

    const filesArray = Array.from(files).slice(0, availableSlots);
    const validFiles = filesArray.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 5MB limit.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      onChange([...images, ...validFiles].slice(0, maxImages));
    }
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

  const renderSlots = [];
  for (let i = 0; i < images.length; i++) {
    renderSlots.push({ type: 'image', value: images[i], index: i });
  }
  if (images.length < maxImages) {
    renderSlots.push({ type: 'uploader', index: images.length });
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`font-sans p-2 rounded-3xl transition-all duration-200 ${
        isDragging ? 'bg-[#F26522]/10 border-2 border-dashed border-[#F26522]' : ''
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {renderSlots.map((slot) => {
          if (slot.type === 'image' && slot.index !== undefined) {
            return (
              <div
                key={`img-${slot.index}`}
                className="relative aspect-square sm:aspect-[4/5] rounded-3xl border border-border/80 overflow-hidden bg-muted/40 shadow-xs group"
              >
                <ImagePreview img={slot.value!} />

                {/* Cover label at top left for first index */}
                {slot.index === 0 && (
                  <span className="absolute top-3 left-3 bg-[#F26522] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                    COVER PHOTO
                  </span>
                )}

                {/* Remove button at top right */}
                <button
                  type="button"
                  onClick={() => removeImage(slot.index!)}
                  className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-card/90 border border-border/80 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white shadow-md transition-all active:scale-95 backdrop-blur-md"
                  title="Remove photo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          }

          // Dotted Add Photo card
          return (
            <div
              key="uploader-slot"
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer aspect-square sm:aspect-[4/5] rounded-3xl border-2 border-dashed border-border/80 hover:border-[#F26522] bg-card hover:bg-[#F26522]/5 flex flex-col items-center justify-center text-center p-4 transition-all active:scale-95 shadow-xs"
            >
              <div className="h-10 w-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-2">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-foreground">Add Photo</span>
              <span className="text-[10px] text-muted-foreground mt-1 leading-tight font-medium">
                JPG, PNG, WebP<br />Max 5MB each
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ImageUploader;
