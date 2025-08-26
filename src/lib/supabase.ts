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
  id: string;
  email: string;
  name: string;
  company: string;
  position: string;
  phone: string;
  department?: string;
  role?: string;
}) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      ...profileData,
      department: profileData.department || '',
      role: profileData.role || 'user'
    }])
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

export async function updateProfile(userId: string, updates: Partial<{
  name: string;
  company: string;
  position: string;
  phone: string;
  department: string;
}>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

// 出張申請関連
export async function createBusinessTripApplication(applicationData: {
  user_id: string;
  title: string;
  purpose: string;
  start_date: string;
  end_date: string;
  destination: string;
  estimated_amount: number;
  daily_allowance: number;
  transportation_cost: number;
  accommodation_cost: number;
}) {
  const { data, error } = await supabase
    .from('business_trip_applications')
    .insert([applicationData])
    .select()
    .single();

  return { data, error };
}

export async function getBusinessTripApplications(userId: string) {
  const { data, error } = await supabase
    .from('business_trip_applications')
    .select(`
      *,
      profiles!business_trip_applications_user_id_fkey(name, department),
      approver:profiles!business_trip_applications_approver_id_fkey(name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function updateBusinessTripApplicationStatus(
  applicationId: string, 
  status: string, 
  approverId?: string
) {
  const updates: any = { 
    status, 
    updated_at: new Date().toISOString() 
  };
  
  if (status === 'approved' && approverId) {
    updates.approver_id = approverId;
    updates.approved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('business_trip_applications')
    .update(updates)
    .eq('id', applicationId)
    .select()
    .single();

  return { data, error };
}

// 経費申請関連
export async function createExpenseApplication(applicationData: {
  user_id: string;
  title: string;
  total_amount: number;
}, items: Array<{
  category: string;
  date: string;
  amount: number;
  description: string;
  receipt_url?: string;
}>) {
  // 経費申請を作成
  const { data: application, error: appError } = await supabase
    .from('expense_applications')
    .insert([applicationData])
    .select()
    .single();

  if (appError || !application) {
    return { data: null, error: appError };
  }

  // 経費項目を作成
  const itemsWithAppId = items.map(item => ({
    ...item,
    expense_application_id: application.id
  }));

  const { data: expenseItems, error: itemsError } = await supabase
    .from('expense_items')
    .insert(itemsWithAppId)
    .select();

  if (itemsError) {
    // ロールバック：申請を削除
    await supabase
      .from('expense_applications')
      .delete()
      .eq('id', application.id);
    
    return { data: null, error: itemsError };
  }

  return { data: { application, items: expenseItems }, error: null };
}

export async function getExpenseApplications(userId: string) {
  const { data, error } = await supabase
    .from('expense_applications')
    .select(`
      *,
      profiles!expense_applications_user_id_fkey(name, department),
      approver:profiles!expense_applications_approver_id_fkey(name),
      expense_items(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

// 出張規程関連
export async function createTravelRegulation(regulationData: {
  company_name: string;
  version: string;
  status: string;
  company_info: object;
  articles: object;
  positions: object[];
  settings: object;
  created_by: string;
}) {
  const { data, error } = await supabase
    .from('travel_regulations')
    .insert([regulationData])
    .select()
    .single();

  return { data, error };
}

export async function getTravelRegulations(userId: string) {
  const { data, error } = await supabase
    .from('travel_regulations')
    .select(`
      *,
      creator:profiles!travel_regulations_created_by_fkey(name)
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

// 書類管理関連
export async function createDocument(documentData: {
  user_id: string;
  title: string;
  type: string;
  status: string;
  content: object;
  file_url?: string;
  file_size?: string;
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
  category: string;
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

// 管理者用関数
export async function getAllApplicationsForAdmin() {
  const { data: businessTrips, error: btError } = await supabase
    .from('business_trip_applications')
    .select(`
      *,
      profiles!business_trip_applications_user_id_fkey(name, department),
      approver:profiles!business_trip_applications_approver_id_fkey(name)
    `)
    .order('created_at', { ascending: false });

  const { data: expenses, error: expError } = await supabase
    .from('expense_applications')
    .select(`
      *,
      profiles!expense_applications_user_id_fkey(name, department),
      approver:profiles!expense_applications_approver_id_fkey(name),
      expense_items(*)
    `)
    .order('created_at', { ascending: false });

  if (btError || expError) {
    return { data: null, error: btError || expError };
  }

  return { 
    data: { 
      businessTrips: businessTrips || [], 
      expenses: expenses || [] 
    }, 
    error: null 
  };
}