import { useState, useEffect } from 'react';
import { createExpenseApplication, getExpenseApplications } from '../lib/supabase';
  createApplication, 
  getApplications 
interface ExpenseItem {
  id?: string;
  category: string;
  date: string;
  amount: number;
  description: string;
  receipt_url?: string;
}

interface Application {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description?: string;
  data: any;
  total_amount: number;
}

export function useExpenses() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = async () => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getApplications(currentUser.id, 'expense');
      
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
      const { data, error: createError } = await createApplication({
        user_id: currentUser.id,
        type: 'expense',
        title: title,
        data: { items },
        total_amount: totalAmount
      });

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