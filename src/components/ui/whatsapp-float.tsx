import { MessageCircle } from 'lucide-react';
import { getWhatsAppNumber } from '@/utils/whatsappNumber';

interface WhatsAppFloatProps {
  propertyName?: string;
  propertyAddress?: string;
  propertyPrice?: number;
  propertyUrl?: string;
}

export function WhatsAppFloat({
  propertyName,
  propertyAddress,
  propertyPrice,
  propertyUrl,
}: WhatsAppFloatProps) {
  const handleWhatsAppClick = () => {
    let message;
    if (propertyName && propertyAddress && propertyPrice && propertyUrl) {
      message = `Hola! Estoy interesado en esta propiedad:

*${propertyName}*
Ubicación: ${propertyAddress}
Precio: $${propertyPrice.toLocaleString()}

${propertyUrl}`;
    } else {
      message =
        'Hola, me interesa obtener más información sobre las propiedades disponibles.';
    }
    const phoneNumber = getWhatsAppNumber();
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-5 right-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 rounded-full shadow-2xl transition-all z-40 transform hover:scale-110 active:scale-95 group animate-bounce-slow"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-xl text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-purple-200">
        ¡Consultar por WhatsApp!
      </span>
    </button>
  );
}
