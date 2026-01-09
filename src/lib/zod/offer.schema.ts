import { z } from 'zod';

export const offerStatusEnum = z.enum(['PENDING', 'ACCEPTED', 'REJECTED']);

export const offerSchema = z.object({
  id: z.string().cuid(),
  propertyId: z.string().cuid(),
  offeringPerson: z.string().min(1, 'Offering person is required').max(100),
  status: offerStatusEnum.default('PENDING'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createOfferSchema = offerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export const updateOfferSchema = z.object({
  status: offerStatusEnum,
});

export type Offer = z.infer<typeof offerSchema>;
export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;