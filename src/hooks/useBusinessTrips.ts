import { useState, useEffect } from 'react';
import { 
  createBusinessTripApplication, 
  getBusinessTripApplications, 
  updateBusinessTripApplicationStatus 
} from '../lib/supabase';
import { auth } from '../lib/auth';

interface BusinessTripApplication {
  id: string;
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
}

export function useBusinessTrips() {
  const [applications, setApplications] = useState<BusinessTripApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = async () => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getBusinessTripApplications(currentUser.id);
      
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setApplications(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '申請の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const createApplication = async (applicationData: {
    title: string;
    purpose: string;
    start_date: string;
    end_date: string;
    destination: string;
    estimated_amount: number;
    daily_allowance: number;
    transportation_cost: number;
    accommodation_cost: number;
  }) => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: createError } = await createBusinessTripApplication({
        ...applicationData,
        user_id: currentUser.id
      });

      if (createError) {
        setError(createError.message);
        return { success: false, error: createError.message };
      }

      // 申請一覧を再読み込み
      await loadApplications();
      
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '申請の作成に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string, 
    status: string, 
    approverId?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await updateBusinessTripApplicationStatus(
        applicationId, 
        status, 
        approverId
      );

      if (updateError) {
        setError(updateError.message);
        return { success: false, error: updateError.message };
      }

      // 申請一覧を再読み込み
      await loadApplications();
      
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ステータス更新に失敗しました';
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
    updateApplicationStatus,
    refreshApplications: loadApplications
  };
}