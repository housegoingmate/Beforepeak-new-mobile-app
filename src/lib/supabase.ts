import { createClient } from '@supabase/supabase-js';
// Optional polyfill; guard for Snack
try { require('react-native-url-polyfill/auto'); } catch (e) { /* noop for Snack */ }
import { storage } from './storage';

const supabaseUrl = 'https://upnqezwtiehbvyurguja.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbnFlendsaWVoYnZ5dXJndWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NzE0NzQsImV4cCI6MjA1MTQ0NzQ3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
