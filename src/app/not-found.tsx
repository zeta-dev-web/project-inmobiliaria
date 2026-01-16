'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { WhatsAppFloat } from '@/components/ui/whatsapp-float';

export default function NotFound() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Image src="/favicon-32x32.png" alt="Logo" width={48} height={48} />
            <h1 className="text-3xl font-bold text-[#600096]">POLAR INMOBILIARIA</h1>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="mb-8">
            <div className="text-9xl font-bold text-[#600096] mb-4">404</div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              🏠 ¿Buscando propiedades?
            </div>
            <p className="text-lg text-gray-600 mb-2">
              Parece que te perdiste en el intento...
            </p>
            <p className="text-gray-500">
              Esta página no existe, pero tenemos muchas propiedades que sí existen y te están esperando.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-4 text-left">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🔍</div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">¿Qué estabas buscando?</div>
                  <p className="text-sm text-gray-600">
                    Tal vez la URL está mal escrita o la página fue movida.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 text-left">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🏡</div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">¿Buscas una propiedad?</div>
                  <p className="text-sm text-gray-600">
                    Vuelve al inicio y encuentra la casa o local de tus sueños.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {isAdmin ? (
              <Link
                href="/admin"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#600096] hover:bg-[#500080] text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Volver al Inicio
              </Link>
            ) : null}
            <Link
              href="/properties"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#600096] hover:bg-[#500080] text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Ver Propiedades
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              ¿Necesitas ayuda? Contáctanos:
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
              <a href="tel:+543814000000" className="text-[#600096] hover:underline font-semibold">
                📞 (381) 400-0000
              </a>
              <span className="hidden sm:inline text-gray-400">•</span>
              <a href="tel:+543815000000" className="text-[#600096] hover:underline font-semibold">
                📞 (381) 500-0000
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>Monteagudo 563, Local 2 - Tafí Viejo, Tucumán, Argentina</p>
        </div>
      </div>

      <WhatsAppFloat />
    </div>
  );
}
