'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

function ValidateContent() {
  const searchParams = useSearchParams();
  const hash = searchParams.get('hash');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hash) {
      fetch(`/api/payments/validate?hash=${hash}`)
        .then(res => res.json())
        .then(data => {
          setResult(data);
          setLoading(false);
        })
        .catch(() => {
          setResult({ valid: false, message: 'Error al validar' });
          setLoading(false);
        });
    }
  }, [hash]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#600096] mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">Validando recibo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {result?.valid ? (
            <>
              <div className="bg-gradient-to-r from-[#600096] to-[#800096] p-8 text-white text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
                  <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold mb-2">Recibo Válido</h1>
                <p className="text-purple-100">Este recibo está registrado en nuestro sistema</p>
              </div>
              
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                  <Image src="/favicon-32x32.png" alt="Logo" width={32} height={32} />
                  <div>
                    <h2 className="font-bold text-gray-900">POLAR INMOBILIARIA</h2>
                    <p className="text-sm text-gray-500">Monteagudo 563, Local 2 - Tafí Viejo</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Recibo N°</div>
                    <div className="text-2xl font-bold text-[#600096]">{result.data.receiptNumber}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Inquilino</div>
                      <div className="font-semibold text-gray-900">{result.data.tenant}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Monto</div>
                      <div className="font-semibold text-gray-900">${result.data.amount.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Propiedad</div>
                    <div className="font-semibold text-gray-900">{result.data.property}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Fecha de Pago</div>
                      <div className="font-semibold text-gray-900">{new Date(result.data.paymentDate).toLocaleDateString('es-ES')}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Período</div>
                      <div className="font-semibold text-gray-900">{new Date(result.data.periodMonth + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
                  <p>✓ Recibo verificado y autenticado</p>
                  <p className="mt-1">Recibo generado el {new Date(result.data.paymentDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-white text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
                  <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold mb-2">Recibo No Válido</h1>
                <p className="text-red-100">{result?.message || 'No se pudo validar el recibo'}</p>
              </div>
              
              <div className="p-8 text-center">
                <p className="text-gray-600 mb-4">Este recibo no está registrado en nuestro sistema o el código QR es inválido.</p>
                <p className="text-sm text-gray-500">Si cree que esto es un error, contacte con POLAR INMOBILIARIA.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ValidatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#600096] mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">Cargando...</p>
        </div>
      </div>
    }>
      <ValidateContent />
    </Suspense>
  );
}
