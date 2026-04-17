export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
  capacity: number;
  current_attendees: number;
  status: string;
  cover_image_url: string | null;
  category: string | null;
  tags: string | null;
  organizer_id: string;
  created_at: string;
  updated_at: string;
}

export interface EventCreate {
  title: string;
  description: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
  capacity: number;
  status: string;
  cover_image_url?: string | null;
  category?: string | null;
  tags?: string | null;
}

export interface EventUpdate {
  title?: string;
  description?: string;
  location?: string;
  start_datetime?: string;
  end_datetime?: string;
  capacity?: number;
  status?: string;
  cover_image_url?: string | null;
  category?: string | null;
  tags?: string | null;
}
