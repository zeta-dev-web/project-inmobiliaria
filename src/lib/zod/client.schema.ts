import { z } from 'zod';

export const clientSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone is required').max(20),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createClientSchema = clientSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateClientSchema = createClientSchema.partial();

export type Client = z.infer<typeof clientSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;