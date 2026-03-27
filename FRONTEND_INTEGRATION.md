# Frontend Integration Guide - Kinetic Backend

## Overview

This document provides complete integration guidance for building a React frontend that interfaces with the Kinetic backend. It covers authentication, REST APIs, WebSocket communication, and voice calling features.

**Base URL**: `http://localhost:8080`  
**WebSocket URL**: `ws://localhost:8080/ws`  
**API Base Path**: `/api`

---

## Table of Contents

1. [Authentication](#authentication)
2. [REST API Reference](#rest-api-reference)
3. [Data Models](#data-models)
4. [WebSocket Integration](#websocket-integration)
5. [Voice & WebRTC](#voice--webrtc)
6. [React Implementation Examples](#react-implementation-examples)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

---

## Authentication

### Token Structure

The backend uses JWT tokens:
- **Access Token**: 24 hours expiry, used for API authorization
- **Refresh Token**: 7 days expiry, used to obtain new access tokens

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Register  │ ──► │   Login     │ ──► │  API Calls  │
│  /register  │     │  /login     │     │  (with JWT) │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                         ┌─────────────┐
                                         │  Refresh    │
                                         │ /refresh-token
                                         └─────────────┘
```

### Register User

**Endpoint**: `POST /api/auth/register`

```typescript
// Request
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "avatar_url": "",
      "settings": "{\"theme\":\"light\",\"language\":\"en\",\"notifications\":true,\"privacy\":\"everyone\"}",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User

**Endpoint**: `POST /api/auth/login`

```typescript
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "user": { /* User object */ },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Refresh Token

**Endpoint**: `POST /api/auth/refresh-token`

```typescript
// Request
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "user": { /* User object */ },
    "token": "new_access_token...",
    "refresh_token": "new_refresh_token..."
  }
}
```

### Forgot Password

**Endpoint**: `POST /api/auth/forgot-password`

```typescript
// Request
{
  "email": "user@example.com"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "message": "Password reset link generated",
    "reset_link": "/reset-password?token=abc123..."
  }
}
```

### Reset Password

**Endpoint**: `POST /api/auth/reset-password`

```typescript
// Request
{
  "token": "abc123...",
  "new_password": "newpassword123"
}

// Response (200 OK)
{
  "success": true,
  "data": "Password reset successful"
}
```

### Verify Email (Placeholder)

**Endpoint**: `POST /api/auth/verify-email`

```typescript
// Request
{
  "token": "verification_token"
}

// Response (200 OK)
{
  "success": true,
  "data": "Email verification placeholder - implementation pending"
}
```

---

## REST API Reference

### Authorization Header

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

### Users

#### Get Current User

**Endpoint**: `GET /api/users/@me`

```typescript
// Response (200 OK)
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "avatar_url": "",
    "settings": "{\"theme\":\"light\",\"language\":\"en\",\"notifications\":true,\"privacy\":\"everyone\"}",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Current User

**Endpoint**: `PATCH /api/users/@me`

```typescript
// Request
{
  "username": "newname",      // optional
  "avatar_url": "https://..." // optional
}

// Response (200 OK)
{
  "success": true,
  "data": { /* Updated User object */ }
}
```

#### Update User Settings

**Endpoint**: `PATCH /api/users/@me/settings`

```typescript
// Request
{
  "theme": "dark",           // "light" | "dark" | ""
  "language": "es",          // "" = any language code
  "notifications": false,    // boolean or omit
  "privacy": "friends"       // "everyone" | "friends" | "none" | ""
}

// Response (200 OK)
{
  "success": true,
  "data": { /* Updated User object with parsed settings */ }
}
```

### Servers

#### Get User Servers

**Endpoint**: `GET /api/servers`

```typescript
// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "id": 1,
      "owner_id": 1,
      "name": "My Server",
      "icon_url": "",
      "invite_code": "abc123xyz",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Server

**Endpoint**: `POST /api/servers`

```typescript
// Request
{
  "name": "New Server Name"
}

// Response (200 OK)
{
  "success": true,
  "data": { /* Server object with generated invite_code */ }
}
```

#### Get Server

**Endpoint**: `GET /api/servers/:id`

```typescript
// Response (200 OK)
{
  "success": true,
  "data": { /* Server object with channels and members */ }
}
```

#### Update Server

**Endpoint**: `PATCH /api/servers/:id`

```typescript
// Request
{
  "name": "Updated Name",    // optional
  "icon_url": "https://..."  // optional
}

// Response (200 OK)
{
  "success": true,
  "data": { /* Updated Server object */ }
}
```

#### Delete Server

**Endpoint**: `DELETE /api/servers/:id`

```typescript
// Response (200 OK)
{
  "success": true,
  "data": "Server deleted"
}
```

#### Join Server

**Endpoint**: `POST /api/servers/join`

```typescript
// Request
{
  "invite_code": "abc123xyz"
}

// Response (200 OK)
{
  "success": true,
  "data": { /* Server object */ }
}
```

#### Leave Server

**Endpoint**: `POST /api/servers/:id/leave`

```typescript
// Response (200 OK)
{
  "success": true,
  "data": "Left server successfully"
}
```

#### Get Server Channels

**Endpoint**: `GET /api/servers/:id/channels`

```typescript
// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "id": 1,
      "server_id": 1,
      "name": "general",
      "type": "text",
      "topic": "",
      "position": 0,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Channels

#### Create Channel

**Endpoint**: `POST /api/channels`

```typescript
// Request
{
  "server_id": 1,
  "name": "new-channel",
  "type": "text",       // "text" | "voice"
  "topic": "Channel topic" // optional
}

// Response (200 OK)
{
  "success": true,
  "data": { /* Channel object */ }
}
```

#### Get Channel

**Endpoint**: `GET /api/channels/:id`

```typescript
// Response (200 OK)
{
  "success": true,
  "data": { /* Channel object */ }
}
```

#### Update Channel

**Endpoint**: `PATCH /api/channels/:id`

```typescript
// Request
{
  "name": "updated-name",  // optional
  "topic": "new topic",    // optional
  "position": 1           // optional
}

// Response (200 OK)
{
  "success": true,
  "data": { /* Updated Channel object */ }
}
```

#### Delete Channel

**Endpoint**: `DELETE /api/channels/:id`

```typescript
// Response (200 OK)
{
  "success": true,
  "data": "Channel deleted"
}
```

### Messages

#### Get Channel Messages

**Endpoint**: `GET /api/channels/:id/messages`

Query Parameters:
- `limit`: number (default: 50)
- `offset`: number (default: 0)

```typescript
// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "id": 1,
      "channel_id": 1,
      "author_id": 1,
      "content": "Hello world!",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "author": {
        "id": 1,
        "username": "johndoe",
        "avatar_url": ""
      }
    }
  ]
}
```

#### Create Message

**Endpoint**: `POST /api/channels/:id/messages`

```typescript
// Request
{
  "channel_id": 1,
  "content": "Hello from frontend!"
}

// Response (200 OK)
{
  "success": true,
  "data": { /* Message object */ }
}
```

#### Delete Message

**Endpoint**: `DELETE /api/channels/:id/messages/:messageId`

```typescript
// Response (200 OK)
{
  "success": true,
  "data": "Message deleted"
}
```

---

## Data Models

### User

```typescript
interface User {
  id: number;
  email: string;
  username: string;
  avatar_url: string;
  settings: string; // JSON string, see UserSettings
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
```

### UserSettings

```typescript
interface UserSettings {
  theme: "light" | "dark" | "";
  language: string;
  notifications: boolean;
  privacy: "everyone" | "friends" | "none" | "";
}
```

### Server

```typescript
interface Server {
  id: number;
  owner_id: number;
  name: string;
  icon_url: string;
  invite_code: string;
  created_at: string;
  updated_at: string;
}
```

### Channel

```typescript
interface Channel {
  id: number;
  server_id: number;
  name: string;
  type: "text" | "voice";
  topic: string;
  position: number;
  created_at: string;
  updated_at: string;
}
```

### Message

```typescript
interface Message {
  id: number;
  channel_id: number;
  author_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  author: {
    id: number;
    username: string;
    avatar_url: string;
  };
}
```

### ServerMember

```typescript
interface ServerMember {
  id: number;
  user_id: number;
  server_id: number;
  nickname: string;
  role: "member" | "admin" | "owner";
  joined_at: string;
}
```

---

## WebSocket Integration

### Connection

Connect to `ws://localhost:8080/ws` and authenticate by sending an AUTHENTICATE event immediately after connection.

```typescript
// React WebSocket hook example
const useWebSocket = (token: string) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080/ws');

    socket.onopen = () => {
      setConnected(true);
      // Authenticate immediately
      socket.send(JSON.stringify({
        type: 'AUTHENTICATE',
        payload: { token }
      }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    setWs(socket);
    return () => socket.close();
  }, [token]);

  return { ws, connected };
};
```

### WebSocket Event Types

#### Client → Server Events

| Event | Description | Payload |
|-------|-------------|---------|
| `AUTHENTICATE` | Authenticate connection | `{ token: string }` |
| `JOIN_ROOM` | Join text channel room | `{ channel_id: number }` |
| `LEAVE_ROOM` | Leave text channel room | `{ channel_id: number }` |
| `SEND_MESSAGE` | Send message to channel | `{ channel_id: number, content: string }` |
| `TYPING_START` | User started typing | `{ channel_id: number }` |
| `TYPING_STOP` | User stopped typing | `{ channel_id: number }` |
| `VOICE_JOIN` | Join voice channel | `{ channel_id: number }` |
| `VOICE_LEAVE` | Leave voice channel | `{ channel_id: number }` |
| `VOICE_SIGNAL` | WebRTC signaling | `{ channel_id, target_user_id, sdp/candidate, type }` |
| `PRESENCE_UPDATE` | Update presence status | `{ status: string }` |

#### Server → Client Events

| Event | Description | Payload |
|-------|-------------|---------|
| `AUTHENTICATE` | Auth response | `{ success: boolean, user_id, username }` |
| `NEW_MESSAGE` | New message in channel | `{ id, channel_id, author_id, content, username, created_at }` |
| `USER_JOINED` | User joined channel | `{ user_id, username }` |
| `USER_LEFT` | User left channel | `{ user_id, username }` |
| `TYPING` | User typing indicator | `{ channel_id, user_id, username }` |
| `ERROR` | Error message | `{ message: string }` |
| `PRESENCE_LIST` | Initial presence list | `{ users: [{ user_id, username, status }] }` |
| `PRESENCE_UPDATE` | User presence changed | `{ user_id, username, status }` |
| `VOICE_JOIN` | Joined voice channel | `{ channel_id, users: [] }` |
| `VOICE_LEAVE` | Left voice channel | `{ channel_id }` |
| `VOICE_USER_JOINED` | User joined voice | `{ channel_id, user_id, username }` |
| `VOICE_USER_LEFT` | User left voice | `{ channel_id, user_id, username }` |
| `VOICE_OFFER` | WebRTC offer received | `{ channel_id, target_user_id, sdp }` |
| `VOICE_ANSWER` | WebRTC answer received | `{ channel_id, target_user_id, sdp }` |
| `ICE_CANDIDATE` | ICE candidate received | `{ channel_id, target_user_id, candidate }` |

### Sending Events

```typescript
// Helper to send events
const sendEvent = (ws: WebSocket, type: string, payload: object) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, payload }));
  }
};

// Examples
sendEvent(ws, 'JOIN_ROOM', { channel_id: 1 });
sendEvent(ws, 'SEND_MESSAGE', { channel_id: 1, content: 'Hello!' });
sendEvent(ws, 'TYPING_START', { channel_id: 1 });
```

---

## Voice & WebRTC

### Architecture

The backend handles **signaling only** - it relays WebRTC offers, answers, and ICE candidates between peers. The actual audio processing happens peer-to-peer in the browser using WebRTC.

```
┌──────────┐    Signaling    ┌──────────┐
│ Client A │ ◄──────────────► │ Backend  │ ◄──────────────► Client B
│ (WebRTC) │   (WebSocket)   │  (Relay) │   (WebSocket)   (WebRTC)
└──────────┘                 └──────────┘
```

### Voice Channel Flow

```
1. User clicks "Join Voice" in UI
   │
   ▼
2. Frontend sends WebSocket event: VOICE_JOIN { channel_id }
   │
   ▼
3. Backend:
   - Adds user to voice state in DB
   - Creates/joins VoiceRooms map
   - Broadcasts VOICE_USER_JOINED to other users in channel
   - Sends VOICE_JOIN to user with list of existing voice users
   │
   ▼
4. Frontend receives VOICE_JOIN, starts WebRTC connections
   │
   ▼
5. For each existing user: Create RTCPeerConnection, send offer
   │
   ▼
6. Other users receive VOICE_OFFER, create answer, exchange ICE
   │
   ▼
7. When user leaves: send VOICE_JOIN, backend cleans up
```

### React Implementation

#### Voice State Management

```typescript
// types/voice.ts
interface VoiceState {
  channelId: number | null;
  users: VoiceUser[];
  localStream: MediaStream | null;
  peerConnections: Map<number, RTCPeerConnection>;
}

interface VoiceUser {
  userId: number;
  username: string;
  stream: MediaStream | null;
}
```

#### Voice Context

```typescript
// context/VoiceContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

interface VoiceContextType {
  channelId: number | null;
  users: VoiceUser[];
  joinVoice: (channelId: number) => void;
  leaveVoice: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const VoiceContext = createContext<VoiceContextType | null>(null);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [channelId, setChannelId] = useState<number | null>(null);
  const [users, setUsers] = useState<VoiceUser[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peerConnections, setPeerConnections] = useState<Map<number, RTCPeerConnection>>(new Map());
  const [isMuted, setIsMuted] = useState(false);

  const joinVoice = useCallback(async (channelId: number) => {
    // Get local audio stream
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    setLocalStream(stream);
    setChannelId(channelId);

    // Send WebSocket event
    sendEvent(ws, 'VOICE_JOIN', { channel_id: channelId });
  }, []);

  const leaveVoice = useCallback(() => {
    // Stop local stream
    localStream?.getTracks().forEach(track => track.stop());
    setLocalStream(null);

    // Close all peer connections
    peerConnections.forEach(pc => pc.close());
    setPeerConnections(new Map());
    setUsers([]);
    setChannelId(null);

    // Send WebSocket event
    if (channelId) {
      sendEvent(ws, 'VOICE_LEAVE', { channel_id: channelId });
    }
  }, [localStream, peerConnections, channelId]);

  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  }, [localStream, isMuted]);

  return (
    <VoiceContext.Provider value={{ channelId, users, joinVoice, leaveVoice, isMuted, toggleMute }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) throw new Error('useVoice must be used within VoiceProvider');
  return context;
};
```

#### WebRTC Peer Connection Management

```typescript
// hooks/useWebRTC.ts
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const useWebRTC = (ws: WebSocket, localStream: MediaStream | null) => {
  const [peerConnections, setPeerConnections] = useState<Map<number, RTCPeerConnection>>(new Map());

  const createPeerConnection = useCallback((userId: number, onIceCandidate: (candidate: RTCIceCandidate) => void) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local stream
    localStream?.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
    });

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendEvent(ws, 'VOICE_SIGNAL', {
          channel_id: currentChannelId,
          target_user_id: userId,
          candidate: JSON.stringify(event.candidate),
          type: 'ice'
        });
      }
    };

    // Handle incoming stream
    pc.ontrack = (event) => {
      // Update user stream in state
      updateUserStream(userId, event.streams[0]);
    };

    setPeerConnections(prev => new Map(prev).set(userId, pc));
    return pc;
  }, [ws, localStream]);

  const handleOffer = useCallback(async (fromUserId: number, sdp: string) => {
    let pc = peerConnections.get(fromUserId);
    if (!pc) {
      pc = createPeerConnection(fromUserId, () => {});
    }

    await pc.setRemoteDescription(JSON.parse(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    sendEvent(ws, 'VOICE_SIGNAL', {
      channel_id: currentChannelId,
      target_user_id: fromUserId,
      sdp: JSON.stringify(answer),
      type: 'answer'
    });
  }, [peerConnections, createPeerConnection, ws]);

  const handleAnswer = useCallback(async (fromUserId: number, sdp: string) => {
    const pc = peerConnections.get(fromUserId);
    if (pc) {
      await pc.setRemoteDescription(JSON.parse(sdp));
    }
  }, [peerConnections]);

  const handleIceCandidate = useCallback(async (fromUserId: number, candidate: string) => {
    const pc = peerConnections.get(fromUserId);
    if (pc) {
      await pc.addIceCandidate(JSON.parse(candidate));
    }
  }, [peerConnections]);

  // Call this from WebSocket message handler
  const handleVoiceSignal = useCallback((data: {
    channel_id: number;
    target_user_id: number;
    sdp?: string;
    candidate?: string;
    type: 'offer' | 'answer' | 'ice';
  }) => {
    switch (data.type) {
      case 'offer':
        handleOffer(data.target_user_id, data.sdp!);
        break;
      case 'answer':
        handleAnswer(data.target_user_id, data.sdp!);
        break;
      case 'ice':
        handleIceCandidate(data.target_user_id, data.candidate!);
        break;
    }
  }, [handleOffer, handleAnswer, handleIceCandidate]);

  return { peerConnections, handleVoiceSignal };
};
```

#### Handling Voice WebSocket Events

```typescript
// In your WebSocket message handler
const handleWebSocketMessage = (event: { type: string; payload: any }) => {
  switch (event.type) {
    case 'VOICE_JOIN':
      // Successfully joined voice
      setVoiceUsers(event.payload.users);
      break;

    case 'VOICE_USER_JOINED':
      // New user joined - create peer connection and send offer
      createPeerConnectionAndSendOffer(event.payload.user_id);
      break;

    case 'VOICE_USER_LEFT':
      // User left - close peer connection
      closePeerConnection(event.payload.user_id);
      break;

    case 'VOICE_OFFER':
      // Received WebRTC offer - create answer
      handleOffer(event.payload.target_user_id, event.payload.sdp);
      break;

    case 'VOICE_ANSWER':
      // Received WebRTC answer
      handleAnswer(event.payload.target_user_id, event.payload.sdp);
      break;

    case 'ICE_CANDIDATE':
      // Received ICE candidate
      handleIceCandidate(event.payload.target_user_id, event.payload.candidate);
      break;
  }
};
```

---

## React Implementation Examples

### API Client

```typescript
// api/client.ts
const API_BASE = 'http://localhost:8080/api';

class ApiClient {
  private token: string | null = null;
  private refreshToken: string | null = null;

  setTokens(token: string, refreshToken: string) {
    this.token = token;
    this.refreshToken = refreshToken;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }

  loadFromStorage() {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && this.refreshToken) {
      await this.refreshAccessToken();
      return this.request(endpoint, options);
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    const data = await response.json();
    return data.data;
  }

  private async refreshAccessToken() {
    const response = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: this.refreshToken }),
    });

    if (!response.ok) {
      this.clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    const data = await response.json();
    this.setTokens(data.data.token, data.data.refresh_token);
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  // Auth
  register(email: string, username: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
  }

  login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Users
  getMe() {
    return this.request('/users/@me');
  }

  updateMe(data: { username?: string; avatar_url?: string }) {
    return this.request('/users/@me', { method: 'PATCH', body: JSON.stringify(data) });
  }

  updateSettings(data: { theme?: string; language?: string; notifications?: boolean; privacy?: string }) {
    return this.request('/users/@me/settings', { method: 'PATCH', body: JSON.stringify(data) });
  }

  // Servers
  getServers() {
    return this.request('/servers');
  }

  createServer(name: string) {
    return this.request('/servers', { method: 'POST', body: JSON.stringify({ name }) });
  }

  joinServer(inviteCode: string) {
    return this.request('/servers/join', { method: 'POST', body: JSON.stringify({ invite_code: inviteCode }) });
  }

  // Channels
  getChannels(serverId: number) {
    return this.request(`/servers/${serverId}/channels`);
  }

  createChannel(serverId: number, name: string, type: string = 'text') {
    return this.request('/channels', {
      method: 'POST',
      body: JSON.stringify({ server_id: serverId, name, type }),
    });
  }

  // Messages
  getMessages(channelId: number, limit = 50, offset = 0) {
    return this.request(`/channels/${channelId}/messages?limit=${limit}&offset=${offset}`);
  }

  sendMessage(channelId: number, content: string) {
    return this.request(`/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ channel_id: channelId, content }),
    });
  }
}

