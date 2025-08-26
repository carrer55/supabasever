import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 接続テスト関数
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    
    if (error) {
      // テーブルが存在しない場合は正常（接続は成功）
      if (error.code === 'PGRST116' || error.code === 'PGRST205' || error.message.includes('does not exist') || error.message.includes('Could not find the table')) {
        return { 
          success: true, 
          message: 'Supabaseに正常に接続されました（データベースは空です）',
          details: 'プロジェクトは正常に動作しています'
        };
      }
      return { 
        success: false, 
        message: 'Supabase接続エラー', 
        error: error.message 
      };
    }
    
    return { 
      success: true, 
      message: 'Supabaseに正常に接続されました',
      data 
    };
  } catch (error) {
    return { 
      success: false, 
      message: '接続テストに失敗しました', 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}