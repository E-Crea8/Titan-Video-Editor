import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase, isDemoMode } from '@/lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
}

interface AuthStore {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

const mapSupabaseUser = (user: SupabaseUser): User => ({
  id: user.id,
  email: user.email ?? '',
  name: user.user_metadata?.name ?? user.user_metadata?.full_name ?? user.user_metadata?.user_name ?? undefined,
  // Google OAuth provides picture in different fields depending on provider
  avatar: user.user_metadata?.avatar_url ?? 
          user.user_metadata?.picture ?? 
          user.user_metadata?.photo_url ??
          undefined,
  createdAt: user.created_at,
});

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,

      initialize: async () => {
        // In demo mode, skip auth initialization
        if (isDemoMode()) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        try {
          set({ isLoading: true, error: null });

          // Get current session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth initialization error:', error);
            set({ isLoading: false, error: error.message });
            return;
          }

          if (session?.user) {
            set({
              user: mapSupabaseUser(session.user),
              session,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              set({
                user: mapSupabaseUser(session.user),
                session,
                isAuthenticated: true,
              });
            } else {
              set({
                user: null,
                session: null,
                isAuthenticated: false,
              });
            }
          });
        } catch (err) {
          console.error('Auth initialization error:', err);
          set({ isLoading: false, error: 'Failed to initialize authentication' });
        }
      },

      signUp: async (email, password, name) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name },
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }

          if (data.user) {
            set({
              user: mapSupabaseUser(data.user),
              session: data.session,
              isAuthenticated: !!data.session,
              isLoading: false,
            });
          }

          return { success: true };
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Sign up failed';
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      signIn: async (email, password) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }

          if (data.user) {
            set({
              user: mapSupabaseUser(data.user),
              session: data.session,
              isAuthenticated: true,
              isLoading: false,
            });
          }

          return { success: true };
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Sign in failed';
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      signInWithGoogle: async () => {
        try {
          set({ isLoading: true, error: null });

          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }

          return { success: true };
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Google sign in failed';
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true });
          await supabase.auth.signOut();
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (err) {
          console.error('Sign out error:', err);
          set({ isLoading: false });
        }
      },

      resetPassword: async (email) => {
        try {
          set({ isLoading: true, error: null });

          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          });

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }

          set({ isLoading: false });
          return { success: true };
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Password reset failed';
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      updateProfile: async (updates) => {
        try {
          const { user } = get();
          if (!user) return { success: false, error: 'Not authenticated' };

          set({ isLoading: true, error: null });

          const { error } = await supabase.auth.updateUser({
            data: updates,
          });

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }

          set({
            user: { ...user, ...updates },
            isLoading: false,
          });

          return { success: true };
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Profile update failed';
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'AuthStore' }
  )
);

