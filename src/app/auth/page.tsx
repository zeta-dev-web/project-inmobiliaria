'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Building2, Lock, Mail } from 'lucide-react';

export default function AuthPage() {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      dni,
      password,
    });

    setIsLoading(false);

    if (result?.error) {
      toast.error('Credenciales inválidas. Verifique su DNI y contraseña.');
    } else {
      toast.success('¡Bienvenido! Acceso exitoso al sistema.');
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(148,163,184,0.3)_1px,_transparent_0)] bg-[length:20px_20px]"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#600096] rounded-2xl mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Polar Inmobiliaria
          </h1>
          <p className="text-gray-600">Sistema de Gestión Inmobiliaria</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center text-gray-900">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Accede a tu panel de administración
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="dni"
                  className="text-sm font-medium text-gray-700"
                >
                  DNI
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="dni"
                    type="text"
                    placeholder="35523278"
                    required
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-[#600096] focus:ring-[#600096]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-[#600096] focus:ring-[#600096]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#600096] hover:bg-[#4a0075] text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verificando...</span>
                  </div>
                ) : (
                  'Ingresar al Sistema'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 Polar Inmobiliaria. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
