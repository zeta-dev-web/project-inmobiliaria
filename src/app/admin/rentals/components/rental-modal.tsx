'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clientAxios from '@/utils/clientAxios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';
import { Rental, Property, Client } from '@/generated/prisma';
import {
  Plus,
  X,
  Home,
  User,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Percent,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';

type RentalWithRelations = Rental & {
  property: Property;
  tenants: Array<{ client: Client }>;
  landlord: Client;
  guarantors: Array<{ client: Client }>;
};

interface RentalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rental?: RentalWithRelations;
}

type FormData = {
  propertyId: string;
  rentalPrice: number;
  updateFrequency: number;
  startDate: Date;
  endDate: Date;
  paymentDueDay: number;
  lateFee: number;
  lateFeeType: 'PERCENTAGE' | 'FIXED';
  administrationAmount: number;
  administrationType: 'PERCENTAGE' | 'FIXED';
};

export function RentalModal({ open, onOpenChange, rental }: RentalModalProps) {
  const queryClient = useQueryClient();
  const [tenantIds, setTenantIds] = useState<string[]>([]);
  const [guarantorIds, setGuarantorIds] = useState<string[]>([]);
  const [backendErrors, setBackendErrors] = useState<Record<string, string>>(
    {}
  );

  const { data: properties = [] } = useQuery({
    queryKey: ['properties-for-rental'],
    queryFn: async () => {
      const { data } = await clientAxios.get('/properties');
      return data.data.filter(
        (p: Property & { client?: Client }) =>
          p.type === 'RENT' &&
          (p.status === 'AVAILABLE' || (rental && p.id === rental.propertyId))
      );
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients-for-rental'],
    queryFn: async () => {
      const { data } = await clientAxios.get('/clients');
      return data.data;
    },
  });

  const propertyOptions = (properties || []).map((p: Property) => ({
    value: p.id,
    label: p.name,
    subtitle: p.address,
    icon: <Home className="h-4 w-4 text-purple-500" />,
  }));

  const clientOptions = (clients || []).map((c: Client) => ({
    value: c.id,
    label: c.name,
    subtitle: c.email,
    icon: <User className="h-4 w-4 text-blue-500" />,
  }));

  const { register, handleSubmit, control, reset, setValue, watch } =
    useForm<FormData>({
      defaultValues: {
        administrationType: 'PERCENTAGE',
        lateFeeType: 'PERCENTAGE',
      },
    });

  useEffect(() => {
    if (rental && rental.tenants) {
      setValue('propertyId', rental.propertyId);
      setValue('rentalPrice', rental.rentalPrice);
      setValue('updateFrequency', rental.updateFrequency);
      
      // Handle dates with timezone - extract date parts and create local date
      const startDate = new Date(rental.startDate);
      const endDate = new Date(rental.endDate);
      
      // Create date strings in YYYY-MM-DD format for the input fields
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      setValue('startDate', new Date(startDateStr));
      setValue('endDate', new Date(endDateStr));
      setValue('paymentDueDay', rental.paymentDueDay);
      setValue('lateFee', rental.lateFee);
      setValue('lateFeeType', (rental as any).lateFeeType || 'PERCENTAGE');
      setValue('administrationAmount', rental.administrationAmount);
      setValue('administrationType', rental.administrationType || 'PERCENTAGE');
      setTenantIds(rental.tenants.map((t) => t.client.id));
      setGuarantorIds(rental.guarantors ? rental.guarantors.map((g) => g.client.id) : []);
    } else if (!rental) {
      reset({
        administrationType: 'PERCENTAGE',
        lateFeeType: 'PERCENTAGE',
      });
      setTenantIds([]);
      setGuarantorIds([]);
    }
  }, [rental, reset, setValue]);

  const createMutation = useMutation({
    mutationFn: async (
      data: FormData & {
        tenantIds: string[];
        guarantorIds: string[];
        landlordId: string;
      }
    ) => {
      // Ensure proper data types for API
      const { landlordId, ...restData } = data;
      const payload = {
        ...restData,
        tenantIds,
        guarantorIds,
        landlordId,
        lateFeeType: data.lateFeeType || 'PERCENTAGE',
        administrationType: data.administrationType || 'PERCENTAGE',
        paymentDueDay: Number(data.paymentDueDay),
        updateFrequency: Number(data.updateFrequency),
        rentalPrice: Number(data.rentalPrice),
        lateFee: Number(data.lateFee),
        administrationAmount: Number(data.administrationAmount),
      };
      return clientAxios.post('/rentals', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      toast.success('Alquiler creado exitosamente');
      handleClose();
    },
    onError: (error: any) => {
      console.error('Error creating rental:', error);
      if (error.response?.data?.errors) {
        setBackendErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al crear el alquiler. Por favor, intente nuevamente.');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (
      data: FormData & {
        tenantIds: string[];
        guarantorIds: string[];
        landlordId: string;
      }
    ) => {
      // Ensure proper data types for API
      const { landlordId, ...restData } = data;
      const payload = {
        ...restData,
        tenantIds,
        guarantorIds,
        landlordId,
        lateFeeType: data.lateFeeType || 'PERCENTAGE',
        administrationType: data.administrationType || 'PERCENTAGE',
        paymentDueDay: Number(data.paymentDueDay),
        updateFrequency: Number(data.updateFrequency),
        rentalPrice: Number(data.rentalPrice),
        lateFee: Number(data.lateFee),
        administrationAmount: Number(data.administrationAmount),
      };
      return clientAxios.put(`/rentals/${rental?.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      toast.success('Alquiler actualizado exitosamente');
      handleClose();
    },
    onError: (error: any) => {
      console.error('Error updating rental:', error);
      if (error.response?.data?.errors) {
        setBackendErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al actualizar el alquiler. Por favor, intente nuevamente.');
      }
    },
  });

  const onSubmit = (data: FormData) => {
    setBackendErrors({});
    const landlordId = rental ? rental.landlordId : (selectedProperty?.clientId || '');
    const formData = { ...data, tenantIds, guarantorIds, landlordId };
    if (rental) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const removeTenant = (clientId: string) => {
    setTenantIds(tenantIds.filter((id) => id !== clientId));
  };

  const removeGuarantor = (clientId: string) => {
    setGuarantorIds(guarantorIds.filter((id) => id !== clientId));
  };

  const handleClose = () => {
    reset();
    setTenantIds([]);
    setGuarantorIds([]);
    setBackendErrors({});
    onOpenChange(false);
  };

  const selectedPropertyId = watch('propertyId');
  const selectedProperty = (properties || []).find(
    (p: Property & { client?: Client }) => p.id === selectedPropertyId
  );

  // Auto-set landlord when property is selected
  useEffect(() => {
    if (selectedProperty?.clientId) {
      // Landlord is now auto-set from property
    }
  }, [selectedProperty?.clientId]);

  const availableTenants = clientOptions.filter((c: { value: string }) => {
    const client = clients.find((cl: Client) => cl.id === c.value);
    return (
      client?.clientType === 'TENANT' &&
      !tenantIds.includes(c.value) &&
      c.value !== selectedProperty?.clientId
    );
  });
  const availableGuarantors = clientOptions.filter((c: { value: string }) => {
    const client = clients.find((cl: Client) => cl.id === c.value);
    return (
      client?.clientType === 'GUARANTOR' &&
      !guarantorIds.includes(c.value) &&
      !tenantIds.includes(c.value) &&
      c.value !== selectedProperty?.clientId
    );
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {rental ? 'Editar Alquiler' : 'Nuevo Alquiler'}
          </DialogTitle>
        </DialogHeader>

        {rental && !rental.tenants ? (
          <div className="py-8 text-center text-gray-500">Cargando...</div>
        ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Home className="w-5 h-5 text-[#600096]" />
              <h3 className="font-semibold text-gray-900">
                Información de la Propiedad
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Propiedad *</Label>
                <Controller
                  name="propertyId"
                  control={control}
                  render={({ field }) => (
                    rental ? (
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                        <Input
                          value={
                            rental.property?.name || 'Propiedad no encontrada'
                          }
                          disabled
                          className="pl-10 bg-gray-50 cursor-not-allowed"
                        />
                      </div>
                    ) : (
                      <SearchableSelect
                        options={propertyOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Seleccionar propiedad..."
                        searchPlaceholder="Buscar propiedad..."
                        emptyMessage="No hay propiedades disponibles"
                      />
                    )
                  )}
                />
                {rental && (
                  <p className="text-xs text-blue-600">
                    No se puede cambiar la propiedad al editar un alquiler
                  </p>
                )}
                {backendErrors.propertyId && (
                  <p className="text-sm text-red-500">
                    {backendErrors.propertyId}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Precio de Alquiler *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    step="0.01"
                    {...register('rentalPrice', {
                      setValueAs: (v) => (v === '' ? undefined : parseFloat(v)),
                    })}
                    placeholder={
                      selectedProperty
                        ? selectedProperty.price.toLocaleString('es-AR')
                        : '0.00'
                    }
                    className="pl-10"
                  />
                </div>
                {selectedProperty && (
                  <p className="text-xs text-gray-500">
                    Precio publicado: $
                    {selectedProperty.price.toLocaleString('es-AR')}
                  </p>
                )}
                {backendErrors.rentalPrice && (
                  <p className="text-sm text-red-500">
                    {backendErrors.rentalPrice}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">
                Partes del Contrato
              </h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Propietario (Locador) *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <Input
                    value={
                      rental?.landlord?.name ||
                      (selectedProperty?.clientId
                        ? clients.find(
                            (c: Client) => c.id === selectedProperty.clientId
                          )?.name || 'Propietario no encontrado'
                        : 'Seleccione una propiedad')
                    }
                    disabled
                    className="pl-10 bg-gray-50 cursor-not-allowed"
                  />
                </div>
                {(selectedProperty?.clientId || rental?.landlordId) && (
                  <p className="text-xs text-blue-600">
                    El propietario se asigna automáticamente desde la propiedad
                    seleccionada
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Inquilinos (Locatarios) *
                </Label>
                <SearchableSelect
                  options={availableTenants}
                  value=""
                  onChange={(value) => {
                    if (value && !tenantIds.includes(value)) {
                      setTenantIds([...tenantIds, value]);
                    }
                  }}
                  placeholder="Agregar inquilino..."
                  searchPlaceholder="Buscar cliente..."
                  emptyMessage="No hay más clientes disponibles"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {tenantIds && tenantIds?.length > 0 && tenantIds?.map((id) => {
                    const client = clients.find((c: Client) => c.id === id);
                    return client ? (
                      <div
                        key={id}
                        className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium"
                      >
                        <User className="h-3 w-3" />
                        {client.name}
                        <button
                          type="button"
                          onClick={() => removeTenant(id)}
                          className="ml-1 hover:text-blue-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
                {backendErrors.tenantIds && (
                  <p className="text-sm text-red-500">
                    {backendErrors.tenantIds}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Garantes</Label>
                <SearchableSelect
                  options={availableGuarantors}
                  value=""
                  onChange={(value) => {
                    if (value && !guarantorIds.includes(value)) {
                      setGuarantorIds([...guarantorIds, value]);
                    }
                  }}
                  placeholder="Agregar garante..."
                  searchPlaceholder="Buscar cliente..."
                  emptyMessage="No hay más clientes disponibles"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {guarantorIds && guarantorIds?.length > 0 && guarantorIds?.map((id) => {
                    const client = clients.find((c: Client) => c.id === id);
                    return client ? (
                      <div
                        key={id}
                        className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium"
                      >
                        <Users className="h-3 w-3" />
                        {client.name}
                        <button
                          type="button"
                          onClick={() => removeGuarantor(id)}
                          className="ml-1 hover:text-purple-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
                {backendErrors.guarantorIds && (
                  <p className="text-sm text-red-500">
                    {backendErrors.guarantorIds}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Fechas y Pagos</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Fecha de Inicio *</Label>
                <Input
                  type="date"
                  value={
                    watch('startDate')
                      ? new Date(watch('startDate')).toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) => {
                    const [year, month, day] = e.target.value.split('-').map(Number);
                    const localDate = new Date(year, month - 1, day);
                    setValue('startDate', localDate);
                  }}
                />
                {backendErrors.startDate && (
                  <p className="text-sm text-red-500">
                    {backendErrors.startDate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Fecha de Vencimiento *
                </Label>
                <Input
                  type="date"
                  value={
                    watch('endDate')
                      ? new Date(watch('endDate')).toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) => {
                    const [year, month, day] = e.target.value.split('-').map(Number);
                    const localDate = new Date(year, month - 1, day);
                    setValue('endDate', localDate);
                  }}
                />
                {backendErrors.endDate && (
                  <p className="text-sm text-red-500">
                    {backendErrors.endDate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Día de Vencimiento *
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  {...register('paymentDueDay', {
                    setValueAs: (v) => (v === '' ? undefined : parseInt(v)),
                  })}
                  placeholder="10"
                />
                {backendErrors.paymentDueDay && (
                  <p className="text-sm text-red-500">
                    {backendErrors.paymentDueDay}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">
                Configuración Financiera
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Actualización (meses) *
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    {...register('updateFrequency', {
                      setValueAs: (v) => (v === '' ? undefined : parseInt(v)),
                    })}
                    placeholder="6"
                    className="pl-10"
                  />
                </div>
                {backendErrors.updateFrequency && (
                  <p className="text-sm text-red-500">
                    {backendErrors.updateFrequency}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Multa por Mora *</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    {watch('lateFeeType') === 'PERCENTAGE' ? (
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    ) : (
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    )}
                    <Input
                      type="number"
                      step="0.01"
                      {...register('lateFee', {
                        setValueAs: (v) =>
                          v === '' ? undefined : parseFloat(v),
                      })}
                      placeholder={
                        watch('lateFeeType') === 'PERCENTAGE' ? '10' : '0.00'
                      }
                      className="pl-10"
                    />
                  </div>
                  <Controller
                    name="lateFeeType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PERCENTAGE">%</SelectItem>
                          <SelectItem value="FIXED">$</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                {backendErrors.lateFee && (
                  <p className="text-sm text-red-500">
                    {backendErrors.lateFee}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <Label className="text-sm font-medium">Administración *</Label>
              <div className="flex gap-2 mt-2">
                <div className="relative flex-1">
                  {watch('administrationType') === 'PERCENTAGE' ? (
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  ) : (
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  )}
                  <Input
                    type="number"
                    step="0.01"
                    {...register('administrationAmount', {
                      setValueAs: (v) => (v === '' ? undefined : parseFloat(v)),
                    })}
                    placeholder={
                      watch('administrationType') === 'PERCENTAGE'
                        ? '10'
                        : '0.00'
                    }
                    className="pl-10"
                  />
                </div>
                <Controller
                  name="administrationType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">%</SelectItem>
                        <SelectItem value="FIXED">$</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {backendErrors.administrationAmount && (
                <p className="text-sm text-red-500 mt-1">
                  {backendErrors.administrationAmount}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#600096] hover:bg-[#500080] w-full sm:w-auto"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {rental ? 'Actualizar' : 'Crear'} Alquiler
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
