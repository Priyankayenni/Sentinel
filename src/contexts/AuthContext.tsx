/**
 * Authentication Context
 * Manages user authentication state with Supabase Auth + RBAC
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/lib/database.types';

interface AuthUser {
  id: string;
  email: string;
  profile: Profile | null;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
  hasPermission: (requiredRole: UserRole) => boolean;
  canWrite: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  analyst: 2,
  viewer: 1,
};

// Demo users for when Supabase is not configured
const DEMO_USERS: Record<string, { password: string; profile: Profile }> = {
  'admin@sentinel.io': {
    password: 'Admin@123',
    profile: {
      id: 'demo-admin-id',
      email: 'admin@sentinel.io',
      full_name: 'Alex Admin',
      avatar_url: null,
      role: 'admin',
      department: 'Security Operations',
      is_active: true,
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  'analyst@sentinel.io': {
    password: 'Analyst@123',
    profile: {
      id: 'demo-analyst-id',
      email: 'analyst@sentinel.io',
      full_name: 'Sam Analyst',
      avatar_url: null,
      role: 'analyst',
      department: 'Threat Intelligence',
      is_active: true,
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  'viewer@sentinel.io': {
    password: 'Viewer@123',
    profile: {
      id: 'demo-viewer-id',
      email: 'viewer@sentinel.io',
      full_name: 'Val Viewer',
      avatar_url: null,
      role: 'viewer',
      department: 'Management',
      is_active: true,
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
};

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && url !== 'your_supabase_project_url' && key && key !== 'your_supabase_anon_key';
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data as Profile;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    // Check for demo session
    const demoSession = localStorage.getItem('sentinel_demo_session');
    if (demoSession) {
      try {
        const parsed = JSON.parse(demoSession) as Profile;
        setProfile(parsed);
        setUser({ id: parsed.id, email: parsed.email, profile: parsed });
        setIsLoading(false);
        return;
      } catch {
        localStorage.removeItem('sentinel_demo_session');
      }
    }

    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    // Initialize Supabase auth
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const prof = await fetchProfile(session.user.id);
        setProfile(prof);
        setUser({ id: session.user.id, email: session.user.email!, profile: prof });
      }
      setIsLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const prof = await fetchProfile(session.user.id);
        setProfile(prof);
        setUser({ id: session.user.id, email: session.user.email!, profile: prof });
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    // Demo mode authentication
    if (!isSupabaseConfigured()) {
      const demoUser = DEMO_USERS[email.toLowerCase()];
      if (demoUser && demoUser.password === password) {
        const updatedProfile = { ...demoUser.profile, last_login: new Date().toISOString() };
        localStorage.setItem('sentinel_demo_session', JSON.stringify(updatedProfile));
        setProfile(updatedProfile);
        setUser({ id: updatedProfile.id, email: updatedProfile.email, profile: updatedProfile });
        return { error: null };
      }
      return { error: 'Invalid credentials. Try admin@sentinel.io / Admin@123' };
    }

    // Supabase authentication
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured()) {
      return { error: 'Sign up not available in demo mode. Use the provided demo accounts.' };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    localStorage.removeItem('sentinel_demo_session');
    setUser(null);
    setProfile(null);
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<{ error: string | null }> => {
    if (!profile) return { error: 'No profile found' };

    if (!isSupabaseConfigured()) {
      const updated = { ...profile, ...updates };
      localStorage.setItem('sentinel_demo_session', JSON.stringify(updated));
      setProfile(updated);
      return { error: null };
    }

    try {
      const { error } = await (supabase.from('profiles') as ReturnType<typeof supabase.from>)
        .update(updates)
        .eq('id', profile.id);
      if (error) return { error: (error as { message: string }).message };
    } catch (err) {
      return { error: String(err) };
    }
    setProfile({ ...profile, ...updates });
    return { error: null };
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!profile) return false;
    return ROLE_HIERARCHY[profile.role] >= ROLE_HIERARCHY[requiredRole];
  };

  const value: AuthContextType = {
    user,
    profile,
    role: profile?.role ?? null,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasPermission,
    canWrite: profile ? ['admin', 'analyst'].includes(profile.role) : false,
    isAdmin: profile?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
