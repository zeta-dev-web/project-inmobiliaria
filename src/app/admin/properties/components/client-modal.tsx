'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import clientAxios from '@/utils/clientAxios';
import { toast } from 'react-toastify';
import { Client } from '@/generated/prisma';
import { Upload, X } from 'lucide-react';

const clientSchema = z
  .object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    phone: z.string().min(1, 'El teléfono es obligatiorio'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    cbu: z.string().max(22).optional().or(z.literal('')),
    alias: z.string().max(50).optional().or(z.literal('')),
    clientType: z.enum(['LANDLORD', 'TENANT', 'GUARANTOR']),
    dni: z.string().optional().or(z.literal('')),
    workplace: z.string().optional().or(z.literal('')),
    fiscalAddress: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.clientType === 'TENANT' || data.clientType === 'GUARANTOR') {
        return data.dni && data.dni.trim() !== '';
      }
      return true;
    },
    {
      message: 'El DNI es obligatorio',
      path: ['dni'],
    }
  )
  .refine(
    (data) => {
      if (data.clientType === 'TENANT' || data.clientType === 'GUARANTOR') {
        return data.workplace && data.workplace.trim() !== '';
      }
      return true;
    },
    {
      message: 'El lugar de trabajo es obligatorio',
      path: ['workplace'],
    }
  )
  .refine(
    (data) => {
      if (data.clientType === 'TENANT' || data.clientType === 'GUARANTOR') {
        return data.fiscalAddress && data.fiscalAddress.trim() !== '';
      }
      return true;
    },
    {
      message: 'El domicilio es obligatorio',
      path: ['fiscalAddress'],
    }
  );

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated?: (clientId: string) => void;
  client?: Client;
}

