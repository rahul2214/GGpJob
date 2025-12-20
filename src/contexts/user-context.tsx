
"use client";

import { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '@/lib/types';
import { getAuth, onAuthStateChanged, User as FirebaseUser, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
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
        return await res.json();
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }, []);
  
  const createNewUserProfile = async (firebaseUser: FirebaseUser): Promise<User | null> => {
      const { uid, email, displayName, phoneNumber } = firebaseUser;
      
      const role = "Job Seeker";

      const profileData = {
        id: uid,
        name: displayName || email?.split('@')[0] || 'New User',
        email: email!,
        phone: phoneNumber || '',
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
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        console.error("Firebase config not found.");
        setLoading(false);
        return;
    }
      
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        if (firebaseUser.emailVerified) {
            let userProfile = await fetchUserProfile(firebaseUser.uid);
            // If user exists in Auth but not in DB (e.g., first Google sign-in)
            if (!userProfile) {
                userProfile = await createNewUserProfile(firebaseUser);
            }
            setUserState(userProfile);
        } else {
            // User exists but email is not verified
            setUserState(null);
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
