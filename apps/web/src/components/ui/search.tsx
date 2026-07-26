import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  loading?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  defaultValue = '',
  onChange,
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300,
  loading = false,
  className,
}: SearchProps) {
  const [internalValue, setInternalValue] = useState(value !== undefined ? value : defaultValue);
  const isFirstRender = useRef(true);

  // Sync value from prop
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  // Debounce handler
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (debounceMs <= 0) return;

    const timer = setTimeout(() => {
      onChange?.(internalValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [internalValue, debounceMs, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalValue(val);
    if (debounceMs <= 0) {
      onChange?.(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(internalValue);
    }
  };

  const handleClear = () => {
    setInternalValue('');
    onChange?.('');
    onSearch?.('');
  };

  return (
    <div className={cn('relative flex items-center w-full font-sans text-xs', className)}>
      <SearchIcon className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none z-10" />

      <input
        type="text"
        value={internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2.5 bg-slate-50/40 text-text-primary border border-border rounded-md transition-all focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary font-medium"
      />

      <div className="absolute right-3.5 flex items-center gap-1.5 z-10">
        {loading && <Loader2 className="h-3.5 w-3.5 text-text-muted animate-spin" />}
        {!loading && internalValue && (
          <button
            type="button"
            onClick={handleClear}
            className="p-0.5 rounded-full hover:bg-muted text-text-muted hover:text-text-primary transition-colors focus-ring"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchInput;
