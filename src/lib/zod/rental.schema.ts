import { z } from 'zod';

export const paymentStatusEnum = z.enum(['PAID', 'UNPAID']);

export const rentalSchema = z.object({
  id: z.string().cuid(),
  propertyId: z.string().cuid(),
  clientId: z.string().cuid(),
  startDate: z.date(),
  endDate: z.date(),
  paymentStatus: paymentStatusEnum.default('UNPAID'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createRentalSchema = rentalSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  paymentStatus: true,
}).extend({
  startDate: z.string().datetime().transform((val) => new Date(val)),
  endDate: z.string().datetime().transform((val) => new Date(val)),
});

export const updateRentalSchema = z.object({
  paymentStatus: paymentStatusEnum,
});

export type Rental = z.infer<typeof rentalSchema>;
export type CreateRentalInput = z.infer<typeof createRentalSchema>;
export type UpdateRentalInput = z.infer<typeof updateRentalSchema>;