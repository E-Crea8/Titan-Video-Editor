import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
};

// Demo mode when Supabase is not configured
export const isDemoMode = (): boolean => !isSupabaseConfigured();

// Create a mock client for demo mode that won't throw errors
const createMockClient = (): SupabaseClient => {
  // Return a proxy that handles all method calls gracefully
  const mockAuth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Demo mode - authentication disabled' } }),
    signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Demo mode - authentication disabled' } }),
    signInWithOAuth: async () => ({ data: { provider: '', url: '' }, error: { message: 'Demo mode - authentication disabled' } }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ data: {}, error: { message: 'Demo mode - authentication disabled' } }),
    updateUser: async () => ({ data: { user: null }, error: { message: 'Demo mode - authentication disabled' } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  };

  return {
    auth: mockAuth,
  } as unknown as SupabaseClient;
};

// Create Supabase client - only create real client if configured
export const supabase: SupabaseClient = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : createMockClient();

// Log configuration status (for debugging)
if (isDemoMode()) {
  console.info('🎬 Titan Video Editor running in Demo Mode (no authentication)');
  console.info('To enable authentication, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local');
}

