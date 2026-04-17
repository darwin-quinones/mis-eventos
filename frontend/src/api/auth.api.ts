import { apiClient } from './client';
import type { Token, User, UserCreate } from '../types/user';

export const authApi = {
  register: async (data: UserCreate): Promise<User> => {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string): Promise<Token> => {
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);
    
    const response = await apiClient.post<Token>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', { 
      token, 
      new_password: newPassword 
    });
    return response.data;
  },
};
