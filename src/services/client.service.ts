import clientAxios from '@/src/utils/clientAxios';
import { Client, CreateClientInput, UpdateClientInput } from '@/src/lib/zod/client.schema';
import { PaginatedResponse, PaginationParams } from '@/src/utils/pagination';

export const clientService = {
  async getClients(params?: PaginationParams): Promise<PaginatedResponse<Client>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    
    const response = await clientAxios.get(`/clients?${searchParams}`);
    return response.data;
  },

  async getClientById(id: string): Promise<Client> {
    const response = await clientAxios.get(`/clients/${id}`);
    return response.data;
  },

  async createClient(clientData: CreateClientInput): Promise<Client> {
    const response = await clientAxios.post('/clients', clientData);
    return response.data;
  },

  async updateClient(id: string, clientData: UpdateClientInput): Promise<Client> {
    const response = await clientAxios.put(`/clients/${id}`, clientData);
    return response.data;
  },

  async deleteClient(id: string): Promise<void> {
    await clientAxios.delete(`/clients/${id}`);
  },
};