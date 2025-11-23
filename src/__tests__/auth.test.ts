import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth, useAuthGuard } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import type { User, AuthTokens } from '@/types';

// Mock the dependencies
jest.mock('@/lib/constants', () => ({
  API_ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      GOOGLE_OAUTH: '/api/auth/google',
    },
  },
}));

// Mock fetch
global.fetch = jest.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAuth', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.getState().logout();
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.tokens).toBe(null);
  });

  it('should handle successful login', async () => {
    const mockUser: User = {
      id: 'user1',
      email: 'test@example.com',
      displayName: 'Test User',
      preferredLanguage: 'en',
      voicePersona: 'natural',
      privacyOptIn: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const mockTokens: AuthTokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: Date.now() + 3600000,
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser, tokens: mockTokens }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await result.current.loginWithGoogle('mock-code');

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.tokens).toEqual(mockTokens);
    });
  });

  it('should handle logout', async () => {
    // First log in
    const mockUser: User = {
      id: 'user1',
      email: 'test@example.com',
      displayName: 'Test User',
      preferredLanguage: 'en',
      voicePersona: 'natural',
      privacyOptIn: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    useAuthStore.getState().login(mockUser, {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: Date.now() + 3600000,
    });

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    result.current.logout();

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.tokens).toBe(null);
    });
  });
});

describe('useAuthGuard', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('should return correct initial state', () => {
    const { result } = renderHook(() => useAuthGuard(), { wrapper: createWrapper() });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isReady).toBe(true);
  });
});