import React, { useState } from 'react';
import { Mail, ArrowLeft, RotateCcw, CheckCircle } from 'lucide-react';

interface PasswordResetProps {
  onNavigate: (view: string) => void;
}

function PasswordReset({ onNavigate }: PasswordResetProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // ローカル実装では、実際のメール送信は行わない
    setTimeout(() => {
      setIsSuccess(true);
      setIsLoading(false);
    }, 1000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 rounded-xl p-8 lg:p-12 border border-emerald-300/30 shadow-2xl">
              <div className="mb-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100/50 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-emerald-800 mb-4">
                  パスワードリセット完了
                </h1>
                <p className="text-xl text-slate-700 mb-2">パスワードがリセットされました</p>
                <p className="text-slate-600">新しいパスワードでログインしてください</p>
              </div>

              <button
                onClick={() => onNavigate('login')}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-navy-600 to-navy-800 hover:from-navy-700 hover:to-navy-900 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 mx-auto"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>ログイン画面に戻る</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-2xl">
              <RotateCcw className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">パスワード再設定</h1>
            <p className="text-slate-600">登録済みのメールアドレスを入力してください</p>
          </div>

          {/* パスワードリセットフォーム */}
          <div className="backdrop-blur-xl bg-white/20 rounded-xl p-8 border border-white/30 shadow-2xl">
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  メールアドレス
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/40 rounded-lg text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 backdrop-blur-xl"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-5 h-5" />
                <span>{isLoading ? '送信中...' : 'リセットメールを送信'}</span>
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

          {/* フッター */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              © 2024 賢者の精算. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PasswordReset;