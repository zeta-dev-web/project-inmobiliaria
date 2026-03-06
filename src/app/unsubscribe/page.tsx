'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Mail, Home } from 'lucide-react';
import Link from 'next/link';
import clientAxios from '@/utils/clientAxios';
import { toast } from 'react-toastify';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      handleUnsubscribe(emailParam);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const handleUnsubscribe = async (emailParam: string) => {
    try {
      const { data } = await clientAxios.post('/subscribers/unsubscribe', {
        email: emailParam,
      });
      setSuccess(true);
      toast.success(data.message);
    } catch (error: any) {
      setSuccess(false);
      toast.error(error.response?.data?.error || 'Error al darse de baja');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 border-4 border-[#600096] border-t-transparent rounded-full animate-spin"></div>
            <CardTitle className="mt-4">Procesando...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl">
        <CardHeader className="text-center">
          {success ? (
            <>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">
                ¡Te has dado de baja exitosamente!
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Lamentamos que te vayas. Ya no recibirás más emails de nuestras propiedades.
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-600">
                Error al darse de baja
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Hubo un problema al procesar tu solicitud. Por favor, intenta nuevamente o contáctanos.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {email && (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Mail className="w-4 h-4 inline-block mr-2 text-gray-500" />
              <span className="text-gray-700">{email}</span>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Button
              asChild
              className="w-full h-12 bg-gradient-to-r from-[#600096] to-[#8b00d4] hover:from-[#4a0075] hover:to-[#600096] text-white font-semibold rounded-xl"
            >
              <Link href="/properties">
                <Home className="w-4 h-4 mr-2" />
                Volver a las Propiedades
              </Link>
            </Button>
            {success && (
              <Button
                asChild
                variant="outline"
                className="w-full h-12 border-2 border-[#600096] text-[#600096] hover:bg-purple-50 rounded-xl"
              >
                <Link href="/">
                  Ir a la Página Principal
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#600096] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
