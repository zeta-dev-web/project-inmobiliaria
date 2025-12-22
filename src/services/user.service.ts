import clientAxios from '@/src/utils/clientAxios';
import { User } from '@/src/lib/zod/user.schema';

export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await clientAxios.get('/users');
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await clientAxios.get(`/users/${id}`);
    return response.data;
  },

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const response = await clientAxios.post('/users', userData);
    return response.data;
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await clientAxios.put(`/users/${id}`, userData);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await clientAxios.delete(`/users/${id}`);
  },
};