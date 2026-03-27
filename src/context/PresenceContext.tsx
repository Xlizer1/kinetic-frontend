import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWS } from './WebSocketContext';
import { useAuth } from './AuthContext';
import { WSServerEvent } from '../types/websocket';

interface PresenceUser {
  user_id: number;
  username: string;
  status: string;
}

interface PresenceContextType {
  users: Map<number, PresenceUser>;
  getStatus: (userId: number) => string;
  updateMyStatus: (status: string) => void;
}

const PresenceContext = createContext<PresenceContextType | null>(null);

export const PresenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sendEvent, subscribe, authenticated } = useWS();
  const { user } = useAuth();
  const [users, setUsers] = useState<Map<number, PresenceUser>>(new Map());

  // Get current user's ID
  const currentUserId = user?.id;

  useEffect(() => {
    const unsubscribe = subscribe((event: WSServerEvent) => {
      switch (event.type) {
        case 'PRESENCE_LIST':
          setUsers((prev) => {
            const next = new Map(prev);
            event.payload.users.forEach((u) => next.set(u.user_id, u));
            return next;
          });
          break;

        case 'PRESENCE_UPDATE':
          setUsers((prev) => {
            const next = new Map(prev);
            next.set(event.payload.user_id, {
              user_id: event.payload.user_id,
              username: event.payload.username,
              status: event.payload.status,
            });
            return next;
          });
          break;
      }
    });

    return unsubscribe;
  }, [subscribe]);

  // Set status to online when WS authenticates
  useEffect(() => {
    if (authenticated) {
      sendEvent({ type: 'PRESENCE_UPDATE', payload: { status: 'online' } });
    }
  }, [authenticated, sendEvent]);

  // Add current user to the map when authenticated
  useEffect(() => {
    if (authenticated && currentUserId && user) {
      setUsers((prev) => {
        const next = new Map(prev);
        next.set(currentUserId, {
          user_id: currentUserId,
          username: user.username,
          status: 'online',
        });
        return next;
      });
    }
  }, [authenticated, currentUserId, user]);

  const getStatus = useCallback(
    (userId: number): string => {
      // If this is the current user and they're authenticated, return online
      if (userId === currentUserId && authenticated) {
        return 'online';
      }
      return users.get(userId)?.status || 'offline';
    },
    [users, currentUserId, authenticated]
  );

  const updateMyStatus = useCallback(
    (status: string) => {
      sendEvent({ type: 'PRESENCE_UPDATE', payload: { status } });
    },
    [sendEvent]
  );

  return (
    <PresenceContext.Provider value={{ users, getStatus, updateMyStatus }}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = (): PresenceContextType => {
  const context = useContext(PresenceContext);
  if (!context) throw new Error('usePresence must be used within a PresenceProvider');
  return context;
};
