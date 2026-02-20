"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Client, Property } from "@/generated/prisma";
import { User, Mail, Phone, Building2, Calendar, CreditCard, AtSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/shadcn/utils";

interface ClientViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client & { properties?: Property[] };
}

export function ClientViewModal({ open, onOpenChange, client }: ClientViewModalProps) {
  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-6 w-6 text-[#600096]" />
            {client.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información del cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-gray-900 font-medium">{client.email || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Teléfono</p>
                <p className="text-gray-900 font-medium">{client.phone}</p>
              </div>
            </div>
            {(client as any).cbu && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">CBU</p>
                  <p className="text-gray-900 font-medium">{(client as any).cbu}</p>
                </div>
              </div>
            )}
            {(client as any).alias && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <AtSign className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Alias</p>
                  <p className="text-gray-900 font-medium">{(client as any).alias}</p>
                </div>
              </div>
            )}
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Registrado: {new Date(client.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Actualizado: {new Date(client.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Propiedades vinculadas */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#600096]" />
              Propiedades Vinculadas ({client.properties?.length || 0})
            </h3>
            
            {client.properties && client.properties.length > 0 ? (
              <div className="space-y-3">
                {client.properties.map((property) => {
                  const statusConfig = {
                    AVAILABLE: { label: "Disponible", className: "bg-green-100 text-green-800 border-green-200" },
                    RENTED: { label: "Alquilada", className: "bg-blue-100 text-blue-800 border-blue-200" },
                    SOLD: { label: "Vendida", className: "bg-purple-100 text-purple-800 border-purple-200" },
                    UNAVAILABLE: { label: "No Disponible", className: "bg-red-100 text-red-800 border-red-200" },
                  };
                  const config = statusConfig[property.status as keyof typeof statusConfig] || statusConfig.AVAILABLE;

                  return (
                    <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#600096] transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{property.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{property.address}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge 
                              variant="outline" 
                              className={property.type === "RENT" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-green-50 text-green-700 border-green-200"}
                            >
                              {property.type === "RENT" ? "Alquiler" : "Venta"}
                            </Badge>
                            <Badge variant="outline" className={cn("whitespace-nowrap", config.className)}>
                              {config.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">${property.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No hay propiedades vinculadas a este cliente</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
