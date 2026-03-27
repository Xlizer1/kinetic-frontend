import { API_BASE } from '../utils/constants';
import { AuthResponse } from '../types/auth';
import { User, UpdateUserPayload, UpdateSettingsPayload } from '../types/user';
import { Server, CreateServerPayload, UpdateServerPayload, JoinServerPayload } from '../types/server';
import { Channel, CreateChannelPayload, UpdateChannelPayload } from '../types/channel';
import { Message } from '../types/message';

// ─── API Response Wrapper ───
// Backend may wrap responses in { success, data } or return raw.
// We handle both cases.

interface WrappedResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ─── API Client ───

class ApiClient {
  public token: string | null = null;
  private userId: number | null = null;

  // ── Token Management ──

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('kinetic_token', token);
  }

  setUserId(id: number) {
    this.userId = id;
    localStorage.setItem('kinetic_user_id', String(id));
  }

  loadFromStorage() {
    this.token = localStorage.getItem('kinetic_token');
    const storedId = localStorage.getItem('kinetic_user_id');
    this.userId = storedId ? Number(storedId) : null;
  }

  clearTokens() {
    this.token = null;
    this.userId = null;
    localStorage.removeItem('kinetic_token');
    localStorage.removeItem('kinetic_user_id');
  }

  // ── Core Request Method ──

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 — session expired, redirect to login
    if (response.status === 401) {
      this.clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    const json = await response.json();

    // Handle both wrapped { success, data } and raw responses
    if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
      return (json as WrappedResponse<T>).data;
    }

    return json as T;
  }

  // ── Auth Endpoints ──

  register(email: string, username: string, password: string) {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
  }

  login(email: string, password: string) {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  forgotPassword(email: string) {
    return this.request<string>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  resetPassword(token: string, password: string) {
    return this.request<string>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  verifyEmail(token: string) {
    return this.request<string>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  refreshToken(refreshToken: string) {
    return this.request<string>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  // ── 2FA / QR Endpoints ──

  getQRCode() {
    return this.request<string>('/auth/qr-code');
  }

  verifyQRCode(code: string) {
    return this.request<string>('/auth/qr-verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // ── User Endpoints ──
  // Swagger uses /users/{id} not /users/@me

  getMe() {
    if (!this.userId) throw new Error('User ID not set');
    return this.request<User>(`/users/${this.userId}`);
  }

  updateMe(data: UpdateUserPayload) {
    if (!this.userId) throw new Error('User ID not set');
    return this.request<User>(`/users/${this.userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  updateSettings(data: UpdateSettingsPayload) {
    if (!this.userId) throw new Error('User ID not set');
    return this.request<string>(`/users/${this.userId}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ── Server Endpoints ──

  getServers() {
    return this.request<Server[]>('/servers');
  }

  createServer(data: CreateServerPayload) {
    return this.request<Server>('/servers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getServer(serverId: number) {
    return this.request<Server>(`/servers/${serverId}`);
  }

  updateServer(serverId: number, data: UpdateServerPayload) {
    return this.request<Server>(`/servers/${serverId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  deleteServer(serverId: number) {
    return this.request<string>(`/servers/${serverId}`, {
      method: 'DELETE',
    });
  }

  joinServer(data: JoinServerPayload) {
    return this.request<Server>('/servers/join', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  leaveServer(serverId: number) {
    return this.request<string>(`/servers/${serverId}/leave`, {
      method: 'POST',
    });
  }

  // ── Channel Endpoints ──

  getChannels(serverId: number) {
    return this.request<Channel[]>(`/servers/${serverId}/channels`);
  }

  createChannel(data: CreateChannelPayload) {
    return this.request<Channel>('/channels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getChannel(channelId: number) {
    return this.request<Channel>(`/channels/${channelId}`);
  }

  updateChannel(channelId: number, data: UpdateChannelPayload) {
    return this.request<Channel>(`/channels/${channelId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  deleteChannel(channelId: number) {
    return this.request<string>(`/channels/${channelId}`, {
      method: 'DELETE',
    });
  }

  // ── Message Endpoints ──

  getMessages(channelId: number, limit = 50, offset = 0) {
    return this.request<Message[]>(
      `/channels/${channelId}/messages?limit=${limit}&offset=${offset}`
    );
  }

  sendMessage(channelId: number, content: string) {
    return this.request<Message>(`/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ channel_id: channelId, content }),
    });
  }

  deleteMessage(channelId: number, messageId: number) {
    return this.request<string>(`/channels/${channelId}/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  // ── Voice Endpoints ──

  joinVoiceChannel(channelId: number) {
    return this.request<unknown>(`/channels/${channelId}/voice/join`, {
      method: 'POST',
    });
  }

  leaveVoiceChannel(channelId: number) {
    return this.request<string>(`/channels/${channelId}/voice/leave`, {
      method: 'POST',
    });
  }

  getVoiceUsers(channelId: number) {
    return this.request<unknown[]>(`/channels/${channelId}/voice`);
  }
}

export const api = new ApiClient();
