'use client';

import {
  Building2,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Phone,
  Shield,
  Star,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Property } from '@/generated/prisma';
import { cn } from '@/lib/shadcn/utils';
import { getWhatsAppNumber } from '@/utils/whatsappNumber';
import { useState } from 'react';

type PublicProperty = Property & {
  client?: { name: string; email: string; phone: string };
  photos?: { id: string; url: string }[];
};

interface PropertyViewProps {
  property: PublicProperty;
}

export function PropertyView({ property }: PropertyViewProps) {
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const contactWhatsApp = () => {
    const url = `${window.location.origin}/property/${property.id}`;
    const message = `Hola! Estoy interesado en esta propiedad:

*${property?.name}*
Ubicación: ${property?.address}
Precio: $${property?.price.toLocaleString()}

${url}`;
    const phoneNumber = getWhatsAppNumber();
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Photos and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo Gallery */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {property.photos && property.photos.length > 0 ? (
              <div>
                {/* Main Photo */}
                <div
                  className="aspect-video bg-gray-200 relative cursor-pointer"
                  onClick={() => setFullscreenOpen(true)}
                >
                  <img
                    src={property.photos[selectedPhoto]?.url}
                    alt={`${property.name} - Foto principal`}
                    className="w-full h-full object-cover"
                  />

                  {/* Navigation Buttons */}
                  {property.photos.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setSelectedPhoto((prev) =>
                            prev === 0
                              ? property.photos!.length - 1
                              : prev - 1
                          )
                        }
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() =>
                          setSelectedPhoto((prev) =>
                            prev === property.photos!.length - 1
                              ? 0
                              : prev + 1
                          )
                        }
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {selectedPhoto + 1} / {property.photos.length}
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                {property.photos.length > 1 && (
                  <div className="p-4 border-t">
                    <div className="flex gap-2 overflow-x-auto">
                      {property.photos.map((photo, index) => (
                        <button
                          key={photo.id}
                          onClick={() => setSelectedPhoto(index)}
                          className={cn(
                            'flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-colors',
                            selectedPhoto === index
                              ? 'border-[#600096]'
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                        >
                          <img
                            src={photo.url}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Sin fotos disponibles</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Descripción
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          )}

          {/* Requirements (for RENT) - at the end */}
          {property.type === 'RENT' && (property as any).requirements && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Requerimientos
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {(property as any).requirements}
              </div>
            </div>
          )}

          {/* Documentation (for SALE) - at the end */}
          {property.type === 'SALE' && (property as any).documentation && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Documentación
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {(property as any).documentation}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Purchase Info */}
        <div className="space-y-6">
          {/* Price and Action */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <Badge
                  variant="outline"
                  className={
                    property.type === 'RENT'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-green-50 text-green-700 border-green-200'
                  }
                >
                  {property.type === 'RENT' ? 'Alquiler' : 'Venta'}
                </Badge>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                {property.name}
              </h1>
              <p className="text-2xl font-bold text-[#600096] mb-1">
                ${property.price.toLocaleString()}
              </p>
              {property.type === 'SALE' && property.saleCommission && (
                <p className="text-sm text-gray-500">
                  Comisión: {property.saleCommission}%
                </p>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={contactWhatsApp}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Consultar por WhatsApp
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">¿Tienes dudas?</p>
                <div className="flex justify-center space-x-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-[#600096] hover:text-[#500080] font-medium text-sm">
                        381 662-5078
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="center"
                      className="w-48 bg-white"
                    >
                      <DropdownMenuItem asChild>
                        <a href="tel:3816625078" className="cursor-pointer">
                          <Phone className="mr-2 h-4 w-4" />
                          Llamar
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const message = `Hola! Estoy interesado en esta propiedad:

*${property?.name}*
Ubicación: ${property?.address}
Precio: $${property?.price.toLocaleString()}

${window.location.href}`;
                          const phoneNumber = getWhatsAppNumber();
                          window.open(
                            `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                              message
                            )}`,
                            '_blank'
                          );
                        }}
                        className="cursor-pointer"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        WhatsApp
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <span className="text-gray-300">|</span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-[#600096] hover:text-[#500080] font-medium text-sm">
                        381 401-8196
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="center"
                      className="w-48 bg-white"
                    >
                      <DropdownMenuItem asChild>
                        <a href="tel:3814018196" className="cursor-pointer">
                          <Phone className="mr-2 h-4 w-4" />
                          Llamar
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const message = `Hola! Estoy interesado en esta propiedad:

*${property?.name}*
Ubicación: ${property?.address}
Precio: $${property?.price.toLocaleString()}

${window.location.href}`;
                          const phoneNumber = getWhatsAppNumber();
                          window.open(
                            `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                              message
                            )}`,
                            '_blank'
                          );
                        }}
                        className="cursor-pointer"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        WhatsApp
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Ubicación
            </h3>
            <div className="space-y-2">
              <p className="text-gray-700">{property.address}</p>
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      property.address
                    )}`,
                    '_blank'
                  )
                }
                className="text-[#600096] hover:text-[#500080] font-medium text-sm"
              >
                Ver en Google Maps →
              </button>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Inmobiliaria
            </h3>
            <div className="flex items-center space-x-3 mb-3">
              <img
                src="/favicon-32x32.png"
                alt="Polar Inmobiliaria"
                className="w-12 h-12"
              />
              <div>
                <p className="font-semibold text-gray-900">
                  Polar Inmobiliaria
                </p>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-500 ml-1">
                    Inmobiliaria
                  </span>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>📍 Monteagudo 563 Local 2</p>
              <p>Tafí Viejo, Tucumán</p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Garantías
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700">
                  Inmobiliaria verificada
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700">
                  Atención personalizada
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700">
                  Propiedades garantizadas
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black border-0">
          <div className="relative w-full h-[95vh] flex items-center justify-center">
            <img
              src={property.photos?.[selectedPhoto]?.url}
              alt={`${property.name} - Foto ${selectedPhoto + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {property.photos && property.photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhoto((prev) =>
                      prev === 0 ? property.photos!.length - 1 : prev - 1
                    );
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhoto((prev) =>
                      prev === property.photos!.length - 1 ? 0 : prev + 1
                    );
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
              {selectedPhoto + 1} / {property.photos?.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
