"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import clientAxios from "@/utils/clientAxios";
import { toast } from 'react-toastify';
import { Client } from "@/generated/prisma";

const clientSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "El teléfono es requerido"),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated?: (clientId: string) => void;
  client?: Client;
}

export function ClientModal({ open, onOpenChange, onClientCreated, client }: ClientModalProps) {
  const queryClient = useQueryClient();
  
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
      });
    }
  }, [client, form]);

  const createMutation = useMutation({
    mutationFn: (data: ClientFormData) => clientAxios.post("/clients", data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente creado exitosamente");
      onClientCreated?.(response.data.id);
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast.error("Error al crear el cliente");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ClientFormData) => 
      clientAxios.put(`/clients/${client?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente actualizado exitosamente");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Error al actualizar el cliente");
    },
  });

  const onSubmit = (data: ClientFormData) => {
    if (client) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white rounded-2xl shadow-2xl border-0">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {client ? "✏️ Editar Cliente" : "👤 Nuevo Cliente"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">Nombre</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Juan Pérez" 
                      className="h-11 border-gray-300 focus:border-[#600096] focus:ring-[#600096]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="juan@ejemplo.com" 
                      className="h-11 border-gray-300 focus:border-[#600096] focus:ring-[#600096]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">Teléfono</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+54 11 1234-5678" 
                      className="h-11 border-gray-300 focus:border-[#600096] focus:ring-[#600096]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-11 px-6 border-gray-300 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="h-11 px-6 bg-[#600096] hover:bg-[#500080] text-white shadow-lg hover:shadow-xl transition-all"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                ) : (
                  client ? "✓ Actualizar" : "✓ Crear Cliente"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
