import { useState, useEffect } from 'react';
import { auth, type User, type AuthState } from '../lib/auth';
import { updateProfile as updateSupabaseProfile } from '../lib/supabase';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(auth.getAuthState());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.subscribe((newState) => {
      setAuthState(newState);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await auth.login(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    company: string;
    position: string;
    phone: string;
  }) => {
    setLoading(true);
    try {
      const result = await auth.register(userData);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    auth.logout();
  };

  const updateProfile = async (updates: Partial<User>) => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    // フロントエンドのUser型からSupabaseのprofiles型にマッピング
    const profileUpdates: any = {};
    if (updates.name !== undefined) profileUpdates.full_name = updates.name;
    if (updates.company !== undefined) profileUpdates.company_name = updates.company;
    if (updates.position !== undefined) profileUpdates.position = updates.position;
    if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
    if (updates.department !== undefined) profileUpdates.department = updates.department;

    setLoading(true);
    try {
      const { data, error } = await updateSupabaseProfile(currentUser.id, profileUpdates);
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'プロフィール更新に失敗しました' 
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    user: authState.user,
    profile: authState.user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: authState.isAuthenticated,
    isOnboardingComplete: true
  };
}