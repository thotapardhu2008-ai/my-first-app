// User and Authentication Types
export interface User {
  id: string;
  email: string;
  googleId?: string;
  displayName: string;
  preferredLanguage: string;
  voicePersona: 'natural' | 'professional' | 'friendly';
  defaultTargetLanguage?: string;
  privacyOptIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Job and Media Types
export interface MediaFile {
  id: string;
  userId: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  duration?: number;
  resolution?: string;
  thumbnailUrl?: string;
  downloadUrl: string;
  createdAt: string;
}

export interface Job {
  id: string;
  userId: string;
  originalFilename: string;
  sourceLanguage: string;
  targetLanguages: string[];
  voiceStyle: 'natural' | 'professional' | 'friendly';
  qualityTier: 'fast' | 'standard' | 'studio';
  outputResolution?: string;
  fileSize: number;
  durationSeconds?: number;
  costCredits: number;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStage?: JobStage['stage'];
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  stages: JobStage[];
  files: JobFiles;
  cost: JobCost;
}

export interface JobStage {
  stage: 'ingest' | 'asr' | 'translation' | 'tts' | 'sync' | 'final';
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  startedAt?: string;
  completedAt?: string;
  costCredits?: number;
  errorMessage?: string;
  estimatedTime?: number;
  actualTime?: number;
}

export interface JobFiles {
  original: string;
  audio?: string;
  transcript?: string;
  translated?: string;
  dubbed?: string;
  subtitles?: string;
}

export interface JobCost {
  spent: number;
  estimated: number;
  breakdown: {
    asr: number;
    translation: number;
    tts: number;
    sync: number;
    overhead: number;
  };
}

// Billing and Credit Types
export interface CreditBalance {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdated: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'purchase' | 'spend' | 'refund' | 'bonus';
  referenceId?: string;
  description: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'free' | 'creator' | 'professional' | 'enterprise';
  price: number;
  creditsPerMonth: number;
  features: string[];
  limits: {
    maxFileSize: number;
    maxResolution: string;
    languages: number;
    voiceCloning: boolean;
    apiAccess: boolean;
  };
}

export interface Subscription {
  id: string;
  userId: string;
  planType: string;
  stripeSubscriptionId?: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  creditsPerMonth: number;
  createdAt: string;
}

// Upload and Processing Types
export interface UploadOptions {
  sourceLanguage?: string;
  targetLanguages: string[];
  voiceStyle: 'natural' | 'professional' | 'friendly';
  qualityTier: 'fast' | 'standard' | 'studio';
  autoDetectLanguage: boolean;
  generateSubtitles: boolean;
  preserveOriginalAudio: boolean;
}

export interface UploadSource {
  type: 'file' | 'url' | 'youtube' | 'instagram' | 'cloud' | 'record';
  data: File | string | { url: string; provider: string };
}

export interface ProcessingProgress {
  jobId: string;
  stage: string;
  progress: number;
  eta?: number;
  message?: string;
  error?: string;
}

// Player and Media Types
export interface VideoPlayerState {
  jobId: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  quality: string;
  subtitlesEnabled: boolean;
  comparisonMode: 'side-by-side' | 'a-b' | 'overlay';
  originalVolume: number;
  dubbedVolume: number;
}

export interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
  url: string;
  format: 'srt' | 'vtt' | 'ass';
}

export interface SubtitleCue {
  id: string;
  start: number;
  end: number;
  text: string;
  language: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Language Types
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  supported: boolean;
}

export interface VoicePersona {
  id: string;
  name: string;
  description: string;
  sampleUrl?: string;
  gender: 'male' | 'female' | 'neutral';
  age: 'young' | 'adult' | 'mature';
  style: 'natural' | 'professional' | 'friendly';
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'job_completed' | 'job_failed' | 'payment_processed' | 'credit_low';
  title: string;
  message: string;
  jobId?: string;
  read: boolean;
  createdAt: string;
  expiresAt?: string;
}

// Error Types
export interface PolyDubError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode: number;
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'job_progress' | 'job_completed' | 'job_failed' | 'notification';
  payload: any;
  timestamp: string;
}