import { apiClient } from './client';
import type { User } from '../types/user';

export interface PaginatedUsers {
  items: User[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface UserUpdate {
  full_name?: string;
  email?: string;
  role?: 'asistente' | 'organizador' | 'admin';
}

export const adminApi = {
  getUsers: async (page: number = 1, size: number = 20): Promise<PaginatedUsers> => {
    const response = await apiClient.get('/admin/users', {
      params: { page, size }
    });
    return response.data;
  },

  updateUser: async (userId: string, data: UserUpdate): Promise<User> => {
    const response = await apiClient.put(`/admin/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },
};
