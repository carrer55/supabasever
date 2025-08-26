import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, Database, Wifi } from 'lucide-react';
import { testConnection } from '../lib/supabase';

interface ConnectionTestProps {
  onClose: () => void;
}

function ConnectionTest({ onClose }: ConnectionTestProps) {
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
    error?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runTest = async () => {
      setIsLoading(true);
      try {
        const result = await testConnection();
        setTestResult(result);
      } catch (error) {
        setTestResult({
          success: false,
          message: '接続テストでエラーが発生しました',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    runTest();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <Database className="w-16 h-16 text-navy-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Supabase接続テスト</h2>
          <p className="text-slate-600">データベースへの接続状況を確認しています</p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <Loader className="w-8 h-8 text-navy-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-600">接続テスト中...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`flex items-center space-x-3 p-4 rounded-lg ${
              testResult?.success 
                ? 'bg-emerald-50 border border-emerald-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {testResult?.success ? (
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${
                  testResult?.success ? 'text-emerald-800' : 'text-red-800'
                }`}>
                  {testResult?.message}
                </p>
                {testResult?.details && (
                  <p className="text-sm text-slate-600 mt-1">{testResult.details}</p>
                )}
                {testResult?.error && (
                  <p className="text-sm text-red-600 mt-1">エラー: {testResult.error}</p>
                )}
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-2">接続情報</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">プロジェクトURL:</span>
                  <span className="text-slate-800 font-mono text-xs">
                    {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">APIキー:</span>
                  <span className="text-slate-800 font-mono text-xs">
                    {import.meta.env.VITE_SUPABASE_ANON_KEY ? '設定済み' : '未設定'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-navy-600 to-navy-800 text-white rounded-lg font-medium hover:from-navy-700 hover:to-navy-900 transition-all duration-200"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConnectionTest;