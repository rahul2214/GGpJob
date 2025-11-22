
"use client";

import { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '@/lib/types';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { firebaseApp } from '@/firebase/config';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  logout: () => Promise<void>;
  fetchUserProfile: (uid: string) => Promise<User | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      setLoading(true);
      if (firebaseUser) {
        // Additional check for email verification before fetching profile
        if (firebaseUser.emailVerified) {
            const userProfile = await fetchUserProfile(firebaseUser.uid);
            setUserState(userProfile);
        } else {
            // If email is not verified, ensure user is logged out of the app's state
            setUserState(null);
            // Optionally, you can sign them out of Firebase as well to be strict
            // await auth.signOut(); 
        }
      } else {
        // User is signed out
        setUserState(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  const setUser = (user: User | null) => {
    setUserState(user);
  };

  const logout = async () => {
    const auth = getAuth(firebaseApp);
    await auth.signOut();
    setUserState(null);
  }
  
  return (
    <UserContext.Provider value={{ user, setUser, loading, logout, fetchUserProfile }}>
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
