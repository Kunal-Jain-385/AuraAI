export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  modelId: string;
  context?: string; // For PDF text context
  createdAt: number;
  updatedAt: number;
}

export interface ModelConfig {
  id: string;
  name: string;
  size: string;
  ram: string;
  description: string;
  vram_required_MB?: number;
  low_resource_required?: boolean;
}

export interface DownloadProgress {
  progress: number;
  text: string;
}

export type DownloadStatus = 'idle' | 'queued' | 'downloading' | 'completed' | 'error' | 'cancelled';

export interface ModelDownloadState {
  modelId: string;
  status: DownloadStatus;
  progress: number;
  text: string;
  error?: string;
}

export type LearningStyle = 'beginner' | 'intermediate' | 'advanced';

export interface LearningProfile {
  style: LearningStyle;
  interests: string[];
  weakTopics: string[];
  questionFrequency: Record<string, number>;
  confusionCount: number;
}

export interface UserPreferences {
  learningProfile: LearningProfile;
  privacyMode: boolean;
  theme: 'light' | 'dark';
}

export type LLMStatus = 'idle' | 'loading' | 'downloading' | 'ready' | 'error';
