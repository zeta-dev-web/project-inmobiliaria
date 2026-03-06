'use client';

import { Footer } from '@/components/ui/footer';
import { WhatsAppFloat } from '@/components/ui/whatsapp-float';
import { SubscribeFloat } from '@/components/ui/subscribe-float';
import { SubscribeModal } from '@/components/ui/subscribe-modal';
import { PropertiesView } from './components/PropertiesView';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

function useAsyncSearchParams() {
  const searchParams = useSearchParams();
  return Object.fromEntries(searchParams.entries());
}

function PropertiesContent() {
  const searchParams = useAsyncSearchParams();
  const [data, setData] = useState<any>(null);
  const [paramsString, setParamsString] = useState('');
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(searchParams as any);
    setParamsString(params.toString());
  }, [searchParams]);

  useEffect(() => {
    fetch(`/api/properties/public?${paramsString}`)
      .then(res => res.json())
      .then(setData);
  }, [paramsString]);

  // Mostrar el modal la primera vez que el usuario entra (si no se ha suscrito antes)
  useEffect(() => {
    const hasSeenModal = localStorage.getItem('subscribeModalSeen');
    const hasSubscribed = localStorage.getItem('hasSubscribed');

    if (!hasSeenModal && !hasSubscribed) {
      // Mostrar el modal después de un pequeño delay
      const timer = setTimeout(() => {
        setShowSubscribeModal(true);
        localStorage.setItem('subscribeModalSeen', 'true');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubscribed = () => {
    localStorage.setItem('hasSubscribed', 'true');
  };

  if (!data) {
    return <div>Cargando...</div>;
  }

  const { properties, totalPages, currentPage } = data;

  return (
    <>
      <PropertiesView
        properties={properties}
        totalPages={totalPages}
        currentPage={currentPage}
        isLoading={false}
      />
      <SubscribeFloat onSubscribed={handleSubscribed} />
      <SubscribeModal
        open={showSubscribeModal}
        onOpenChange={setShowSubscribeModal}
        onSubscribed={handleSubscribed}
      />
    </>
  );
}

export default function PropiedadesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/favicon-32x32.png"
                alt="Polar Inmobiliaria"
                className="w-8 h-8"
              />
              <h1 className="text-xl font-bold text-gray-900">
                Polar Inmobiliaria
              </h1>
            </div>
            {isAdmin ? (
              <Link
                href="/admin"
                className="px-4 py-2 bg-[#600096] hover:bg-[#500080] text-white rounded-lg transition-colors"
              >
                Panel Admin
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-[#600096] hover:bg-[#500080] text-white rounded-lg transition-colors"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      <Suspense fallback={<div>Cargando...</div>}>
        <PropertiesContent />
      </Suspense>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
