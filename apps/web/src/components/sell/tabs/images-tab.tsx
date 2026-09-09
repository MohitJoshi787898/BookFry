'use client';

import React from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
import { SellBookFormData } from '@/lib/validations/sell-form.schema';
import { ImageUploader } from '@/components/sell/image-uploader';
import { Camera, AlertCircle } from 'lucide-react';

interface ImagesTabProps {
  form: UseFormReturn<SellBookFormData>;
}

export function ImagesTab({ form }: ImagesTabProps) {
  const {
    control,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
          Step 5: Book Photos &amp; Visual Evidence
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Upload clear, well-lit photos of the actual book. The first image serves as the primary storefront cover photo.
        </p>
      </div>

      {/* Guidelines Box */}
      <div className="p-4 bg-muted/40 border border-border rounded-xl flex items-start gap-3">
        <Camera className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Photography Tips for Higher Conversion:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Place book on a clean, solid background with good daylight.</li>
            <li>Take photo 1: Front cover; photo 2: Spine; photo 3: Open sample page or any wear.</li>
            <li>Maximum 4 photos allowed (JPG, PNG, or WebP up to 5MB each).</li>
          </ul>
        </div>
      </div>

      {/* Image Uploader */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground flex items-center gap-1">
          Upload Book Photos (Max 4) <span className="text-rose-500">*</span>
        </label>
        
        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <ImageUploader images={field.value} onChange={field.onChange} maxImages={4} />
          )}
        />
        
        {errors.images && (
          <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errors.images.message}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default ImagesTab;
