import { supabase } from './supabase';
import { createProfile, getProfile } from './supabase';

interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  position: string;
  phone: string;
  department: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

class SupabaseAuth {
  private static instance: SupabaseAuth;
  private authState: AuthState = {
    user: null,
    isAuthenticated: false
  };
  private listeners: ((state: AuthState) => void)[] = [];

  static getInstance(): SupabaseAuth {
    if (!SupabaseAuth.instance) {
      SupabaseAuth.instance = new SupabaseAuth();
    }
    return SupabaseAuth.instance;
  }

  constructor() {
    // Supabase認証状態の監視
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      } else {
        this.authState = {
          user: null,
          isAuthenticated: false
        };
        this.notifyListeners();
      }
    });

    // 初期認証状態の確認
    this.checkInitialAuth();
  }

  private async checkInitialAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await this.loadUserProfile(session.user.id);
    }
  }

  private async loadUserProfile(userId: string) {
    const { data: profile, error } = await getProfile(userId);
    
    if (profile) {
      this.authState = {
        user: {
          id: profile.id,
          email: '', // Supabase authから取得
          name: profile.full_name || '',
          company: profile.company_name || '',
          position: profile.position || '',
          phone: profile.phone || '',
          department: profile.department || '',
          role: profile.role || 'user'
        },
        isAuthenticated: true
      };
    } else {
      // プロフィールが存在しない場合は作成
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profileData = {
          full_name: '',
          company_name: '',
          position: '',
          phone: '',
          department: ''
        };
        
        await createProfile(profileData);
        this.authState = {
          user: {
            id: user.id,
            email: user.email || '',
            name: '',
            company: '',
            position: '',
            phone: '',
            department: '',
            role: 'user'
          },
          isAuthenticated: true
        };
      }
    }
    
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState));
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        await this.loadUserProfile(data.user.id);
        return { success: true };
      }

      return { success: false, error: 'ログインに失敗しました' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'ログインエラーが発生しました' 
      };
    }
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    company: string;
    position: string;
    phone: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: undefined // メール確認を無効化
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // プロフィール作成
        const profileData = {
          full_name: userData.name,
          company_name: userData.company,
          position: userData.position,
          phone: userData.phone,
          department: ''
        };

        const { error: profileError } = await createProfile(profileData);
        
        if (profileError) {
          return { success: false, error: 'プロフィール作成に失敗しました' };
        }

        // 自動ログイン
        this.authState = {
          user: {
            id: data.user.id,
            email: userData.email,
            name: userData.name,
            company: userData.company,
            position: userData.position,
            phone: userData.phone,
            department: '',
            role: 'user'
          },
          isAuthenticated: true
        };
        this.notifyListeners();

        return { success: true };
      }

      return { success: false, error: '登録に失敗しました' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '登録エラーが発生しました' 
      };
    }
  }

  async logout() {
    await supabase.auth.signOut();
    this.authState = {
      user: null,
      isAuthenticated: false
    };
    this.notifyListeners();
  }

  getCurrentUser(): User | null {
    return this.authState.user;
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  getAuthState(): AuthState {
    return this.authState;
  }
}

export const auth = SupabaseAuth.getInstance();
export type { User, AuthState };