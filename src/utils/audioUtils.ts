export function base64ToBlobUrl(base64Data: string, mimeType = "audio/wav"): string {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  return URL.createObjectURL(blob);
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms}`;
}

export function calculateReadingTime(text: string, wpm = 145): { words: number; chars: number; estSeconds: number } {
  const trimmed = text.trim();
  if (!trimmed) return { words: 0, chars: 0, estSeconds: 0 };
  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const estSeconds = Math.round((words / wpm) * 60);
  return { words, chars, estSeconds };
}

/**
 * Extracts 60 normalized amplitude peaks from an audio blob URL for waveform rendering
 */
export async function extractWaveformPeaks(blobUrl: string, barsCount = 64): Promise<number[]> {
  try {
    const response = await fetch(blobUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    const blockSize = Math.floor(channelData.length / barsCount);
    const peaks: number[] = [];

    for (let i = 0; i < barsCount; i++) {
      let sum = 0;
      const start = i * blockSize;
      const end = Math.min(start + blockSize, channelData.length);
      for (let j = start; j < end; j++) {
        sum += Math.abs(channelData[j]);
      }
      const avg = sum / (end - start || 1);
      peaks.push(Math.min(1, avg * 2.8));
    }
    audioCtx.close();
    return peaks;
  } catch {
    // Generate organic pseudo waveform if audio decoding fails
    return Array.from({ length: barsCount }, (_, i) => {
      return 0.2 + 0.6 * Math.abs(Math.sin((i / barsCount) * Math.PI * 3));
    });
  }
}
