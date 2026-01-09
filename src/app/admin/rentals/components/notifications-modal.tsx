"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { MessageCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import clientAxios from "@/utils/clientAxios";
import { toast } from "react-toastify";
import { useState } from "react";
import n2words from "n2words";

type RentalWithWarnings = {
  id: string;
  property: { name: string; address: string };
  tenant: { name: string; phone: string };
  pricePeriods: Array<{ id: string; startMonth: number; endMonth: number; price: number | null }>;
  startDate: string;
  warnings?: { contractExpiring?: string; priceUpdate?: string };
  notifications?: Array<{ type: string; notified: boolean }>;
};

interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rentals: RentalWithWarnings[];
  onOpenUpdatePrice?: (rental: RentalWithWarnings) => void;
}

export function NotificationsModal({
  open,
  onOpenChange,
  rentals,
  onOpenUpdatePrice,
}: NotificationsModalProps) {
  const queryClient = useQueryClient();
  const rentalsWithWarnings = rentals.filter(r => {
    if (!r.warnings) return false;
    
    const hasUnnotifiedContractExpiring = r.warnings.contractExpiring && 
      !(r as any).notifications?.some((n: any) => n.type === 'CONTRACT_EXPIRING' && n.notified);
    
    const hasUnnotifiedPriceUpdate = r.warnings.priceUpdate && 
      !(r as any).notifications?.some((n: any) => n.type === 'PRICE_UPDATE' && n.notified);
    
    return hasUnnotifiedContractExpiring || hasUnnotifiedPriceUpdate;
  });
  const [notifiedMap, setNotifiedMap] = useState<Record<string, boolean>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingNotification, setPendingNotification] = useState<{ rentalId: string; type: string } | null>(null);

  const markNotifiedMutation = useMutation({
    mutationFn: ({ rentalId, type }: { rentalId: string; type: string }) =>
      clientAxios.post("/notifications/mark", { rentalId, type }),
    onSuccess: (_, variables) => {
      const key = `${variables.rentalId}-${variables.type}`;
      setNotifiedMap(prev => ({ ...prev, [key]: true }));
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      toast.success("Notificación marcada como enviada");
    },
    onError: () => {
      toast.error("Error al marcar notificación");
    },
  });

  const handleMarkNotified = (rentalId: string, type: string) => {
    setPendingNotification({ rentalId, type });
    setConfirmOpen(true);
  };

  const confirmMarkNotified = () => {
    if (pendingNotification) {
      markNotifiedMutation.mutate(pendingNotification);
    }
    setConfirmOpen(false);
    setPendingNotification(null);
  };

  const handleWhatsApp = async (rental: RentalWithWarnings) => {
    if (rental.warnings?.priceUpdate) {
      const now = new Date();
      const startDate = new Date(rental.startDate);
      const monthsSinceStart = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
      const currentContractMonth = monthsSinceStart + 1;
      
      const nextPeriod = rental.pricePeriods.find(p => 
        p.startMonth > currentContractMonth && 
        p.startMonth <= currentContractMonth + 2
      );
      
      if (!nextPeriod?.price) {
        toast.error("No se ha cargado el nuevo precio");
        onOpenChange(false);
        if (onOpenUpdatePrice) {
          onOpenUpdatePrice(rental);
        }
        return;
      }
    }
    
    const phone = rental.tenant.phone.replace(/\D/g, "");
    const formattedPhone = phone.startsWith("54") ? phone : `54${phone}`;
    let message = `Buenos Dias, le escribimos de Polar Inmobiliaria respecto a la propiedad ubicada en: ${rental.property.address}. `;
    
    if (rental.warnings?.contractExpiring) {
      message += `Queríamos notificarle que ${rental.warnings.contractExpiring.toLowerCase()}. `;
    }
    
    if (rental.warnings?.priceUpdate) {
      const now = new Date();
      const startDate = new Date(rental.startDate);
      const monthsSinceStart = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
      const currentContractMonth = monthsSinceStart + 1;
      
      const nextPeriod = rental.pricePeriods.find(p => 
        p.startMonth > currentContractMonth && 
        p.startMonth <= currentContractMonth + 2
      );
      
      if (nextPeriod?.price) {
        const updateDate = new Date(startDate);
        updateDate.setMonth(startDate.getMonth() + nextPeriod.startMonth - 1);
        const monthName = updateDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        
        const priceInWords = n2words(nextPeriod.price, { lang: 'es' });
        message += `Le informamos que habrá actualización de precio en ${monthName}. El nuevo precio será: ${priceInWords} ($${nextPeriod.price.toLocaleString('es-AR')}). `;
      }
    }
    
    message += "Agradeceremos que se comunique por cualquier duda.";
    
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Notificaciones Pendientes
          </DialogTitle>
        </DialogHeader>

        {rentalsWithWarnings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay notificaciones pendientes
          </div>
        ) : (
          <div className="space-y-4">
            {rentalsWithWarnings.map((rental) => (
              <div
                key={rental.id}
                className="border border-gray-200 rounded-lg p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {rental.property.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {rental.property.address}
                    </p>
                    <p className="text-sm text-gray-500">
                      Inquilino: {rental.tenant.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mt-3">
                  {rental.warnings?.contractExpiring && !(rental.notifications?.some(n => n.type === 'CONTRACT_EXPIRING' && n.notified)) && (
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200 flex-1"
                      >
                        {rental.warnings.contractExpiring}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleWhatsApp(rental)}
                          className="h-8 text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          WhatsApp
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPendingNotification({ rentalId: rental.id, type: "CONTRACT_EXPIRING" });
                            setConfirmOpen(true);
                          }}
                          disabled={notifiedMap[`${rental.id}-CONTRACT_EXPIRING`]}
                          className="h-8 text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-blue-600"
                        >
                          {notifiedMap[`${rental.id}-CONTRACT_EXPIRING`] ? "✓ Notificado" : "Marcar Notificado"}
                        </Button>
                      </div>
                    </div>
                  )}
                  {rental.warnings?.priceUpdate && !(rental.notifications?.some(n => n.type === 'PRICE_UPDATE' && n.notified)) && (
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 flex-1"
                      >
                        {rental.warnings.priceUpdate}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleWhatsApp(rental)}
                          className="h-8 text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          WhatsApp
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPendingNotification({ rentalId: rental.id, type: "PRICE_UPDATE" });
                            setConfirmOpen(true);
                          }}
                          disabled={notifiedMap[`${rental.id}-PRICE_UPDATE`]}
                          className="h-8 text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-blue-600"
                        >
                          {notifiedMap[`${rental.id}-PRICE_UPDATE`] ? "✓ Notificado" : "Marcar Notificado"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>

    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Confirmar notificación?</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro que ya notificaste al inquilino? Esta acción marcará la notificación como enviada.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirmMarkNotified}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
