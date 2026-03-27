/**
 * Process a local audio MediaStream through an AudioContext
 * for additional noise gate / gain control.
 * Returns a new MediaStream from the processed output.
 */
export const createProcessedAudioStream = (
  inputStream: MediaStream
): { outputStream: MediaStream; cleanup: () => void } => {
  const audioCtx = new AudioContext({ sampleRate: 48000 });
  const source = audioCtx.createMediaStreamSource(inputStream);

  // Gain node — allows muting/volume adjustment programmatically
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = 1.0;

  // Dynamics compressor — acts as a light noise gate / leveler
  const compressor = audioCtx.createDynamicsCompressor();
  compressor.threshold.value = -50;
  compressor.knee.value = 40;
  compressor.ratio.value = 12;
  compressor.attack.value = 0;
  compressor.release.value = 0.25;

  // Chain: source → compressor → gain → destination
  const destination = audioCtx.createMediaStreamDestination();
  source.connect(compressor);
  compressor.connect(gainNode);
  gainNode.connect(destination);

  const cleanup = () => {
    source.disconnect();
    compressor.disconnect();
    gainNode.disconnect();
    audioCtx.close().catch(() => {});
  };

  return {
    outputStream: destination.stream,
    cleanup,
  };
};

/**
 * Simple volume meter — returns current volume level (0-1) for visualizing.
 */
export const createVolumeMeter = (
  stream: MediaStream
): { getLevel: () => number; cleanup: () => void } => {
  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  const getLevel = (): number => {
    analyser.getByteFrequencyData(dataArray);
    const sum = dataArray.reduce((a, b) => a + b, 0);
    return sum / (dataArray.length * 255);
  };

  const cleanup = () => {
    source.disconnect();
    audioCtx.close().catch(() => {});
  };

  return { getLevel, cleanup };
};
