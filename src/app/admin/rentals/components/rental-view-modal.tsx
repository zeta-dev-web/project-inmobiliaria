"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Rental, Property, Client } from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";
import { Home, User, Users, Calendar, DollarSign, Clock, AlertCircle } from "lucide-react";

type RentalWithRelations = Rental & {
  property: Property;
  tenant: Client;
  landlord: Client;
  guarantors: Array<{ client: Client }>;
};

interface RentalViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rental?: RentalWithRelations;
}

export function RentalViewModal({ open, onOpenChange, rental }: RentalViewModalProps) {
  if (!rental) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Alquiler</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-5 h-5 text-[#600096]" />
              <h3 className="font-semibold text-gray-900">Propiedad</h3>
            </div>
            <p className="text-lg font-semibold text-gray-900">{rental.property.name}</p>
            <p className="text-sm text-gray-600">{rental.property.address}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Inquilino</h3>
              </div>
              <p className="text-gray-900">{rental.tenant.name}</p>
              <p className="text-sm text-gray-600">{rental.tenant.email}</p>
              <p className="text-sm text-gray-600">{rental.tenant.phone}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Propietario</h3>
              </div>
              <p className="text-gray-900">{rental.landlord.name}</p>
              <p className="text-sm text-gray-600">{rental.landlord.email}</p>
              <p className="text-sm text-gray-600">{rental.landlord.phone}</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">Garantes</h3>
            </div>
            <div className="space-y-2">
              {rental.guarantors.map((guarantor, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div>
                    <p className="font-medium text-gray-900">{guarantor.client.name}</p>
                    <p className="text-sm text-gray-600">{guarantor.client.email}</p>
                  </div>
                  <p className="text-sm text-gray-600">{guarantor.client.phone}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Precio de Alquiler</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">${rental.rentalPrice.toLocaleString()}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-gray-900">Multa por Mora</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">${rental.lateFee.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Actualización</h3>
              </div>
              <p className="text-lg font-semibold text-gray-900">{rental.updateFrequency} meses</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Día de Vencimiento</h3>
              </div>
              <p className="text-lg font-semibold text-gray-900">Día {rental.paymentDueDay}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Administración</h3>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {rental.administrationType === "PERCENTAGE" 
                  ? `${rental.administrationAmount}%` 
                  : `$${rental.administrationAmount.toLocaleString()}`
                }
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Fecha de Inicio</h3>
              </div>
              <p className="text-gray-900">{new Date(rental.startDate).toLocaleDateString()}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-gray-900">Fecha de Vencimiento</h3>
              </div>
              <p className="text-gray-900">{new Date(rental.endDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900">Estado de Pago</h3>
            </div>
            <Badge 
              variant="outline"
              className={rental.paymentStatus === "PAID" 
                ? "bg-green-50 text-green-700 border-green-200" 
                : "bg-red-50 text-red-700 border-red-200"
              }
            >
              {rental.paymentStatus === "PAID" ? "Pagado" : "Pendiente"}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
