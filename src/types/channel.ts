export interface Channel {
  id: number;
  server_id: number;
  name: string;
  type: 'text' | 'voice';
  topic: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CreateChannelPayload {
  server_id: number;
  name: string;
  type: 'text' | 'voice';
  topic?: string;
}

export interface UpdateChannelPayload {
  name?: string;
  topic?: string;
  position?: number;
}
