
"use client";

import { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/lib/types';
import { supabase } from '@/lib/supabase-client';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  logout: () => Promise<void>;
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

    if (user.role === 'Job Seeker' && (!user.planType || user.planType === 'none')) {
        if (!pathname.startsWith('/jobseeker/plans') && !isAllowedPath) {
            router.replace('/jobseeker/plans');
        }
    }
  }, [user, loading, pathname, router]);

  const fetchUserProfile = useCallback(async (uid: string): Promise<User | null> => {
    try {
      const res = await fetch(`/api/users?uid=${uid}`);
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }, []);
  
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


  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Background events like TOKEN_REFRESHED (often triggered by tab focus) 
      // shouldn't show a global loading spinner if we already have a user.
      const isInitial = event === 'INITIAL_SESSION';
      const isSignEvent = event === 'SIGNED_IN' || event === 'SIGNED_OUT';
      
      // Only show global loading on the very first check or during significant auth transitions
      if (isInitial || (isSignEvent && !user)) {
          setLoading(true);
      }

      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id);
        setUserState(userProfile);
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
    <UserContext.Provider value={{ user, setUser, loading, logout, fetchUserProfile, createNewUserProfile }}>
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
