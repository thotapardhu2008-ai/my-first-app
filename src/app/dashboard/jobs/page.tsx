'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Download,
  MoreHorizontal,
  Search,
  Filter,
  RefreshCw,
  ArrowRight,
  FileText,
  Languages,
  Zap,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { formatCredits, formatDuration, formatRelativeTime, getJobStageProgress } from '@/lib/utils';
import { PROCESSING_STAGES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Job, JobStage } from '@/types';

// Mock jobs data
const mockJobs: Job[] = [
  {
    id: '1',
    userId: 'user1',
    originalFilename: 'product-demo.mp4',
    sourceLanguage: 'en',
    targetLanguages: ['es', 'fr'],
    voiceStyle: 'natural',
    qualityTier: 'standard',
    outputResolution: '1080p',
    fileSize: 50000000,
    durationSeconds: 180,
    costCredits: 25,
    status: 'completed',
    progress: 100,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    stages: [
      { stage: 'ingest', status: 'completed', progress: 100, costCredits: 2 },
      { stage: 'asr', status: 'completed', progress: 100, costCredits: 5, actualTime: 135 },
      { stage: 'translation', status: 'completed', progress: 100, costCredits: 8, actualTime: 90 },
      { stage: 'tts', status: 'completed', progress: 100, costCredits: 8, actualTime: 225 },
      { stage: 'sync', status: 'completed', progress: 100, costCredits: 2, actualTime: 80 },
      { stage: 'final', status: 'completed', progress: 100, costCredits: 0, actualTime: 45 },
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
      spent: 25,
      estimated: 28,
      breakdown: {
        asr: 5,
        translation: 8,
        tts: 8,
        sync: 2,
        overhead: 2,
      },
    },
  },
  {
    id: '2',
    userId: 'user1',
    originalFilename: 'tutorial-webinar.mp4',
    sourceLanguage: 'en',
    targetLanguages: ['es', 'fr', 'de'],
    voiceStyle: 'professional',
    qualityTier: 'studio',
    outputResolution: '4K',
    fileSize: 200000000,
    durationSeconds: 1200,
    costCredits: 150,
    status: 'processing',
    progress: 68,
    currentStage: 'tts',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    stages: [
      { stage: 'ingest', status: 'completed', progress: 100, costCredits: 8, actualTime: 60 },
      { stage: 'asr', status: 'completed', progress: 100, costCredits: 30, actualTime: 540 },
      { stage: 'translation', status: 'completed', progress: 100, costCredits: 45, actualTime: 360 },
      { stage: 'tts', status: 'processing', progress: 75, costCredits: 55, estimatedTime: 300 },
      { stage: 'sync', status: 'pending', estimatedTime: 120 },
      { stage: 'final', status: 'pending', estimatedTime: 90 },
    ],
    files: {
      original: 'gs://polydub-files/user123/job457/original.mp4',
      audio: 'gs://polydub-files/user123/job457/audio.wav',
      transcript: 'gs://polydub-files/user123/job457/transcript.json',
    },
    cost: {
      spent: 83,
      estimated: 150,
      breakdown: {
        asr: 30,
        translation: 45,
        tts: 55,
        sync: 15,
        overhead: 5,
      },
    },
  },
  {
    id: '3',
    userId: 'user1',
    originalFilename: 'interview-raw.wav',
    sourceLanguage: 'es',
    targetLanguages: ['en'],
    voiceStyle: 'friendly',
    qualityTier: 'fast',
    fileSize: 30000000,
    durationSeconds: 900,
    costCredits: 80,
    status: 'queued',
    progress: 0,
    currentStage: 'ingest',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    stages: [
      { stage: 'ingest', status: 'pending', estimatedTime: 30 },
      { stage: 'asr', status: 'pending', estimatedTime: 180 },
      { stage: 'translation', status: 'pending', estimatedTime: 120 },
      { stage: 'tts', status: 'pending', estimatedTime: 270 },
      { stage: 'sync', status: 'pending', estimatedTime: 60 },
      { stage: 'final', status: 'pending', estimatedTime: 30 },
    ],
    files: {
      original: 'gs://polydub-files/user123/job458/interview-raw.wav',
    },
    cost: {
      spent: 0,
      estimated: 80,
      breakdown: {
        asr: 15,
        translation: 15,
        tts: 40,
        sync: 7,
        overhead: 3,
      },
    },
  },
  {
    id: '4',
    userId: 'user1',
    originalFilename: 'marketing-video.mp4',
    sourceLanguage: 'en',
    targetLanguages: ['es', 'fr', 'de', 'it', 'pt'],
    voiceStyle: 'professional',
    qualityTier: 'studio',
    fileSize: 150000000,
    durationSeconds: 300,
    costCredits: 120,
    status: 'failed',
    progress: 45,
    errorMessage: 'Audio format not supported. Please convert to MP3 or WAV.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
    stages: [
      { stage: 'ingest', status: 'completed', progress: 100 },
      { stage: 'asr', status: 'error', progress: 0, errorMessage: 'Audio format not supported' },
      { stage: 'translation', status: 'pending' },
      { stage: 'tts', status: 'pending' },
      { stage: 'sync', status: 'pending' },
      { stage: 'final', status: 'pending' },
    ],
    files: {
      original: 'gs://polydub-files/user123/job459/marketing-video.mp4',
    },
    cost: {
      spent: 10,
      estimated: 120,
      breakdown: {
        asr: 20,
        translation: 40,
        tts: 50,
        sync: 5,
        overhead: 5,
      },
    },
  },
];

