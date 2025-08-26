import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Login from './auth/Login';
import Register from './auth/Register';
import RegisterSuccess from './auth/RegisterSuccess';
import EmailConfirmed from './auth/EmailConfirmed';
import Onboarding from './auth/Onboarding';
import PasswordReset from './auth/PasswordReset';
import Dashboard from './Dashboard';

function AuthWrapper() {
  const [currentView, setCurrentView] = useState<string>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // デモモードのチェック
        const demoMode = localStorage.getItem('demoMode');
        const demoSession = localStorage.getItem('demoSession');
        
        if (demoMode === 'true' && demoSession) {
          try {
            const session = JSON.parse(demoSession);
            if (session.user && session.user.email_confirmed_at) {
              setIsAuthenticated(true);
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error('Demo session parse error:', error);
            localStorage.removeItem('demoMode');
            localStorage.removeItem('demoSession');
          }
        }

        // 通常の認証状態チェック
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError || !profile) {
            console.error('Profile fetch error:', profileError);
            setCurrentView('onboarding');
          } else if (profile && !profile.onboarding_completed) {
            setCurrentView('onboarding');
          } else {
            setIsAuthenticated(true);
          }
        } else {
          setCurrentView('login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setCurrentView('login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id, session?.user?.email_confirmed_at);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!profile || !profile.onboarding_completed) {
            setCurrentView('onboarding');
          } else {
            setIsAuthenticated(true);
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setCurrentView('login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleOnboardingComplete = () => {
    setIsAuthenticated(true);
  };

  const navigateToView = (view: string) => {
    setCurrentView(view);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  switch (currentView) {
    case 'register':
      return <Register onNavigate={navigateToView} />;
    case 'register-success':
      return <RegisterSuccess onNavigate={navigateToView} />;
    case 'email-confirmed':
      return <EmailConfirmed onNavigate={navigateToView} />;
    case 'onboarding':
      return <Onboarding onNavigate={navigateToView} onComplete={handleOnboardingComplete} />;
    case 'password-reset':
      return <PasswordReset onNavigate={navigateToView} />;
    default:
      return <Login onNavigate={navigateToView} onLoginSuccess={handleLoginSuccess} />;
  }
}

export default AuthWrapper;