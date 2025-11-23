import {
  formatFileSize,
  formatDuration,
  formatRelativeTime,
  calculateJobCost,
  validateFile,
  cn
} from '@/lib/utils';
import { SUPPORTED_VIDEO_FORMATS, MAX_FILE_SIZE } from '@/lib/constants';

describe('Utils', () => {
  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle decimal values', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(2621440)).toBe('2.5 MB');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds correctly', () => {
      expect(formatDuration(0)).toBe('0:00');
      expect(formatDuration(65)).toBe('1:05');
      expect(formatDuration(3665)).toBe('1:01:05');
    });

    it('should handle edge cases', () => {
      expect(formatDuration(59)).toBe('0:59');
      expect(formatDuration(60)).toBe('1:00');
      expect(formatDuration(3600)).toBe('1:00:00');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should format recent times correctly', () => {
      const now = new Date();
      jest.setSystemTime(now);

      expect(formatRelativeTime(new Date(now.getTime() - 1000 * 30))).toBe('30 seconds ago');
      expect(formatRelativeTime(new Date(now.getTime() - 1000 * 60 * 5))).toBe('5 minutes ago');
      expect(formatRelativeTime(new Date(now.getTime() - 1000 * 60 * 60 * 2))).toBe('2 hours ago');
    });
  });

  describe('calculateJobCost', () => {
    it('should calculate basic job cost', () => {
      const cost = calculateJobCost(5, ['es'], false, 'STANDARD');
      expect(cost).toBeGreaterThan(0);
    });

    it('should apply voice cloning multiplier', () => {
      const basicCost = calculateJobCost(5, ['es'], false, 'STANDARD');
      const cloningCost = calculateJobCost(5, ['es'], true, 'STANDARD');
      expect(cloningCost).toBeGreaterThan(basicCost);
    });

    it('should scale with multiple target languages', () => {
      const oneLanguage = calculateJobCost(5, ['es'], false, 'STANDARD');
      const twoLanguages = calculateJobCost(5, ['es', 'fr'], false, 'STANDARD');
      expect(twoLanguages).toBeGreaterThan(oneLanguage);
    });

    it('should apply quality tier multipliers', () => {
      const fastCost = calculateJobCost(5, ['es'], false, 'FAST');
      const standardCost = calculateJobCost(5, ['es'], false, 'STANDARD');
      const studioCost = calculateJobCost(5, ['es'], false, 'STUDIO');

      expect(fastCost).toBeLessThan(standardCost);
      expect(studioCost).toBeGreaterThan(standardCost);
    });
  });

  describe('validateFile', () => {
    it('should validate supported video formats', () => {
      const mockFile = new File(['content'], 'video.mp4', { type: 'video/mp4' });
      const result = validateFile(mockFile, MAX_FILE_SIZE.FREE);
      expect(result.valid).toBe(true);
    });

    it('should validate supported audio formats', () => {
      const mockFile = new File(['content'], 'audio.mp3', { type: 'audio/mp3' });
      const result = validateFile(mockFile, MAX_FILE_SIZE.FREE);
      expect(result.valid).toBe(true);
    });

    it('should reject unsupported formats', () => {
      const mockFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const result = validateFile(mockFile, MAX_FILE_SIZE.FREE);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('This file format is not supported.');
    });

    it('should reject files that are too large', () => {
      const mockFile = new File(['content'], 'video.mp4', { type: 'video/mp4' });
      Object.defineProperty(mockFile, 'size', { value: MAX_FILE_SIZE.FREE + 1 });

      const result = validateFile(mockFile, MAX_FILE_SIZE.FREE);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File size exceeds');
    });
  });

  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
      expect(cn('class1', null, 'class2')).toBe('class1 class2');
      expect(cn('class1', 'class2', undefined)).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3');
      expect(cn('class1', true && 'class2', 'class3')).toBe('class1 class2 class3');
    });
  });
});