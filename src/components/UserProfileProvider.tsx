import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  position: string | null;
  phone: string | null;
  department: string | null;
  role: string | null;
  onboarding_completed: boolean | null;
}

interface UserProfileContextType {
  profile: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string; data?: UserProfile }>;
  loading: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, updateProfile } = useAuth();

  return (
    <UserProfileContext.Provider value={{ profile, updateProfile, loading }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}