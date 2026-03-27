import { useRef, useCallback } from 'react';
import { useWS } from '../context/WebSocketContext';
import { TYPING_DEBOUNCE_MS } from '../utils/constants';

export const useTypingIndicator = (channelId: number) => {
  const { sendEvent } = useWS();
  const typingTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const isTypingRef = useRef(false);

  const startTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendEvent({ type: 'TYPING_START', payload: { channel_id: channelId } });
    }

    // Reset the stop timer
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      sendEvent({ type: 'TYPING_STOP', payload: { channel_id: channelId } });
    }, TYPING_DEBOUNCE_MS);
  }, [channelId, sendEvent]);

  const stopTyping = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      sendEvent({ type: 'TYPING_STOP', payload: { channel_id: channelId } });
    }
  }, [channelId, sendEvent]);

  return { startTyping, stopTyping };
};
