'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Receipt } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import clientAxios from '@/utils/clientAxios';
import { ModernTable } from '@/components/ui/modern-table';
import { GeneralReceiptModal } from './components/general-receipt-modal';
import { cn } from '@/lib/shadcn/utils';

export default function GeneralReceiptsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data: response, isLoading } = useQuery({
    queryKey: ['general-receipts', page],
    queryFn: async () => {
      const { data } = await clientAxios.get(`/general-receipts?page=${page}&limit=10`);
      return data;
    },
  });

  const data = response?.data || [];
  const totalPages = response?.totalPages || 1;

  const columns = [
    {
      key: 'receiptNumber',
      label: 'N° Recibo',
      render: (receipt: any) => (
        <span className="font-semibold text-[#600096]">{receipt.receiptNumber}</span>
      ),
    },
    {
      key: 'receiptDate',
      label: 'Fecha',
      render: (receipt: any) => new Date(receipt.receiptDate).toLocaleDateString('es-AR'),
    },
    {
      key: 'reason',
      label: 'Concepto',
      render: (receipt: any) => (
        <span className="text-gray-900">{receipt.reason}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Monto',
      render: (receipt: any) => (
        <span className="font-semibold text-green-600">
          ${receipt.amount.toLocaleString('es-AR')}
        </span>
      ),
    },
    {
      key: 'signedBy',
      label: 'Firmado por',
      render: (receipt: any) => receipt.signedBy.name,
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            📄 Recibos Generales
          </h1>
          <p className="text-gray-600 mt-1">
            Gestión de recibos generales del sistema
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-[#600096] hover:bg-[#500080] text-white shadow-lg hover:shadow-xl transition-all h-11"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Recibo
        </Button>
      </div>

      <ModernTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No hay recibos registrados"
        actions={(receipt) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/api/general-receipts/${receipt.id}`, '_blank')}
          >
            <Receipt className="h-4 w-4" />
          </Button>
        )}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
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
                    : 'bg-white hover:bg-gray-50'
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
          >
            Siguiente
          </Button>
        </div>
      )}

      <GeneralReceiptModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
