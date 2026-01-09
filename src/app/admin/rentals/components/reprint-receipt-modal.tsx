"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import clientAxios from "@/utils/clientAxios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReprintReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rental: any;
}

export function ReprintReceiptModal({ open, onOpenChange, rental }: ReprintReceiptModalProps) {
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("");

  const { data: payments = [] } = useQuery({
    queryKey: ["rental-payments", rental?.id],
    queryFn: async () => {
      if (!rental?.id) return [];
      const { data } = await clientAxios.get(`/payments?rentalId=${rental.id}`);
      return data.data || [];
    },
    enabled: !!rental?.id && open,
  });

  const selectedPayment = payments.find((p: any) => p.id === selectedPaymentId);

  const handlePrint = () => {
    if (selectedPayment) {
      // Aquí se generará el PDF con los datos del pago seleccionado
      console.log("Generar PDF duplicado para:", selectedPayment);
      // TODO: Implementar generación de PDF
    }
  };

  if (!rental) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Reimprimir Recibo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del Alquiler */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Información del Alquiler</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Propiedad:</span> {rental.property.name}</p>
              <p><span className="font-medium">Inquilino:</span> {rental.tenant.name}</p>
            </div>
          </div>

          {/* Selector de Pago */}
          <div className="space-y-2">
            <Label>Seleccionar Pago *</Label>
            <Select value={selectedPaymentId} onValueChange={setSelectedPaymentId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar mes de pago..." />
              </SelectTrigger>
              <SelectContent>
                {payments.map((payment: any) => (
                  <SelectItem key={payment.id} value={payment.id}>
                    {new Date(payment.paymentDate).toLocaleDateString('es-AR', { 
                      month: 'long', 
                      year: 'numeric' 
                    })} - ${payment.amount.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Detalles del Pago Seleccionado */}
          {selectedPayment && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">Detalles del Pago</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Fecha de Pago:</p>
                  <p className="font-medium">{new Date(selectedPayment.paymentDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Monto Total:</p>
                  <p className="font-medium">${selectedPayment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Firmado por:</p>
                  <p className="font-medium">{selectedPayment.signedBy.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Hash de Seguridad:</p>
                  <p className="font-mono text-xs truncate">{selectedPayment.transactionHash}</p>
                </div>
              </div>

              {selectedPayment.items && selectedPayment.items.length > 0 && (
                <div>
                  <p className="text-gray-600 mb-2">Items Adicionales:</p>
                  <div className="space-y-1">
                    {selectedPayment.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.description}</span>
                        <span className="font-medium">${item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPayment.notes && (
                <div>
                  <p className="text-gray-600">Notas:</p>
                  <p className="text-sm">{selectedPayment.notes}</p>
                </div>
              )}

              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <FileText className="mr-1 h-3 w-3" />
                Este recibo será marcado como DUPLICADO
              </Badge>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handlePrint}
              disabled={!selectedPaymentId}
              className="bg-[#600096] hover:bg-[#500080]"
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Recibo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
