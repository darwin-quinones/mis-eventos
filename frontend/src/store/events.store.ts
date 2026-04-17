import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Event } from '../types/event';
import { eventsApi } from '../api/events.api';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

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
  cache: {
    events: Record<string, CacheEntry<Event[]>>;
    eventDetails: Record<string, CacheEntry<Event>>;
  };

  fetchEvents: (page?: number, size?: number, search?: string, status?: string, category?: string, forceRefresh?: boolean) => Promise<void>;
  fetchEvent: (id: string, forceRefresh?: boolean) => Promise<void>;
  createEvent: (data: any) => Promise<Event>;
  updateEvent: (id: string, data: any) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  clearCurrentEvent: () => void;
  clearError: () => void;
  clearCache: () => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_TTL;
};

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
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
      cache: {
        events: {},
        eventDetails: {},
      },

      fetchEvents: async (page = 1, size = 20, search?: string, status?: string, category?: string, forceRefresh = false) => {
        const cacheKey = `${page}-${size}-${search || ''}-${status || ''}-${category || ''}`;
        const cached = get().cache.events[cacheKey];

        // Return cached data if valid and not forcing refresh
        if (!forceRefresh && cached && isCacheValid(cached.timestamp)) {
          set({
            events: cached.data,
            isLoading: false,
          });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await eventsApi.getEvents({ page, size, search, status, category });
          
          // Update cache
          set((state) => ({
            events: response.items,
            pagination: {
              page: response.page,
              size: response.size,
              total: response.total,
              pages: response.pages,
            },
            isLoading: false,
            cache: {
              ...state.cache,
              events: {
                ...state.cache.events,
                [cacheKey]: {
                  data: response.items,
                  timestamp: Date.now(),
                },
              },
            },
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Error al cargar eventos',
            isLoading: false,
          });
        }
      },

      fetchEvent: async (id: string, forceRefresh = false) => {
        const cached = get().cache.eventDetails[id];

        // Return cached data if valid and not forcing refresh
        if (!forceRefresh && cached && isCacheValid(cached.timestamp)) {
          set({
            currentEvent: cached.data,
            isLoading: false,
          });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const event = await eventsApi.getEvent(id);
          
          // Update cache and clear events list cache to ensure consistency
          set((state) => ({
            currentEvent: event,
            isLoading: false,
            cache: {
              events: {}, // Clear events list cache when fetching individual event
              eventDetails: {
                ...state.cache.eventDetails,
                [id]: {
                  data: event,
                  timestamp: Date.now(),
                },
              },
            },
          }));
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
          
          // Clear events cache after creating
          set((state) => ({
            isLoading: false,
            cache: {
              ...state.cache,
              events: {},
            },
          }));
          
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
          
          // Clear caches after updating
          set((state) => ({
            currentEvent: event,
            isLoading: false,
            cache: {
              events: {},
              eventDetails: {
                ...state.cache.eventDetails,
                [id]: {
                  data: event,
                  timestamp: Date.now(),
                },
              },
            },
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
          
          // Clear caches and remove event from current list
          set((state) => {
            const { [id]: removed, ...remainingDetails } = state.cache.eventDetails;
            return {
              // Remove deleted event from events list
              events: state.events.filter(event => event.id !== id),
              isLoading: false,
              cache: {
                events: {}, // Clear events cache to force refresh
                eventDetails: remainingDetails,
              },
            };
          });
          
          // Force clear persisted cache in localStorage
          get().clearCache();
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
      clearCache: () => set({ cache: { events: {}, eventDetails: {} } }),
    }),
    {
      name: 'events-cache',
      partialize: (state) => ({
        cache: state.cache,
      }),
    }
  )
);
