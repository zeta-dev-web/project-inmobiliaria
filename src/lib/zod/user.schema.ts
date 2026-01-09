import { z } from 'zod';
import { USER_ROLES } from '@/src/constants/roles.constants';

export const userSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  dni: z.string().min(7, 'DNI must be at least 7 digits').max(8, 'DNI must be at most 8 digits').optional(),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.USER]).default(USER_ROLES.USER),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  dni: z.string().min(7, 'DNI must be at least 7 digits').max(8, 'DNI must be at most 8 digits').optional(),
});

export type User = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;