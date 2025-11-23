'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Download,
  RefreshCw,
  X,
  BarChart3,
  FileText,
  Languages,
  Zap,
  Film,
  Music,
  Subtitles,
  Volume2
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { formatCredits, formatDuration, formatFileSize } from '@/lib/utils';
import { PROCESSING_STAGES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Job } from '@/types';

// Mock job data - in real app would fetch from API based on ID
const getMockJob = (id: string): Job | null => {
  const jobs: Job[] = [
    {
      id: '1',
      userId: 'user1',
      originalFilename: 'product-demo.mp4',
      sourceLanguage: 'en',
      targetLanguages: ['es', 'fr'],
      voiceStyle: 'professional',
      qualityTier: 'studio',
      outputResolution: '4K',
      fileSize: 50000000,
      durationSeconds: 180,
      costCredits: 75,
      status: 'completed',
      progress: 100,
      currentStage: 'final',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      completedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      stages: [
        { stage: 'ingest', status: 'completed', progress: 100, startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 45000).toISOString(), costCredits: 8 },
        { stage: 'asr', status: 'completed', progress: 100, startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 45000).toISOString(), completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 135000).toISOString(), costCredits: 15 },
        { stage: 'translation', status: 'completed', progress: 100, startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 135000).toISOString(), completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 225000).toISOString(), costCredits: 20 },
        { stage: 'tts', status: 'completed', progress: 100, startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 225000).toISOString(), completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 450000).toISOString(), costCredits: 25 },
        { stage: 'sync', status: 'completed', progress: 100, startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 450000).toISOString(), completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 530000).toISOString(), costCredits: 5 },
        { stage: 'final', status: 'completed', progress: 100, startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 530000).toISOString(), completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 575000).toISOString(), costCredits: 2 },
      ],
      files: {
        original: 'gs://polydub-files/user123/job456/original.mp4',
        audio: 'gs://polydub-files/user123/job456/audio.wav',
        transcript: 'gs://polydub-files/user123/job456/transcript.json',
        translated: 'gs://polydub-files/user123/job456/translated.json',
        dubbed: 'gs://polydub-files/user123/job456/dubbed.mp4',
        subtitles: 'gs://polydub-files/user123/job456/subtitles.srt',
      },
      cost: {
        spent: 75,
        estimated: 80,
        breakdown: {
          asr: 15,
          translation: 20,
          tts: 25,
          sync: 5,
          overhead: 10,
        },
      },
    },
    {
      id: '2',
      userId: 'user1',
      originalFilename: 'tutorial-webinar.mp4',
      sourceLanguage: 'en',
      targetLanguages: ['es', 'fr', 'de'],
      voiceStyle: 'natural',
      qualityTier: 'standard',
      outputResolution: '1080p',
      fileSize: 200000000,
      durationSeconds: 1200,
      costCredits: 150,
      status: 'processing',
      progress: 68,
      currentStage: 'tts',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      stages: [
        { stage: 'ingest', status: 'completed', progress: 100, startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 60000).toISOString(), costCredits: 20 },
        { stage: 'asr', status: 'completed', progress: 100, startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 60000).toISOString(), completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 600000).toISOString(), costCredits: 30 },
        { stage: 'translation', status: 'completed', progress: 100, startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 600000).toISOString(), completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 960000).toISOString(), costCredits: 40 },
        { stage: 'tts', status: 'processing', progress: 75, startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 960000).toISOString(), estimatedTime: 1800000, costCredits: 50 },
        { stage: 'sync', status: 'pending', estimatedTime: 720000 },
        { stage: 'final', status: 'pending', estimatedTime: 540000 },
      ],
      files: {
        original: 'gs://polydub-files/user123/job457/original.mp4',
        audio: 'gs://polydub-files/user123/job457/audio.wav',
        transcript: 'gs://polydub-files/user123/job457/transcript.json',
      },
      cost: {
        spent: 90,
        estimated: 150,
        breakdown: {
          asr: 30,
          translation: 40,
          tts: 50,
          sync: 15,
          overhead: 15,
        },
      },
    },
  ];

  return jobs.find(job => job.id === id) || null;
};

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock fetch job data
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const jobData = getMockJob(params.id as string);
        setJob(jobData);
      } catch (error) {
        toast.error('Failed to load job details');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchJob();
    }
  }, [params.id]);

  // Mock real-time updates for processing jobs
  useEffect(() => {
    if (!job || job.status !== 'processing') return;

    const interval = setInterval(() => {
      setJob(prev => {
        if (!prev || prev.status !== 'processing') return prev;

        // Simulate progress updates
        const newProgress = Math.min(100, prev.progress + Math.random() * 5);
        return {
          ...prev,
          progress: newProgress,
          updatedAt: new Date().toISOString(),
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [job?.status]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Job status refreshed');
    } catch (error) {
      toast.error('Failed to refresh job');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCancel = async () => {
    if (!job) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setJob(prev => prev ? { ...prev, status: 'cancelled', progress: 0 } : null);
      toast.success('Job cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel job');
    }
  };

  const handleRetry = async () => {
    if (!job) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setJob(prev => prev ? { ...prev, status: 'queued', progress: 0, errorMessage: undefined } : null);
      toast.success('Job restarted successfully');
    } catch (error) {
      toast.error('Failed to restart job');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Job not found</h2>
          <p className="text-muted-foreground mb-4">The job you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/dashboard/jobs" className="text-primary hover:underline">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: Job['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'processing':
        return <Clock className="h-6 w-6 text-blue-600 animate-spin" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-600" />;
      case 'queued':
        return <Clock className="h-6 w-6 text-muted-foreground" />;
      case 'cancelled':
        return <XCircle className="h-6 w-6 text-gray-600" />;
      default:
        return <Clock className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 40) return 'bg-blue-500';
    if (progress >= 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard/jobs" className="flex items-center gap-2">
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
              <Link href="/dashboard/jobs" className="hover:text-foreground">Jobs</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{job.originalFilename}</span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link
            href="/dashboard/jobs"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header */}
              <div className="bg-card rounded-lg border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(job.status)}
                    <div>
                      <h1 className="text-2xl font-bold">{job.originalFilename}</h1>
                      <p className="text-muted-foreground mt-1">
                        Created {new Date(job.createdAt).toLocaleDateString()} at{' '}
                        {new Date(job.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {job.status === 'completed' && (
                      <>
                        <Link
                          href={`/player/${job.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          <Play className="h-4 w-4" />
                          Play
                        </Link>
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    {job.status === 'failed' && (
                      <button
                        onClick={handleRetry}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Retry Job
                      </button>
                    )}

                    {job.status === 'processing' && (
                      <button
                        onClick={handleCancel}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{job.status}</span>
                    {job.status === 'processing' && job.currentStage && (
                      <span className="text-sm text-muted-foreground">
                        {PROCESSING_STAGES[job.currentStage.toUpperCase() as keyof typeof PROCESSING_STAGES]?.name || job.currentStage}
                      </span>
                    )}
                  </div>

                  {(job.status === 'processing' || job.status === 'completed') && (
                    <>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className={cn("h-3 rounded-full transition-all", getProgressColor(job.progress))}
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>{job.progress}% complete</span>
                        <span>{job.cost.spent}/{job.cost.estimated} credits</span>
                      </div>
                    </>
                  )}

                  {job.status === 'failed' && job.errorMessage && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{job.errorMessage}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pipeline Stages */}
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Processing Pipeline
                </h2>

                <div className="space-y-4">
                  {job.stages.map((stage, index) => {
                    const stageInfo = PROCESSING_STAGES[stage.stage.toUpperCase() as keyof typeof PROCESSING_STAGES];
                    const isCompleted = stage.status === 'completed';
                    const isProcessing = stage.status === 'processing';
                    const isPending = stage.status === 'pending';
                    const isError = stage.status === 'error';

                    return (
                      <div key={stage.stage} className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                            isCompleted && "border-green-500 bg-green-500 text-white",
                            isProcessing && "border-blue-500 bg-blue-500 text-white animate-pulse",
                            isPending && "border-muted text-muted-foreground",
                            isError && "border-red-500 bg-red-500 text-white"
                          )}>
                            {isCompleted && <CheckCircle className="h-5 w-5" />}
                            {isProcessing && <Clock className="h-5 w-5 animate-spin" />}
                            {isPending && <span className="text-sm font-medium">{index + 1}</span>}
                            {isError && <XCircle className="h-5 w-5" />}
                          </div>
                          {index < job.stages.length - 1 && (
                            <div className={cn(
                              "w-0.5 h-8 my-2 transition-colors",
                              isCompleted ? "bg-green-500" : "bg-muted"
                            )} />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium">{stageInfo?.name || stage.stage}</h3>
                            {stage.costCredits && (
                              <span className="text-sm text-muted-foreground">{stage.costCredits} credits</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{stageInfo?.description}</p>

                          {isProcessing && (
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div
                                className="bg-blue-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${stage.progress}%` }}
                              />
                            </div>
                          )}

                          {stage.actualTime && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Completed in {Math.round(stage.actualTime / 1000)}s
                            </p>
                          )}

                          {stage.estimatedTime && isPending && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Estimated {Math.round(stage.estimatedTime / 1000)}s
                            </p>
                          )}

                          {stage.errorMessage && (
                            <p className="text-xs text-red-600 mt-1">{stage.errorMessage}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Files and Downloads */}
              {job.status === 'completed' && (
                <div className="bg-card rounded-lg border p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Generated Files
                  </h2>

                  <div className="grid gap-3">
                    {job.files.original && (
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Film className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Original Video</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(job.fileSize)} • {formatDuration(job.durationSeconds || 0)}
                            </p>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {job.files.dubbed && (
                      <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Languages className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Dubbed Video</p>
                            <p className="text-sm text-muted-foreground">
                              {job.targetLanguages.length} language{job.targetLanguages.length !== 1 ? 's' : ''} • {job.outputResolution}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/player/${job.id}`}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                          >
                            <Play className="h-4 w-4" />
                          </Link>
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {job.files.subtitles && (
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Subtitles className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Subtitle Files</p>
                            <p className="text-sm text-muted-foreground">
                              SRT format for all languages
                            </p>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Job Details */}
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Job Details</h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Source Language</p>
                    <p className="font-medium capitalize">{job.sourceLanguage}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Target Languages</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {job.targetLanguages.map(lang => (
                        <span key={lang} className="px-2 py-1 bg-primary/10 text-primary rounded text-sm capitalize">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Voice Style</p>
                    <p className="font-medium capitalize">{job.voiceStyle}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Quality Tier</p>
                    <p className="font-medium capitalize">{job.qualityTier}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Output Resolution</p>
                    <p className="font-medium">{job.outputResolution}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{formatDuration(job.durationSeconds || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Cost Breakdown
                </h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ASR</span>
                    <span className="text-sm font-medium">{job.cost.breakdown.asr} credits</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Translation</span>
                    <span className="text-sm font-medium">{job.cost.breakdown.translation} credits</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Text-to-Speech</span>
                    <span className="text-sm font-medium">{job.cost.breakdown.tts} credits</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Synchronization</span>
                    <span className="text-sm font-medium">{job.cost.breakdown.sync} credits</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Overhead</span>
                    <span className="text-sm font-medium">{job.cost.breakdown.overhead} credits</span>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Spent</span>
                      <span className="font-bold text-primary">{job.cost.spent} credits</span>
                    </div>
                    {job.status !== 'completed' && (
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Estimated Total</span>
                        <span className="text-sm font-medium">{job.cost.estimated} credits</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Technical Info */}
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Technical Info</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Job ID</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{job.id}</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">File Size</span>
                    <span>{formatFileSize(job.fileSize)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{new Date(job.createdAt).toLocaleString()}</span>
                  </div>
                  {job.completedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Completed</span>
                      <span>{new Date(job.completedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}