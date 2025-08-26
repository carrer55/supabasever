import { useState, useEffect } from 'react';
import { 
  createNotification, 
  getNotifications, 
  markNotificationAsRead 
} from '../lib/supabase';
import { auth } from '../lib/auth';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  category: string;
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getNotifications(currentUser.id);
      
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setNotifications(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '通知の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const createNotif = async (notificationData: {
    type: string;
    title: string;
    message: string;
    category: string;
  }) => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: createError } = await createNotification({
        ...notificationData,
        user_id: currentUser.id
      });

      if (createError) {
        setError(createError.message);
        return { success: false, error: createError.message };
      }

      // 通知一覧を再読み込み
      await loadNotifications();
      
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '通知の作成に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await markNotificationAsRead(notificationId);

      if (updateError) {
        setError(updateError.message);
        return { success: false, error: updateError.message };
      }

      // 通知一覧を再読み込み
      await loadNotifications();
      
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '通知の更新に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    createNotification: createNotif,
    markAsRead,
    refreshNotifications: loadNotifications
  };
}