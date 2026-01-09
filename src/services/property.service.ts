import clientAxios from '@/src/utils/clientAxios';
import { Property, CreatePropertyInput, UpdatePropertyInput } from '@/src/lib/zod/property.schema';
import { PaginatedResponse, PaginationParams } from '@/src/utils/pagination';

export const propertyService = {
  async getProperties(params?: PaginationParams): Promise<PaginatedResponse<Property>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    
    const response = await clientAxios.get(`/properties?${searchParams}`);
    return response.data;
  },

  async getPropertyById(id: string): Promise<Property> {
    const response = await clientAxios.get(`/properties/${id}`);
    return response.data;
  },

  async createProperty(propertyData: CreatePropertyInput): Promise<Property> {
    const response = await clientAxios.post('/properties', propertyData);
    return response.data;
  },

  async updateProperty(id: string, propertyData: UpdatePropertyInput): Promise<Property> {
    const response = await clientAxios.put(`/properties/${id}`, propertyData);
    return response.data;
  },

  async deleteProperty(id: string): Promise<void> {
    await clientAxios.delete(`/properties/${id}`);
  },
};