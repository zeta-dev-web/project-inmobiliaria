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
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-colors z-50"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
