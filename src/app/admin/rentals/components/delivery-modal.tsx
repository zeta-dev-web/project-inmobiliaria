'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import clientAxios from '@/utils/clientAxios';
import { toast } from 'react-toastify';

interface DeliveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rentalId: string;
  propertyName: string;
}

export function DeliveryModal({
  open,
  onOpenChange,
  rentalId,
  propertyName,
}: DeliveryModalProps) {
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<string>('efectivo');
  const queryClient = useQueryClient();

  const { data: pendingPayments, isLoading } = useQuery({
    queryKey: ['pending-deliveries', rentalId],
    queryFn: async () => {
      const { data } = await clientAxios.get(`/payments?rentalId=${rentalId}`);
      return data
        .filter((p: any) => !p.delivered)
        .sort((a: any, b: any) => a.periodMonth.localeCompare(b.periodMonth));
    },
    enabled: open,
  });

  const deliveryMutation = useMutation({
    mutationFn: async () => {
      await clientAxios.post('/payments/deliver', {
        paymentIds: selectedPayments,
        deliveryMethod,
      });
    },
    onSuccess: async () => {
      toast.success('Entrega registrada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['pending-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });

      const response = await fetch('/api/payments/delivery-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIds: selectedPayments }),
      });

      const html = await response.text();
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(html);
        newWindow.document.close();
      }

      setSelectedPayments([]);
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Error al registrar la entrega');
    },
  });

  const formatPeriod = (periodMonth: string) => {
    const [year, month] = periodMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const handleTogglePayment = (paymentId: string) => {
    setSelectedPayments((prev) =>
      prev.includes(paymentId)
        ? prev.filter((id) => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const totalAmount =
    pendingPayments
      ?.filter((p: any) => selectedPayments.includes(p.id))
      .reduce((sum: number, p: any) => sum + p.amount, 0) || 0;

  const handleSubmit = () => {
    if (selectedPayments.length === 0) {
      toast.error('Debe seleccionar al menos un pago');
      return;
    }
    deliveryMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Entregar Dinero - {propertyName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Cargando...</div>
        ) : !pendingPayments || pendingPayments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay pagos pendientes de entrega
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-semibold text-gray-900 mb-3 block">
                Seleccione los meses a entregar:
              </Label>
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                {pendingPayments.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedPayments.includes(payment.id)}
                        onCheckedChange={() => handleTogglePayment(payment.id)}
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatPeriod(payment.periodMonth)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${payment.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedPayments.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Total a entregar:
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    ${totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm font-semibold text-gray-900 mb-3 block">
                Forma de entrega:
              </Label>
              <RadioGroup
                value={deliveryMethod}
                onValueChange={setDeliveryMethod}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="efectivo" id="efectivo" />
                  <Label htmlFor="efectivo" className="cursor-pointer">
                    Efectivo
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="transferencia" id="transferencia" />
                  <Label htmlFor="transferencia" className="cursor-pointer">
                    Transferencia
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  selectedPayments.length === 0 || deliveryMutation.isPending
                }
                className="bg-[#600096] hover:bg-[#500080]"
              >
                Asentar Entrega
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
