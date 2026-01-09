import { z } from 'zod';

export const propertyStatusEnum = z.enum(['AVAILABLE', 'RENTED', 'SOLD', 'UNAVAILABLE']);
export const propertyTypeEnum = z.enum(['RENT', 'SALE']);

export const propertySchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, 'Name is required').max(255),
  address: z.string().min(1, 'Address is required').max(255),
  clientId: z.string().cuid().optional().nullable(),
  type: propertyTypeEnum,
  price: z.number().positive('Price must be positive'),
  saleCommission: z.number().min(0).max(100).optional().nullable(),
  description: z.string().optional().nullable(),
  status: propertyStatusEnum.default('AVAILABLE'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createPropertySchema = propertySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePropertySchema = createPropertySchema.partial();

export type Property = z.infer<typeof propertySchema>;
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;