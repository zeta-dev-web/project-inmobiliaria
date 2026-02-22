"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Property } from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, DollarSign, User, Calendar, Image } from "lucide-react";
import { cn } from "@/lib/shadcn/utils";

interface PropertyViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: Property & { 
    client?: { name: string; email: string | null; phone: string };
    photos?: { id: string; url: string }[];
  };
}

export function PropertyViewModal({ open, onOpenChange, property }: PropertyViewModalProps) {
  if (!property) return null;

  const statusConfig = {
    AVAILABLE: { label: "Disponible", className: "bg-green-100 text-green-800 border-green-200" },
    RENTED: { label: "Alquilada", className: "bg-blue-100 text-blue-800 border-blue-200" },
    SOLD: { label: "Vendida", className: "bg-purple-100 text-purple-800 border-purple-200" },
    UNAVAILABLE: { label: "No Disponible", className: "bg-red-100 text-red-800 border-red-200" },
  };

  const config = statusConfig[property.status as keyof typeof statusConfig] || statusConfig.AVAILABLE;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[#600096]" />
            {property.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información básica */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Dirección</p>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <p className="text-gray-900">{property.address}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Estado</p>
              <Badge variant="outline" className={cn("whitespace-nowrap", config.className)}>
                {config.label}
              </Badge>
            </div>
          </div>

          {/* Tipo y Precio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Tipo</p>
              <Badge 
                variant="outline" 
                className={property.type === "RENT" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-green-50 text-green-700 border-green-200"}
              >
                {property.type === "RENT" ? "🏠 Alquiler" : "💰 Venta"}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Precio</p>
              <p className="text-lg font-bold text-gray-900">${property.price.toLocaleString()}</p>
            </div>
          </div>

          {/* Comisión si es venta */}
          {property.type === "SALE" && property.saleCommission && (
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Comisión de Venta</p>
              <p className="text-gray-900">{property.saleCommission}%</p>
            </div>
          )}

          {/* Descripción */}
          {property.description && (
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Descripción</p>
              <p className="text-gray-900">{property.description}</p>
            </div>
          )}

          {/* Fotos */}
          {property.photos && property.photos.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                <Image className="h-4 w-4" />
                Fotos ({property.photos.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {property.photos.map((photo, index) => (
                  <div key={photo.id} className="relative group cursor-pointer">
                    <img
                      src={photo.url}
                      alt={`Foto ${index + 1} de ${property.name}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 group-hover:border-[#600096] transition-colors"
                      onClick={() => window.open(photo.url, '_blank')}
                    />
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Haz clic en una foto para verla en tamaño completo</p>
            </div>
          )}

          {/* Cliente */}
          {property.client && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente Asociado
              </p>
              <div className="space-y-1">
                <p className="text-gray-900 font-medium">{property.client.name}</p>
                <p className="text-sm text-gray-600">{property.client.email || '-'}</p>
                <p className="text-sm text-gray-600">{property.client.phone}</p>
              </div>
            </div>
          )}

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Creado: {new Date(property.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Actualizado: {new Date(property.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
