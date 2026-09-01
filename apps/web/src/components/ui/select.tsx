import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  isMulti?: boolean;
  loading?: boolean;
  className?: string;
}

export function Select({
  label,
  placeholder = 'Select an option',
  error,
  helperText,
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  searchable = false,
  isMulti = false,
  loading = false,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  const selectedOptions = options.filter((opt) => selectedValues.includes(opt.value));

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (optionValue: string) => {
    if (!onChange) return;

    if (isMulti) {
      if (selectedValues.includes(optionValue)) {
        onChange(selectedValues.filter((v) => v !== optionValue));
      } else {
        onChange([...selectedValues, optionValue]);
      }
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const handleRemove = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    if (!onChange) return;
    onChange(selectedValues.filter((v) => v !== optionValue));
  };

  // Grouped options rendering
  const groupedOptions: Record<string, SelectOption[]> = {};
  filteredOptions.forEach((opt) => {
    const groupName = opt.group || '';
    if (!groupedOptions[groupName]) {
      groupedOptions[groupName] = [];
    }
    groupedOptions[groupName].push(opt);
  });

  return (
    <div className="w-full flex flex-col space-y-1.5 font-sans" ref={dropdownRef}>
      {label && (
        <label className="text-xs sm:text-sm font-semibold text-text-primary/90 select-none flex items-center gap-0.5">
          {label}
          {required && <span className="text-danger" aria-hidden="true">*</span>}
        </label>
      )}

      {/* Dropdown Toggle */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full bg-card text-text-primary border border-border/80 text-sm rounded-lg min-h-[48px] sm:min-h-[44px] px-3.5 py-2.5 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary flex items-center justify-between text-left disabled:opacity-50 disabled:bg-muted font-medium',
            isOpen ? 'ring-2 ring-secondary/30 border-secondary' : '',
            error ? 'border-danger focus:ring-danger/30 focus:border-danger' : '',
            className
          )}
        >
          <div className="flex flex-wrap gap-1.5 items-center overflow-hidden pr-2">
            {selectedOptions.length === 0 ? (
              <span className="text-text-muted">{placeholder}</span>
            ) : isMulti ? (
              selectedOptions.map((opt) => (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary rounded-md px-2 py-0.5 text-xs font-semibold"
                >
                  {opt.label}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, opt.value)}
                    className="p-0.5 rounded-full hover:bg-primary/20 text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-sm font-medium">{selectedOptions[0].label}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {loading && <Loader2 className="h-4 w-4 text-text-muted animate-spin" />}
            <ChevronDown className={cn('h-4 w-4 text-text-muted transition-transform duration-200', isOpen && 'rotate-180')} />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-card shadow-lg py-1">
            {searchable && (
              <div className="sticky top-0 bg-card px-3 py-2 border-b border-border flex items-center gap-2">
                <Search className="h-4 w-4 text-text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Search options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm font-medium focus:outline-none bg-transparent placeholder:text-text-muted"
                />
              </div>
            )}

            {Object.keys(groupedOptions).length === 0 ? (
              <div className="px-3.5 py-3 text-xs text-text-muted text-center font-medium">No options available</div>
            ) : (
              Object.entries(groupedOptions).map(([group, opts]) => (
                <div key={group || 'root'} className="py-1">
                  {group && (
                    <div className="px-3.5 py-1 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                      {group}
                    </div>
                  )}
                  {opts.map((opt) => {
                    const isSelected = selectedValues.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(opt.value)}
                        className={cn(
                          'w-full px-3.5 py-2 text-sm text-left flex items-center justify-between hover:bg-muted font-medium transition-colors',
                          isSelected ? 'bg-primary/10 text-primary font-semibold' : 'text-text-primary'
                        )}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Error/Helper text */}
      {error && <p className="text-xs text-danger font-medium px-0.5">{error}</p>}
      {helperText && !error && <p className="text-xs text-text-muted px-0.5">{helperText}</p>}
    </div>
  );
}

export default Select;
