# PolyDub - AI-Powered Universal Dubbing Platform

[![CI/CD](https://github.com/polydub/polydub-web/actions/workflows/ci.yml/badge.svg)](https://github.com/polydub/polydub-web/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/polydub/polydub-web/branch/main/graph/badge.svg)](https://codecov.io/gh/polydub/polydub-web)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

PolyDub is an AI-powered universal dubbing platform that converts audio/video content from any language to any other language while preserving voice character, synchronization, and studio-quality output.

## 🌟 Features

- **🌍 Universal Translation**: Support for 1000+ languages with context-aware translation
- **🎤 Voice Preservation**: Advanced voice cloning technology that preserves the original speaker's characteristics
- **⚡ Lightning Fast**: Studio-quality results in minutes, not days
- **📹 Multi-Format Support**: Video (MP4, MOV, AVI, MKV) and Audio (MP3, WAV, M4A, FLAC)
- **🔄 Real-time Progress**: Track your dubbing projects with live updates
- **📱 Cross-Platform**: Web interface, with mobile apps coming soon
- **💰 Flexible Pricing**: Credit-based system with multiple subscription tiers

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or later
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/polydub/polydub-web.git
   cd polydub-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **State Management**: Zustand, React Query
- **Authentication**: Google OAuth2 + JWT tokens
- **File Upload**: Resumable uploads with TUS protocol
- **Video Processing**: FFmpeg for preprocessing
- **AI Pipeline**: Custom ASR → MT → TTS models
- **Database**: PostgreSQL for user data, Firestore for job tracking
- **Infrastructure**: Google Cloud Platform (Cloud Run, Cloud Storage, Vertex AI)

### Project Structure

```
polydub-web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Authentication routes
│   │   ├── dashboard/          # Main dashboard
│   │   ├── player/             # Video player
│   │   ├── settings/           # User settings
│   │   └── api/                # API routes
│   ├── components/             # Reusable UI components
│   │   ├── auth/
│   │   ├── upload/
│   │   ├── jobs/
│   │   ├── player/
│   │   └── ui/
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and constants
│   ├── store/                  # State management
│   ├── types/                  # TypeScript type definitions
│   └── __tests__/              # Test files
├── public/                     # Static assets
├── docs/                       # Documentation
└── tests/                      # E2E tests
```

## 🔐 Authentication

PolyDub uses Google OAuth2 for authentication. The authentication flow includes:

1. **Google Sign-In**: Users authenticate with their Google account
2. **JWT Tokens**: Secure JSON Web Tokens for session management
3. **Token Refresh**: Automatic token rotation for security
4. **Persistent Sessions**: Secure session storage with httpOnly cookies

## 📤 File Upload System

The upload system supports:

- **Multiple Sources**: Local files, URLs, YouTube, Instagram, cloud storage
- **Large Files**: Resumable uploads with chunking for files >50MB
- **Format Validation**: Comprehensive file type and size validation
- **Progress Tracking**: Real-time upload progress with ETA
- **Error Recovery**: Automatic retry with exponential backoff

### Supported Formats

**Video**: MP4, MOV, AVI, MKV, WebM, QuickTime
**Audio**: MP3, WAV, M4A, FLAC, OGG, AAC

## 🤖 AI Processing Pipeline

The AI processing pipeline consists of six stages:

1. **Ingest**: File validation and preprocessing
2. **ASR**: Speech-to-text with word-level timestamps
3. **Translation**: Neural machine translation with context awareness
4. **TTS**: Text-to-speech with voice cloning capabilities
5. **Synchronization**: Forced alignment with <150ms accuracy
6. **Final Processing**: Video muxing and quality optimization

### Pipeline Features

- **Parallel Processing**: Multiple target languages processed simultaneously
- **Error Handling**: Comprehensive retry logic with fallback strategies
- **Quality Metrics**: Real-time WER, BLEU, and MOS calculation
- **Resource Optimization**: GPU instances for TTS, CPU for ASR/MT

## 💳 Credit System

PolyDub uses a credit-based pricing model:

### Credit Costs (per minute of content)

- **ASR**: 1 credit
- **Translation**: 1 credit per target language
- **TTS (Basic)**: 2 credits
- **TTS (Voice Cloning)**: 5 credits
- **Synchronization**: 0.5 credits
- **Processing Overhead**: 0.5 credits

### Subscription Plans

- **Free**: 50 credits/month, 720p max, 20 languages
- **Creator**: $19/month, 500 credits, 1080p, 100 languages
- **Professional**: $79/month, 2000 credits, 4K, all languages
- **Enterprise**: Custom pricing, unlimited features

## 🎥 Media Player

The advanced media player features:

- **Comparison Modes**: Side-by-side, A/B toggle, overlay
- **Synchronized Playback**: Frame-accurate timing between versions
- **Audio Controls**: Independent volume for original and dubbed tracks
- **Subtitle Support**: Multiple subtitle tracks with customizable positioning
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Mobile Optimization**: Touch gestures and responsive design

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Individual component and utility function tests
- **Integration Tests**: API endpoint and workflow tests
- **E2E Tests**: Complete user journey tests
- **Performance Tests**: Load testing for video processing

### Coverage Requirements

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## 🚀 Deployment

### Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t polydub-web .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 polydub-web
   ```

### Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-jwt-secret
DATABASE_URL=your-database-url
GOOGLE_APPLICATION_CREDENTIALS=path-to-service-account
```

### Production Deployment

The application is designed for deployment on:

- **Google Cloud Run**: Serverless container hosting
- **Vercel**: Next.js optimized hosting
- **AWS ECS**: Container orchestration
- **DigitalOcean**: App Platform or Droplets

## 📊 Monitoring & Observability

### Application Metrics

- **Performance**: Response times, throughput, error rates
- **Business**: Jobs processed, credits spent, user engagement
- **Infrastructure**: CPU, memory, disk usage
- **AI Models**: Accuracy metrics, processing times, resource utilization

### Monitoring Stack

- **Logging**: Structured logging with correlation IDs
- **Metrics**: Prometheus-compatible metrics
- **Tracing**: Distributed tracing for request flows
- **Alerting**: Real-time alerts for critical issues

## 🔒 Security

### Security Features

- **Authentication**: OAuth2 with secure token handling
- **Authorization**: Role-based access control
- **Data Encryption**: AES-256 encryption at rest and in transit
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting per user and IP
- **Audit Logging**: Complete audit trail for all actions

### Privacy Compliance

- **GDPR**: Full compliance with data protection regulations
- **Data Minimization**: Only collect necessary user data
- **User Rights**: Data export, modification, and deletion
- **Consent Management**: granular consent controls
- **Privacy by Design**: Privacy considerations in all features

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Custom linting rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.polydub.com](https://docs.polydub.com)
- **Help Center**: [help.polydub.com](https://help.polydub.com)
- **Community**: [GitHub Discussions](https://github.com/polydub/polydub-web/discussions)
- **Support Email**: support@polydub.com

## 🗺️ Roadmap

### Near Future (Q1 2024)

- [ ] Mobile apps (iOS/Android)
- [ ] Advanced voice customization
- [ ] Batch processing capabilities
- [ ] API access for developers

### Mid-term (Q2-Q3 2024)

- [ ] Real-time dubbing for live streams
- [ ] Custom voice training
- [ ] Enterprise features
- [ ] Advanced analytics dashboard

### Long-term (2025)

- [ ] 8K video support
- [ ] VR/AR content dubbing
- [ ] AI-generated content
- [ ] Global CDN optimization

## 📈 Performance Metrics

### Production Targets

- **Uptime**: 99.9%
- **Response Time**: <200ms (p95)
- **Job Processing**: <10 minutes/hour of content
- **Audio Sync Accuracy**: <150ms
- **Video Quality**: <3% quality loss

### Scaling Capabilities

- **Concurrent Users**: 10,000+
- **Processing Jobs**: 1,000+ per hour
- **File Size**: Up to 10GB per file
- **Storage**: Petabyte-scale capacity

---

Made with ❤️ by the PolyDub team. Transforming content accessibility through AI.