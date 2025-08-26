import { useState, useEffect } from 'react';
import { createExpenseApplication, getExpenseApplications } from '../lib/supabase';
import { auth } from '../lib/auth';

interface ExpenseItem {
  id?: string;
  category: string;
  date: string;
  amount: number;
  description: string;
  receipt_url?: string;
}

interface ExpenseApplication {
  id: string;
  user_id: string;
  title: string;
  total_amount: number;
  status: string;
  approver_id?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
    department: string;
  };
  approver?: {
    name: string;
  };
  expense_items?: ExpenseItem[];
}

export function useExpenses() {
  const [applications, setApplications] = useState<ExpenseApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = async () => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getExpenseApplications(currentUser.id);
      
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setApplications(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '経費申請の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const createApplication = async (
    title: string,
    items: ExpenseItem[]
  ) => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    setLoading(true);
    setError(null);

    try {
      const { data, error: createError } = await createExpenseApplication(
        {
          user_id: currentUser.id,
          title,
          total_amount: totalAmount
        },
        items
      );

      if (createError) {
        setError(createError.message);
        return { success: false, error: createError.message };
      }

      // 申請一覧を再読み込み
      await loadApplications();
      
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '経費申請の作成に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    applications,
    loading,
    error,
    createApplication,
    refreshApplications: loadApplications
  };
}