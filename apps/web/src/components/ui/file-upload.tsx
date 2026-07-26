import React, { useRef, useState } from 'react';
import { UploadCloud, File, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
export interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  existingFiles?: string[];
  onRemoveExisting?: (url: string) => void;
  loading?: boolean;
  className?: string;
}

export function FileUpload({
  onFilesSelected,
  maxFiles = 5,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  existingFiles = [],
  onRemoveExisting,
  loading = false,
  className,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = (filesList: FileList) => {
    setError(null);
    const newFiles: File[] = [];
    const totalCount = existingFiles.length + previews.length + filesList.length;

    if (totalCount > maxFiles) {
      setError(`Maximum file limit of ${maxFiles} exceeded.`);
      return;
    }

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      if (!acceptedTypes.includes(file.type)) {
        setError(`File type ${file.type} is not accepted.`);
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File ${file.name} exceeds ${maxSizeMB}MB limit.`);
        return;
      }
      newFiles.push(file);
    }

    if (newFiles.length > 0) {
      // Create local previews
      const newPreviews = newFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));

      setPreviews((prev) => [...prev, ...newPreviews]);
      onFilesSelected(newFiles);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const removeLocalFile = (index: number) => {
    const fileToRemove = previews[index];
    URL.revokeObjectURL(fileToRemove.url);
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onFilesSelected(updated.map((p) => p.file));
  };

  return (
    <div className={cn('w-full space-y-3 font-sans text-xs', className)}>
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !loading && inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center bg-slate-50/20 hover:bg-slate-50/40 hover:border-secondary/60',
          dragActive ? 'border-secondary bg-secondary/5' : '',
          loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={loading}
        />

        <UploadCloud className="h-8 w-8 text-text-muted mb-2 shrink-0" />
        <p className="font-bold text-text-primary mb-1">
          Drag & drop files here, or <span className="text-secondary underline">browse</span>
        </p>
        <p className="text-[10px] text-text-muted">
          Supported: JPG, PNG, WEBP (Max {maxSizeMB}MB each)
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3 bg-danger/5 border border-danger/20 rounded-md text-[10px] font-bold text-danger flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Previews List */}
      {(existingFiles.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
          {/* Existing Files */}
          {existingFiles.map((url, i) => (
            <div key={`existing-${i}`} className="relative aspect-square border border-border rounded-lg bg-muted overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Existing listing" className="w-full h-full object-cover" />
              {onRemoveExisting && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveExisting(url);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}

          {/* New Files */}
          {previews.map((preview, i) => (
            <div key={`new-${i}`} className="relative aspect-square border border-border rounded-lg bg-muted overflow-hidden group animate-in fade-in duration-200">
              {preview.file.type.startsWith('image/') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview.url} alt="Listing preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-text-muted p-2">
                  <File className="h-6 w-6 mb-1" />
                  <span className="text-[8px] font-mono truncate w-full text-center">{preview.file.name}</span>
                </div>
              )}
              <button
                type="button"
                disabled={loading}
                onClick={(e) => {
                  e.stopPropagation();
                  removeLocalFile(i);
                }}
                className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
