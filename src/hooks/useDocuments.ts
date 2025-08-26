import { useState, useEffect } from 'react';
import { createDocument, getDocuments } from '../lib/supabase';
import { auth } from '../lib/auth';

interface Document {
  id: string;
  user_id: string;
  title: string;
  type: string;
  status: string;
  content: object;
  file_url?: string;
  file_size?: string;
  created_at: string;
  updated_at: string;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = async () => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getDocuments(currentUser.id);
      
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setDocuments(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '書類の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const createDoc = async (documentData: {
    title: string;
    type: string;
    status: string;
    content: object;
    file_url?: string;
    file_size?: string;
  }) => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: createError } = await createDocument({
        ...documentData,
        user_id: currentUser.id
      });

      if (createError) {
        setError(createError.message);
        return { success: false, error: createError.message };
      }

      // 書類一覧を再読み込み
      await loadDocuments();
      
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '書類の作成に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    documents,
    loading,
    error,
    createDocument: createDoc,
    refreshDocuments: loadDocuments
  };
}