'use client';

import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface AdminDataTableProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchField?: keyof T;
  actions?: React.ReactNode;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AdminDataTable<T extends Record<string, any>>({
  title,
  subtitle,
  data,
  columns,
  searchPlaceholder = 'Filter records...',
  searchField,
  actions,
  onRowClick,
  isLoading = false,
}: AdminDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Set to 5 matching the 5 records mockup

  // Search filtering
  const filteredData = data.filter((item) => {
    if (!searchTerm.trim() || !searchField) return true;
    const value = String(item[searchField] || '').toLowerCase();
    return value.includes(searchTerm.toLowerCase().trim());
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="border border-border/80 bg-card rounded-2xl shadow-xs overflow-hidden font-sans space-y-4">
      
      {/* Table Top Header Row */}
      <div className="p-5 border-b border-border/85 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-text-primary">{title}</h3>
          {subtitle && <p className="text-[10px] text-text-muted mt-0.5 font-bold">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {searchField && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={searchPlaceholder}
                className="pl-9 pr-3 py-1.5 text-xs bg-background-subtle border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-[#F26522] focus:outline-none w-44 sm:w-56"
              />
            </div>
          )}

          {actions}
        </div>
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs divide-y divide-border/60">
          <thead className="bg-[#FBFBFC] dark:bg-slate-900/40 text-text-muted uppercase text-[9px] font-extrabold tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-5 py-3 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-text-primary">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-5 py-4">
                      <div className="h-4 bg-background-subtle rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-text-muted font-bold">
                  No records match your criteria.
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIdx) => (
                <tr
                  key={item._id || item.id || rowIdx}
                  onClick={() => onRowClick?.(item)}
                  className={`hover:bg-background-subtle/50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className={`px-5 py-3.5 align-middle ${col.className || ''}`}>
                      {col.cell
                        ? col.cell(item)
                        : col.accessorKey
                        ? String(item[col.accessorKey] ?? '')
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer matching mockup */}
      <div className="p-4 border-t border-border/80 flex items-center justify-between text-xs text-text-secondary font-medium font-sans">
        <span>
          Showing {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} to{' '}
          {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} records
        </span>

        <div className="flex items-center space-x-2">
          {/* Back page */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 border border-border rounded-lg hover:bg-background-subtle disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-4.5 w-4.5 text-text-secondary" />
          </button>

          {/* Current Page Highlight Orange */}
          <div className="h-7 w-7 rounded-lg border border-[#F26522] text-[#F26522] bg-[#FFF9F6] dark:bg-orange-950/15 flex items-center justify-center font-bold font-mono text-xs">
            {currentPage}
          </div>

          {/* Next Page */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1 border border-border rounded-lg hover:bg-background-subtle disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="h-4.5 w-4.5 text-text-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDataTable;