export default function JobsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(mockJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'processing' | 'completed' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'progress' | 'cost'>('date');
  const [isLoading, setIsLoading] = useState(false);

  // Filter and sort jobs
  useEffect(() => {
    let filtered = jobs;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.originalFilename.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'progress':
          return b.progress - a.progress;
        case 'cost':
          return b.costCredits - a.costCredits;
        default:
          return 0;
      }
    });

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, statusFilter, sortBy]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Mock refresh - would fetch from API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Jobs refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      // Mock retry - would call API
      await new Promise(resolve => setTimeout(resolve, 500));
      setJobs(prev => prev.map(job =>
        job.id === jobId
          ? { ...job, status: 'queued', progress: 0, errorMessage: undefined, updatedAt: new Date().toISOString() }
          : job
      ));
      toast.success('Job restarted successfully');
    } catch (error) {
      toast.error('Failed to restart job');
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      // Mock cancel - would call API
      await new Promise(resolve => setTimeout(resolve, 500));
      setJobs(prev => prev.map(job =>
        job.id === jobId
          ? { ...job, status: 'cancelled', progress: 0, updatedAt: new Date().toISOString() }
          : job
      ));
      toast.success('Job cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel job');
    }
  };

  const getStatusIcon = (status: Job['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'queued':
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: Job['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      case 'queued':
        return 'Queued';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
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
              <span className="text-foreground">Jobs</span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Credits: </span>
              <span className="font-medium">50</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Jobs</h1>
              <p className="text-muted-foreground">
                Track the progress of your dubbing projects
              </p>
            </div>
            <Link
              href="/dashboard/upload"
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              New Job
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-bold">{jobs.length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Processing</p>
                  <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'processing').length}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'completed').length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">
                    {jobs.reduce((sum, job) => sum + job.cost.spent, 0)} credits
                  </p>
                </div>
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-card rounded-lg border p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by filename..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Status</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="date">Sort by Date</option>
                  <option value="progress">Sort by Progress</option>
                  <option value="cost">Sort by Cost</option>
                </select>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="bg-card rounded-lg border">
            {filteredJobs.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Start your first dubbing project to see it here'
                  }
                </p>
                <Link
                  href="/dashboard/upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Upload Content
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        {getStatusIcon(job.status)}
                      </div>

                      {/* Job Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-foreground truncate">
                              {job.originalFilename}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>{formatRelativeTime(job.createdAt)}</span>
                              <span>{formatDuration(job.durationSeconds || 0)}</span>
                              <span>{job.targetLanguages.length} language{job.targetLanguages.length !== 1 ? 's' : ''}</span>
                              <span>{job.costCredits} credits</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {job.status === 'completed' && (
                              <>
                                <Link
                                  href={`/player/${job.id}`}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
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
                                onClick={() => handleRetryJob(job.id)}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <RefreshCw className="h-4 w-4" />
                                Retry
                              </button>
                            )}

                            {job.status === 'processing' && (
                              <Link
                                href={`/dashboard/jobs/${job.id}`}
                                className="inline-flex items-center gap-2 px-3 py-2 border border-input rounded-lg hover:bg-muted transition-colors"
                              >
                                View Details
                              </Link>
                            )}

                            {['queued', 'processing'].includes(job.status) && (
                              <button
                                onClick={() => handleCancelJob(job.id)}
                                className="p-2 hover:bg-muted rounded-lg transition-colors text-red-600"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            )}

                            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Progress and Status */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {getStatusText(job.status)}
                            </span>
                            {job.status === 'processing' && job.currentStage && (
                              <span className="text-sm text-muted-foreground">
                                {PROCESSING_STAGES[job.currentStage.toUpperCase() as keyof typeof PROCESSING_STAGES]?.name || job.currentStage}
                              </span>
                            )}
                          </div>

                          {/* Progress Bar */}
                          {(job.status === 'processing' || job.status === 'completed') && (
                            <div className="space-y-2">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className={cn("h-2 rounded-full transition-all", getProgressColor(job.progress))}
                                  style={{ width: `${job.progress}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{job.progress}% complete</span>
                                <span>{job.cost.spent}/{job.cost.estimated} credits</span>
                              </div>
                            </div>
                          )}

                          {/* Error Message */}
                          {job.status === 'failed' && job.errorMessage && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-800">{job.errorMessage}</p>
                            </div>
                          )}

                          {/* Stage Breakdown for completed jobs */}
                          {job.status === 'completed' && job.stages && (
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {job.stages.filter(s => s.status === 'completed').map((stage) => (
                                <div key={stage.stage} className="flex items-center gap-1">
                                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                  <span>{stage.stage}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Languages */}
                          <div className="flex items-center gap-2">
                            <Languages className="h-4 w-4 text-muted-foreground" />
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">From:</span>
                              <span className="font-medium uppercase">{job.sourceLanguage}</span>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-medium uppercase">{job.targetLanguages.join(', ')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}