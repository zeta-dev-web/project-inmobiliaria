'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { SubscribeModal } from './subscribe-modal';

interface SubscribeFloatProps {
  onSubscribed?: () => void;
}

export function SubscribeFloat({ onSubscribed }: SubscribeFloatProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = () => {
    setModalOpen(true);
  };

  const handleSubscribed = () => {
    onSubscribed?.();
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed bottom-22 right-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-4 rounded-full shadow-2xl transition-all z-40 transform hover:scale-110 active:scale-95 group animate-bounce-slow"
        aria-label="Suscribirse para novedades"
      >
        <Mail className="w-7 h-7" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-xl text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-purple-200">
          ¡Alertas de propiedades gratis!
        </span>
      </button>

      <SubscribeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubscribed={handleSubscribed}
      />
    </>
  );
}
