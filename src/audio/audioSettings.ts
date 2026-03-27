export const AUDIO_SETTINGS = {
  sampleRate: 48000,
  channels: 1, // mono for voice chat
  bitrate: 64000, // 64kbps - good balance for voice
  maxBitrate: 128000,
  dtx: true, // discontinuous transmission — saves bandwidth during silence
  fec: true, // forward error correction — helps with packet loss
  ptime: 20, // packet time in ms
};

/**
 * Constraints for getUserMedia to optimize for voice.
 */
export const VOICE_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: AUDIO_SETTINGS.sampleRate,
    channelCount: AUDIO_SETTINGS.channels,
  },
  video: false,
};
