import { create } from 'zustand';
import type { Event } from '../types/event';
import { eventsApi } from '../api/events.api';

interface EventsState {
  events: Event[];
  currentEvent: Event | null;
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
  isLoading: boolean;
  error: string | null;

  fetchEvents: (page?: number, size?: number, search?: string, status?: string, category?: string) => Promise<void>;
  fetchEvent: (id: string) => Promise<void>;
  createEvent: (data: any) => Promise<Event>;
  updateEvent: (id: string, data: any) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  clearCurrentEvent: () => void;
  clearError: () => void;
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  currentEvent: null,
  pagination: {
    page: 1,
    size: 20,
    total: 0,
    pages: 0,
  },
  isLoading: false,
  error: null,

  fetchEvents: async (page = 1, size = 20, search?: string, status?: string, category?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await eventsApi.getEvents({ page, size, search, status, category });
      
      set({
        events: response.items,
        pagination: {
          page: response.page,
          size: response.size,
          total: response.total,
          pages: response.pages,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Error al cargar eventos',
        isLoading: false,
      });
    }
  },

  fetchEvent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const event = await eventsApi.getEvent(id);
      
      set({
        currentEvent: event,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Error al cargar evento',
        isLoading: false,
      });
    }
  },

  createEvent: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const event = await eventsApi.createEvent(data);
      set({ isLoading: false });
      return event;
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Error al crear evento',
        isLoading: false,
      });
      throw error;
    }
  },

  updateEvent: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const event = await eventsApi.updateEvent(id, data);
      
      set((state) => ({
        currentEvent: event,
        events: state.events.map((existingEvent) =>
          String(existingEvent.id) === String(id) ? event : existingEvent
        ),
        isLoading: false,
      }));
      
      return event;
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Error al actualizar evento',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteEvent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await eventsApi.deleteEvent(id);
      
      // Remove deleted event from current list
      set((state) => ({
        events: state.events.filter((event) => String(event.id) !== String(id)),
        currentEvent: state.currentEvent && String(state.currentEvent.id) === String(id) ? null : state.currentEvent,
        pagination: {
          ...state.pagination,
          total: Math.max(0, state.pagination.total - 1),
        },
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Error al eliminar evento',
        isLoading: false,
      });
      throw error;
    }
  },

  clearCurrentEvent: () => set({ currentEvent: null }),
  clearError: () => set({ error: null }),
}));
