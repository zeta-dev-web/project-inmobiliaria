'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Building2, Search, X, Filter } from 'lucide-react';
import { PropertyModal } from './components/property-modal';
import { PropertyViewModal } from './components/property-view-modal';
import { useQuery } from '@tanstack/react-query';
import clientAxios from '@/utils/clientAxios';
import { Property } from '@/generated/prisma';
import { ModernTable } from '@/components/ui/modern-table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { cn } from '@/lib/shadcn/utils';

async function getProperties(): Promise<Property[]> {
  const { data } = await clientAxios.get('/properties');
  return data.data || data;
}

export default function PropertiesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<
    Property | undefined
  >();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['properties', page, search, statusFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
      });
      const { data } = await clientAxios.get(
        `/properties?${params.toString()}`
      );
      return data;
    },
  });

  const data = response?.data || [];
  const totalPages = response?.totalPages || 1;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientAxios.delete(`/properties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Propiedad eliminada exitosamente');
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.error || 'Error al eliminar la propiedad';
      toast.error(errorMessage);
    },
  });

  const handleEdit = (property: Property) => {
    // Cargar la propiedad completa con fotos
    clientAxios.get(`/properties/${property.id}`).then(({ data }) => {
      setSelectedProperty(data);
      setModalOpen(true);
    });
  };

  const handleView = async (property: Property) => {
    const { data } = await clientAxios.get(`/properties/${property.id}`);
    setSelectedProperty(data);
    setViewModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedProperty(undefined);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProperty(undefined);
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
    setPage(1);
  };

  const hasActiveFilters = search || statusFilter || typeFilter;

  const columns = [
    {
      key: 'name',
      label: 'Propiedad',
      width: '35%',
      render: (property: Property) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-[#600096]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 truncate">
              {property.name}
            </p>
            <p className="text-sm text-gray-500 truncate">{property.address}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Tipo',
      width: '15%',
      render: (property: Property) => (
        <Badge
          variant="outline"
          className={cn(
            'whitespace-nowrap',
            property.type === 'RENT'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-green-50 text-green-700 border-green-200'
          )}
        >
          {property.type === 'RENT' ? '🏠 Alquiler' : '💰 Venta'}
        </Badge>
      ),
    },
    {
      key: 'price',
      label: 'Precio',
      width: '15%',
      className: 'hidden md:table-cell',
      render: (property: Property) => (
        <span className="font-semibold text-gray-900 whitespace-nowrap">
          ${property.price.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      width: '18%',
      className: 'hidden md:table-cell',
      render: (property: Property) => {
        const statusConfig = {
          AVAILABLE: {
            label: 'Disponible',
            className: 'bg-green-100 text-green-800 border-green-200',
          },
          RENTED: {
            label: 'Alquilada',
            className: 'bg-blue-100 text-blue-800 border-blue-200',
          },
          SOLD: {
            label: 'Vendida',
            className: 'bg-purple-100 text-purple-800 border-purple-200',
          },
          UNAVAILABLE: {
            label: 'No Disponible',
            className: 'bg-red-100 text-red-800 border-red-200',
          },
        };
        const config =
          statusConfig[property.status as keyof typeof statusConfig] ||
          statusConfig.AVAILABLE;
        return (
          <Badge
            variant="outline"
            className={cn('whitespace-nowrap', config.className)}
          >
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'lastEditedBy',
      label: 'Editado',
      width: '17%',
      className: 'hidden md:table-cell',
      render: (property: any) => (
        <span className="text-sm text-gray-600">
          {property.lastEditedBy?.name || 'N/A'}
        </span>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error al cargar las propiedades</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            🏢 Propiedades
          </h1>
          <p className="text-gray-600 mt-1">
            Gestión de propiedades en alquiler y venta
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-[#600096] hover:bg-[#500080] text-white shadow-lg hover:shadow-xl transition-all h-11"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Propiedad
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o dirección..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 border-gray-300 focus:border-[#600096] focus:ring-[#600096]"
            />
          </div>

          {/* Filtro por estado */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-11 min-w-[160px] justify-between bg-white hover:bg-gray-50 border-gray-300',
                  statusFilter &&
                    'border-[#600096] bg-purple-50 hover:bg-purple-100'
                )}
              >
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {statusFilter
                    ? statusFilter === 'AVAILABLE'
                      ? 'Disponible'
                      : statusFilter === 'RENTED'
                        ? 'Alquilada'
                        : statusFilter === 'SOLD'
                          ? 'Vendida'
                          : 'No Disponible'
                    : 'Estado'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white">
              <DropdownMenuItem
                onClick={() => setStatusFilter('')}
                className="cursor-pointer"
              >
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter('AVAILABLE')}
                className="cursor-pointer"
              >
                ✅ Disponible
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter('RENTED')}
                className="cursor-pointer"
              >
                🔒 Alquilada
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter('SOLD')}
                className="cursor-pointer"
              >
                💰 Vendida
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter('UNAVAILABLE')}
                className="cursor-pointer"
              >
                ❌ No Disponible
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtro por tipo */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-11 min-w-[160px] justify-between bg-white hover:bg-gray-50 border-gray-300',
                  typeFilter &&
                    'border-[#600096] bg-purple-50 hover:bg-purple-100'
                )}
              >
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {typeFilter
                    ? typeFilter === 'RENT'
                      ? 'Alquiler'
                      : 'Venta'
                    : 'Tipo'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white">
              <DropdownMenuItem
                onClick={() => setTypeFilter('')}
                className="cursor-pointer"
              >
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTypeFilter('RENT')}
                className="cursor-pointer"
              >
                🏠 Alquiler
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTypeFilter('SALE')}
                className="cursor-pointer"
              >
                💰 Venta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Botón limpiar filtros */}
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              className="h-11 px-4 bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg transition-all"
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          )}
        </div>

        {/* Indicadores de filtros activos */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {search && (
              <Badge
                variant="outline"
                className="bg-purple-50 text-purple-700 border-purple-200"
              >
                Búsqueda: {search}
                <button
                  onClick={() => setSearch('')}
                  className="ml-2 hover:text-purple-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {statusFilter && (
              <Badge
                variant="outline"
                className="bg-purple-50 text-purple-700 border-purple-200"
              >
                Estado:{' '}
                {statusFilter === 'AVAILABLE'
                  ? 'Disponible'
                  : statusFilter === 'RENTED'
                    ? 'Alquilada'
                    : statusFilter === 'SOLD'
                      ? 'Vendida'
                      : 'No Disponible'}
                <button
                  onClick={() => setStatusFilter('')}
                  className="ml-2 hover:text-purple-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {typeFilter && (
              <Badge
                variant="outline"
                className="bg-purple-50 text-purple-700 border-purple-200"
              >
                Tipo: {typeFilter === 'RENT' ? 'Alquiler' : 'Venta'}
                <button
                  onClick={() => setTypeFilter('')}
                  className="ml-2 hover:text-purple-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error al cargar las propiedades</p>
        </div>
      )}

      <ModernTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        emptyMessage={
          hasActiveFilters
            ? 'No se encontraron propiedades con los filtros aplicados'
            : 'No hay propiedades registradas'
        }
        actions={(property) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white">
              <DropdownMenuItem
                onClick={() => handleView(property)}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEdit(property)}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteMutation.mutate(property.id)}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
            className="h-10 px-4 bg-white hover:bg-gray-50 border-gray-300 disabled:opacity-50"
          >
            Anterior
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                onClick={() => setPage(p)}
                variant={page === p ? 'default' : 'outline'}
                className={cn(
                  'h-10 w-10',
                  page === p
                    ? 'bg-[#600096] hover:bg-[#500080] text-white'
                    : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700'
                )}
              >
                {p}
              </Button>
            ))}
          </div>
          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="outline"
            className="h-10 px-4 bg-white hover:bg-gray-50 border-gray-300 disabled:opacity-50"
          >
            Siguiente
          </Button>
        </div>
      )}

      <PropertyModal
        open={modalOpen}
        onOpenChange={handleCloseModal}
        property={selectedProperty}
      />

      <PropertyViewModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        property={selectedProperty}
      />
    </div>
  );
}
