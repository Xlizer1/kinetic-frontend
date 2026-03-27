export interface MessageAuthor {
  id: number;
  username: string;
  avatar_url: string;
}

export interface Message {
  id: number;
  channel_id: number;
  author_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  author: MessageAuthor;
}

export interface CreateMessagePayload {
  channel_id: number;
  content: string;
}
