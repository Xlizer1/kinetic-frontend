export interface VoiceState {
  channelId: number | null;
  users: VoiceUser[];
  localStream: MediaStream | null;
  peerConnections: Map<number, RTCPeerConnection>;
}

export interface VoiceUser {
  userId: number;
  username: string;
  stream: MediaStream | null;
}
