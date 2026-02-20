'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Home, Search, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clientAxios from '@/utils/clientAxios';
import { Rental } from '@/generated/prisma';
import { ModernTable } from '@/components/ui/modern-table';
import { RentalModal } from './components/rental-modal';
import { RentalViewModal } from './components/rental-view-modal';
import { UpdatePriceModal } from './components/update-price-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Receipt,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { cn } from '@/lib/shadcn/utils';
import { Badge } from '@/components/ui/badge';

import { PaymentModal } from './components/payment-modal';
import { NotificationsModal } from './components/notifications-modal';
import { PaymentHistoryModal } from './components/payment-history-modal';
import { DeliveryModal } from './components/delivery-modal';
import { DeliveryHistoryModal } from './components/delivery-history-modal';

type RentalWithRelations = Rental & {
  property: { name: string; address: string };
  tenant: { name: string; phone: string };
  landlord: { name: string };
  guarantors: Array<{ client: { name: string } }>;
  pricePeriods: Array<{
    id: string;
    startMonth: number;
    endMonth: number;
    price: number | null;
  }>;
  warnings?: { contractExpiring?: string; priceUpdate?: string };
};

export default function RentalsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [updatePriceModalOpen, setUpdatePriceModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [paymentHistoryModalOpen, setPaymentHistoryModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [deliveryHistoryModalOpen, setDeliveryHistoryModalOpen] =
    useState(false);
  const [selectedRental, setSelectedRental] = useState<any>();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['rentals', page],
    queryFn: async () => {
      const { data } = await clientAxios.get(`/rentals?page=${page}&limit=10`);
      return data;
    },
    retry: false,
  });

  const data = response?.data || [];
  const totalPages = response?.totalPages || 1;

  const filteredData =
    search && data.length > 0
      ? data.filter((rental: RentalWithRelations) => {
          const matchesSearch =
            rental.property.name.toLowerCase().includes(search.toLowerCase()) ||
            rental.property.address
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            rental.tenant.name.toLowerCase().includes(search.toLowerCase());
          return matchesSearch;
        })
      : data;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientAxios.delete(`/rentals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      toast.success('Alquiler eliminado exitosamente');
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.error || 'Error al eliminar el alquiler';
      toast.error(errorMessage);
    },
  });

  const handleEdit = (rental: RentalWithRelations) => {
    setSelectedRental(rental);
    setModalOpen(true);
  };

  const handleView = (rental: RentalWithRelations) => {
    setSelectedRental(rental);
    setViewModalOpen(true);
  };

  const handlePayment = async (rental: RentalWithRelations) => {
    const { data: rentalsData } = await clientAxios.get(
      `/rentals?page=${page}&limit=10`
    );
    const updatedRental = rentalsData.data.find((r: any) => r.id === rental.id);
    setSelectedRental(updatedRental || rental);
    setPaymentModalOpen(true);
  };

  const handleDelivery = (rental: RentalWithRelations) => {
    setSelectedRental(rental);
    setDeliveryModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedRental(undefined);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRental(undefined);
  };

  const getCurrentPrice = (rental: RentalWithRelations) => {
    const now = new Date();
    const startDate = new Date(rental.startDate);
    const monthsSinceStart =
      (now.getFullYear() - startDate.getFullYear()) * 12 +
      (now.getMonth() - startDate.getMonth());
    const currentContractMonth = monthsSinceStart + 1;

    const currentPeriod = rental.pricePeriods.find(
      (p) =>
        p.startMonth <= currentContractMonth &&
        p.endMonth >= currentContractMonth
    );

    return currentPeriod?.price || rental.rentalPrice;
  };

  const columns = [
    {
      key: 'property',
      label: 'Propiedad',
      width: '40%',
      render: (rental: RentalWithRelations) => (
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5 text-[#600096]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 truncate">
                {rental.property.name}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {rental.property.address}
              </p>
            </div>
          </div>
          {rental.warnings && (
            <div className="space-y-1">
              {rental.warnings.contractExpiring && (
                <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  ⚠️ {rental.warnings.contractExpiring}
                </div>
              )}
              {rental.warnings.priceUpdate && (
                <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  💰 {rental.warnings.priceUpdate}
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'tenant',
      label: 'Inquilino',
      width: '15%',
      hideOnMobile: true,
      render: (rental: RentalWithRelations) => (
        <span className="text-gray-900">{rental.tenant.name}</span>
      ),
    },
    {
      key: 'rentalPrice',
      label: 'Precio Actual',
      width: '10%',
      hideOnMobile: true,
      render: (rental: RentalWithRelations) => {
        const currentPrice = getCurrentPrice(rental);
        return (
          <span className="font-semibold text-gray-900">
            ${currentPrice.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: 'paymentStatus',
      label: 'Estado de Pago',
      width: '10%',
      render: (rental: RentalWithRelations) => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const currentPeriodMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

        const isPaid = (rental as any).payments?.some(
          (p: any) => p.periodMonth === currentPeriodMonth
        );

        const dueDay = rental.paymentDueDay;
        const currentDay = today.getDate();
        const isLate = currentDay > dueDay && !isPaid;

        return (
          <Badge
            variant="outline"
            className={
              isPaid
                ? 'bg-green-50 text-green-700 border-green-200'
                : isLate
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }
          >
            {isPaid ? 'Pagado' : isLate ? 'Atrasado' : 'Pendiente'}
          </Badge>
        );
      },
    },
    {
      key: 'dates',
      label: 'Vigencia',
      width: '17%',
      hideOnMobile: true,
      render: (rental: RentalWithRelations) => (
        <span className="text-sm text-gray-600">
          {new Date(rental.startDate).toLocaleDateString()} -{' '}
          {new Date(rental.endDate).toLocaleDateString()}
        </span>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              🏠 Alquileres
            </h1>
            <p className="text-gray-600 mt-1">
              Gestión de contratos de alquiler
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-[#600096] hover:bg-[#500080] text-white shadow-lg hover:shadow-xl transition-all h-11"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Alquiler
          </Button>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            No hay alquileres registrados aún. Crea el primero usando el botón
            "Nuevo Alquiler".
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            🏠 Alquileres
          </h1>
          <p className="text-gray-600 mt-1">Gestión de contratos de alquiler</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setNotificationsModalOpen(true)}
            variant="outline"
            className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 h-11"
          >
            Notificaciones (
            {
              data.filter((r: any) => {
                if (!r.warnings) return false;
                const hasUnnotifiedContractExpiring =
                  r.warnings.contractExpiring &&
                  !r.notifications?.some(
                    (n: any) => n.type === 'CONTRACT_EXPIRING' && n.notified
                  );
                const hasUnnotifiedPriceUpdate =
                  r.warnings.priceUpdate &&
                  !r.notifications?.some(
                    (n: any) => n.type === 'PRICE_UPDATE' && n.notified
                  );
                return (
                  hasUnnotifiedContractExpiring || hasUnnotifiedPriceUpdate
                );
              }).length
            }
            )
          </Button>
          <Button
            onClick={handleCreate}
            className="bg-[#600096] hover:bg-[#500080] text-white shadow-lg hover:shadow-xl transition-all h-11"
          >
            <Plus className="mr-2 h-4 w-4 text-white" />
            Nuevo Alquiler
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por propiedad o inquilino..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 border-gray-300 focus:border-[#600096] focus:ring-[#600096]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <ModernTable
        data={filteredData}
        columns={columns}
        isLoading={isLoading}
        emptyMessage={
          search
            ? 'No se encontraron alquileres con los filtros aplicados'
            : 'No hay alquileres registrados'
        }
        getRowClassName={(rental) => {
          const hasExpiring = rental.warnings?.contractExpiring;
          const hasPriceUpdate = rental.warnings?.priceUpdate;
          return hasExpiring
            ? 'border-2 border-red-500'
            : hasPriceUpdate
              ? 'border-2 border-blue-500'
              : 'border border-gray-200';
        }}
        actions={(rental) => (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handlePayment(rental)}
              className="bg-green-600 hover:bg-green-700 text-white h-7 px-2 text-xs"
            >
              Asentar Pago
            </Button>
            <Button
              size="sm"
              onClick={() => handleDelivery(rental)}
              className="bg-blue-600 hover:bg-blue-700 text-white h-7 px-2 text-xs"
            >
              Asentar Entrega
            </Button>
          </div>
        )}
        extras={(rental) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white">
              <DropdownMenuItem
                onClick={() => handleView(rental)}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedRental(rental);
                  setPaymentHistoryModalOpen(true);
                }}
                className="cursor-pointer"
              >
                <Receipt className="mr-2 h-4 w-4" />
                Historial de Pagos
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedRental(rental);
                  setDeliveryHistoryModalOpen(true);
                }}
                className="cursor-pointer"
              >
                <Receipt className="mr-2 h-4 w-4" />
                Historial de Entregas
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedRental(rental);
                  setUpdatePriceModalOpen(true);
                }}
                className="cursor-pointer"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Actualizar Precio
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEdit(rental)}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteMutation.mutate(rental.id)}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

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

      <RentalModal
        open={modalOpen}
        onOpenChange={handleCloseModal}
        rental={selectedRental}
      />

      <RentalViewModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        rental={selectedRental}
      />

      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        rental={selectedRental}
      />

      {selectedRental && (
        <UpdatePriceModal
          open={updatePriceModalOpen}
          onOpenChange={setUpdatePriceModalOpen}
          rentalId={selectedRental.id}
          periods={selectedRental.pricePeriods}
          startDate={new Date(selectedRental.startDate)}
        />
      )}

      <NotificationsModal
        open={notificationsModalOpen}
        onOpenChange={setNotificationsModalOpen}
        rentals={data}
        onOpenUpdatePrice={(rental) => {
          setSelectedRental(rental);
          setUpdatePriceModalOpen(true);
        }}
      />

      {selectedRental && (
        <PaymentHistoryModal
          open={paymentHistoryModalOpen}
          onOpenChange={setPaymentHistoryModalOpen}
          rentalId={selectedRental.id}
          propertyName={selectedRental.property.name}
        />
      )}

      {selectedRental && (
        <DeliveryModal
          open={deliveryModalOpen}
          onOpenChange={setDeliveryModalOpen}
          rentalId={selectedRental.id}
          propertyName={selectedRental.property.name}
        />
      )}

      {selectedRental && (
        <DeliveryHistoryModal
          open={deliveryHistoryModalOpen}
          onOpenChange={setDeliveryHistoryModalOpen}
          rentalId={selectedRental.id}
          propertyName={selectedRental.property.name}
        />
      )}
    </div>
  );
}
