// ─── Client → Server Events ───

export interface WSAuthenticate {
  type: 'AUTHENTICATE';
  payload: { token: string };
}

export interface WSJoinRoom {
  type: 'JOIN_ROOM';
  payload: { channel_id: number };
}

export interface WSLeaveRoom {
  type: 'LEAVE_ROOM';
  payload: { channel_id: number };
}

export interface WSSendMessage {
  type: 'SEND_MESSAGE';
  payload: { channel_id: number; content: string };
}

export interface WSTypingStart {
  type: 'TYPING_START';
  payload: { channel_id: number };
}

export interface WSTypingStop {
  type: 'TYPING_STOP';
  payload: { channel_id: number };
}

export interface WSVoiceJoin {
  type: 'VOICE_JOIN';
  payload: { channel_id: number };
}

export interface WSVoiceLeave {
  type: 'VOICE_LEAVE';
  payload: { channel_id: number };
}

export interface WSVoiceSignal {
  type: 'VOICE_SIGNAL';
  payload: {
    channel_id: number;
    target_user_id: number;
    sdp?: string;
    candidate?: string;
    type: 'offer' | 'answer' | 'ice';
  };
}

export interface WSPresenceUpdate {
  type: 'PRESENCE_UPDATE';
  payload: { status: string };
}

export type WSClientEvent =
  | WSAuthenticate
  | WSJoinRoom
  | WSLeaveRoom
  | WSSendMessage
  | WSTypingStart
  | WSTypingStop
  | WSVoiceJoin
  | WSVoiceLeave
  | WSVoiceSignal
  | WSPresenceUpdate;

// ─── Server → Client Events ───

export interface WSAuthResponse {
  type: 'AUTHENTICATE';
  payload: { success: boolean; user_id: number; username: string };
}

export interface WSNewMessage {
  type: 'NEW_MESSAGE';
  payload: {
    id: number;
    channel_id: number;
    author_id: number;
    content: string;
    username: string;
    created_at: string;
  };
}

export interface WSUserJoined {
  type: 'USER_JOINED';
  payload: { user_id: number; username: string };
}

export interface WSUserLeft {
  type: 'USER_LEFT';
  payload: { user_id: number; username: string };
}

export interface WSTyping {
  type: 'TYPING';
  payload: { channel_id: number; user_id: number; username: string };
}

export interface WSError {
  type: 'ERROR';
  payload: { message: string };
}

export interface WSPresenceList {
  type: 'PRESENCE_LIST';
  payload: { users: Array<{ user_id: number; username: string; status: string }> };
}

export interface WSPresenceUpdateResponse {
  type: 'PRESENCE_UPDATE';
  payload: { user_id: number; username: string; status: string };
}

export interface WSVoiceJoinResponse {
  type: 'VOICE_JOIN';
  payload: { channel_id: number; users: Array<{ user_id: number; username: string }> };
}

export interface WSVoiceLeaveResponse {
  type: 'VOICE_LEAVE';
  payload: { channel_id: number };
}

export interface WSVoiceUserJoined {
  type: 'VOICE_USER_JOINED';
  payload: { channel_id: number; user_id: number; username: string };
}

export interface WSVoiceUserLeft {
  type: 'VOICE_USER_LEFT';
  payload: { channel_id: number; user_id: number; username: string };
}

export interface WSVoiceOffer {
  type: 'VOICE_OFFER';
  payload: { channel_id: number; target_user_id: number; sdp: string };
}

export interface WSVoiceAnswer {
  type: 'VOICE_ANSWER';
  payload: { channel_id: number; target_user_id: number; sdp: string };
}

export interface WSIceCandidate {
  type: 'ICE_CANDIDATE';
  payload: { channel_id: number; target_user_id: number; candidate: string };
}

export type WSServerEvent =
  | WSAuthResponse
  | WSNewMessage
  | WSUserJoined
  | WSUserLeft
  | WSTyping
  | WSError
  | WSPresenceList
  | WSPresenceUpdateResponse
  | WSVoiceJoinResponse
  | WSVoiceLeaveResponse
  | WSVoiceUserJoined
  | WSVoiceUserLeft
  | WSVoiceOffer
  | WSVoiceAnswer
  | WSIceCandidate;
