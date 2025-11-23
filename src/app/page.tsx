import Link from "next/link";
import { ArrowRight, Globe, Mic, Languages, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Languages className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">PolyDub</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="container flex min-h-[calc(100vh-4rem)] items-center px-4 py-12">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                AI-Powered Universal
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {" "}Dubbing
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
                Convert audio/video content from any language to any other language while preserving voice character,
                synchronization, and studio-quality output. Support for 1000+ languages.
              </p>
            </div>

            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/dashboard/upload"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
              >
                Start Dubbing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">Languages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">&lt;150ms</div>
                <div className="text-sm text-muted-foreground">Sync Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4K</div>
                <div className="text-sm text-muted-foreground">Max Quality</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">AI</div>
                <div className="text-sm text-muted-foreground">Powered</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="border-t bg-muted/50 py-24">
          <div className="container px-4">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Why Choose PolyDub?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Advanced AI technology meets professional-grade dubbing for unprecedented quality and efficiency.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Voice Preservation</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced voice cloning technology preserves the original speaker's characteristics,
                  emotion, and intonation across all languages.
                </p>
              </div>

              <div className="rounded-lg bg-background p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Languages className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Universal Translation</h3>
                <p className="text-sm text-muted-foreground">
                  Support for 1000+ languages with context-aware translation that preserves meaning,
                  cultural nuances, and technical accuracy.
                </p>
              </div>

              <div className="rounded-lg bg-background p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">
                  Studio-quality results in minutes, not days. Optimized AI pipeline ensures fast
                  turnaround without compromising quality.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t bg-primary py-24 text-primary-foreground">
          <div className="container px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Go Global?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
              Join thousands of creators using PolyDub to reach audiences worldwide.
              Start with 50 free credits and experience the future of content localization.
            </p>
            <div className="mt-8">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground shadow-lg transition-all hover:bg-background/90"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-12">
        <div className="container px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Languages className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold">PolyDub</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered universal dubbing for creators worldwide.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold">Product</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/api" className="hover:text-foreground">API</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold">Company</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-foreground">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold">Support</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 PolyDub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
