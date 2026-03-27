import { useState, useCallback, useRef } from 'react';
import { useWS } from '../context/WebSocketContext';
import { ICE_SERVERS } from '../utils/constants';
import { prioritizeOpusCodec, setAudioBitrate } from '../audio/codecConfig';
import { VoiceUser } from '../types/voice';

export const useWebRTC = () => {
  const { sendEvent } = useWS();
  const [peerConnections] = useState<Map<number, RTCPeerConnection>>(new Map());
  const [remoteUsers, setRemoteUsers] = useState<VoiceUser[]>([]);
  const pcRef = useRef(peerConnections);
  pcRef.current = peerConnections;

  const updateUserStream = useCallback((userId: number, username: string, stream: MediaStream | null) => {
    console.log('[WebRTC] updateUserStream:', userId, username, stream ? 'stream received' : 'no stream');
    setRemoteUsers((prev) => {
      const existing = prev.find((u) => u.userId === userId);
      if (existing) {
        return prev.map((u) => (u.userId === userId ? { ...u, stream } : u));
      }
      return [...prev, { userId, username, stream }];
    });
  }, []);

  const removeUser = useCallback((userId: number) => {
    setRemoteUsers((prev) => prev.filter((u) => u.userId !== userId));
  }, []);

  // Create a peer connection for a specific user
  const createPeerConnection = useCallback(
    (userId: number, username: string, channelId: number, localStream: MediaStream | null): RTCPeerConnection => {
      console.log('[WebRTC] Creating peer connection for user', userId, 'in channel', channelId);
      const pc = new RTCPeerConnection(ICE_SERVERS);

      // Add local audio tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          const sender = pc.addTrack(track, localStream);
          setAudioBitrate(sender).catch(console.error);
        });
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('[WebRTC] Sending ICE candidate to user', userId);
          sendEvent({
            type: 'VOICE_SIGNAL',
            payload: {
              channel_id: channelId,
              target_user_id: userId,
              candidate: JSON.stringify(event.candidate),
              type: 'ice',
            },
          });
        }
      };

      // Handle incoming remote stream
      pc.ontrack = (event) => {
        console.log('[WebRTC] Received track from user', userId, 'streams:', event.streams.length);
        updateUserStream(userId, username, event.streams[0] || null);
      };

      pc.onconnectionstatechange = () => {
        console.log(`[WebRTC] Connection state for user ${userId}:`, pc.connectionState);
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          console.warn(`[WebRTC] Connection to user ${userId} ${pc.connectionState}`);
        }
      };

      pcRef.current.set(userId, pc);
      return pc;
    },
    [sendEvent, updateUserStream]
  );

  // Create an offer and send it to a specific user
  const createAndSendOffer = useCallback(
    async (userId: number, username: string, channelId: number, localStream: MediaStream | null) => {
      console.log('[WebRTC] Creating and sending offer to user', userId, 'channel', channelId);
      const pc = createPeerConnection(userId, username, channelId, localStream);
      const offer = await pc.createOffer();

      const modifiedSdp = prioritizeOpusCodec(offer.sdp || '');
      const modifiedOffer = { ...offer, sdp: modifiedSdp };

      await pc.setLocalDescription(modifiedOffer);

      sendEvent({
        type: 'VOICE_SIGNAL',
        payload: {
          channel_id: channelId,
          target_user_id: userId,
          sdp: JSON.stringify(pc.localDescription),
          type: 'offer',
        },
      });
    },
    [createPeerConnection, sendEvent]
  );

  // Handle incoming offer
  const handleOffer = useCallback(
    async (fromUserId: number, sdp: string, channelId: number, localStream: MediaStream | null) => {
      console.log('[WebRTC] Handling offer from user', fromUserId, 'channel', channelId);
      let pc = pcRef.current.get(fromUserId);
      if (!pc) {
        pc = createPeerConnection(fromUserId, '', channelId, localStream);
      }

      await pc.setRemoteDescription(JSON.parse(sdp));
      const answer = await pc.createAnswer();

      const modifiedSdp = prioritizeOpusCodec(answer.sdp || '');
      const modifiedAnswer = { ...answer, sdp: modifiedSdp };

      await pc.setLocalDescription(modifiedAnswer);

      sendEvent({
        type: 'VOICE_SIGNAL',
        payload: {
          channel_id: channelId,
          target_user_id: fromUserId,
          sdp: JSON.stringify(pc.localDescription),
          type: 'answer',
        },
      });
    },
    [createPeerConnection, sendEvent]
  );

  // Handle incoming answer
  const handleAnswer = useCallback(async (fromUserId: number, sdp: string) => {
    console.log('[WebRTC] Handling answer from user', fromUserId);
    const pc = pcRef.current.get(fromUserId);
    if (pc) {
      await pc.setRemoteDescription(JSON.parse(sdp));
    }
  }, []);

  // Handle incoming ICE candidate
  const handleIceCandidate = useCallback(async (fromUserId: number, candidate: string) => {
    console.log('[WebRTC] Handling ICE candidate from user', fromUserId);
    const pc = pcRef.current.get(fromUserId);
    if (pc) {
      await pc.addIceCandidate(JSON.parse(candidate));
    }
  }, []);

  // Close a specific peer connection
  const closePeerConnection = useCallback(
    (userId: number) => {
      const pc = pcRef.current.get(userId);
      if (pc) {
        pc.close();
        pcRef.current.delete(userId);
      }
      removeUser(userId);
    },
    [removeUser]
  );

  // Close all connections (on leave)
  const closeAllConnections = useCallback(() => {
    pcRef.current.forEach((pc) => pc.close());
    pcRef.current.clear();
    setRemoteUsers([]);
  }, []);

  return {
    remoteUsers,
    createAndSendOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    closePeerConnection,
    closeAllConnections,
  };
};
