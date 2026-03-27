import { AUDIO_SETTINGS } from './audioSettings';

/**
 * Modify SDP to prioritize Opus codec and set optimal voice parameters.
 * WebRTC uses Opus by default, but this ensures it's explicitly preferred
 * and configured for voice chat (mono, DTX, FEC).
 */
export const prioritizeOpusCodec = (sdp: string): string => {
  const lines = sdp.split('\r\n');
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Find the Opus payload type from rtpmap
    if (line.startsWith('a=rtpmap:') && line.toLowerCase().includes('opus')) {
      const payloadType = line.split(':')[1]?.split(' ')[0];

      if (payloadType) {
        // Add fmtp line with Opus parameters after rtpmap
        result.push(line);

        // Check if next line is already an fmtp for this payload
        const nextLine = lines[i + 1] || '';
        if (nextLine.startsWith(`a=fmtp:${payloadType}`)) {
          // Replace existing fmtp with our optimized one
          result.push(buildOpusFmtp(payloadType));
          i++; // skip original fmtp
        } else {
          // Insert our fmtp
          result.push(buildOpusFmtp(payloadType));
        }
        continue;
      }
    }

    result.push(line);
  }

  return result.join('\r\n');
};

/**
 * Build the fmtp line for Opus with voice-optimized parameters.
 */
const buildOpusFmtp = (payloadType: string): string => {
  const params = [
    `maxplaybackrate=${AUDIO_SETTINGS.sampleRate}`,
    `sprop-maxcapturerate=${AUDIO_SETTINGS.sampleRate}`,
    `maxaveragebitrate=${AUDIO_SETTINGS.bitrate}`,
    `stereo=0`, // mono for voice
    `useinbandfec=${AUDIO_SETTINGS.fec ? 1 : 0}`,
    `usedtx=${AUDIO_SETTINGS.dtx ? 1 : 0}`,
    `ptime=${AUDIO_SETTINGS.ptime}`,
  ];

  return `a=fmtp:${payloadType} ${params.join(';')}`;
};

/**
 * Set max bitrate on an RTCRtpSender for audio.
 */
export const setAudioBitrate = async (
  sender: RTCRtpSender,
  maxBitrate: number = AUDIO_SETTINGS.maxBitrate
): Promise<void> => {
  const params = sender.getParameters();
  if (!params.encodings || params.encodings.length === 0) {
    params.encodings = [{}];
  }
  params.encodings[0].maxBitrate = maxBitrate;
  await sender.setParameters(params);
};
