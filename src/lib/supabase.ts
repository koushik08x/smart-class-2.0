import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate whether real Supabase configuration is supplied
export const isSupabaseConfigured = Boolean(
  rawSupabaseUrl && 
  rawSupabaseAnonKey && 
  rawSupabaseUrl.startsWith('http') && 
  !rawSupabaseUrl.includes('your-project')
);

// Actual Supabase Client instance (fallback to safe dummy URL if not set to prevent constructor crashes)
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? rawSupabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? rawSupabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Realtime event emitter for multi-tab or intra-app live broadcasts
type Listener<T = any> = (payload: T) => void;
class RealtimeBus {
  private listeners: Map<string, Set<Listener>> = new Map();

  subscribe<T>(channel: string, callback: Listener<T>) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(callback);

    return () => {
      this.listeners.get(channel)?.delete(callback);
    };
  }

  emit<T>(channel: string, payload: T) {
    this.listeners.get(channel)?.forEach((cb) => {
      try {
        cb(payload);
      } catch (err) {
        console.error('Realtime callback error:', err);
      }
    });
  }
}

export const realtimeBus = new RealtimeBus();
