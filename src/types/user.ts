import { ServerMember } from './server';

export interface User {
  id: number;
  email: string;
  username: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
  servers?: ServerMember[];
}

// Settings are separate — only theme and language per Swagger
export interface UserSettings {
  theme: string;
  language: string;
}

export interface UpdateUserPayload {
  username?: string;
  avatar_url?: string;
}

export interface UpdateSettingsPayload {
  theme?: string;
  language?: string;
}
