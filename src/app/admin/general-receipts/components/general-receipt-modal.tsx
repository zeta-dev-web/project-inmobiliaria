'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clientAxios from '@/utils/clientAxios';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const schema = z.object({
  clientIds: z.array(z.string()).min(1, 'Seleccione al menos un cliente'),
  reason: z.string().min(1, 'Ingrese el concepto'),
  amount: z.number().min(0.01, 'Ingrese un monto válido'),
  receiptDate: z.string().min(1, 'Seleccione una fecha'),
});

type FormData = z.infer<typeof schema>;

interface GeneralReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GeneralReceiptModal({ open, onOpenChange }: GeneralReceiptModalProps) {
  const queryClient = useQueryClient();
  const [selectedClients, setSelectedClients] = useState<any[]>([]);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await clientAxios.get('/clients');
      return data.data;
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientIds: [],
      reason: '',
      amount: 0,
      receiptDate: new Date().toISOString().split('T')[0],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await clientAxios.post('/general-receipts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-receipts'] });
      toast.success('Recibo creado exitosamente');
      onOpenChange(false);
      form.reset();
      setSelectedClients([]);
    },
    onError: () => {
      toast.error('Error al crear el recibo');
    },
  });

  const addClient = (clientId: string) => {
    const client = clients.find((c: any) => c.id === clientId);
    if (client && !selectedClients.find((c) => c.id === clientId)) {
      const newClients = [...selectedClients, client];
      setSelectedClients(newClients);
      form.setValue('clientIds', newClients.map((c) => c.id));
    }
  };

  const removeClient = (clientId: string) => {
    const newClients = selectedClients.filter((c) => c.id !== clientId);
    setSelectedClients(newClients);
    form.setValue('clientIds', newClients.map((c) => c.id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Nuevo Recibo General
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="clientIds"
              render={() => (
                <FormItem>
                  <FormLabel>Clientes que abonan *</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <select
                        onChange={(e) => {
                          addClient(e.target.value);
                          e.target.value = '';
                        }}
                        className="w-full h-11 border-2 border-gray-300 rounded-md px-3"
                      >
                        <option value="">Seleccionar cliente...</option>
                        {clients.map((client: any) => (
                          <option key={client.id} value={client.id}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex flex-wrap gap-2">
                        {selectedClients.map((client) => (
                          <Badge key={client.id} variant="outline" className="bg-purple-50">
                            {client.name}
                            <button
                              type="button"
                              onClick={() => removeClient(client.id)}
                              className="ml-2"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concepto *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Motivo del recibo..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receiptDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#600096] hover:bg-[#500080]"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creando...' : 'Crear Recibo'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
