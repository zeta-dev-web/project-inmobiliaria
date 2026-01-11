import { z } from 'zod';

export const rentalSchema = z.object({
  propertyId: z.string().min(1, 'La propiedad es requerida'),
  tenantId: z.string().min(1, 'El inquilino es requerido'),
  landlordId: z.string().min(1, 'El propietario es requerido'),
  guarantorIds: z.array(z.string()).min(1, 'Al menos un garante es requerido'),
  rentalPrice: z
    .number({ message: 'El precio es requerido' })
    .positive('El precio debe ser mayor a 0'),
  updateFrequency: z
    .number({ message: 'La frecuencia es requerida' })
    .int('Debe ser un número entero')
    .positive('La frecuencia debe ser mayor a 0'),
  startDate: z.date({ message: 'La fecha de inicio es requerida' }),
  endDate: z.date({ message: 'La fecha de vencimiento es requerida' }),
  paymentDueDay: z
    .number({ message: 'El día de vencimiento es requerido' })
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1')
    .max(31, 'Máximo 31'),
  lateFee: z
    .number({ message: 'La multa es requerida' })
    .min(0, 'La multa no puede ser negativa'),
  administrationAmount: z
    .number({ message: 'El monto de administración es requerido' })
    .positive('El monto debe ser mayor a 0'),
  administrationType: z.enum(['PERCENTAGE', 'FIXED']),
});

export type RentalFormData = z.infer<typeof rentalSchema>;