export const api = new ApiClient();
```

### Auth Context

```typescript
// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

interface User {
  id: number;
  email: string;
  username: string;
  avatar_url: string;
  settings: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.loadFromStorage();
    if (api.token) {
      api.getMe()
        .then(setUser)
        .catch(() => api.clearTokens())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    api.setTokens(response.token, response.refresh_token);
    setUser(response.user);
  };

  const register = async (email: string, username: string, password: string) => {
    const response = await api.register(email, username, password);
    api.setTokens(response.token, response.refresh_token);
    setUser(response.user);
  };

  const logout = () => {
    api.clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### Chat Component with WebSocket

```typescript
// components/Chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

interface Message {
  id: number;
  channel_id: number;
  author_id: number;
  content: string;
  created_at: string;
  author: { id: number; username: string; avatar_url: string };
}

interface ChatProps {
  channelId: number;
  ws: WebSocket;
  currentUserId: number;
}

export const Chat: React.FC<ChatProps> = ({ channelId, ws, currentUserId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    api.getMessages(channelId).then(setMessages);
  }, [channelId]);

  // Join WebSocket room
  useEffect(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'JOIN_ROOM', payload: { channel_id: channelId } }));
    }
  }, [ws, channelId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'NEW_MESSAGE':
          if (data.payload.channel_id === channelId) {
            setMessages(prev => [...prev, data.payload]);
          }
          break;
        case 'TYPING':
          if (data.payload.channel_id === channelId && data.payload.user_id !== currentUserId) {
            setTypingUsers(prev => [...prev, data.payload.username]);
            setTimeout(() => setTypingUsers(prev => prev.filter(u => u !== data.payload.username)), 3000);
          }
          break;
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => ws.removeEventListener('message', handleMessage);
  }, [ws, channelId, currentUserId]);

  const sendMessage = () => {
    if (!input.trim()) return;

    ws.send(JSON.stringify({
      type: 'SEND_MESSAGE',
      payload: { channel_id: channelId, content: input }
    }));
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else {
      // Send typing indicator (debounce in production)
      ws.send(JSON.stringify({ type: 'TYPING_START', payload: { channel_id: channelId } }));
    }
  };

  return (
    <div className="chat">
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.author_id === currentUserId ? 'own' : ''}`}>
            <img src={msg.author.avatar_url || '/default-avatar.png'} alt="" />
            <div className="content">
              <span className="username">{msg.author.username}</span>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.length > 0 && (
        <div className="typing">{typingUsers.join(', ')} typing...</div>
      )}

      <div className="input-area">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};
