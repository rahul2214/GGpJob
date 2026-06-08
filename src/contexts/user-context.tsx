
"use client";

import { createContext, useState, useContext, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/lib/types';
import { supabase } from '@/lib/supabase-client';
import { isOnboardingComplete } from '@/lib/onboarding';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  fetchUserProfile: (uid: string) => Promise<User | null>;
  createNewUserProfile: (supabaseUser: any) => Promise<User | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || !user || !pathname) return;

    const allowedPaths = ['/profile', '/feedback', '/settings'];
    const isAllowedPath = allowedPaths.some(p => pathname.startsWith(p));

    if (user.role === 'Recruiter' && !user.isPaid) {
        if (!pathname.startsWith('/company/payment') && !isAllowedPath) {
            router.replace('/company/payment');
        }
    }

    if (user.role === 'Job Seeker') {
        if (!isOnboardingComplete(user)) {
            if (!pathname.startsWith('/onboarding') && !isAllowedPath) {
                router.replace('/onboarding');
            }
        } else if (!user.planType || user.planType === 'none') {
            if (!pathname.startsWith('/jobseeker/plans') && !isAllowedPath) {
                router.replace('/jobseeker/plans');
            }
        }
    }
  }, [user, loading, pathname, router]);

  const fetchUserProfile = useCallback(async (uid: string): Promise<User | null> => {
    try {
      const res = await fetch(`/api/users?uid=${uid}`, { cache: 'no-store' });
      if (res.ok) {
        const u = await res.json();
        if (u) {
          u.totalCredits = (u.subscriptionCredits || 0) + (u.purchasedCredits || 0);
        }
        return u;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const updatedProfile = await fetchUserProfile(session.user.id);
      if (updatedProfile) setUserState(updatedProfile);
    }
  }, [fetchUserProfile]);
  
  const createNewUserProfile = async (supabaseUser: any): Promise<User | null> => {
      const { id, email, user_metadata } = supabaseUser;
      
      const role = user_metadata?.role || "Job Seeker";

      const profileData = {
        id: id,
        name: user_metadata?.name || email?.split('@')[0] || 'New User',
        email: email!,
        phone: user_metadata?.phone || '',
        role: role,
      };

      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData),
        });
        if (response.ok) {
            return await response.json();
        } else {
             console.error("Failed to create user profile in DB");
            return null;
        }
      } catch (error) {
           console.error("Error creating user profile in DB:", error);
           return null;
      }
  }


  const userRef = useContext(UserContext)?.user; // This won't work inside provider
  // Actually, I'll just use a local ref inside the provider
  const currentUserRef = useRef<User | null>(null);

  // Sync ref with state
  useEffect(() => {
    currentUserRef.current = user;
  }, [user]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      const isInitial = event === 'INITIAL_SESSION';
      const isSignEvent = event === 'SIGNED_IN' || event === 'SIGNED_OUT';
      
      // Only set loading for initial mount or if we're explicitly signing in/out and don't have a user yet
      // This prevents the "refresh" flicker on mobile during background TOKEN_REFRESHED events
      if (isInitial || (isSignEvent && !currentUserRef.current)) {
          setLoading(true);
      }

      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id);
        
        // Stability check using ref to ensure comparison against latest state
        if (JSON.stringify(userProfile) !== JSON.stringify(currentUserRef.current)) {
            setUserState(userProfile);
        }
      } else {
        setUserState(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const setUser = (user: User | null) => {
    setUserState(user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUserState(null);
    router.replace('/');
  }
  
  return (
    <UserContext.Provider value={{ user, setUser, loading, logout, refreshUser, fetchUserProfile, createNewUserProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
