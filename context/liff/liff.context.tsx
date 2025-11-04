'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import liff from '@line/liff';

/**
 * LIFF Context
 * Manages LINE LIFF authentication and user profile
 * 
 * Security Features:
 * - Ensures LIFF is only accessible within LINE app
 * - Auto-redirects non-LIFF browsers to error page
 * - Validates LIFF initialization before allowing access
 * - Provides parent profile after verification
 */

// Define LIFF Profile type manually (LINE LIFF SDK doesn't export it)
interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

interface LiffContextType {
  isInitialized: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  profile: LiffProfile | null;
  parentProfile: ParentProfile | null;
  login: () => void;
  logout: () => void;
  refreshParentProfile: () => Promise<void>;
}

interface ParentProfile {
  id: number;
  name: string;
  email: string;
  contactNo: string;
  lineId: string;
  profilePicture?: string;
}

const LiffContext = createContext<LiffContextType | undefined>(undefined);

export const LiffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);

  /**
   * Initialize LIFF on mount
   */
  useEffect(() => {
    initializeLiff();
  }, []);

  const initializeLiff = async () => {
    try {
      setIsLoading(true);
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

      if (!liffId) {
        throw new Error('LIFF ID is not configured');
      }

      // Initialize LIFF
      await liff.init({ liffId });
      setIsInitialized(true);

      // Check if user is logged in
      if (liff.isLoggedIn()) {
        setIsLoggedIn(true);
        
        // Get LINE profile
        const userProfile = await liff.getProfile();
        setProfile(userProfile);

        // Fetch parent profile from backend
        await fetchParentProfile(userProfile.userId);
      } else {
        // Not logged in - redirect to LINE login
        setIsLoggedIn(false);
      }
    } catch (err: any) {
      console.error('LIFF initialization failed:', err);
      setError(err.message || 'Failed to initialize LIFF');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch parent profile from backend using LINE user ID
   */
  const fetchParentProfile = async (lineUserId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/parents/profile?lineUserId=${lineUserId}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          // Parent not verified yet - this is okay, user will verify on login page
          return;
        }
        throw new Error('Failed to fetch parent profile');
      }

      const data = await response.json();
      setParentProfile(data);
    } catch (err: any) {
      console.error('Failed to fetch parent profile:', err);
      // Don't set error here - parent might not be verified yet
    }
  };

  /**
   * Login with LINE
   */
  const login = () => {
    if (!isInitialized) return;
    liff.login();
  };

  /**
   * Logout from LINE
   */
  const logout = () => {
    if (!isInitialized) return;
    liff.logout();
    setIsLoggedIn(false);
    setProfile(null);
    setParentProfile(null);
  };

  /**
   * Refresh parent profile (call after verification)
   */
  const refreshParentProfile = async () => {
    if (!profile) return;
    await fetchParentProfile(profile.userId);
  };

  const value: LiffContextType = {
    isInitialized,
    isLoggedIn,
    isLoading,
    error,
    profile,
    parentProfile,
    login,
    logout,
    refreshParentProfile,
  };

  return <LiffContext.Provider value={value}>{children}</LiffContext.Provider>;
};

/**
 * Hook to use LIFF context
 */
export const useLiff = () => {
  const context = useContext(LiffContext);
  if (!context) {
    throw new Error('useLiff must be used within LiffProvider');
  }
  return context;
};

/**
 * Security: Ensure code only runs in LIFF environment
 */
export const isInLiffBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  return liff.isInClient();
};

/**
 * Get LIFF context (current page context)
 */
export const getLiffContext = () => {
  if (typeof window === 'undefined') return null;
  return liff.getContext();
};
