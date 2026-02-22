'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import clientAxios from '@/utils/clientAxios';

interface PaymentHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rentalId: string;
  propertyName: string;
}

export function PaymentHistoryModal({
  open,
  onOpenChange,
  rentalId,
  propertyName,
}: PaymentHistoryModalProps) {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['payment-history', rentalId],
    queryFn: async () => {
      const { data } = await clientAxios.get(`/payments?rentalId=${rentalId}`);
      return data.sort((a: any, b: any) =>
        b.periodMonth.localeCompare(a.periodMonth)
      );
    },
    enabled: open,
  });

  const formatPeriod = (periodMonth: string) => {
    const [year, month] = periodMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Historial de Pagos - {propertyName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Cargando...</div>
        ) : !payments || payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay pagos registrados
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment: any) => (
              <div
                key={payment.id}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {formatPeriod(payment.periodMonth)}
                    </div>
                    <div className="text-lg font-bold text-[#600096] mt-1">
                      ${payment.amount.toLocaleString()}
                    </div>
                    <div className="mt-2">
                      <Badge
                        variant="outline"
                        className={
                          payment.delivered
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }
                      >
                        {payment.delivered
                          ? 'Entregado'
                          : 'Pendiente de entrega'}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open(
                        `/api/payments/${payment.id}/receipt`,
                        '_blank'
                      )
                    }
                    className="h-8 w-full sm:w-auto"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Ver Recibo
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
