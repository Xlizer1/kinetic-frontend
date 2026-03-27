import { useEffect, useCallback, useRef } from 'react';
import { useWS } from '../context/WebSocketContext';
import { WSServerEvent } from '../types/websocket';

type EventType = WSServerEvent['type'];
type EventHandler<T extends EventType> = (
  payload: Extract<WSServerEvent, { type: T }>['payload']
) => void;

/**
 * Subscribe to specific WebSocket event types.
 * Automatically cleans up on unmount.
 *
 * Usage:
 *   useWebSocketEvent('NEW_MESSAGE', (payload) => {
 *     console.log('New message:', payload);
 *   });
 */
export const useWebSocketEvent = <T extends EventType>(
  type: T,
  handler: EventHandler<T>
) => {
  const { subscribe } = useWS();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.type === type) {
        // Safe cast: the type guard above guarantees the payload matches T.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (handlerRef.current as (payload: any) => void)(event.payload);
      }
    });
    return unsubscribe;
  }, [subscribe, type]);
};

/**
 * Send a WebSocket event. Returns a stable sendEvent function.
 */
export const useWebSocketSend = () => {
  const { sendEvent } = useWS();
  return useCallback(sendEvent, [sendEvent]);
};
