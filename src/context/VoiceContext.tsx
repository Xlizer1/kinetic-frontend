import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useWS } from './WebSocketContext';
import { WSServerEvent } from '../types/websocket';
import { VoiceUser } from '../types/voice';
import { useWebRTC } from '../hooks/useWebRTC';
import { VOICE_CONSTRAINTS } from '../audio/audioSettings';
import { createProcessedAudioStream } from '../audio/audioProcessor';
import { api } from '../api/client';

interface VoiceContextType {
  channelId: number | null;
  remoteUsers: VoiceUser[];
  localStream: MediaStream | null;
  isMuted: boolean;
  joinVoice: (channelId: number) => Promise<void>;
  leaveVoice: () => void;
  toggleMute: () => void;
}

const VoiceContext = createContext<VoiceContextType | null>(null);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { subscribe } = useWS();
  const [channelId, setChannelId] = useState<number | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioCleanupRef = useRef<(() => void) | null>(null);

  const {
    remoteUsers,
    createAndSendOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    closePeerConnection,
    closeAllConnections,
  } = useWebRTC();

  // Handle voice-related WebSocket events
  useEffect(() => {
    const unsubscribe = subscribe((event: WSServerEvent) => {
      console.log('[Voice] Received WebSocket event:', event.type, event.payload);
      
      switch (event.type) {
        case 'VOICE_JOIN':
          console.log('[Voice] Joined voice channel, users:', event.payload.users);
          // Successfully joined — create offers to existing users
          if (event.payload.users) {
            event.payload.users.forEach((u: { user_id: number; username: string }) => {
              console.log('[Voice] Creating offer for existing user:', u.user_id, u.username);
              createAndSendOffer(u.user_id, u.username, event.payload.channel_id, localStream);
            });
          }
          break;

        case 'VOICE_USER_JOINED':
          console.log('[Voice] User joined:', event.payload);
          // New user joined our channel — create offer
          if (event.payload.channel_id === channelId) {
            console.log('[Voice] Creating offer for new user:', event.payload.user_id);
            createAndSendOffer(event.payload.user_id, event.payload.username, event.payload.channel_id, localStream);
          }
          break;

        case 'VOICE_USER_LEFT':
          if (event.payload.channel_id === channelId) {
            console.log('[Voice] User left:', event.payload.user_id);
            closePeerConnection(event.payload.user_id);
          }
          break;

        case 'VOICE_OFFER':
          console.log('[Voice] Received offer from:', event.payload.target_user_id);
          handleOffer(event.payload.target_user_id, event.payload.sdp, event.payload.channel_id, localStream);
          break;

        case 'VOICE_ANSWER':
          console.log('[Voice] Received answer from:', event.payload.target_user_id);
          handleAnswer(event.payload.target_user_id, event.payload.sdp);
          break;

        case 'ICE_CANDIDATE':
          console.log('[Voice] Received ICE from:', event.payload.target_user_id);
          handleIceCandidate(event.payload.target_user_id, event.payload.candidate);
          break;
      }
    });

    return unsubscribe;
  }, [
    subscribe, channelId, localStream, createAndSendOffer, handleOffer,
    handleAnswer, handleIceCandidate, closePeerConnection,
  ]);

  const joinVoice = useCallback(async (targetChannelId: number) => {
    try {
      // Get microphone access
      const rawStream = await navigator.mediaDevices.getUserMedia(VOICE_CONSTRAINTS);

      // Process through audio pipeline
      const { outputStream, cleanup } = createProcessedAudioStream(rawStream);
      audioCleanupRef.current = () => {
        cleanup();
        rawStream.getTracks().forEach((t) => t.stop());
      };

      setLocalStream(outputStream);
      setChannelId(targetChannelId);

      // Tell backend we're joining via HTTP
      console.log('[Voice] Joining voice channel via HTTP:', targetChannelId);
      await api.joinVoiceChannel(targetChannelId);
      console.log('[Voice] Joined voice channel successfully');
    } catch (err) {
      console.error('[Voice] Failed to join voice channel:', err);
      throw err;
    }
  }, []);

  const leaveVoice = useCallback(async () => {
    // Stop local audio
    if (audioCleanupRef.current) {
      audioCleanupRef.current();
      audioCleanupRef.current = null;
    }
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);

    // Close all peer connections
    closeAllConnections();

    // Tell backend via HTTP
    if (channelId) {
      console.log('[Voice] Leaving voice channel via HTTP:', channelId);
      try {
        await api.leaveVoiceChannel(channelId);
      } catch (err) {
        console.error('[Voice] Failed to leave voice channel:', err);
      }
    }

    setChannelId(null);
    setIsMuted(false);
  }, [localStream, channelId, closeAllConnections]);

  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  }, [localStream]);

  return (
    <VoiceContext.Provider
      value={{ channelId, remoteUsers, localStream, isMuted, joinVoice, leaveVoice, toggleMute }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = (): VoiceContextType => {
  const context = useContext(VoiceContext);
  if (!context) throw new Error('useVoice must be used within a VoiceProvider');
  return context;
};