```

---

## Error Handling

### Error Response Format

All errors follow this structure:

```typescript
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE" // optional
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or expired token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Backend issue |

### Handling in React

```typescript
// Custom hook for API calls with error handling
const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async <T>(fn: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
};

// Usage
const { execute, loading, error } = useApi();
const handleLogin = () => execute(() => auth.login(email, password));
```

---

## Best Practices

### Token Management
- Store tokens in memory (React state/context), not localStorage for security
- Use refresh token flow before expiration
- Clear tokens on logout

### WebSocket
- Implement reconnection logic with exponential backoff
- Queue messages when disconnected, send when reconnected
- Clean up event listeners on unmount

### Voice/WebRTC
- Handle browser permission prompts gracefully
- Implement proper cleanup (close peer connections, stop tracks)
- Use STUN servers for NAT traversal

### Performance
- Implement message pagination
- Debounce typing indicators
- Cache server/channel data in context

### Security
- Validate all user input client-side before sending
- Sanitize message content before rendering (prevent XSS)
- Use HTTPS in production

---

## Environment Variables

Create a `.env` file for your React app:

```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_WS_URL=ws://localhost:8080/ws
```

---

## Quick Start Checklist

1. [ ] Set up React project with TypeScript
2. [ ] Create API client with token management
3. [ ] Implement Auth context and login/register forms
4. [ ] Create server/channel list components
5. [ ] Build chat component with WebSocket integration
6. [ ] Add voice channel functionality with WebRTC
7. [ ] Implement presence system
8. [ ] Add error handling and loading states

---

## Support

- Swagger UI: `http://localhost:8080/swagger/index.html`
- Test WebSocket: `ws://localhost:8080/ws`