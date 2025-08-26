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
    // profilesテーブルの存在確認で接続テスト
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) {
      // テーブルが存在しない場合の特別処理
      if (error.code === 'PGRST116' || error.message.includes('relation "public.profiles" does not exist')) {
        return { 
          success: false, 
          message: 'データベーステーブルが作成されていません', 
          details: 'マイグレーションを実行してテーブルを作成してください',
          error: 'Tables not created' 
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
      details: 'データベーステーブルが正常に作成されています'
    };
  } catch (error) {
    return { 
      success: false, 
      message: '接続テストに失敗しました', 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// データベース操作関数

// プロフィール関連
export async function createProfile(profileData: {
  full_name?: string;
  company_name?: string;
  position?: string;
  phone?: string;
  department?: string;
}) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profileData])
    .select()
    .single();

  return { data, error };
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

export async function updateProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

// 申請関連（既存のapplicationsテーブルを使用）
export async function createApplication(applicationData: {
  user_id: string;
  type: string;
  title: string;
  description?: string;
  data: any;
  total_amount?: number;
}) {
  const { data, error } = await supabase
    .from('applications')
    .insert([applicationData])
    .select()
    .single();

  return { data, error };
}

export async function getApplications(userId: string, type?: string) {
  let query = supabase
    .from('applications')
    .select('*')
    .eq('user_id', userId);
    
  if (type) {
    query = query.eq('type', type);
  }
  
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function updateApplicationStatus(
  applicationId: string, 
  status: string, 
  approverId?: string
) {
  const updates: any = { 
    status, 
    updated_at: new Date().toISOString() 
  };
  
  if (status === 'approved' && approverId) {
    updates.approved_at = new Date().toISOString();
    updates.approved_by = approverId;
  }

  const { data, error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', applicationId)
    .select()
    .single();

  return { data, error };
}

// 書類管理関連
export async function createDocument(documentData: {
  user_id: string;
  organization_id?: string;
  application_id?: string;
  type: string;
  title: string;
  content?: object;
  file_url?: string;
  file_size?: number;
  mime_type?: string;
}) {
  const { data, error } = await supabase
    .from('documents')
    .insert([documentData])
    .select()
    .single();

  return { data, error };
}

export async function getDocuments(userId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

// 通知関連
export async function createNotification(notificationData: {
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: object;
}) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([notificationData])
    .select()
    .single();

  return { data, error };
}

export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function markNotificationAsRead(notificationId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single();

  return { data, error };
}