export function ClientModal({
  open,
  onOpenChange,
  onClientCreated,
  client,
}: ClientModalProps) {
  const queryClient = useQueryClient();
  const [documents, setDocuments] = useState<File[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<
    { id: string; url: string; name: string }[]
  >([]);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      cbu: '',
      alias: '',
      clientType: 'LANDLORD',
      dni: '',
      workplace: '',
      fiscalAddress: '',
    },
  });

  const watchClientType = form.watch('clientType');

  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name || '',
        phone: client.phone || '',
        email: client.email || '',
        cbu: (client as any).cbu || '',
        alias: (client as any).alias || '',
        clientType: (client as any).clientType || 'LANDLORD',
        dni: (client as any).dni || '',
        workplace: (client as any).workplace || '',
        fiscalAddress: (client as any).fiscalAddress || '',
      });
      if ((client as any).documents) {
        setExistingDocuments((client as any).documents);
      }
    } else {
      form.reset({
        name: '',
        phone: '',
        email: '',
        cbu: '',
        alias: '',
        clientType: 'LANDLORD',
        dni: '',
        workplace: '',
        fiscalAddress: '',
      });
      setExistingDocuments([]);
    }
    setDocuments([]);
  }, [client, form]);

  const createMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await clientAxios.post('/clients', data);
      if (documents.length > 0) {
        const formData = new FormData();
        documents.forEach((doc) => formData.append('documents', doc));
        await clientAxios.post(
          `/clients/${response.data.id}/documents`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
      }
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente creado exitosamente');
      onClientCreated?.(response.data.id);
      onOpenChange(false);
      form.reset();
      setDocuments([]);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || '';
      if (errorMessage.includes('email')) {
        toast.error('El email ya está registrado');
      } else {
        toast.error('Error al crear el cliente');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await clientAxios.put(`/clients/${client?.id}`, data);
      if (documents.length > 0) {
        const formData = new FormData();
        documents.forEach((doc) => formData.append('documents', doc));
        await clientAxios.post(`/clients/${client?.id}/documents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente actualizado exitosamente');
      onOpenChange(false);
      setDocuments([]);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || '';
      if (errorMessage.includes('email')) {
        toast.error('El email ya está registrado');
      } else {
        toast.error('Error al actualizar el cliente');
      }
    },
  });

  const onSubmit = (data: ClientFormData) => {
    if (client) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingDocument = async (docId: string) => {
    try {
      await clientAxios.delete(`/clients/${client?.id}/documents/${docId}`);
      setExistingDocuments((prev) => prev.filter((doc) => doc.id !== docId));
      toast.success('Documento eliminado');
    } catch (error) {
      toast.error('Error al eliminar el documento');
    }
  };

  const handleCloseModal = () => {
    form.reset({
      name: '',
      phone: '',
      email: '',
      cbu: '',
      alias: '',
      clientType: 'LANDLORD',
      dni: '',
      workplace: '',
      fiscalAddress: '',
    });
    setDocuments([]);
    setExistingDocuments([]);
    onOpenChange(false);
  };

  const needsExtraFields =
    watchClientType === 'TENANT' || watchClientType === 'GUARANTOR';

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border-0">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {client ? '✏️ Editar Cliente' : '👤 Nuevo Cliente'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 pt-4"
          >
            <FormField
              control={form.control}
              name="clientType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    Tipo de Cliente
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 border-gray-300 focus:border-[#600096] focus:ring-[#600096]">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LANDLORD">Propietario</SelectItem>
                      <SelectItem value="TENANT">Inquilino</SelectItem>
                      <SelectItem value="GUARANTOR">Garante</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      Nombre
                    </FormLabel>
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      Teléfono
                    </FormLabel>
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
            </div>

            {needsExtraFields && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        DNI *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="12345678"
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
                  name="workplace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Lugar de Trabajo *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Empresa SA"
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
                  name="fiscalAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Domicilio Fiscal *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Av. Corrientes 1234"
                          className="h-11 border-gray-300 focus:border-[#600096] focus:ring-[#600096]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 mt-2">
              <p className="text-xs text-gray-500 mb-4">Campos opcionales</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Email <span className="text-gray-400">(opcional)</span>
                      </FormLabel>
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
                  name="cbu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        CBU <span className="text-gray-400">(opcional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="CBU para transferencias"
                          maxLength={22}
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
                  name="alias"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Alias <span className="text-gray-400">(opcional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Alias para transferencias"
                          className="h-11 border-gray-300 focus:border-[#600096] focus:ring-[#600096]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {needsExtraFields && (
              <div>
                <FormLabel className="text-sm font-semibold text-gray-700 mb-3 block">
                  Documentos (DNI, Recibos de Sueldo)
                </FormLabel>

                {/* Zona de arrastre */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#600096] transition-colors cursor-pointer bg-gray-50 hover:bg-purple-50"
                  onClick={() =>
                    document.getElementById('document-upload')?.click()
                  }
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add(
                      'border-[#600096]',
                      'bg-purple-50'
                    );
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove(
                      'border-[#600096]',
                      'bg-purple-50'
                    );
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove(
                      'border-[#600096]',
                      'bg-purple-50'
                    );
                    const files = Array.from(e.dataTransfer.files);
                    if (files.length > 0) {
                      setDocuments((prev) => [...prev, ...files]);
                    }
                  }}
                >
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Arrastra los documentos aquí
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    o haz clic para seleccionar archivos
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mx-auto"
                  >
                    <Upload className="mr-2 h-3 w-3" />
                    Seleccionar Documentos
                  </Button>
                  <input
                    id="document-upload"
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleDocumentChange}
                  />
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Imágenes o PDF. Máximo 10MB por archivo.
                </p>

                {/* Documentos existentes */}
                {existingDocuments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Documentos actuales ({existingDocuments.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {existingDocuments.map((doc, index) => {
                        const isImage = doc.url.match(/\.(jpg|jpeg|png|gif)$/i);
                        return (
                          <div key={doc.id} className="relative group">
                            {isImage ? (
                              <img
                                src={doc.url}
                                alt={`Documento ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg border-2 border-gray-200 group-hover:border-[#600096] transition-colors"
                              />
                            ) : (
                              <div className="w-full h-20 bg-gray-100 rounded-lg border-2 border-gray-200 group-hover:border-[#600096] transition-colors flex items-center justify-center">
                                <Upload className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeExistingDocument(doc.id);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded truncate max-w-[90%]">
                              {doc.name.length > 15
                                ? doc.name.substring(0, 12) + '...'
                                : doc.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Vista previa de documentos */}
                {documents.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      {documents.length} documento
                      {documents.length > 1 ? 's' : ''} seleccionado
                      {documents.length > 1 ? 's' : ''}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {documents.map((doc, index) => {
                        const isImage = doc.type.startsWith('image/');
                        return (
                          <div key={index} className="relative group">
                            {isImage ? (
                              <img
                                src={URL.createObjectURL(doc)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg border-2 border-gray-200 group-hover:border-[#600096] transition-colors"
                              />
                            ) : (
                              <div className="w-full h-20 bg-gray-100 rounded-lg border-2 border-gray-200 group-hover:border-[#600096] transition-colors flex items-center justify-center">
                                <Upload className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeDocument(index)}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded truncate max-w-[90%]">
                              {doc.name.length > 15
                                ? doc.name.substring(0, 12) + '...'
                                : doc.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
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
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Guardando...
                  </span>
                ) : client ? (
                  '✓ Actualizar'
                ) : (
                  '✓ Crear Cliente'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
