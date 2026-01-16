'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, FileText, ArrowUpDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import clientAxios from '@/utils/clientAxios';
import { ModernTable } from '@/components/ui/modern-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DeliveryGroup {
  id: string;
  deliveryDate: string;
  deliveryMethod: string;
  payments: any[];
  totalAmount: number;
  property: any;
  landlord: any;
}

export default function DeliveriesHistoryPage() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  const { data: deliveries, isLoading } = useQuery<DeliveryGroup[]>({
    queryKey: ['all-deliveries'],
    queryFn: async () => {
      const { data } = await clientAxios.get('/payments');
      const delivered = data.filter((p: any) => p.delivered);

      const grouped = delivered.reduce((acc: any, payment: any) => {
        const key = `${payment.deliveryDate}-${payment.rentalId}`;
        if (!acc[key]) {
          acc[key] = {
            id: key,
            deliveryDate: payment.deliveryDate,
            deliveryMethod: payment.deliveryMethod,
            payments: [],
            totalAmount: 0,
            property: payment.rental.property,
            landlord: payment.rental.landlord,
          };
        }
        acc[key].payments.push(payment);
        acc[key].totalAmount += payment.amount;
        return acc;
      }, {});

      return Object.values(grouped) as DeliveryGroup[];
    },
  });

  const filteredAndSortedData = useMemo(() => {
    if (!deliveries) return [];

    let filtered = deliveries;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (delivery: any) =>
          delivery.property.name.toLowerCase().includes(searchLower) ||
          delivery.property.address.toLowerCase().includes(searchLower) ||
          delivery.landlord.name.toLowerCase().includes(searchLower)
      );
    }

    const sorted = [...filtered].sort((a: any, b: any) => {
      switch (sortBy) {
        case 'date-desc':
          return (
            new Date(b.deliveryDate).getTime() -
            new Date(a.deliveryDate).getTime()
          );
        case 'date-asc':
          return (
            new Date(a.deliveryDate).getTime() -
            new Date(b.deliveryDate).getTime()
          );
        case 'property':
          return a.property.name.localeCompare(b.property.name);
        case 'landlord':
          return a.landlord.name.localeCompare(b.landlord.name);
        default:
          return 0;
      }
    });

    return sorted;
  }, [deliveries, search, sortBy]);

  const handleViewReceipt = (payments: any[]) => {
    const paymentIds = payments.map((p) => p.id);
    fetch('/api/payments/delivery-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentIds }),
    })
      .then((res) => res.text())
      .then((html) => {
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(html);
          newWindow.document.close();
        }
      });
  };

  const columns = [
    {
      key: 'date',
      label: 'Fecha de Entrega',
      width: '15%',
      render: (delivery: DeliveryGroup) => (
        <span className="font-semibold text-gray-900">
          {new Date(delivery.deliveryDate).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'property',
      label: 'Propiedad',
      width: '25%',
      render: (delivery: DeliveryGroup) => (
        <div>
          <p className="font-medium text-gray-900">{delivery.property.name}</p>
          <p className="text-sm text-gray-500">{delivery.property.address}</p>
        </div>
      ),
    },
    {
      key: 'landlord',
      label: 'Propietario',
      width: '15%',
      hideOnMobile: true,
      render: (delivery: DeliveryGroup) => (
        <span className="text-gray-900">{delivery.landlord.name}</span>
      ),
    },
    {
      key: 'method',
      label: 'Método',
      width: '12%',
      render: (delivery: DeliveryGroup) => (
        <span className="text-gray-900">
          {delivery.deliveryMethod === 'efectivo'
            ? 'Efectivo'
            : 'Transferencia'}
        </span>
      ),
    },
    {
      key: 'periods',
      label: 'Períodos',
      width: '18%',
      render: (delivery: DeliveryGroup) => (
        <div className="flex flex-wrap gap-1">
          {delivery.payments.slice(0, 3).map((payment: any) => {
            const [year, month] = payment.periodMonth.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1);
            return (
              <span
                key={payment.id}
                className="bg-gray-100 px-2 py-1 rounded text-xs"
              >
                {date.toLocaleDateString('es-ES', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            );
          })}
          {delivery.payments.length > 3 && (
            <span className="text-xs text-gray-500">
              +{delivery.payments.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Total',
      width: '10%',
      render: (delivery: DeliveryGroup) => (
        <span className="font-bold text-[#600096]">
          ${delivery.totalAmount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      width: '5%',
      render: (delivery: DeliveryGroup) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleViewReceipt(delivery.payments)}
          className="h-8"
        >
          <FileText className="h-4 w-4 mr-1" />
          Ver
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          💰 Historial de Entregas
        </h1>
        <p className="text-gray-600 mt-1">
          Todas las entregas realizadas a propietarios
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por propiedad o propietario..."
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

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[220px]">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Fecha (más reciente)</SelectItem>
            <SelectItem value="date-asc">Fecha (más antigua)</SelectItem>
            <SelectItem value="property">Propiedad (A-Z)</SelectItem>
            <SelectItem value="landlord">Propietario (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ModernTable
        data={filteredAndSortedData}
        columns={columns}
        isLoading={isLoading}
        emptyMessage={
          search
            ? 'No se encontraron entregas con los filtros aplicados'
            : 'No hay entregas registradas'
        }
      />
    </div>
  );
}
