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
      {/* Desktop Table */}
      <div className="hidden md:block space-y-4">
        {data.map((item) => (
          <div
            key={item.id}
            className={cn(
              'bg-white rounded-xl shadow-sm overflow-hidden',
              getRowClassName?.(item) || 'border border-gray-200'
            )}
          >
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        'px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider',
                        column.className
                      )}
                    >
                      {column.label}
                    </th>
                  ))}
                  {actions && (
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-[80px]">
                      Acciones
                    </th>
                  )}
                  {extras && (
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Extras
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-6 py-4 text-sm text-gray-900',
                        column.className
                      )}
                    >
                      {column.render
                        ? column.render(item)
                        : (item[column.key as keyof T] as ReactNode)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-4 text-center text-sm w-[80px]">
                      {actions(item)}
                    </td>
                  )}
                  {extras && (
                    <td className="px-6 py-4 text-center text-sm">
                      {extras(item)}
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.map((item) => (
          <div
            key={item.id}
            className={cn(
              'bg-white rounded-xl shadow-sm overflow-hidden transition-all',
              getRowClassName?.(item) || 'border border-gray-200'
            )}
          >
            <div className="p-4 space-y-3">
              {/* Header con extras siempre visible */}
              <div className="pb-3 border-b border-gray-100 flex items-start justify-between gap-3">
                <div
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'flex-1 min-w-0',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.find((col) => !col.hideOnMobile)?.render
                    ? columns.find((col) => !col.hideOnMobile)!.render!(item)
                    : (item[
                        columns.find((col) => !col.hideOnMobile)?.key as keyof T
                      ] as ReactNode)}
                </div>
                {extras && (
                  <div className="flex-shrink-0 ml-2">{extras(item)}</div>
                )}
              </div>

              {/* Resto de columnas visibles en mobile */}
              {columns
                .filter((col) => !col.hideOnMobile)
                .slice(1)
                .map((column) => (
                  <div
                    key={column.key}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      'flex items-center justify-between gap-3',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {column.label}
                    </span>
                    <div className="text-sm">
                      {column.render
                        ? column.render(item)
                        : (item[column.key as keyof T] as ReactNode)}
                    </div>
                  </div>
                ))}

              {/* Actions en fila separada */}
              {actions && (
                <div className="pt-2 border-t border-gray-100">
                  {actions(item)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
