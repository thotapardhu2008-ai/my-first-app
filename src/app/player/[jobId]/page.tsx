'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  SkipBack,
  SkipForward,
  Settings,
  Subtitles,
  Download,
  Share2,
  Eye,
  EyeOff,
  Repeat,
  Pip,
  Fullscreen,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { formatDuration, formatFileSize } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Mock job data
const getMockJob = (jobId: string) => {
  return {
    id: jobId,
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    files: {
      original: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      dubbed: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      subtitles: '/api/subtitles/sample.srt',
    },
  };
};

export default function PlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Comparison mode state
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'a-b' | 'overlay'>('side-by-side');
  const [showOriginal, setShowOriginal] = useState(true);
  const [showDubbed, setShowDubbed] = useState(true);

  // Subtitle state
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [currentSubtitle, setCurrentSubtitle] = useState('');

  // Audio levels
  const [originalVolume, setOriginalVolume] = useState(0.3);
  const [dubbedVolume, setDubbedVolume] = useState(1.0);

  // Refs
  const originalVideoRef = useRef<HTMLVideoElement>(null);
  const dubbedVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLInputElement>(null);

  // Fetch job data
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const jobData = getMockJob(params.jobId as string);
        setJob(jobData);
      } catch (error) {
        toast.error('Failed to load video');
        router.push('/dashboard/jobs');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.jobId) {
      fetchJob();
    }
  }, [params.jobId, router]);

  // Sync video playback
  useEffect(() => {
    const originalVideo = originalVideoRef.current;
    const dubbedVideo = dubbedVideoRef.current;

    if (!originalVideo || !dubbedVideo) return;

    const syncPlayPause = () => {
      if (isPlaying) {
        originalVideo.play();
        dubbedVideo.play();
      } else {
        originalVideo.pause();
        dubbedVideo.pause();
      }
    };

    const syncTime = () => {
      if (Math.abs(originalVideo.currentTime - dubbedVideo.currentTime) > 0.1) {
        const avgTime = (originalVideo.currentTime + dubbedVideo.currentTime) / 2;
        originalVideo.currentTime = avgTime;
        dubbedVideo.currentTime = avgTime;
      }
    };

    const handlePlayPause = () => {
      setCurrentTime(originalVideo.currentTime);
      syncTime();
    };

    originalVideo.addEventListener('play', handlePlayPause);
    originalVideo.addEventListener('pause', handlePlayPause);
    originalVideo.addEventListener('timeupdate', handlePlayPause);
    originalVideo.addEventListener('loadedmetadata', () => setDuration(originalVideo.duration));

    return () => {
      originalVideo.removeEventListener('play', handlePlayPause);
      originalVideo.removeEventListener('pause', handlePlayPause);
      originalVideo.removeEventListener('timeupdate', handlePlayPause);
    };
  }, [isPlaying]);

  // Player controls
  const togglePlayPause = () => {
    const originalVideo = originalVideoRef.current;
    const dubbedVideo = dubbedVideoRef.current;

    if (!originalVideo || !dubbedVideo) return;

    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);

    if (originalVideoRef.current) {
      originalVideoRef.current.currentTime = time;
    }
    if (dubbedVideoRef.current) {
      dubbedVideoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);

    if (dubbedVideoRef.current) {
      dubbedVideoRef.current.volume = newVolume * dubbedVolume;
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    if (dubbedVideoRef.current) {
      dubbedVideoRef.current.muted = newMuted;
    }
  };

  const skipBackward = () => {
    const newTime = Math.max(0, currentTime - 10);
    handleSeek({ target: { value: newTime.toString() } } as any);
  };

  const skipForward = () => {
    const newTime = Math.min(duration, currentTime + 10);
    handleSeek({ target: { value: newTime.toString() } } as any);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = async () => {
    if (!job?.files.dubbed) return;

    try {
      const response = await fetch(job.files.dubbed);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dubbed_${job.originalFilename}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Video not found</h2>
          <p className="text-gray-400 mb-4">The video you're looking for doesn't exist.</p>
          <Link href="/dashboard/jobs" className="text-primary hover:underline">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const renderVideoComparison = () => {
    switch (comparisonMode) {
      case 'side-by-side':
        return (
          <div className="grid grid-cols-2 gap-4 h-full">
            {showOriginal && (
              <div className="relative bg-black">
                <video
                  ref={originalVideoRef}
                  src={job.files.original}
                  className="w-full h-full object-contain"
                  muted={true}
                  volume={originalVolume}
                />
                <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-lg text-sm">
                  Original ({job.sourceLanguage.toUpperCase()})
                </div>
              </div>
            )}
            {showDubbed && (
              <div className="relative bg-black">
                <video
                  ref={dubbedVideoRef}
                  src={job.files.dubbed}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-lg text-sm">
                  Dubbed ({job.targetLanguages.join(', ').toUpperCase()})
                </div>
                {subtitlesEnabled && currentSubtitle && (
                  <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-center max-w-lg">
                    {currentSubtitle}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'a-b':
        return (
          <div className="relative h-full bg-black">
            <video
              ref={showOriginal ? originalVideoRef : dubbedVideoRef}
              src={showOriginal ? job.files.original : job.files.dubbed}
              className="w-full h-full object-contain"
              muted={showOriginal}
              volume={showOriginal ? originalVolume : dubbedVolume}
            />
            <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-lg text-sm">
              {showOriginal ? `Original (${job.sourceLanguage.toUpperCase()})` : `Dubbed (${job.targetLanguages.join(', ').toUpperCase()})`}
            </div>
            {subtitlesEnabled && !showOriginal && currentSubtitle && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-center max-w-lg">
                {currentSubtitle}
              </div>
            )}
          </div>
        );

      case 'overlay':
        return (
          <div className="relative h-full bg-black">
            <video
              ref={originalVideoRef}
              src={job.files.original}
              className="w-full h-full object-contain"
              muted={true}
              volume={originalVolume}
              style={{ opacity: 0.5 }}
            />
            <video
              ref={dubbedVideoRef}
              src={job.files.dubbed}
              className="absolute inset-0 w-full h-full object-contain"
            />
            <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-lg text-sm">
              Comparison Mode
            </div>
            {subtitlesEnabled && currentSubtitle && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-center max-w-lg">
                {currentSubtitle}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard/jobs" className="flex items-center gap-2 text-gray-300 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
              Back
            </Link>
            <div>
              <h1 className="text-lg font-semibold">{job.originalFilename}</h1>
              <p className="text-sm text-gray-400">
                {formatDuration(job.durationSeconds)} • {formatFileSize(job.fileSize)} • {job.costCredits} credits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Video Player */}
      <div ref={containerRef} className="relative h-[calc(100vh-8rem)]">
        {renderVideoComparison()}

        {/* Player Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              ref={progressRef}
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(currentTime / duration) * 100}%, #4B5563 ${(currentTime / duration) * 100}%, #4B5563 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlayPause}
                className="p-3 hover:bg-gray-800 rounded-full transition-colors"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>

              {/* Skip Backward */}
              <button
                onClick={skipBackward}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <SkipBack className="h-5 w-5" />
              </button>

              {/* Skip Forward */}
              <button
                onClick={skipForward}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <SkipForward className="h-5 w-5" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Playback Rate */}
              <select
                value={playbackRate}
                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                className="bg-gray-800 text-white px-2 py-1 rounded text-sm"
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              {/* Comparison Mode */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setComparisonMode('side-by-side')}
                  className={cn(
                    "px-3 py-1 rounded text-sm transition-colors",
                    comparisonMode === 'side-by-side' ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  )}
                >
                  Side by Side
                </button>
                <button
                  onClick={() => setComparisonMode('a-b')}
                  className={cn(
                    "px-3 py-1 rounded text-sm transition-colors",
                    comparisonMode === 'a-b' ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  )}
                >
                  A/B
                </button>
                <button
                  onClick={() => setComparisonMode('overlay')}
                  className={cn(
                    "px-3 py-1 rounded text-sm transition-colors",
                    comparisonMode === 'overlay' ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  )}
                >
                  Overlay
                </button>
              </div>

              {/* Toggle Views */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOriginal(!showOriginal)}
                  className={cn(
                    "p-2 rounded transition-colors",
                    showOriginal ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  )}
                  title="Toggle Original"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowDubbed(!showDubbed)}
                  className={cn(
                    "p-2 rounded transition-colors",
                    showDubbed ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  )}
                  title="Toggle Dubbed"
                >
                  <EyeOff className="h-4 w-4" />
                </button>
              </div>

              {/* Subtitles */}
              <button
                onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                className={cn(
                  "p-2 rounded transition-colors",
                  subtitlesEnabled ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                )}
                title="Toggle Subtitles"
              >
                <Subtitles className="h-5 w-5" />
              </button>

              {/* Settings */}
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
              </button>

              {/* Picture in Picture */}
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <Pip className="h-5 w-5" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                {isFullscreen ? <Fullscreen className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Info Panel */}
      <div className="absolute top-20 right-4 w-80 bg-black/80 backdrop-blur rounded-lg p-4 border border-gray-800">
        <h3 className="font-semibold mb-3">Video Information</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Format:</span>
            <span>{job.outputResolution}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Languages:</span>
            <span>{job.targetLanguages.join(', ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Voice Style:</span>
            <span className="capitalize">{job.voiceStyle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Quality:</span>
            <span className="capitalize">{job.qualityTier}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Duration:</span>
            <span>{formatDuration(job.durationSeconds)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">File Size:</span>
            <span>{formatFileSize(job.fileSize)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Processing Cost:</span>
            <span>{job.costCredits} credits</span>
          </div>
        </div>

        {/* Audio Levels */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h4 className="font-medium mb-3">Audio Levels</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Original</span>
                <span>{Math.round(originalVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={originalVolume}
                onChange={(e) => setOriginalVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Dubbed</span>
                <span>{Math.round(dubbedVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={dubbedVolume}
                onChange={(e) => setDubbedVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}