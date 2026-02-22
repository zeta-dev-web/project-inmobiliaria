'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Client, Property } from '@/generated/prisma';
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  CreditCard,
  AtSign,
  Briefcase,
  MapPin,
  FileText,
  Download,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/shadcn/utils';

interface ClientViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client & { properties?: Property[]; documents?: any[] };
}

export function ClientViewModal({
  open,
  onOpenChange,
  client,
}: ClientViewModalProps) {
  if (!client) return null;

  const typeLabels = {
    LANDLORD: 'Propietario',
    TENANT: 'Inquilino',
    GUARANTOR: 'Garante',
  };
  const typeColors = {
    LANDLORD: 'bg-green-100 text-green-800 border-green-200',
    TENANT: 'bg-blue-100 text-blue-800 border-blue-200',
    GUARANTOR: 'bg-orange-100 text-orange-800 border-orange-200',
  };
  const clientType = (client as any).clientType || 'LANDLORD';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={cn(
                'text-sm',
                typeColors[clientType as keyof typeof typeColors]
              )}
            >
              {typeLabels[clientType as keyof typeof typeLabels]}
            </Badge>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-6 w-6 text-[#600096]" />
              {client.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Teléfono</p>
                <p className="text-gray-900 font-medium">{client.phone}</p>
              </div>
            </div>
            {client.email && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium">{client.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Información adicional para inquilinos y garantes */}
          {(clientType === 'TENANT' || clientType === 'GUARANTOR') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(client as any).dni && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">DNI</p>
                    <p className="text-gray-900 font-medium">
                      {(client as any).dni}
                    </p>
                  </div>
                </div>
              )}
              {(client as any).workplace && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Lugar de Trabajo</p>
                    <p className="text-gray-900 font-medium">
                      {(client as any).workplace}
                    </p>
                  </div>
                </div>
              )}
              {(client as any).fiscalAddress && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Domicilio Fiscal</p>
                    <p className="text-gray-900 font-medium">
                      {(client as any).fiscalAddress}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Información bancaria */}
          {((client as any).cbu || (client as any).alias) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(client as any).cbu && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">CBU</p>
                    <p className="text-gray-900 font-medium">
                      {(client as any).cbu}
                    </p>
                  </div>
                </div>
              )}
              {(client as any).alias && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <AtSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Alias</p>
                    <p className="text-gray-900 font-medium">
                      {(client as any).alias}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documentos */}
          {client.documents && client.documents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#600096]" />
                Documentos ({client.documents.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {client.documents.map((doc: any, index: number) => {
                  const isImage = doc.url.match(/\.(jpg|jpeg|png|gif)$/i);
                  return (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative group block"
                    >
                      {isImage ? (
                        <img
                          src={doc.url}
                          alt={`Documento ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 group-hover:border-[#600096] transition-colors"
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-100 rounded-lg border-2 border-gray-200 group-hover:border-[#600096] transition-colors flex flex-col items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-500">PDF</span>
                        </div>
                      )}
                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded truncate max-w-[90%]">
                        {doc.name.length > 15
                          ? doc.name.substring(0, 12) + '...'
                          : doc.name}
                      </div>
                      <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        <Download className="h-3 w-3" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Registrado:{' '}
                {new Date(client.createdAt).toLocaleDateString('es-AR')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Actualizado:{' '}
                {new Date(client.updatedAt).toLocaleDateString('es-AR')}
                {(client as any).lastEditedBy &&
                  ` por ${(client as any).lastEditedBy.name}`}
              </span>
            </div>
          </div>

          {/* Propiedades vinculadas - solo para propietarios */}
          {clientType === 'LANDLORD' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#600096]" />
                Propiedades Vinculadas ({client.properties?.length || 0})
              </h3>

              {client.properties && client.properties.length > 0 ? (
                <div className="space-y-3">
                  {client.properties.map((property) => {
                    const statusConfig = {
                      AVAILABLE: {
                        label: 'Disponible',
                        className:
                          'bg-green-100 text-green-800 border-green-200',
                      },
                      RENTED: {
                        label: 'Alquilada',
                        className: 'bg-blue-100 text-blue-800 border-blue-200',
                      },
                      SOLD: {
                        label: 'Vendida',
                        className:
                          'bg-purple-100 text-purple-800 border-purple-200',
                      },
                      UNAVAILABLE: {
                        label: 'No Disponible',
                        className: 'bg-red-100 text-red-800 border-red-200',
                      },
                    };
                    const config =
                      statusConfig[
                        property.status as keyof typeof statusConfig
                      ] || statusConfig.AVAILABLE;

                    return (
                      <div
                        key={property.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-[#600096] transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {property.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {property.address}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Badge
                                variant="outline"
                                className={
                                  property.type === 'RENT'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-green-50 text-green-700 border-green-200'
                                }
                              >
                                {property.type === 'RENT'
                                  ? 'Alquiler'
                                  : 'Venta'}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'whitespace-nowrap',
                                  config.className
                                )}
                              >
                                {config.label}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-lg font-bold text-gray-900">
                              ${property.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">
                    No hay propiedades vinculadas a este cliente
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
