'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, Clock, CheckCircle, Play, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useAuth, useAuthGuard } from '@/hooks/useAuth';
import { formatCredits, formatRelativeTime } from '@/lib/utils';

// Mock recent jobs data
const mockJobs = [
  {
    id: '1',
    originalFilename: 'product-demo.mp4',
    status: 'completed' as const,
    progress: 100,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    durationSeconds: 180,
    costCredits: 25,
  },
  {
    id: '2',
    originalFilename: 'tutorial-webinar.mp4',
    status: 'processing' as const,
    progress: 65,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    durationSeconds: 1200,
    costCredits: 150,
  },
  {
    id: '3',
    originalFilename: 'interview-raw.wav',
    status: 'queued' as const,
    progress: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    durationSeconds: 900,
    costCredits: 80,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthGuard();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (user && !user.onboardingCompleted) {
      router.push('/onboarding');
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-xl font-bold">PolyDub</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-foreground">
                Dashboard
              </Link>
              <Link href="/dashboard/jobs" className="text-sm text-muted-foreground hover:text-foreground">
                Jobs
              </Link>
              <Link href="/dashboard/upload" className="text-sm text-muted-foreground hover:text-foreground">
                Upload
              </Link>
              <Link href="/settings/billing" className="text-sm text-muted-foreground hover:text-foreground">
                Billing
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Credits: </span>
              <span className="font-medium">{formatCredits(50)}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user?.displayName?.[0]?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.displayName}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Ready to dub your content to reach a global audience?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Credits</p>
                <p className="text-2xl font-bold">50</p>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">18</p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/dashboard/upload"
              className="flex items-center gap-4 rounded-lg border bg-card p-6 hover:bg-accent transition-colors"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Upload Content</h3>
                <p className="text-sm text-muted-foreground">Start a new dubbing project</p>
              </div>
            </Link>

            <Link
              href="/dashboard/jobs"
              className="flex items-center gap-4 rounded-lg border bg-card p-6 hover:bg-accent transition-colors"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">View Jobs</h3>
                <p className="text-sm text-muted-foreground">Track your dubbing progress</p>
              </div>
            </Link>

            <Link
              href="/settings/billing"
              className="flex items-center gap-4 rounded-lg border bg-card p-6 hover:bg-accent transition-colors"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Manage Credits</h3>
                <p className="text-sm text-muted-foreground">Purchase credits or upgrade plan</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Jobs</h2>
            <Link
              href="/dashboard/jobs"
              className="text-sm text-primary hover:underline"
            >
              View all jobs →
            </Link>
          </div>

          <div className="rounded-lg border bg-card">
            <div className="divide-y">
              {mockJobs.length === 0 ? (
                <div className="p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No jobs yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your first dubbing project to see it here.
                  </p>
                  <Link
                    href="/dashboard/upload"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Content
                  </Link>
                </div>
              ) : (
                mockJobs.map((job) => (
                  <div key={job.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          {job.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                          {job.status === 'processing' && <Clock className="h-5 w-5 text-blue-600 animate-spin" />}
                          {job.status === 'queued' && <Clock className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <div>
                          <h3 className="font-medium">{job.originalFilename}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{formatRelativeTime(job.createdAt)}</span>
                            <span>{Math.ceil(job.durationSeconds / 60)} min</span>
                            <span>{job.costCredits} credits</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium capitalize">
                            {job.status === 'completed' && 'Completed'}
                            {job.status === 'processing' && `${job.progress}%`}
                            {job.status === 'queued' && 'Queued'}
                          </div>
                          {job.status === 'processing' && (
                            <div className="mt-1 w-32 bg-muted rounded-full h-1.5">
                              <div
                                className="bg-primary h-1.5 rounded-full transition-all"
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {job.status === 'completed' && (
                          <Link
                            href={`/player/${job.id}`}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                          >
                            <Play className="h-4 w-4" />
                            Play
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}