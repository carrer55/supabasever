import { useState, useEffect } from 'react';
import { 
  createApplication, 
  getApplications, 
  updateApplicationStatus 
} from '../lib/supabase';
import { auth } from '../lib/auth';

interface Application {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description?: string;
  data: any;
  total_amount?: number;
  status: string;
  submitted_at?: string;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export function useBusinessTrips() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = async () => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getApplications(currentUser.id, 'business_trip');
      
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
      const { data, error: createError } = await createApplication({
        user_id: currentUser.id,
        type: 'business_trip',
        title: applicationData.title,
        description: applicationData.purpose,
        data: {
          purpose: applicationData.purpose,
          start_date: applicationData.start_date,
          end_date: applicationData.end_date,
          destination: applicationData.destination,
          daily_allowance: applicationData.daily_allowance,
          transportation_cost: applicationData.transportation_cost,
          accommodation_cost: applicationData.accommodation_cost
        },
        total_amount: applicationData.estimated_amount
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
      const { data, error: updateError } = await updateApplicationStatus(
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