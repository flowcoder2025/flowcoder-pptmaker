/**
 * 알림 상태 관리 스토어
 *
 * @description
 * 구독 관련 알림을 관리하는 Zustand 스토어
 */

import { create } from 'zustand';
import { logger } from '@/lib/logger';

export interface Notification {
  id: string;
  type: 'EXPIRING_SOON' | 'EXPIRED' | 'PAYMENT_FAILED' | 'PAYMENT_SUCCESS' | 'RENEWED';
  title: string;
  message: string;
  daysBeforeExpiry?: number | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

interface NotificationState {
  // 상태
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;

  // 액션
  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // 초기 상태
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  lastFetched: null,

  // 알림 목록 조회
  fetchNotifications: async (unreadOnly = false) => {
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams();
      if (unreadOnly) params.set('unreadOnly', 'true');

      const response = await fetch(`/api/notifications?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '알림을 불러오지 못했어요');
      }

      const data = await response.json();

      set({
        notifications: data.notifications,
        unreadCount: data.unreadCount,
        isLoading: false,
        lastFetched: new Date(),
      });
    } catch (error) {
      logger.error('알림 목록 조회 실패', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '알림을 불러오지 못했어요',
      });
    }
  },

  // 선택한 알림 읽음 처리
  markAsRead: async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '알림 처리에 실패했어요');
      }

      const data = await response.json();

      // 로컬 상태 업데이트
      const { notifications } = get();
      const updatedNotifications = notifications.map((n) =>
        notificationIds.includes(n.id)
          ? { ...n, isRead: true, readAt: new Date().toISOString() }
          : n
      );

      set({
        notifications: updatedNotifications,
        unreadCount: data.unreadCount,
      });
    } catch (error) {
      logger.error('알림 읽음 처리 실패', error);
      set({
        error: error instanceof Error ? error.message : '알림 처리에 실패했어요',
      });
    }
  },

  // 모든 알림 읽음 처리
  markAllAsRead: async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '알림 처리에 실패했어요');
      }

      // 로컬 상태 업데이트
      const { notifications } = get();
      const updatedNotifications = notifications.map((n) => ({
        ...n,
        isRead: true,
        readAt: new Date().toISOString(),
      }));

      set({
        notifications: updatedNotifications,
        unreadCount: 0,
      });
    } catch (error) {
      logger.error('전체 알림 읽음 처리 실패', error);
      set({
        error: error instanceof Error ? error.message : '알림 처리에 실패했어요',
      });
    }
  },

  // 에러 초기화
  clearError: () => set({ error: null }),
}));
