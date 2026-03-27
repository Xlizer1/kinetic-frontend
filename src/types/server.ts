import { User } from './user';
import { Channel } from './channel';

export interface Server {
  id: number;
  owner_id: number;
  name: string;
  icon_url: string;
  invite_code: string;
  created_at: string;
  updated_at: string;
  owner?: User;
  channels?: Channel[];
  members?: ServerMember[];
}

export interface ServerMember {
  id: number;
  user_id: number;
  server_id: number;
  nickname: string;
  role: string;
  joined_at: string;
  created_at: string;
  updated_at: string;
  user?: User;
  server?: Server;
}

export interface CreateServerPayload {
  name: string;
  icon_url?: string;
}

export interface UpdateServerPayload {
  name?: string;
  icon_url?: string;
}

export interface JoinServerPayload {
  invite_code: string;
}
