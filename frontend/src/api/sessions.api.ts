import { apiClient } from './client';

export interface SessionCreate {
  title: string;
  description: string;
  speaker_name: string;
  speaker_bio?: string;
  speaker_photo_url?: string;
  start_time: string;
  end_time: string;
  capacity: number;
}

export interface SessionUpdate extends Partial<SessionCreate> {}

export interface Session extends SessionCreate {
  id: string;
  event_id: string;
}

export const sessionsApi = {
  create: async (eventId: string, data: SessionCreate): Promise<Session> => {
    const response = await apiClient.post(`/events/${eventId}/sessions`, data);
    return response.data;
  },

  getAll: async (eventId: string): Promise<Session[]> => {
    const response = await apiClient.get(`/events/${eventId}/sessions`);
    return response.data;
  },

  update: async (eventId: string, sessionId: string, data: SessionUpdate): Promise<Session> => {
    const response = await apiClient.put(`/events/${eventId}/sessions/${sessionId}`, data);
    return response.data;
  },

  delete: async (eventId: string, sessionId: string): Promise<void> => {
    await apiClient.delete(`/events/${eventId}/sessions/${sessionId}`);
  },
};
