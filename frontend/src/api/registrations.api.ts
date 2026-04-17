import { apiClient } from './client';
import type { Event } from '../types/event';
import type { RegistrationMessage } from '../types/api';

export const registrationsApi = {
  register: async (eventId: string): Promise<RegistrationMessage> => {
    const response = await apiClient.post<RegistrationMessage>(`/events/${eventId}/register`);
    return response.data;
  },

  unregister: async (eventId: string): Promise<RegistrationMessage> => {
    const response = await apiClient.delete<RegistrationMessage>(`/events/${eventId}/register`);
    return response.data;
  },

  getMyEvents: async (): Promise<Event[]> => {
    const response = await apiClient.get<Event[]>('/users/me/events');
    return response.data;
  },
};
