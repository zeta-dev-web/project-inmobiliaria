const WHATSAPP_NUMBERS = ['5493816625078', '5493814018196'];

export function getWhatsAppNumber(): string {
  const randomIndex = Math.floor(Math.random() * WHATSAPP_NUMBERS.length);
  return WHATSAPP_NUMBERS[randomIndex];
}
