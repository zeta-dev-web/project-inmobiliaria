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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Período
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Monto
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">
                    Entregado
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: any) => (
                  <tr
                    key={payment.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-gray-900">
                      {formatPeriod(payment.periodMonth)}
                    </td>
                    <td className="py-3 px-4 text-gray-900 font-semibold">
                      ${payment.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={
                          payment.delivered
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }
                      >
                        {payment.delivered ? 'Sí' : 'No'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(
                            `/api/payments/${payment.id}/receipt`,
                            '_blank'
                          )
                        }
                        className="h-8"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Ver Recibo
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
