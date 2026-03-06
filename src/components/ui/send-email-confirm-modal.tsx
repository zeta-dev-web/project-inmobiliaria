'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Mail, AlertCircle } from 'lucide-react';

interface SendEmailConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  propertyName: string;
  subscribersCount: number;
  isSending?: boolean;
}

export function SendEmailConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  propertyName,
  subscribersCount,
  isSending = false,
}: SendEmailConfirmModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#600096] to-[#8b00d4] bg-clip-text text-transparent">
            ¿Enviar email a todos los suscriptores?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 text-base mt-2">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#600096] mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900 mb-1">
                    Propiedad: {propertyName}
                  </p>
                  <p className="text-sm text-gray-700">
                    Se enviará un email a <strong className="text-[#600096]">{subscribersCount}</strong> suscriptores activos.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Esta acción no se puede deshacer. Los suscriptores recibirán información completa de la propiedad.
                  </p>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="flex-1 h-11 border-2 border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isSending}
            className="flex-1 h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {isSending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Enviando...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Enviar Emails</span>
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
