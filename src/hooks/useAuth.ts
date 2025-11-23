import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { API_ENDPOINTS } from '@/lib/constants';
import { User, AuthTokens } from '@/types';

// API response types
interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

interface GoogleOAuthUrlResponse {
  authUrl: string;
  state: string;
}

// Base API client function
const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const { tokens } = useAuthStore.getState();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(tokens?.accessToken && {
        Authorization: `Bearer ${tokens.accessToken}`,
      }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Authentication hook
export const useAuth = () => {
  const queryClient = useQueryClient();
  const {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    login: storeLogin,
    logout: storeLogout,
    updateUserProfile,
    refreshAccessToken
  } = useAuthStore();

  // Token refresh mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      if (!tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient(API_ENDPOINTS.AUTH.REFRESH, {
        method: 'POST',
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      return response as { accessToken: string; expiresAt: number };
    },
    onSuccess: (data) => {
      refreshAccessToken(data.accessToken, data.expiresAt);
    },
    onError: () => {
      // Refresh failed, log out the user
      storeLogout();
      queryClient.clear();
      toast.error('Session expired. Please log in again.');
    },
  });

  // Check token expiry and refresh if needed
  const checkAndRefreshToken = useCallback(() => {
    if (!tokens) return false;

    const now = Date.now();
    const expiresAt = tokens.expiresAt;
    const timeUntilExpiry = expiresAt - now;

    // Refresh token if it expires in the next 5 minutes
    if (timeUntilExpiry < 5 * 60 * 1000) {
      if (!refreshMutation.isLoading) {
        refreshMutation.mutate();
      }
      return true;
    }

    return false;
  }, [tokens, refreshMutation]);

  // Google OAuth login mutation
  const googleLoginMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiClient(API_ENDPOINTS.AUTH.GOOGLE_OAUTH, {
        method: 'POST',
        body: JSON.stringify({ code }),
      });

      return response as LoginResponse;
    },
    onSuccess: (data) => {
      storeLogin(data.user, data.tokens);
      queryClient.clear();
      toast.success('Welcome to PolyDub!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
      });
    },
    onSettled: () => {
      storeLogout();
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: (error) => {
      // Still log out locally even if server logout fails
      storeLogout();
      queryClient.clear();
      toast.error(error instanceof Error ? error.message : 'Logout failed');
    },
  });

  // Get current user query
  const userQuery = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const response = await apiClient('/api/users/profile');
      return response as User;
    },
    enabled: isAuthenticated && !!tokens?.accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<User>) => {
      const response = await apiClient('/api/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      return response as User;
    },
    onSuccess: (updatedUser) => {
      updateUserProfile(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    },
  });

  // Combined login function for Google OAuth
  const loginWithGoogle = useCallback((code: string) => {
    googleLoginMutation.mutate(code);
  }, [googleLoginMutation]);

  // Logout function
  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  // Check authentication on mount and periodically refresh tokens
  useEffect(() => {
    if (tokens?.accessToken) {
      // Check token expiry immediately
      checkAndRefreshToken();

      // Set up periodic token refresh check (every 4 minutes)
      const interval = setInterval(checkAndRefreshToken, 4 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [tokens, checkAndRefreshToken]);

  // Sync user data with server
  useEffect(() => {
    if (userQuery.data && userQuery.data.updatedAt !== user?.updatedAt) {
      updateUserProfile(userQuery.data);
    }
  }, [userQuery.data, user, updateUserProfile]);

  return {
    // State
    user,
    tokens,
    isAuthenticated,
    isLoading: isLoading || userQuery.isLoading || refreshMutation.isLoading,

    // Mutations
    loginWithGoogle,
    logout,
    updateProfile: updateProfileMutation.mutate,

    // Loading states
    isLoggingIn: googleLoginMutation.isLoading,
    isLoggingOut: logoutMutation.isLoading,
    isUpdatingProfile: updateProfileMutation.isLoading,

    // Error states
    loginError: googleLoginMutation.error,
    logoutError: logoutMutation.error,
    updateProfileError: updateProfileMutation.error,

    // User query
    refetchUser: userQuery.refetch,
  };
};

// Hook for getting Google OAuth URL
export const useGoogleOAuth = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient(API_ENDPOINTS.AUTH.GOOGLE_OAUTH + '/url', {
        method: 'GET',
      });

      return response as GoogleOAuthUrlResponse;
    },
  });
};

// Auth guard hook for protected routes
export const useAuthGuard = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    isReady: !isLoading,
  };
};