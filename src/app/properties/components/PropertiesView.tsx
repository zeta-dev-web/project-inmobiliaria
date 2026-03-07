'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Eye,
  Grid3X3,
  List,
  MapPin,
  Search,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/useAuth';
import { Property } from '@/generated/prisma';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

type PublicProperty = Property & {
  photos?: { id: string; url: string }[];
};

interface PropertiesViewProps {
  properties: PublicProperty[];
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
}

export function PropertiesView({
  properties,
  totalPages,
  currentPage,
  isLoading,
}: PropertiesViewProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState(
    searchParams.get('type') || ''
  );
  const [sortBy, setSortBy] = useState(searchParams.get('order') || 'asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    (searchParams.get('view') as 'grid' | 'list') || 'grid'
  );

  const handleFilterChange = () => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    if (typeFilter && typeFilter !== 'all') {
      params.set('type', typeFilter);
    } else {
      params.delete('type');
    }
    params.set('order', sortBy);
    params.set('view', viewMode);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setSortBy('asc');
    router.push(pathname);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    const params = new URLSearchParams(searchParams);
    params.set('view', mode);
    router.push(`${pathname}?${params.toString()}`);
  };

  const breadcrumbItems =
    user?.role === 'ADMIN'
      ? [{ label: 'Panel de Control', href: '/admin' }, { label: 'Propiedades' }]
      : [{ label: 'Propiedades' }];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Propiedades Disponibles
              </h1>
              <p className="text-gray-600">
                Encuentra tu hogar ideal con nuestra ayuda
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#600096] text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#600096] text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nombre o dirección..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={handleFilterChange}
                onKeyPress={(e) => e.key === 'Enter' && handleFilterChange()}
                className="pl-10"
              />
            </div>

            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value);
                handleFilterChange();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de propiedad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="RENT">Alquiler</SelectItem>
                <SelectItem value="SALE">Venta</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value);
                handleFilterChange();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por precio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Precio: Menor a Mayor</SelectItem>
                <SelectItem value="desc">Precio: Mayor a Menor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(search ||
            (typeFilter && typeFilter !== 'all') ||
            sortBy !== 'asc') && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-4 h-4 mr-1" />
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Properties Grid */}
        {isLoading ? (
          <LoadingSpinner message="Cargando propiedades..." />
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {properties?.map((property: PublicProperty) =>
              viewMode === 'grid' ? (
                <Link
                  key={property.id}
                  href={`/property/${property.id}`}
                  className="block"
                >
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-[420px] flex flex-col">
                    {/* Property Image */}
                    <div className="h-48 bg-gray-200 relative flex-shrink-0">
                      {property.photos && property.photos.length > 0 ? (
                        <img
                          src={property.photos[0].url}
                          alt={property.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge
                          variant="outline"
                          className={
                            property.type === 'RENT'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-green-600 text-white border-green-600'
                          }
                        >
                          {property.type === 'RENT' ? 'Alquiler' : 'Venta'}
                        </Badge>
                      </div>
                      {property.photos && property.photos.length > 1 && (
                        <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                          +{property.photos.length - 1} fotos
                        </div>
                      )}
                    </div>

                    {/* Property Info */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 h-7 line-clamp-1">
                        {property.name}
                      </h3>

                      <div className="flex items-center text-gray-600 mb-3 h-5">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="text-sm line-clamp-1">
                          {property.address}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-2xl font-bold text-[#600096]">
                          ${property.price.toLocaleString()}
                        </p>
                        {property.type === 'SALE' &&
                          property.saleCommission && (
                            <p className="text-xs text-gray-500">
                              Comisión: {property.saleCommission}%
                            </p>
                          )}
                      </div>

                      <div className="flex-1">
                        {property.description && (
                          <p className="text-gray-600 text-sm line-clamp-3 h-16">
                            {property.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <Link
                  key={property.id}
                  href={`/property/${property.id}`}
                  className="block"
                >
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-28">
                    <div className="flex h-full">
                      {/* Property Image */}
                      <div className="w-32 h-full bg-gray-200 relative flex-shrink-0">
                        {property.photos && property.photos.length > 0 ? (
                          <img
                            src={property.photos[0].url}
                            alt={property.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        {property.photos && property.photos.length > 1 && (
                          <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white px-1 py-0.5 rounded text-xs">
                            +{property.photos.length - 1}
                          </div>
                        )}
                      </div>

                      {/* Property Info */}
                      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="text-base font-semibold text-gray-900 line-clamp-1 flex-1 mr-2">
                              {property.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`text-xs flex-shrink-0 ${
                                property.type === 'RENT'
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-green-600 text-white border-green-600'
                              }`}
                            >
                              {property.type === 'RENT' ? 'Alquiler' : 'Venta'}
                            </Badge>
                          </div>

                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="text-xs line-clamp-1">
                              {property.address}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="mr-3">
                            <p className="text-lg font-bold text-[#600096]">
                              ${property.price.toLocaleString()}
                            </p>
                          </div>
                          {property.description && (
                            <div className="flex-1">
                              <p className="text-gray-600 text-xs line-clamp-2">
                                {property.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            )}
          </div>
        )}

        {properties && properties.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron propiedades
            </h3>
            <p className="text-gray-600">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page =
                  Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (page > totalPages) return null;

                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'bg-[#600096] text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
