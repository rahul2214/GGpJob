
"use client";

import { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '@/lib/types';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { firebaseApp } from '@/firebase/config';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  login: (userProfile: User) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserProfile: (uid: string) => Promise<User | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false); // New state to prevent race conditions

  const fetchUserProfile = useCallback(async (uid: string): Promise<User | null> => {
    try {
      const res = await fetch(`/api/users?uid=${uid}`);
      
      if (res.ok) {
        const userProfile = await res.json();
        return userProfile;
      } else if (res.status === 404) {
        console.warn(`User profile not found in DB for UID: ${uid}`);
        return null;
      } else {
        console.error("Failed to fetch user profile, status:", res.status);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    // Check for Firebase config before initializing auth
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        console.error("Firebase config not found. Make sure .env.local is set up correctly.");
        setLoading(false);
        return;
    }
      
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // If a login process is active, let it handle the state update
      if (isLoggingIn) return;

      setLoading(true);
      if (firebaseUser) {
        const userProfile = await fetchUserProfile(firebaseUser.uid);
        setUserState(userProfile);
      } else {
        // User is signed out
        setUserState(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile, isLoggingIn]);

  const setUser = (user: User | null) => {
    setUserState(user);
  };

  const login = async (userProfile: User) => {
    setIsLoggingIn(true);
    setUserState(userProfile);
    setIsLoggingIn(false);
  }

  const logout = async () => {
    const auth = getAuth(firebaseApp);
    await auth.signOut();
    setUserState(null);
  }
  
  return (
    <UserContext.Provider value={{ user, setUser, loading, login, logout, fetchUserProfile }}>
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
