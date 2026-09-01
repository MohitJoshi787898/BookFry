'use client';

import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, LayoutGrid, Table } from 'lucide-react';
import { AdminEmptyState } from './admin-empty-state';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  mobileRender?: (item: T) => React.ReactNode;
}

export interface AdminDataTableProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchField?: keyof T;
  actions?: React.ReactNode;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
  mobileCardRender?: (item: T) => React.ReactNode;
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
  emptyTitle = 'No matching records',
  emptyDescription = 'Try clearing your search query or selecting a different filter option.',
  pageSize = 10,
  mobileCardRender,
}: AdminDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Search filtering
  const filteredData = data.filter((item) => {
    if (!searchTerm.trim() || !searchField) return true;
    const value = String(item[searchField] || '').toLowerCase();
    return value.includes(searchTerm.toLowerCase().trim());
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="border border-border/80 bg-card rounded-3xl shadow-sm overflow-hidden font-sans space-y-3">
      {/* Table Top Header Row */}
      <div className="p-4 sm:p-5 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">{title}</h3>
          {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {searchField && (
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={searchPlaceholder}
                className="pl-8 pr-3 py-1.5 text-xs bg-background border border-border/80 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary/40 outline-none w-full sm:w-56"
              />
            </div>
          )}

          {/* Optional Card/Table Toggle on tablet */}
          <div className="hidden sm:flex items-center bg-muted/60 p-0.5 rounded-xl border border-border/60">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
              title="Table View"
            >
              <Table className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'cards' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
              title="Card View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>

          {actions}
        </div>
      </div>

      {/* Main Content: Adaptive Mobile Cards vs Desktop Table */}
      {isLoading ? (
        <div className="p-5 space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-16 rounded-2xl bg-muted/40 animate-pulse border border-border/50" />
          ))}
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="p-4 sm:p-6">
          <AdminEmptyState
            title={emptyTitle}
            description={emptyDescription}
            mascotVariant="searching"
            action={
              searchTerm
                ? {
                    label: 'Clear Search',
                    onClick: () => setSearchTerm(''),
                  }
                : undefined
            }
          />
        </div>
      ) : (
        <>
          {/* Mobile Card List (Visible on mobile screens) */}
          <div className={`${viewMode === 'cards' ? 'block' : 'block md:hidden'} p-3 space-y-2.5`}>
            {paginatedData.map((item, rowIdx) =>
              mobileCardRender ? (
                <div key={item._id || item.id || rowIdx}>{mobileCardRender(item)}</div>
              ) : (
                <div
                  key={item._id || item.id || rowIdx}
                  onClick={() => onRowClick?.(item)}
                  className={`p-4 rounded-2xl border border-border/80 bg-card space-y-2 text-xs shadow-xs ${
                    onRowClick ? 'cursor-pointer hover:border-[#FF9F2D]/40 active:bg-muted/40' : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-bold text-foreground">
                      {columns[0]?.cell ? columns[0].cell(item) : String(item[columns[0]?.accessorKey as keyof T] ?? '')}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
                    {columns.slice(1, 4).map((col, cIdx) => (
                      <div key={cIdx} className="space-y-0.5 min-w-0">
                        <span className="font-bold text-[10px] uppercase opacity-75">{col.header}</span>
                        <div className="text-foreground font-semibold truncate">
                          {col.cell ? col.cell(item) : String(item[col.accessorKey as keyof T] ?? '')}
                        </div>
                      </div>
                    ))}
                  </div>
                  {columns.length > 4 && (
                    <div className="pt-2 border-t border-border/40 flex justify-end">
                      {columns[columns.length - 1]?.cell?.(item)}
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          {/* Desktop/Tablet Table Grid (Hidden on small mobile screens if viewMode === 'table') */}
          <div className={`${viewMode === 'cards' ? 'hidden' : 'hidden md:block'} overflow-x-auto`}>
            <table className="w-full text-left text-xs divide-y divide-border/60">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] font-black tracking-wider">
                <tr>
                  {columns.map((col, idx) => (
                    <th key={idx} className={`px-5 py-3.5 ${col.className || ''}`}>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground">
                {paginatedData.map((item, rowIdx) => (
                  <tr
                    key={item._id || item.id || rowIdx}
                    onClick={() => onRowClick?.(item)}
                    className={`hover:bg-muted/40 transition-colors ${
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
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Pagination Footer */}
      {filteredData.length > 0 && (
        <div className="p-3.5 sm:p-4 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground font-medium font-sans bg-muted/10">
          <span>
            Showing {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} to{' '}
            {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
          </span>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-border/80 rounded-xl hover:bg-muted disabled:opacity-40 transition-colors"
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="px-3 py-1 rounded-xl bg-secondary/15 text-secondary border border-secondary/25 font-bold font-mono text-xs">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-border/80 rounded-xl hover:bg-muted disabled:opacity-40 transition-colors"
              aria-label="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDataTable;
