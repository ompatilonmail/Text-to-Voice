export interface VoiceInfo {
  id: string;
  name: string;
  gender: string;
  tone: string;
  bestFor: string;
  color: string;
  samplePhrase?: string;
  language?: "all" | "en" | "hi";
  nativeName?: string;
  accent?: string;
  baseModelVoice?: string;
  naturalPromptGuide?: string;
  isCustom?: boolean;
  isCloned?: boolean;
  isSyntheticDesign?: boolean;
}

export interface ClonedVoice {
  id: string;
  name: string;
  description: string;
  trainingDurationSec: number;
  filesCount: number;
  voiceIsolationApplied: boolean;
  sampleAudioUrl?: string;
  sampleAudioBase64?: string;
  acousticProfile: {
    pitchHz: number;
    warmth: number;
    timbre: string;
    clarityScore: number;
  };
  baseModelVoice: string;
  customPromptDirective: string;
  createdAt: number;
}

export interface SyntheticVoiceDesign {
  id: string;
  name: string;
  age: string;
  gender: string;
  nationality: string;
  tone: string;
  texture: string;
  promptDescription: string;
  sampleAudioUrl?: string;
  sampleAudioBase64?: string;
  baseModelVoice: string;
  customPromptDirective: string;
  createdAt: number;
}

export interface VoiceChangerSession {
  id: string;
  originalAudioUrl: string;
  originalAudioBase64?: string;
  transcription: string;
  detectedIntonation: string;
  targetVoiceId: string;
  outputAudioUrl: string;
  outputAudioBase64?: string;
  createdAt: number;
}

export interface VoiceCalibrationSettings {
  styleExaggeration: number; // 0 to 200, default 100
  stability: number; // 0 to 100, default 75
  similarityClarity: number; // 0 to 100, default 80
}

export interface EmotionOption {
  id: string;
  label: string;
  directive: string;
  hindiDirective?: string;
  icon?: string;
}

export interface SampleScript {
  title: string;
  category: string;
  voice: string;
  emotion: string;
  text: string;
  language?: "en" | "hi";
  nativeTitle?: string;
}

export interface MultiSpeakerLine {
  id: string;
  speaker: string;
  voice: string;
  text: string;
}

export interface AudioTake {
  id: string;
  timestamp: number;
  text: string;
  voice: string;
  emotion: string;
  mode: "single" | "multi";
  duration: number;
  audioBlobUrl: string;
  audioBase64: string;
  mimeType: string;
  fileName: string;
}
