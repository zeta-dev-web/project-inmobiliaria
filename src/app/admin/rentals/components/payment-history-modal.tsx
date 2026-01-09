"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import clientAxios from "@/utils/clientAxios";

interface PaymentHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rentalId: string;
  propertyName: string;
  tenantPhone?: string;
}

export function PaymentHistoryModal({
  open,
  onOpenChange,
  rentalId,
  propertyName,
  tenantPhone,
}: PaymentHistoryModalProps) {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["payment-history", rentalId],
    queryFn: async () => {
      const { data } = await clientAxios.get(`/payments?rentalId=${rentalId}`);
      return data.sort((a: any, b: any) => b.periodMonth.localeCompare(a.periodMonth));
    },
    enabled: open,
  });

  const formatPeriod = (periodMonth: string) => {
    const [year, month] = periodMonth.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  };

  const handleWhatsApp = (paymentId: string) => {
    if (tenantPhone) {
      const phone = tenantPhone.replace(/\D/g, "");
      const formattedPhone = phone.startsWith("54") ? phone : `54${phone}`;
      const receiptUrl = `${window.location.origin}/api/payments/${paymentId}/receipt`;
      const message = `Hola, adjunto el recibo de pago de alquiler. Puede descargarlo desde: ${receiptUrl}`;
      const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    }
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
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Período</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Monto</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Estado</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: any) => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">
                      {formatPeriod(payment.periodMonth)}
                    </td>
                    <td className="py-3 px-4 text-gray-900 font-semibold">
                      ${payment.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={payment.delivered
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }
                      >
                        {payment.delivered ? "Entregado" : "Pendiente"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/api/payments/${payment.id}/receipt`, "_blank")}
                          className="h-8"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Ver PDF
                        </Button>
                        {tenantPhone && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleWhatsApp(payment.id)}
                            className="h-8 text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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
