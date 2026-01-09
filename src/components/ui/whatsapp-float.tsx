import { MessageCircle } from "lucide-react";

export function WhatsAppFloat() {
  const handleWhatsAppClick = () => {
    const message = "Hola, me interesa obtener más información sobre las propiedades disponibles.";
    const phoneNumber = "5493816625078";
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