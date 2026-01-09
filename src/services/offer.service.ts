import clientAxios from '@/src/utils/clientAxios';
import { Offer, CreateOfferInput, UpdateOfferInput } from '@/src/lib/zod/offer.schema';
import { PaginatedResponse, PaginationParams } from '@/src/utils/pagination';

export const offerService = {
  async getOffers(params?: PaginationParams): Promise<PaginatedResponse<Offer>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    
    const response = await clientAxios.get(`/offers?${searchParams}`);
    return response.data;
  },

  async getOfferById(id: string): Promise<Offer> {
    const response = await clientAxios.get(`/offers/${id}`);
    return response.data;
  },

  async createOffer(offerData: CreateOfferInput): Promise<Offer> {
    const response = await clientAxios.post('/offers', offerData);
    return response.data;
  },

  async updateOffer(id: string, offerData: UpdateOfferInput): Promise<Offer> {
    const response = await clientAxios.put(`/offers/${id}`, offerData);
    return response.data;
  },

  async deleteOffer(id: string): Promise<void> {
    await clientAxios.delete(`/offers/${id}`);
  },
};