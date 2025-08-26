import { useState, useEffect } from 'react';
import { createTravelRegulation, getTravelRegulations } from '../lib/supabase';
import { auth } from '../lib/auth';

interface TravelRegulation {
  id: string;
  company_name: string;
  version: string;
  status: string;
  company_info: object;
  articles: object;
  positions: object[];
  settings: object;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: {
    name: string;
  };
}

export function useTravelRegulations() {
  const [regulations, setRegulations] = useState<TravelRegulation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRegulations = async () => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getTravelRegulations(currentUser.id);
      
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setRegulations(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '出張規程の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegulations();
  }, []);

  const createRegulation = async (regulationData: {
    company_name: string;
    version: string;
    status: string;
    company_info: object;
    articles: object;
    positions: object[];
    settings: object;
  }) => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: createError } = await createTravelRegulation({
        ...regulationData,
        created_by: currentUser.id
      });

      if (createError) {
        setError(createError.message);
        return { success: false, error: createError.message };
      }

      // 規程一覧を再読み込み
      await loadRegulations();
      
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '出張規程の作成に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    regulations,
    loading,
    error,
    createRegulation,
    refreshRegulations: loadRegulations
  };
}