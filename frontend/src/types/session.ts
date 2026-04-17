export interface Session {
  id: string;
  event_id: string;
  title: string;
  description: string;
  speaker_name: string;
  start_time: string;
  end_time: string;
  capacity: number;
  created_at: string;
  updated_at: string;
}

export interface SessionCreate {
  title: string;
  description: string;
  speaker_name: string;
  start_time: string;
  end_time: string;
  capacity: number;
}
