'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/shadcn/utils';

interface Column<T> {
  key: string;
  label: string;
  width?: string;
  hideOnMobile?: boolean;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface ModernTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  actions?: (item: T) => ReactNode;
  extras?: (item: T) => ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
  getRowClassName?: (item: T) => string;
}

export function ModernTable<T extends { id: string | number }>({
  data,
  columns,
  onRowClick,
  actions,
  extras,
  isLoading,
  emptyMessage = 'No hay datos disponibles',
  getRowClassName,
}: ModernTableProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop & Mobile Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full bg-white sm:rounded-xl shadow-sm border border-gray-200">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap',
                      column.className
                    )}
                  >
                    {column.label}
                  </th>
                ))}
                {actions && (
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-[80px] whitespace-nowrap">
                    Acciones
                  </th>
                )}
                {extras && (
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                    Extras
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    onRowClick && 'cursor-pointer',
                    getRowClassName?.(item)
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-4 py-3 text-sm text-gray-900 whitespace-nowrap',
                        column.className
                      )}
                    >
                      {column.render
                        ? column.render(item)
                        : (item[column.key as keyof T] as ReactNode)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-center text-sm w-[80px] whitespace-nowrap">
                      {actions(item)}
                    </td>
                  )}
                  {extras && (
                    <td className="px-4 py-3 text-center text-sm whitespace-nowrap hidden md:table-cell">
                      {extras(item)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
