import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CREDIT_COSTS, QUALITY_TIERS } from './constants';
import type { Job, UploadOptions, Language } from '@/types';

// Utility function for combining CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format file size to human readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format duration from seconds to human readable format
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Format date to relative time
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

// Calculate estimated job cost in credits
export function calculateJobCost(
  durationMinutes: number,
  targetLanguages: string[],
  voiceCloning: boolean = false,
  qualityTier: keyof typeof QUALITY_TIERS = 'STANDARD'
): number {
  const qualityMultiplier = QUALITY_TIERS[qualityTier].multiplier;

  const asrCost = durationMinutes * CREDIT_COSTS.ASR_PER_MINUTE;
  const translationCost = durationMinutes * targetLanguages.length * CREDIT_COSTS.TRANSLATION_PER_MINUTE_PER_LANGUAGE;
  const ttsCost = durationMinutes * targetLanguages.length * (
    voiceCloning ? CREDIT_COSTS.TTS_VOICE_CLONING_PER_MINUTE : CREDIT_COSTS.TTS_BASIC_PER_MINUTE
  );
  const syncCost = durationMinutes * CREDIT_COSTS.SYNC_PER_MINUTE;
  const overheadCost = durationMinutes * CREDIT_COSTS.OVERHEAD_PER_MINUTE;

  const totalCost = (asrCost + translationCost + ttsCost + syncCost + overheadCost) * qualityMultiplier;

  return Math.ceil(totalCost);
}

// Estimate processing time based on file characteristics
export function estimateProcessingTime(
  durationMinutes: number,
  targetLanguages: number,
  qualityTier: keyof typeof QUALITY_TIERS = 'standard'
): number {
  const qualityMultiplier = QUALITY_TIERS[qualityTier.toUpperCase() as keyof typeof QUALITY_TIERS].multiplier;

  // Base times in minutes (from constants)
  const baseTimes = {
    ingest: 0.75,
    asr: 2.25,
    translation: 1.5,
    tts: 3.75 * targetLanguages,
    sync: 1.33,
    final: 0.75,
  };

  const totalBaseTime = Object.values(baseTimes).reduce((sum, time) => sum + time, 0);
  const durationMultiplier = Math.max(1, durationMinutes / 5); // Scale with duration

  return Math.ceil((totalBaseTime * durationMultiplier * qualityMultiplier) / 60); // Return in hours
}

// Validate file type and size
export function validateFile(file: File, maxSize: number): { valid: boolean; error?: string } {
  const videoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm', 'video/quicktime'];
  const audioTypes = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/flac', 'audio/ogg', 'audio/aac'];

  if (!videoTypes.includes(file.type) && !audioTypes.includes(file.type)) {
    return { valid: false, error: 'This file format is not supported.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds ${formatFileSize(maxSize)} limit.` };
  }

  return { valid: true };
}

// Get language from code
export function getLanguageByCode(code: string, languages: Language[]): Language | undefined {
  return languages.find(lang => lang.code === code);
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Calculate percentage progress
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((current / total) * 100));
}

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Check if job is in final stage
export function isJobInFinalStage(job: Job): boolean {
  return job.currentStage === 'final' || job.status === 'completed';
}

// Get job stage progress
export function getJobStageProgress(job: Job): { stage: string; progress: number } {
  const stages = ['ingest', 'asr', 'translation', 'tts', 'sync', 'final'];
  const currentIndex = stages.indexOf(job.currentStage);

  if (currentIndex === -1) return { stage: 'unknown', progress: 0 };

  const stageProgress = job.stages.find(s => s.stage === job.currentStage)?.progress || 0;
  const baseProgress = (currentIndex / stages.length) * 100;
  const currentStageWeight = 100 / stages.length;
  const totalProgress = baseProgress + (stageProgress / 100) * currentStageWeight;

  return {
    stage: job.currentStage,
    progress: Math.min(100, Math.round(totalProgress)),
  };
}

// Format credit amount with proper pluralization
export function formatCredits(amount: number): string {
  return `${amount.toLocaleString()} credit${amount !== 1 ? 's' : ''}`;
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize filename for storage
export function sanitizeFilename(filename: string): string {
  // Remove or replace invalid characters
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

// Get file extension from filename
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

// Check if color is light or dark
export function isLightColor(hexColor: string): boolean {
  const color = hexColor.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness > 155;
}

// Create a download link for a file
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.body.removeChild(textArea);
    return true;
  }
}

// Get default upload options based on user preferences
export function getDefaultUploadOptions(userPreferences?: Partial<UploadOptions>): UploadOptions {
  return {
    sourceLanguage: undefined,
    targetLanguages: ['en'], // Default to English
    voiceStyle: 'natural',
    qualityTier: 'standard',
    autoDetectLanguage: true,
    generateSubtitles: true,
    preserveOriginalAudio: false,
    ...userPreferences,
  };
}

// Generate a shareable URL for a job
export function generateShareableUrl(jobId: string, baseUrl: string = window.location.origin): string {
  return `${baseUrl}/player/${jobId}`;
}

// Parse error message from API response
export function parseApiError(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'An unexpected error occurred.';
}