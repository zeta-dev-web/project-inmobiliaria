"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { toast } from 'react-toastify';
import clientAxios from "@/utils/clientAxios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    try {
      const { data } = await clientAxios.post('/icl/sync');
      toast.success(`ICL sincronizado: ${data.created} creados, ${data.updated} actualizados`);
    } catch (error) {
      toast.error('Error al sincronizar ICL');
    } finally {
      setLoading(false);
      setShowDialog(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">⚙️ Configuración</h1>
        <p className="text-gray-600 mt-1">
          Administra la configuración del sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Índice para Contratos de Locación (ICL)</CardTitle>
          <CardDescription>
            Sincroniza los valores del ICL desde la API del Banco Central de la República Argentina
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Los valores se actualizan automáticamente el día 1 de cada mes. 
                Usa este botón solo si necesitas sincronizar manualmente.
              </p>
            </div>
            <Button
              onClick={() => setShowDialog(true)}
              disabled={loading}
              className="bg-[#600096] hover:bg-[#4a0075] text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Sincronizar
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Sincronizar valores de ICL?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción consultará la API del BCRA y actualizará los valores del Índice para Contratos de Locación de los últimos 12 meses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSync}
              className="bg-[#600096] hover:bg-[#4a0075]"
            >
              Sincronizar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
