'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import clientAxios from '@/utils/clientAxios';
import { useSession } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import {
  Plus,
  X,
  DollarSign,
  Calendar,
  FileText,
  MessageCircle,
  Receipt,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type PaymentItem = {
  description: string;
  amount: number;
};

type PaymentFormData = {
  amount: number;
  paymentDate: Date;
  periodMonth: string;
  notes?: string;
  signedById: number;
};

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rental: any;
}

export function PaymentModal({
  open,
  onOpenChange,
  rental,
}: PaymentModalProps) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [items, setItems] = useState<PaymentItem[]>([]);
  const [newItem, setNewItem] = useState({ description: '', amount: 0 });
  const [applyLateFee, setApplyLateFee] = useState(false);
  const [calculatedLateFee, setCalculatedLateFee] = useState(0);

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<PaymentFormData>({
      defaultValues: {
        amount: 0,
      },
    });

  const [currentPeriodPrice, setCurrentPeriodPrice] = useState(0);

  useEffect(() => {
    if (rental && open) {
      const now = new Date();
      const startDate = new Date(rental.startDate);
      const monthsSinceStart =
        (now.getFullYear() - startDate.getFullYear()) * 12 +
        (now.getMonth() - startDate.getMonth());
      const currentContractMonth = monthsSinceStart + 1;

      const currentPeriod = rental.pricePeriods?.find(
        (p: any) =>
          p.startMonth <= currentContractMonth &&
          p.endMonth >= currentContractMonth
      );

      const currentPrice = currentPeriod?.price || rental.rentalPrice;
      setCurrentPeriodPrice(currentPrice);
      setValue('amount', currentPrice);
    }
  }, [rental, open, setValue]);

  const isLastMonth = () => {
    if (!rental || !watch('periodMonth')) return false;
    const endDate = new Date(rental.endDate);
    const [year, month] = watch('periodMonth').split('-');
    return (
      endDate.getFullYear() === parseInt(year) &&
      endDate.getMonth() === parseInt(month) - 1
    );
  };

  useEffect(() => {
    const subscription = watch((value) => {
      const paymentDate = value.paymentDate;
      const periodMonth = value.periodMonth;

      if (
        paymentDate &&
        periodMonth &&
        rental?.lateFee &&
        rental?.paymentDueDay
      ) {
        const paymentDateObj = new Date(paymentDate);
        const [year, month] = periodMonth.split('-');
        const dueDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          rental.paymentDueDay
        );

        if (paymentDateObj > dueDate) {
          const firstDayOfMonth = new Date(
            parseInt(year),
            parseInt(month) - 1,
            1
          );
          const daysDiff =
            Math.floor(
              (paymentDateObj.getTime() - firstDayOfMonth.getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1;
          const lateFee = rental.lateFee * daysDiff;
          setCalculatedLateFee(lateFee);
        } else {
          setCalculatedLateFee(0);
          setApplyLateFee(false);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, rental]);

  useEffect(() => {
    if (rental && open) {
      const baseAmount = watch('amount') || 0;
      const itemsTotal = items.reduce((sum, i) => sum + i.amount, 0);
      const lateFeeAmount = applyLateFee ? calculatedLateFee : 0;

      setValue('amount', currentPeriodPrice + itemsTotal + lateFeeAmount);
    }
  }, [
    applyLateFee,
    calculatedLateFee,
    items,
    rental,
    open,
    setValue,
    currentPeriodPrice,
    watch,
  ]);

  const [showPrintOption, setShowPrintOption] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const createPayment = useMutation({
    mutationFn: (data: PaymentFormData & { items: PaymentItem[] }) =>
      clientAxios.post(`/payments`, { ...data, rentalId: rental.id }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      setPaymentId(response.data.payment.id);
      setShowConfirmation(false);
      setShowPrintOption(true);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al registrar el pago');
    },
  });

  const addItem = () => {
    if (newItem.description && newItem.amount > 0) {
      setItems([...items, newItem]);
      setNewItem({ description: '', amount: 0 });
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const onSubmit = (data: PaymentFormData) => {
    if (!data.periodMonth) {
      toast.error('Debe seleccionar el mes correspondiente');
      return;
    }
    if (!data.amount || data.amount <= 0) {
      toast.error('El monto del alquiler debe ser mayor a 0');
      return;
    }
    if (!session?.user?.id) {
      toast.error('No se pudo obtener el usuario actual');
      return;
    }
    setShowConfirmation(true);
  };

  const confirmPayment = () => {
    const data = watch();
    const finalItems = [...items];
    if (applyLateFee && calculatedLateFee > 0) {
      finalItems.push({ description: 'Mora', amount: calculatedLateFee });
    }
    createPayment.mutate({
      ...data,
      items: finalItems,
      signedById: parseInt(session?.user?.id || '0'),
    });
  };

  const handleClose = () => {
    reset();
    setItems([]);
    setNewItem({ description: '', amount: 0 });
    setShowPrintOption(false);
    setShowConfirmation(false);
    setPaymentId(null);
    onOpenChange(false);
  };

  const handlePrint = () => {
    if (paymentId) {
      window.open(`/api/payments/${paymentId}/receipt`, '_blank');
    }
    toast.success('Pago asentado exitosamente');
    handleClose();
  };

  const handleWhatsApp = () => {
    if (paymentId && rental?.tenants?.[0]?.client?.phone) {
      const phone = rental.tenants[0].client.phone.replace(/\D/g, '');
      const formattedPhone = phone.startsWith('54') ? phone : `54${phone}`;
      const receiptUrl = `${window.location.origin}/api/payments/${paymentId}/receipt`;
      const message = `Hola, adjunto el recibo de pago de alquiler. Puede descargarlo desde: ${receiptUrl}`;
      const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
    toast.success('Pago asentado exitosamente');
    handleClose();
  };

  if (!rental) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="h-6 w-6 text-[#600096]" />
            Asentar Pago
          </DialogTitle>
        </DialogHeader>

        {showConfirmation ? (
          <div className="space-y-6">
            {isLastMonth() && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-800">
                <p className="font-semibold mb-1">⚠️ Último Mes de Contrato</p>
                <p className="text-sm">
                  Recordar notificar al inquilino que debe entregar la llave el
                  día 01 del mes siguiente al vencimiento.
                </p>
              </div>
            )}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Confirmar Asiento de Pago
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Propiedad:</span>
                  <span className="font-medium">{rental.property.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Inquilino:</span>
                  <span className="font-medium">
                    {rental.tenants && rental.tenants.length > 0
                      ? rental.tenants.map((t: any) => t.client.name).join(', ')
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mes Correspondiente:</span>
                  <span className="font-medium">
                    {new Date(watch('periodMonth') + '-01').toLocaleDateString(
                      'es-ES',
                      { year: 'numeric', month: 'long' }
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha de Pago:</span>
                  <span className="font-medium">
                    {watch('paymentDate')
                      ? new Date(watch('paymentDate')).toLocaleDateString(
                          'es-ES'
                        )
                      : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto Alquiler:</span>
                  <span className="font-medium">
                    $
                    {(() => {
                      const now = new Date();
                      const startDate = new Date(rental.startDate);
                      const monthsSinceStart =
                        (now.getFullYear() - startDate.getFullYear()) * 12 +
                        (now.getMonth() - startDate.getMonth());
                      const currentContractMonth = monthsSinceStart + 1;
                      const currentPeriod = rental.pricePeriods?.find(
                        (p: any) =>
                          p.startMonth <= currentContractMonth &&
                          p.endMonth >= currentContractMonth
                      );
                      return (
                        currentPeriod?.price || rental.rentalPrice
                      ).toLocaleString();
                    })()}
                  </span>
                </div>
                {items.length > 0 && (
                  <>
                    <div className="border-t pt-2 mt-2">
                      <span className="text-gray-600 font-medium">
                        Items Adicionales:
                      </span>
                    </div>
                    {items.map((item, index) => (
                      <div key={index} className="flex justify-between pl-4">
                        <span className="text-gray-600">
                          {item.description}:
                        </span>
                        <span className="font-medium">
                          ${item.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </>
                )}
                {applyLateFee && calculatedLateFee > 0 && (
                  <>
                    {items.length === 0 && (
                      <div className="border-t pt-2 mt-2">
                        <span className="text-gray-600 font-medium">
                          Items Adicionales:
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pl-4">
                      <span className="text-gray-600">Mora:</span>
                      <span className="font-medium">
                        ${calculatedLateFee.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-900 font-semibold">
                    Total a Pagar:
                  </span>
                  <span className="text-[#600096] font-bold text-lg">
                    ${watch('amount')?.toLocaleString()}
                  </span>
                </div>
                {watch('notes') && (
                  <div className="border-t pt-2 mt-2">
                    <span className="text-gray-600">Notas:</span>
                    <p className="text-gray-900 mt-1">{watch('notes')}</p>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-600">Firmado por:</span>
                  <span className="font-medium">
                    {session?.user?.name || 'Usuario actual'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmation(false)}
              >
                Volver
              </Button>
              <Button
                type="button"
                className="bg-[#600096] hover:bg-[#500080]"
                onClick={confirmPayment}
                disabled={createPayment.isPending}
              >
                <FileText className="mr-2 h-4 w-4" />
                Confirmar y Asentar
              </Button>
            </div>
          </div>
        ) : showPrintOption ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Pago Asentado Exitosamente
              </h3>
              <p className="text-gray-600">
                El recibo se ha generado correctamente.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cerrar
              </Button>
              <Button
                type="button"
                className="bg-[#600096] hover:bg-[#500080]"
                onClick={handlePrint}
              >
                <FileText className="mr-2 h-4 w-4" />
                Generar PDF
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Alertas */}
            {rental?.warnings && (
              <div className="space-y-2">
                {rental.warnings.contractExpiring && (
                  <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-red-800 text-sm font-medium">
                    ⚠️ {rental.warnings.contractExpiring}
                  </div>
                )}
                {rental.warnings.priceUpdate && (
                  <div className="bg-orange-50 border border-orange-300 rounded-lg p-3 text-orange-800 text-sm font-medium">
                    ⚠️ {rental.warnings.priceUpdate}
                  </div>
                )}
              </div>
            )}

            {/* Información del Alquiler */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Información del Alquiler
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Propiedad:</span>{' '}
                  {rental.property.name}
                </p>
                <p>
                  <span className="font-medium">Inquilino:</span>{' '}
                  {rental.tenants && rental.tenants.length > 0
                    ? rental.tenants.map((t: any) => t.client.name).join(', ')
                    : '-'}
                </p>
                <p>
                  <span className="font-medium">Precio Base:</span> $
                  {rental.rentalPrice.toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Precio Actual:</span> $
                  {currentPeriodPrice.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Monto y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mes Correspondiente *</Label>
                <Input type="month" {...register('periodMonth')} />
              </div>

              <div className="space-y-2">
                <Label>Fecha de Pago *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={
                      new Date(
                        new Date().getTime() -
                          new Date().getTimezoneOffset() * 60000
                      )
                        .toISOString()
                        .split('T')[0]
                    }
                    {...register('paymentDate')}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Monto del Alquiler *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  step="0.01"
                  defaultValue={rental?.rentalPrice || 0}
                  {...register('amount', { valueAsNumber: true })}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Items Adicionales */}
            <div className="space-y-2">
              <Label>Items Adicionales</Label>

              {calculatedLateFee > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={applyLateFee}
                      onChange={(e) => setApplyLateFee(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Aplicar Mora: ${calculatedLateFee.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">
                    (
                    {Math.floor(
                      (new Date(watch('paymentDate')).getTime() -
                        new Date(watch('periodMonth') + '-01').getTime()) /
                        (1000 * 60 * 60 * 24)
                    ) + 1}{' '}
                    días x ${rental.lateFee})
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Descripción (ej: Servicios, Mora)"
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  className="flex-1"
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Monto"
                  value={newItem.amount || ''}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-32"
                />
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {(items.length > 0 ||
                (applyLateFee && calculatedLateFee > 0)) && (
                <div className="space-y-2 mt-2">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span className="text-sm">{item.description}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          ${item.amount.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {applyLateFee && calculatedLateFee > 0 && (
                    <div className="flex items-center justify-between bg-yellow-50 p-2 rounded border border-yellow-200">
                      <span className="text-sm font-medium">Mora</span>
                      <span className="text-sm font-medium">
                        ${calculatedLateFee.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Textarea
                {...register('notes')}
                placeholder="Observaciones adicionales..."
                rows={3}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#600096] hover:bg-[#500080]"
                disabled={createPayment.isPending}
              >
                <FileText className="mr-2 h-4 w-4" />
                Asentar Pago
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
