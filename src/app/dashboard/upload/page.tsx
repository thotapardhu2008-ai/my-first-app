'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import {
  Upload,
  File,
  X,
  ArrowRight,
  Link,
  Youtube,
  Instagram,
  Cloud,
  Mic,
  Globe,
  Volume2,
  Zap,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { SUPPORTED_VIDEO_FORMATS, SUPPORTED_AUDIO_FORMATS, MAX_FILE_SIZE } from '@/lib/constants';
import { validateFile, formatFileSize, calculateJobCost } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { UploadOptions, UploadSource } from '@/types';

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploadOptions, setUploadOptions] = useState<UploadOptions>({
    sourceLanguage: undefined,
    targetLanguages: ['en'],
    voiceStyle: 'natural',
    qualityTier: 'standard',
    autoDetectLanguage: true,
    generateSubtitles: true,
    preserveOriginalAudio: false,
  });
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'file' | 'url' | 'youtube' | 'instagram' | 'record'>('file');
  const [isUploading, setIsUploading] = useState(false);

  // Get max file size based on user plan (mock implementation)
  const maxFileSize = MAX_FILE_SIZE.FREE; // Would normally check user's subscription

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach((rejected) => {
        if (rejected.errors.some((error: any) => error.code === 'file-too-large')) {
          toast.error(`File ${rejected.file.name} is too large. Maximum size is ${formatFileSize(maxFileSize)}`);
        } else if (rejected.errors.some((error: any) => error.code === 'file-invalid-type')) {
          toast.error(`File ${rejected.file.name} has an unsupported format`);
        }
      });
      return;
    }

    // Validate and add accepted files
    const newFiles = acceptedFiles.map(file => {
      const validation = validateFile(file, maxFileSize);
      if (!validation.valid) {
        toast.error(validation.error);
        return null;
      }

      const fileWithPreview = Object.assign(file, {
        id: Math.random().toString(36).substring(7),
        preview: file.type.startsWith('video/') ? URL.createObjectURL(file) : undefined,
      }) as FileWithPreview;

      return fileWithPreview;
    }).filter(Boolean) as FileWithPreview[];

    setFiles(prev => [...prev, ...newFiles]);
  }, [maxFileSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': SUPPORTED_VIDEO_FORMATS,
      'audio/*': SUPPORTED_AUDIO_FORMATS,
    },
    maxSize: maxFileSize,
    multiple: true,
  });

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleUrlUpload = () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    // Create a mock file object for URL uploads
    const urlFile = {
      id: Math.random().toString(36).substring(7),
      name: urlInput.split('/').pop() || 'media-file',
      size: 0,
      type: 'video/mp4', // Default type, would be detected by backend
      preview: undefined,
    } as any;

    setFiles(prev => [...prev, urlFile]);
    setUrlInput('');
    setShowUrlModal(false);
    toast.success('URL added successfully');
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    if (uploadOptions.targetLanguages.length === 0) {
      toast.error('Please select at least one target language');
      return;
    }

    setIsUploading(true);

    try {
      // Mock upload process - in real implementation, this would:
      // 1. Create upload job via API
      // 2. Handle file uploads (TUS for large files)
      // 3. Start AI processing pipeline
      // 4. Redirect to job tracking page

      for (const file of files) {
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const estimatedCost = calculateJobCost(
          5, // Mock 5 minutes duration
          uploadOptions.targetLanguages.length,
          uploadOptions.voiceStyle !== 'natural',
          uploadOptions.qualityTier
        );

        toast.success(`${file.name} uploaded successfully (${estimatedCost} credits)`);
      }

      // Clear files and redirect to jobs
      setFiles([]);
      router.push('/dashboard/jobs');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const renderUploadTab = () => {
    switch (activeTab) {
      case 'file':
        return (
          <div>
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/25"
              )}
            >
              <input {...getInputProps()} />
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              {isDragActive ? (
                <p className="text-lg font-medium">Drop your files here...</p>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-2">
                    Drag and drop your files here, or click to browse
                  </p>
                  <p className="text-muted-foreground">
                    Supports MP4, MOV, AVI, MP3, WAV, and more. Max size: {formatFileSize(maxFileSize)}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'url':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                <Link className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Upload from URL</h3>
              <p className="text-muted-foreground">
                Enter a direct link to a video or audio file
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleUrlUpload}
                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Add URL
              </button>
            </div>
          </div>
        );

      case 'youtube':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                <Youtube className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Import from YouTube</h3>
              <p className="text-muted-foreground">
                Enter a YouTube video URL to automatically download and process
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleUrlUpload}
                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Import
              </button>
            </div>
          </div>
        );

      case 'instagram':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                <Instagram className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Import from Instagram</h3>
              <p className="text-muted-foreground">
                Enter a public Instagram Reel or video URL
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://instagram.com/reel/..."
                className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleUrlUpload}
                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Import
              </button>
            </div>
          </div>
        );

      case 'record':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary/10">
              <Mic className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Record Audio</h3>
              <p className="text-muted-foreground">
                Use your microphone to record audio directly in your browser
              </p>
            </div>
            <button className="px-8 py-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto">
              <Mic className="h-5 w-5" />
              Start Recording
            </button>
            <p className="text-sm text-muted-foreground">
              Recording feature coming soon
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-xl font-bold">PolyDub</span>
            </Link>
            <nav className="text-sm text-muted-foreground">
              <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">Upload</span>
            </nav>
          </div>

          <div className="text-sm">
            <span className="text-muted-foreground">Credits: </span>
            <span className="font-medium">50</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Upload Content</h1>
            <p className="text-muted-foreground">
              Start dubbing your content to reach a global audience in minutes.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Upload Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upload Tabs */}
              <div className="bg-card rounded-lg border p-6">
                <div className="flex gap-2 mb-6 border-b">
                  {[
                    { id: 'file', label: 'Local File', icon: Upload },
                    { id: 'url', label: 'URL', icon: Link },
                    { id: 'youtube', label: 'YouTube', icon: Youtube },
                    { id: 'instagram', label: 'Instagram', icon: Instagram },
                    { id: 'record', label: 'Record', icon: Mic },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-3 border-b-2 transition-colors",
                          activeTab === tab.id
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {renderUploadTab()}
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="font-medium mb-4">Files to Upload ({files.length})</h3>
                  <div className="space-y-3">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        {file.preview ? (
                          <video
                            src={file.preview}
                            className="h-12 w-12 object-cover rounded"
                            muted
                          />
                        ) : (
                          <div className="h-12 w-12 bg-primary/10 rounded flex items-center justify-center">
                            <File className="h-6 w-6 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {file.size > 0 ? formatFileSize(file.size) : 'URL Import'}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Options Section */}
            <div className="space-y-6">
              {/* Dubbing Options */}
              <div className="bg-card rounded-lg border p-6">
                <h3 className="font-medium mb-4">Dubbing Options</h3>

                <div className="space-y-4">
                  {/* Source Language */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Source Language</label>
                    <select
                      value={uploadOptions.sourceLanguage || ''}
                      onChange={(e) => setUploadOptions(prev => ({
                        ...prev,
                        sourceLanguage: e.target.value || undefined,
                        autoDetectLanguage: !e.target.value,
                      }))}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Auto-detect</option>
                      {/* Would populate with supported languages */}
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>

                  {/* Target Languages */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Languages</label>
                    <div className="space-y-2">
                      {['English', 'Spanish', 'French', 'German'].map((lang) => (
                        <label key={lang} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={uploadOptions.targetLanguages.includes(lang.toLowerCase())}
                            onChange={(e) => {
                              const code = lang.toLowerCase();
                              if (e.target.checked) {
                                setUploadOptions(prev => ({
                                  ...prev,
                                  targetLanguages: [...prev.targetLanguages, code],
                                }));
                              } else {
                                setUploadOptions(prev => ({
                                  ...prev,
                                  targetLanguages: prev.targetLanguages.filter(l => l !== code),
                                }));
                              }
                            }}
                            className="rounded border-input"
                          />
                          <span className="text-sm">{lang}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Voice Style */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Voice Style</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { value: 'natural', label: 'Natural', icon: Volume2 },
                        { value: 'professional', label: 'Professional', icon: Mic },
                        { value: 'friendly', label: 'Friendly', icon: Volume2 },
                      ].map((style) => {
                        const Icon = style.icon;
                        return (
                          <button
                            key={style.value}
                            type="button"
                            onClick={() => setUploadOptions(prev => ({ ...prev, voiceStyle: style.value as any }))}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                              uploadOptions.voiceStyle === style.value
                                ? "border-primary bg-primary/5"
                                : "border-input hover:bg-muted/50"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm">{style.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quality Tier */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Quality</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { value: 'fast', label: 'Fast (30% less)', icon: Zap },
                        { value: 'standard', label: 'Standard', icon: CheckCircle },
                        { value: 'studio', label: 'Studio (2x credits)', icon: CheckCircle },
                      ].map((tier) => {
                        const Icon = tier.icon;
                        return (
                          <button
                            key={tier.value}
                            type="button"
                            onClick={() => setUploadOptions(prev => ({ ...prev, qualityTier: tier.value as any }))}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                              uploadOptions.qualityTier === tier.value
                                ? "border-primary bg-primary/5"
                                : "border-input hover:bg-muted/50"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{tier.label}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Additional Options */}
                  <div className="space-y-3 pt-4 border-t">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={uploadOptions.autoDetectLanguage}
                        onChange={(e) => setUploadOptions(prev => ({ ...prev, autoDetectLanguage: e.target.checked }))}
                        className="rounded border-input"
                      />
                      <div>
                        <span className="text-sm font-medium">Auto-detect source language</span>
                        <p className="text-xs text-muted-foreground">Automatically identify the spoken language</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={uploadOptions.generateSubtitles}
                        onChange={(e) => setUploadOptions(prev => ({ ...prev, generateSubtitles: e.target.checked }))}
                        className="rounded border-input"
                      />
                      <div>
                        <span className="text-sm font-medium">Generate subtitles</span>
                        <p className="text-xs text-muted-foreground">Create subtitle files for translated content</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={uploadOptions.preserveOriginalAudio}
                        onChange={(e) => setUploadOptions(prev => ({ ...prev, preserveOriginalAudio: e.target.checked }))}
                        className="rounded border-input"
                      />
                      <div>
                        <span className="text-sm font-medium">Preserve original audio</span>
                        <p className="text-xs text-muted-foreground">Keep original audio as secondary track</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={files.length === 0 || isUploading}
                className={cn(
                  "w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-medium transition-colors",
                  files.length === 0 || isUploading
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {isUploading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Start Dubbing ({files.length} file{files.length !== 1 ? 's' : ''})
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              {/* Cost Estimate */}
              {files.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Estimated Cost:</span>
                    <span className="text-sm font-bold">
                      {calculateJobCost(
                        5 * files.length, // Mock duration
                        uploadOptions.targetLanguages.length,
                        uploadOptions.voiceStyle !== 'natural',
                        uploadOptions.qualityTier
                      )} credits
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}