// API Constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    GOOGLE_OAUTH: '/api/auth/google',
  },
  JOBS: {
    LIST: '/api/jobs',
    GET: '/api/jobs/:id',
    CREATE: '/api/jobs',
    CANCEL: '/api/jobs/:id/cancel',
    RETRY: '/api/jobs/:id/retry',
  },
  UPLOAD: {
    INITIATE: '/api/upload/initiate',
    CHUNK: '/api/upload/chunk',
    COMPLETE: '/api/upload/complete',
  },
  BILLING: {
    CREDITS: '/api/billing/credits',
    TRANSACTIONS: '/api/billing/transactions',
    PLANS: '/api/billing/plans',
    SUBSCRIBE: '/api/billing/subscribe',
    PURCHASE: '/api/billing/purchase',
  },
  USERS: {
    PROFILE: '/api/users/profile',
    PREFERENCES: '/api/users/preferences',
  },
} as const;

// Language Constants
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', direction: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', direction: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', direction: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', direction: 'ltr' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', direction: 'ltr' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', direction: 'ltr' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', direction: 'ltr' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', direction: 'ltr' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', direction: 'ltr' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', direction: 'ltr' },
] as const;

// File Type Constants
export const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/mov',
  'video/avi',
  'video/mkv',
  'video/webm',
  'video/quicktime',
] as const;

export const SUPPORTED_AUDIO_FORMATS = [
  'audio/mp3',
  'audio/wav',
  'audio/m4a',
  'audio/flac',
  'audio/ogg',
  'audio/aac',
] as const;

export const MAX_FILE_SIZE = {
  FREE: 200 * 1024 * 1024, // 200MB
  CREATOR: 1024 * 1024 * 1024, // 1GB
  PROFESSIONAL: 5 * 1024 * 1024 * 1024, // 5GB
  ENTERPRISE: null, // Unlimited
} as const;

export const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks for resumable uploads

// Processing Constants
export const PROCESSING_STAGES = {
  INGEST: { name: 'Ingest', duration: 45, description: 'Analyzing and preparing your media' },
  ASR: { name: 'Speech Recognition', duration: 135, description: 'Converting speech to text' },
  TRANSLATION: { name: 'Translation', duration: 90, description: 'Translating to target languages' },
  TTS: { name: 'Voice Generation', duration: 225, description: 'Generating dubbed audio' },
  SYNC: { name: 'Synchronization', duration: 80, description: 'Syncing audio with video' },
  FINAL: { name: 'Final Processing', duration: 45, description: 'Creating final output' },
} as const;

export const CREDIT_COSTS = {
  ASR_PER_MINUTE: 1,
  TRANSLATION_PER_MINUTE_PER_LANGUAGE: 1,
  TTS_BASIC_PER_MINUTE: 2,
  TTS_VOICE_CLONING_PER_MINUTE: 5,
  SYNC_PER_MINUTE: 0.5,
  OVERHEAD_PER_MINUTE: 0.5,
} as const;

// Quality Tiers
export const QUALITY_TIERS = {
  FAST: {
    name: 'Fast',
    description: 'Quick processing, good quality',
    resolution: '720p',
    multiplier: 0.7,
  },
  STANDARD: {
    name: 'Standard',
    description: 'Balanced quality and speed',
    resolution: '1080p',
    multiplier: 1.0,
  },
  STUDIO: {
    name: 'Studio',
    description: 'Highest quality, detailed processing',
    resolution: '4K',
    multiplier: 2.0,
  },
} as const;

// Voice Personas
export const VOICE_PERSONAS = {
  NATURAL: {
    id: 'natural',
    name: 'Natural',
    description: 'Clear and authentic voice reproduction',
    gender: 'neutral' as const,
    age: 'adult' as const,
    style: 'natural' as const,
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    description: 'Business-ready, polished delivery',
    gender: 'neutral' as const,
    age: 'adult' as const,
    style: 'professional' as const,
  },
  FRIENDLY: {
    id: 'friendly',
    name: 'Friendly',
    description: 'Warm and approachable tone',
    gender: 'neutral' as const,
    age: 'adult' as const,
    style: 'friendly' as const,
  },
} as const;

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'polydub-free',
    name: 'Free',
    type: 'free' as const,
    price: 0,
    creditsPerMonth: 50,
    features: ['Basic dubbing', 'Top 20 languages', '720p resolution'],
    limits: {
      maxFileSize: 200 * 1024 * 1024,
      maxResolution: '720p',
      languages: 20,
      voiceCloning: false,
      apiAccess: false,
    },
  },
  CREATOR: {
    id: 'polydub-creator',
    name: 'Creator',
    type: 'creator' as const,
    price: 19,
    creditsPerMonth: 500,
    features: ['Voice cloning', 'Batch processing', 'Priority queue', 'Top 100 languages'],
    limits: {
      maxFileSize: 1024 * 1024 * 1024,
      maxResolution: '1080p',
      languages: 100,
      voiceCloning: true,
      apiAccess: false,
    },
  },
  PROFESSIONAL: {
    id: 'polydub-pro',
    name: 'Professional',
    type: 'professional' as const,
    price: 79,
    creditsPerMonth: 2000,
    features: ['Advanced voice cloning', 'API access', 'Fast queue', 'All languages', '4K resolution'],
    limits: {
      maxFileSize: 5 * 1024 * 1024 * 1024,
      maxResolution: '4K',
      languages: 1000,
      voiceCloning: true,
      apiAccess: true,
    },
  },
} as const;

// Credit Purchase Packages
export const CREDIT_PACKAGES = [
  { id: 'small', credits: 100, price: 9.99, savings: 0 },
  { id: 'medium', credits: 500, price: 39.99, savings: 20 },
  { id: 'large', credits: 1000, price: 69.99, savings: 30 },
  { id: 'enterprise', credits: 5000, price: 299.99, savings: 40 },
] as const;

// UI Constants
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// WebSocket Constants
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOB_PROGRESS: 'job_progress',
  JOB_COMPLETED: 'job_completed',
  JOB_FAILED: 'job_failed',
  NOTIFICATION: 'notification',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  FILE_TOO_LARGE: 'File size exceeds your plan limit.',
  UNSUPPORTED_FORMAT: 'This file format is not supported.',
  INSUFFICIENT_CREDITS: 'Insufficient credits for this operation.',
  UPLOAD_FAILED: 'Upload failed. Please try again.',
  PROCESSING_ERROR: 'An error occurred during processing.',
  AUTH_REQUIRED: 'Authentication required.',
  INVALID_TOKEN: 'Invalid or expired authentication token.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  UPLOAD_STARTED: 'Upload started successfully.',
  JOB_CREATED: 'Job created successfully.',
  PAYMENT_PROCESSED: 'Payment processed successfully.',
  PREFERENCES_SAVED: 'Preferences saved successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
} as const;