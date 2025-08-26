import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RegisterProps {
  onNavigate: (view: string) => void;
}

// Zodスキーマ定義
const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('正しいメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください'),
  confirmPassword: z
    .string()
    .min(1, 'パスワード再確認は必須です')
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

function Register({ onNavigate }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('このメールアドレスは既に登録されています。ログイン画面からログインしてください。');
        } else {
          setError(signUpError.message);
        }
        return;
      }

      if (signUpData.user) {
        // サインアップ成功 - 確認メール送信画面へ
        onNavigate('register-success');
      }
      
    } catch (err) {
      console.error('Registration catch error:', err);
      setError('登録に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="w-full h-24 mx-auto mb-6 flex items-center justify-center">
              <img 
                src="/賢者の精算Logo2_Transparent_NoBuffer copy.png" 
                alt="賢者の精算ロゴ" 
                className="h-full object-contain"
              />
            </div>
            <p className="text-slate-600">賢者の精算へようこそ</p>
          </div>

          {/* 登録フォーム */}
          <div className="backdrop-blur-xl bg-white/20 rounded-xl p-8 border border-white/30 shadow-2xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50/50 border border-red-200/50 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  メールアドレス
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    {...register('email')}
                    className={`w-full pl-10 pr-4 py-3 bg-white/50 border rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 backdrop-blur-xl ${
                      errors.email 
                        ? 'border-red-400 focus:ring-red-400' 
                        : 'border-white/40 focus:ring-emerald-400'
                    }`}
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  パスワード
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`w-full pl-10 pr-12 py-3 bg-white/50 border rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 backdrop-blur-xl ${
                      errors.password 
                        ? 'border-red-400 focus:ring-red-400' 
                        : 'border-white/40 focus:ring-emerald-400'
                    }`}
                    placeholder="8文字以上のパスワード"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  パスワード再確認
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    className={`w-full pl-10 pr-12 py-3 bg-white/50 border rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 backdrop-blur-xl ${
                      errors.confirmPassword 
                        ? 'border-red-400 focus:ring-red-400' 
                        : 'border-white/40 focus:ring-emerald-400'
                    }`}
                    placeholder="パスワードを再入力"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !isValid}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-5 h-5" />
                <span>{isLoading ? '登録中...' : '新規登録'}</span>
              </button>
            </form>

            {/* ログインリンク */}
            <div className="mt-6 text-center">
              <button
                onClick={() => onNavigate('login')}
                className="flex items-center justify-center space-x-2 text-navy-600 hover:text-navy-800 text-sm font-medium transition-colors mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ログイン画面に戻る</span>
              </button>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="mt-6 text-center">
            <p className="text-slate-500 text-xs">
              登録することで、利用規約とプライバシーポリシーに同意したものとみなされます。
            </p>
            <p className="text-slate-500 text-xs mt-2">
              © 2025 賢者の精算. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;