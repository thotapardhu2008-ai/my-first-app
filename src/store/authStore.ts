import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, User, AuthTokens } from '@/types';

interface AuthStore extends AuthState {
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  refreshAccessToken: (newToken: string, expiresAt: number) => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user: User) => set({ user }),
      setTokens: (tokens: AuthTokens) => set({ tokens }),
      setLoading: (isLoading: boolean) => set({ isLoading }),

      login: (user: User, tokens: AuthTokens) => {
        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUserProfile: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates, updatedAt: new Date().toISOString() },
          });
        }
      },

      refreshAccessToken: (accessToken: string, expiresAt: number) => {
        const currentTokens = get().tokens;
        if (currentTokens) {
          set({
            tokens: {
              ...currentTokens,
              accessToken,
              expiresAt,
            },
          });
        }
      },
    }),
    {
      name: 'polydub-auth',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Fallback for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors for easy access to auth state
export const useUser = () => useAuthStore((state) => state.user);
export const useTokens = () => useAuthStore((state) => state.tokens);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);