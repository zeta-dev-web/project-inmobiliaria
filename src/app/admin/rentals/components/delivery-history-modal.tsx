'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import clientAxios from '@/utils/clientAxios';

interface DeliveryHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rentalId: string;
  propertyName: string;
}

interface DeliveryGroup {
  deliveryDate: string;
  deliveryMethod: string;
  payments: any[];
  totalAmount: number;
}

export function DeliveryHistoryModal({
  open,
  onOpenChange,
  rentalId,
  propertyName,
}: DeliveryHistoryModalProps) {
  const { data: deliveries, isLoading } = useQuery<DeliveryGroup[]>({
    queryKey: ['delivery-history', rentalId],
    queryFn: async () => {
      const { data } = await clientAxios.get(`/payments?rentalId=${rentalId}`);
      const delivered = data.filter((p: any) => p.delivered);

      const grouped = delivered.reduce((acc: any, payment: any) => {
        const key = `${payment.deliveryDate}-${payment.deliveryMethod}`;
        if (!acc[key]) {
          acc[key] = {
            deliveryDate: payment.deliveryDate,
            deliveryMethod: payment.deliveryMethod,
            payments: [],
            totalAmount: 0,
          };
        }
        acc[key].payments.push(payment);
        acc[key].totalAmount += payment.amount;
        return acc;
      }, {});

      return Object.values(grouped).sort(
        (a: any, b: any) =>
          new Date(b.deliveryDate).getTime() -
          new Date(a.deliveryDate).getTime()
      ) as DeliveryGroup[];
    },
    enabled: open,
  });

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Historial de Entregas - {propertyName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Cargando...</div>
        ) : !deliveries || deliveries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay entregas registradas
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery: DeliveryGroup, index: number) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {new Date(delivery.deliveryDate).toLocaleDateString(
                        'es-ES',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Método:{' '}
                      {delivery.deliveryMethod === 'efectivo'
                        ? 'Efectivo'
                        : 'Transferencia'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#600096]">
                      ${delivery.totalAmount.toLocaleString()}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewReceipt(delivery.payments)}
                      className="mt-2 h-8"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Ver Comprobante
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-medium mb-1">Períodos entregados:</div>
                  <div className="flex flex-wrap gap-2">
                    {delivery.payments.map((payment: any) => {
                      const [year, month] = payment.periodMonth.split('-');
                      const date = new Date(
                        parseInt(year),
                        parseInt(month) - 1
                      );
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
