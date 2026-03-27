import React from 'react';
import { WebSocketProvider } from '../context/WebSocketContext';
import { PresenceProvider } from '../context/PresenceContext';
import { VoiceProvider } from '../context/VoiceContext';
import { AppLayout } from '../components/layout/AppLayout';

const Home: React.FC = () => {
  return (
    <WebSocketProvider>
      <PresenceProvider>
        <VoiceProvider>
          <AppLayout />
        </VoiceProvider>
      </PresenceProvider>
    </WebSocketProvider>
  );
};

export default Home;
