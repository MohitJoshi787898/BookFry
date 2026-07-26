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
        <label className="text-xs font-bold text-text-secondary select-none flex items-center">
          {label}
          {required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}

      {/* Dropdown Toggle */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full bg-slate-50/40 text-text-primary border border-border text-xs rounded-md px-3.5 py-2.5 transition-all focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary flex items-center justify-between text-left disabled:opacity-50 disabled:bg-muted font-medium',
            isOpen ? 'ring-1 ring-secondary border-secondary' : '',
            error ? 'border-danger focus:ring-danger focus:border-danger' : '',
            className
          )}
        >
          <div className="flex flex-wrap gap-1 items-center overflow-hidden pr-2">
            {selectedOptions.length === 0 ? (
              <span className="text-text-muted">{placeholder}</span>
            ) : isMulti ? (
              selectedOptions.map((opt) => (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-1 bg-[#EFF6FC] border border-[#B8D7F2] text-[#1A3B5C] rounded-sm px-1.5 py-0.5 text-[10px] font-bold"
                >
                  {opt.label}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, opt.value)}
                    className="p-0.5 rounded-full hover:bg-slate-200 text-[#1A3B5C]"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))
            ) : (
              <span>{selectedOptions[0].label}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {loading && <Loader2 className="h-3.5 w-3.5 text-text-muted animate-spin" />}
            <ChevronDown className={cn('h-3.5 w-3.5 text-text-muted transition-transform duration-200', isOpen && 'rotate-180')} />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-md border border-border bg-card shadow-lg py-1">
            {searchable && (
              <div className="sticky top-0 bg-card px-2.5 py-1.5 border-b border-border flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs font-medium focus:outline-none bg-transparent"
                />
              </div>
            )}

            {Object.keys(groupedOptions).length === 0 ? (
              <div className="px-3.5 py-2 text-xs text-text-muted text-center font-medium">
                No options found
              </div>
            ) : (
              Object.entries(groupedOptions).map(([groupName, groupOpts]) => (
                <div key={groupName}>
                  {groupName && (
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted bg-muted/30 border-y border-border/20">
                      {groupName}
                    </div>
                  )}
                  {groupOpts.map((option) => {
                    const isSelected = selectedValues.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={cn(
                          'w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-muted transition-colors',
                          isSelected ? 'bg-primary-50/50 text-primary hover:bg-primary-50' : 'text-text-primary'
                        )}
                      >
                        <span>{option.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
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
      {error ? (
        <p className="text-danger text-[10px] font-bold px-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-text-muted text-[10px] px-0.5">{helperText}</p>
      ) : null}
    </div>
  );
}

export default Select;
