'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Textarea } from '@/components/ui/textarea';
import { Property } from '@/generated/prisma';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import clientAxios from '@/utils/clientAxios';
import { toast } from 'react-toastify';
import { ClientCombobox } from './client-combobox';
import { propertySchema, PropertyFormData } from '@/schemas/property.schema';
import { X, Upload, Building2 } from 'lucide-react';

interface PropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: Property;
}

export function PropertyModal({
  open,
  onOpenChange,
  property,
}: PropertyModalProps) {
  const queryClient = useQueryClient();
  const [photos, setPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<
    { id: string; url: string }[]
  >([]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      setPhotos([]);
      setExistingPhotos([]);
    }
    onOpenChange(isOpen);
  };

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: '',
      address: '',
      clientId: '',
      type: 'RENT',
      price: 0,
      saleCommission: 3,
      description: '',
      status: 'AVAILABLE',
    },
    mode: 'onChange',
  });

  // Actualizar form cuando cambia la propiedad
  useEffect(() => {
    if (property) {
      form.reset({
        name: property.name || '',
        address: property.address || '',
        clientId: property.clientId || '',
        type: property.type || 'RENT',
        price: property.price || 0,
        saleCommission: property.saleCommission || 3,
        description: property.description || '',
        status: property.status || 'AVAILABLE',
        requirements: (property as any).requirements || '',
        documentation: (property as any).documentation || '',
      });
      if ((property as any).photos) {
        setExistingPhotos((property as any).photos);
      }
    } else {
      form.reset({
        name: '',
        address: '',
        clientId: '',
        type: 'RENT',
        price: 0,
        saleCommission: 3,
        description: '',
        status: 'AVAILABLE',
        requirements: '',
        documentation: '',
      });
      setExistingPhotos([]);
    }
  }, [property, form]);

  const createMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      const response = await clientAxios.post('/properties', data);
      if (photos.length > 0) {
        const formData = new FormData();
        photos.forEach((photo) => formData.append('photos', photo));
        await clientAxios.post(
          `/properties/${response.data.id}/photos`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Propiedad creada exitosamente');
      onOpenChange(false);
      form.reset();
      setPhotos([]);
    },
    onError: () => {
      toast.error('Error al crear la propiedad');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      const response = await clientAxios.put(
        `/properties/${property?.id}`,
        data
      );
      if (photos.length > 0) {
        const formData = new FormData();
        photos.forEach((photo) => formData.append('photos', photo));
        await clientAxios.post(`/properties/${property?.id}/photos`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Propiedad actualizada exitosamente');
      onOpenChange(false);
      setPhotos([]);
    },
    onError: () => {
      toast.error('Error al actualizar la propiedad');
    },
  });

  const onSubmit = (data: PropertyFormData) => {
    const submitData = property
      ? data
      : { ...data, status: 'AVAILABLE' as const };

    if (property) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (photos.length + existingPhotos.length + files.length > 10) {
      toast.error('Máximo 10 fotos por propiedad');
      return;
    }

    for (const file of files) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error('Solo se permiten archivos JPG o PNG');
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        toast.error('El tamaño máximo por foto es 15MB');
        return;
      }
    }

    setPhotos((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const removeExistingPhoto = async (photoId: string) => {
    try {
      await clientAxios.delete(`/properties/${property?.id}/photos/${photoId}`);
      setExistingPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
      toast.success('Foto eliminada');
    } catch (error) {
      toast.error('Error al eliminar la foto');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const watchType = form.watch('type');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[#600096]" />
            {property ? 'Editar Propiedad' : 'Nueva Propiedad'}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Nombre *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Casa en Lomas de Tafi"
                          className="focus-visible:ring-[#600096]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Tipo *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="RENT">Alquiler</SelectItem>
                          <SelectItem value="SALE">Venta</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Dirección *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Av. Santa Fe 1234"
                        className="focus-visible:ring-[#600096]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Cliente *
                    </FormLabel>
                    <ClientCombobox
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        {watchType === 'RENT'
                          ? 'Precio Alquiler *'
                          : 'Precio Venta *'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Ingrese el precio"
                          className="focus-visible:ring-[#600096]"
                          value={
                            field.value
                              ? field.value.toLocaleString('es-AR')
                              : ''
                          }
                          onChange={(e) => {
                            const val = e.target.value.replace(/\./g, '');
                            field.onChange(
                              val === '' ? undefined : parseFloat(val)
                            );
                          }}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchType === 'SALE' && (
                  <FormField
                    control={form.control}
                    name="saleCommission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Comisión Venta (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ingrese la comisión"
                            max="100"
                            className="focus-visible:ring-[#600096]"
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(
                                val === '' ? undefined : parseFloat(val)
                              );
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Descripción
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción de la propiedad..."
                        className="resize-none min-h-[100px] focus-visible:ring-[#600096]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {property && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Estado
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AVAILABLE">Disponible</SelectItem>
                          <SelectItem value="RENTED">Alquilada</SelectItem>
                          <SelectItem value="SOLD">Vendida</SelectItem>
                          <SelectItem value="UNAVAILABLE">
                            No Disponible
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Requirements for RENT */}
              {watchType === 'RENT' && (
                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Requerimientos (Opcional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ej: Recibo de sueldo, garantía propietaria, depósito..."
                          className="resize-none min-h-[100px] focus-visible:ring-[#600096]"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Documentation for SALE */}
              {watchType === 'SALE' && (
                <FormField
                  control={form.control}
                  name="documentation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Documentación (Opcional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ej: Escritura, planos, certificados, documentos legales..."
                          className="resize-none min-h-[100px] focus-visible:ring-[#600096]"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Sección de fotos mejorada */}
              <div>
                <FormLabel className="text-sm font-medium mb-3 block">
                  Fotos {!property && '(Opcional)'}
                </FormLabel>

                {/* Zona de arrastre */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#600096] transition-colors cursor-pointer bg-gray-50 hover:bg-purple-50"
                  onClick={() =>
                    document.getElementById('photo-input')?.click()
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
                      const event = { target: { files } } as any;
                      handlePhotoChange(event);
                    }
                  }}
                >
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Arrastra las fotos aquí
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
                    {property ? 'Agregar Más Fotos' : 'Seleccionar Fotos'}
                  </Button>
                  <input
                    id="photo-input"
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Máximo 10 fotos. JPG o PNG. 15MB por foto.
                </p>

                {/* Fotos existentes */}
                {existingPhotos.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Fotos actuales ({existingPhotos.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {existingPhotos.map((photo, index) => (
                        <div key={photo.id} className="relative group">
                          <img
                            src={photo.url}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border-2 border-gray-200 group-hover:border-[#600096] transition-colors"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeExistingPhoto(photo.id);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vista previa de fotos nuevas */}
                {photos.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      {photos.length} foto{photos.length > 1 ? 's' : ''}{' '}
                      {property
                        ? 'nueva' + (photos.length > 1 ? 's' : '')
                        : 'seleccionada' + (photos.length > 1 ? 's' : '')}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border-2 border-gray-200 group-hover:border-[#600096] transition-colors"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removePhoto(index);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </Form>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            className="bg-[#600096] hover:bg-[#500080]"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? 'Guardando...'
              : property
                ? 'Actualizar'
                : 'Crear'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
