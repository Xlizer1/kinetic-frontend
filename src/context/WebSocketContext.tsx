import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { WS_URL, WS_RECONNECT_BASE_MS, WS_RECONNECT_MAX_MS } from '../utils/constants';
import { WSClientEvent, WSServerEvent } from '../types/websocket';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';
const HEARTBEAT_INTERVAL_MS = 30000; // Send ping every 30 seconds

type WSEventHandler = (event: WSServerEvent) => void;

interface WebSocketContextType {
  connected: boolean;
  authenticated: boolean;
  sendEvent: (event: WSClientEvent) => void;
  subscribe: (handler: WSEventHandler) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Set<WSEventHandler>>(new Set());
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval>>();
  const messageQueueRef = useRef<WSClientEvent[]>([]);
  const isIntentionalCloseRef = useRef(false);

  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  // Get token from localStorage directly (api client stores it there)
  const getToken = useCallback(() => {
    return localStorage.getItem('kinetic_token');
  }, []);

  // Dispatch incoming events to all subscribers
  const dispatch = useCallback((event: WSServerEvent) => {
    console.log('[WS] Incoming event:', event.type, event.payload);
    handlersRef.current.forEach((handler) => {
      try {
        handler(event);
      } catch (err) {
        console.error('[WS] Handler error:', err);
      }
    });
  }, []);

  // Send event over WebSocket (queues if not connected)
  const sendEvent = useCallback((event: WSClientEvent) => {
    console.log('[WS] Sending event:', event.type, event.payload);
    const ws = wsRef.current;
    console.log('[WS] WebSocket state:', ws?.readyState, WebSocket.OPEN);
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('[WS] Sending directly:', event.type);
      ws.send(JSON.stringify(event));
    } else {
      console.log('[WS] Queueing event:', event.type, 'Queue length:', messageQueueRef.current.length);
      messageQueueRef.current.push(event);
    }
  }, []);

  // Flush queued messages after reconnect + auth
  const flushQueue = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    console.log('[WS] Flushing queue, items:', messageQueueRef.current.length);
    while (messageQueueRef.current.length > 0) {
      const event = messageQueueRef.current.shift()!;
      console.log('[WS] Sending queued event:', event.type);
      ws.send(JSON.stringify(event));
    }
  }, []);

  // Start heartbeat to keep connection alive
  const startHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
    }
    heartbeatTimerRef.current = setInterval(() => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log('[WS] Heartbeat ping');
        ws.send(JSON.stringify({ type: 'PING', payload: {} }));
      }
    }, HEARTBEAT_INTERVAL_MS);
  }, []);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = undefined;
    }
  }, []);

  // Subscribe to incoming WS events, returns unsubscribe fn
  const subscribe = useCallback((handler: WSEventHandler): (() => void) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  }, []);

  // Connect WebSocket
  const connect = useCallback(() => {
    const token = getToken();
    if (!token || !user) return;

    isIntentionalCloseRef.current = false;

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    stopHeartbeat();

    console.log('[WS] Connecting to', WS_URL);
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Connected successfully');
      setConnected(true);
      reconnectAttemptRef.current = 0;
      startHeartbeat();

      // Authenticate immediately after connection
      console.log('[WS] Sending AUTHENTICATE...');
      ws.send(JSON.stringify({
        type: 'AUTHENTICATE',
        payload: { token },
      }));
    };

    ws.onmessage = (event) => {
      // Ignore pongs
      if (event.data === 'pong' || event.data === '{"type":"PONG"}') {
        console.log('[WS] Heartbeat pong received');
        return;
      }
      console.log('[WS] Raw message received:', event.data);
      try {
        const data: WSServerEvent = JSON.parse(event.data);

        // Handle auth response internally
        if (data.type === 'AUTHENTICATE') {
          if (data.payload.success) {
            console.log('[WS] Authentication successful!');
            setAuthenticated(true);
            flushQueue();
          } else {
            console.error('[WS] Authentication failed');
            setAuthenticated(false);
          }
        }

        dispatch(data);
      } catch (err) {
        console.error('[WS] Failed to parse message:', err);
      }
    };

    ws.onclose = (event) => {
      console.log('[WS] Connection closed, code:', event.code, 'reason:', event.reason);
      stopHeartbeat();
      setConnected(false);
      
      // Only reset auth if it's not an intentional close (logout)
      if (!isIntentionalCloseRef.current) {
        setAuthenticated(false);
      }
      
      wsRef.current = null;

      // Don't reconnect if it was intentional (user logged out)
      if (isIntentionalCloseRef.current) {
        console.log('[WS] Intentional close, not reconnecting');
        return;
      }

      // Reconnect with exponential backoff
      const delay = Math.min(
        WS_RECONNECT_BASE_MS * Math.pow(2, reconnectAttemptRef.current),
        WS_RECONNECT_MAX_MS
      );
      reconnectAttemptRef.current += 1;

      console.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttemptRef.current})`);
      reconnectTimerRef.current = setTimeout(connect, delay);
    };

    ws.onerror = (err) => {
      console.error('[WS] Error:', err);
    };
  }, [user, getToken, dispatch, flushQueue, startHeartbeat, stopHeartbeat]);

  // Connect when user is authenticated, disconnect on logout
  useEffect(() => {
    if (IS_DEMO) return; // Skip WS in demo mode
    if (user) {
      connect();
    } else {
      // User logged out — close and stop reconnecting
      isIntentionalCloseRef.current = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      stopHeartbeat();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setConnected(false);
      setAuthenticated(false);
      messageQueueRef.current = [];
    }

    return () => {
      isIntentionalCloseRef.current = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      stopHeartbeat();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [user, connect, stopHeartbeat]);

  return (
    <WebSocketContext.Provider value={{ connected, authenticated, sendEvent, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWS = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWS must be used within a WebSocketProvider');
  return context;
};
