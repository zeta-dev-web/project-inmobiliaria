'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export default function CuilGeneratorPage() {
  const [dni, setDni] = useState('');
  const [cuilData, setCuilData] = useState<{cuil: string; name: string | null} | null>(null);

  const cuilSearchMutation = useMutation({
    mutationFn: async (dniToSearch: string) => {
      const res = await fetch('/api/cuil-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni: dniToSearch }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al buscar CUIL');
      }
      return res.json();
    },
    onSuccess: (data) => {
      setCuilData(data);
      toast.success(`CUIL encontrado: ${data.cuil}${data.name ? ` - ${data.name}` : ''}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSearchCuil = () => {
    if (!dni.trim()) {
      toast.error('Ingrese el DNI');
      return;
    }
    cuilSearchMutation.mutate(dni.replace(/\D/g, ''));
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Generar CUIL</h1>

      <Card>
        <CardHeader>
          <CardTitle>Generar CUIL</CardTitle>
          <CardDescription>
            Ingresá el DNI para obtener el CUIL de la persona
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Label htmlFor="dni">DNI</Label>
              <div className="relative">
                <Input
                  id="dni"
                  placeholder="12345678"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchCuil()}
                  className="pr-12 h-11 border-gray-300 focus:border-[#600096] focus:ring-[#600096]"
                  maxLength={8}
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <Button
              onClick={handleSearchCuil}
              disabled={cuilSearchMutation.isPending || !dni.trim()}
              className="w-full md:w-auto bg-[#600096] hover:bg-[#500080] text-white"
            >
              <Search className="mr-2 h-4 w-4" />
              Generar CUIL
            </Button>
          </div>
          {cuilData && (
            <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <p className="text-lg font-semibold text-green-900 mb-1">
                CUIL: <span className="text-green-700">{cuilData.cuil}</span>
              </p>
              {cuilData.name && (
                <p className="text-md text-green-800">
                  Nombre: <span className="font-medium">{cuilData.name}</span>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
