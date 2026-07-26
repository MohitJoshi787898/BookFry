import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TableSkeleton } from './loader';
import { EmptyState } from './empty-state';

export interface ColumnDef<T> {
  header: React.ReactNode;
  accessorKey?: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface TableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  loading = false,
  emptyState,
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  className,
}: TableProps<T>) {
  const handleSort = (accessorKey?: string) => {
    if (!accessorKey || !onSort) return;
    const isCurrentColumn = sortColumn === accessorKey;
    const direction = isCurrentColumn && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(accessorKey, direction);
  };

  if (loading) {
    return <TableSkeleton rows={5} cols={columns.length} />;
  }

  if (data.length === 0) {
    return (
      emptyState || (
        <EmptyState
          type="default"
          title="No records found"
          description="There are no items in this view currently."
        />
      )
    );
  }

  return (
    <div className={cn('w-full overflow-x-auto border border-border rounded-xl bg-card font-sans text-xs', className)}>
      <table className="w-full text-left border-collapse">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-border bg-slate-50/50">
            {columns.map((col, i) => {
              const isSorted = col.accessorKey && sortColumn === col.accessorKey;
              return (
                <th
                  key={i}
                  className={cn(
                    'p-4 font-bold text-text-secondary select-none',
                    col.sortable && onSort ? 'cursor-pointer hover:text-text-primary' : '',
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(col.accessorKey as string)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && onSort && (
                      <span className="text-text-muted shrink-0">
                        {isSorted ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-60" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-border">
          {data.map((row, rIndex) => (
            <tr
              key={rIndex}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'transition-colors hover:bg-slate-50/30',
                onRowClick ? 'cursor-pointer' : '',
                rIndex % 2 === 1 ? 'bg-slate-50/[0.08]' : ''
              )}
            >
              {columns.map((col, cIndex) => {
                const cellValue =
                  col.accessorKey && typeof col.accessorKey === 'string'
                    ? (row as Record<string, unknown>)[col.accessorKey]
                    : null;

                return (
                  <td key={cIndex} className={cn('p-4 font-medium text-text-primary', col.className)}>
                    {col.cell ? col.cell(row) : cellValue !== null ? String(cellValue) : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
