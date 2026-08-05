
"use client";

import { createContext, useState, useContext, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/lib/types';
import { supabase } from '@/lib/supabase-client';
import { isOnboardingComplete } from '@/lib/onboarding';
import { AccountRestoreModal } from '@/components/account-restore-modal';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  fetchUserProfile: (uid: string) => Promise<User | null>;
  createNewUserProfile: (supabaseUser: any) => Promise<User | null>;
  currency: string;
  setCurrency: (c: string) => Promise<void>;
  exchangeRates: Record<string, number>;
  detectedCountry: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrencyState] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({ USD: 1.0, INR: 86.0 });
  const [detectedCountry, setDetectedCountry] = useState('US');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Detect Country and fetch exchange rates
    fetch('/api/currency/detect')
      .then(r => r.json())
      .then(data => {
        if (data && data.rates) {
          setExchangeRates(data.rates);
        }
        if (data && data.country) {
          setDetectedCountry(data.country);
        }
        
        // 2. Set preferred currency based on priority: localstorage > user profile > detected geo
        const savedLocal = localStorage.getItem('jobsdart_currency');
        if (savedLocal) {
          setCurrencyState(savedLocal.toUpperCase());
        } else if (user?.preferredCurrency) {
          setCurrencyState((user.preferredCurrency as string).toUpperCase());
        } else if (data && data.currency) {
          setCurrencyState(data.currency.toUpperCase());
        }
      })
      .catch(err => console.error('[USER_CONTEXT] Currency detection failed:', err));
  }, [user?.preferredCurrency]);

  const setCurrency = async (newCurrency: string) => {
    const formatted = newCurrency.toUpperCase();
    setCurrencyState(formatted);
    localStorage.setItem('jobsdart_currency', formatted);
    
    // Save to profile if logged in
    if (user?.uuid) {
      try {
        await fetch('/api/currency/preferred', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.uuid, preferredCurrency: formatted }),
        });
      } catch (err) {
        console.error('[USER_CONTEXT] Failed to save preferred currency to DB:', err);
      }
    }
  };

  useEffect(() => {
    if (loading || !user || !pathname) return;

    const allowedPaths = ['/profile', '/feedback', '/settings'];
    const isAllowedPath = allowedPaths.some(p => pathname.startsWith(p));

    if (user.role === 'Job Seeker') {
        if (!isOnboardingComplete(user)) {
            if (!pathname.startsWith('/onboarding') && !isAllowedPath) {
                router.replace('/onboarding');
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
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      loading, 
      logout, 
      refreshUser, 
      fetchUserProfile, 
      createNewUserProfile,
      currency,
      setCurrency,
      exchangeRates,
      detectedCountry
    }}>
      {children}
      <AccountRestoreModal
        open={Boolean(user?.isDeleted || user?.status === 'deleted')}
        onRestored={refreshUser}
      />
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
