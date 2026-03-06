'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';
import { Mail, Sparkles, Home, CheckCircle2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import clientAxios from '@/utils/clientAxios';

interface SubscribeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscribed?: () => void;
}

export function SubscribeModal({
  open,
  onOpenChange,
  onSubscribed,
}: SubscribeModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: async (data: { email: string; name?: string }) => {
      const { data: response } = await clientAxios.post('/subscribers', data);
      return response;
    },
    onSuccess: () => {
      setShowSuccess(true);
      toast.success(
        '¡Gracias por suscribirte! Recibirás las últimas novedades.'
      );

      // Cerrar el modal después de mostrar el éxito
      setTimeout(() => {
        onSubscribed?.();
        onOpenChange(false);
        setShowSuccess(false);
        setEmail('');
        setName('');
      }, 2000);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error ||
          'Error al suscribirse. Por favor, intente nuevamente.'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Por favor, ingresa tu email');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor, ingresa un email válido');
      return;
    }

    subscribeMutation.mutate({ email, name: name || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-br from-purple-50 via-white to-violet-50 border-0 shadow-2xl">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#600096] to-[#8b00d4] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Home className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#600096] to-[#8b00d4] bg-clip-text text-transparent">
            {showSuccess
              ? '¡Suscripción Exitosa!'
              : '¡No te pierdas ninguna oportunidad!'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-base mt-2">
            {showSuccess ? (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-medium">
                  Ahora recibirás las últimas novedades!!!
                </span>
              </div>
            ) : (
              'Sé el primero en enterarte! Recibe alertas de nuevos alquileres y ventas antes que nadie.'
            )}
          </DialogDescription>
        </DialogHeader>

        {!showSuccess && (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-semibold text-gray-700"
              >
                Nombre (opcional)
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-4 h-12 border-2 border-gray-200 focus:border-[#600096] focus:ring-2 focus:ring-[#600096]/20 transition-all duration-200 rounded-xl"
                  disabled={subscribeMutation.isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700"
              >
                Email *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 border-2 border-gray-200 focus:border-[#600096] focus:ring-2 focus:ring-[#600096]/20 transition-all duration-200 rounded-xl"
                  disabled={subscribeMutation.isPending}
                  required
                />
              </div>
            </div>

            <div className="bg-purple-100 border border-purple-200 rounded-lg p-3 mt-4">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#600096] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-purple-800">
                  Recibirás un email cada vez que publiquemos una nueva
                  propiedad.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#600096] to-[#8b00d4] hover:from-[#4a0075] hover:to-[#600096] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={subscribeMutation.isPending}
            >
              {subscribeMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Suscribiendo...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>¡Quiero Suscribirme!</span>
                </div>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500 mt-4">
              Puedes darte de baja en cualquier momento. Respetamos tu
              privacidad.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
