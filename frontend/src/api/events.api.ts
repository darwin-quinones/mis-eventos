import { apiClient } from './client';
import type { Event, EventCreate, EventUpdate } from '../types/event';
import type { PaginatedResponse } from '../types/api';

export const eventsApi = {
  getEvents: async (params?: {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
    category?: string;
  }): Promise<PaginatedResponse<Event>> => {
    const response = await apiClient.get<PaginatedResponse<Event>>('/events', {
      params: {
        ...params,
        _ts: Date.now(),
      },
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });
    return response.data;
  },

  getEvent: async (id: string): Promise<Event> => {
    const response = await apiClient.get<Event>(`/events/${id}`, {
      params: {
        _ts: Date.now(),
      },
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });
    return response.data;
  },

  createEvent: async (data: EventCreate): Promise<Event> => {
    const response = await apiClient.post<Event>('/events', data);
    return response.data;
  },

  updateEvent: async (id: string, data: EventUpdate): Promise<Event> => {
    const response = await apiClient.put<Event>(`/events/${id}`, data);
    return response.data;
  },

  deleteEvent: async (id: string): Promise<void> => {
    await apiClient.delete(`/events/${id}`);
  },
};
