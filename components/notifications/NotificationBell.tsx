'use client';

/**
 * 알림 벨 컴포넌트
 *
 * @description
 * 헤더에 표시되는 알림 아이콘과 드롭다운 메뉴
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Bell, Check, AlertTriangle, CreditCard, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNotificationStore, type Notification } from '@/store/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function NotificationBell() {
  const { status } = useSession();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);

  // 로그인 시 알림 로드
  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotifications();

      // 5분마다 알림 갱신
      const interval = setInterval(() => {
        fetchNotifications();
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [status, fetchNotifications]);

  // 팝업 열릴 때 알림 로드
  useEffect(() => {
    if (isOpen && status === 'authenticated') {
      fetchNotifications();
    }
  }, [isOpen, status, fetchNotifications]);

  // 알림 클릭 시 읽음 처리
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead([notification.id]);
    }
  };

  // 알림 타입별 아이콘
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'EXPIRING_SOON':
        return <Calendar className="w-4 h-4 text-yellow-500" />;
      case 'EXPIRED':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'PAYMENT_FAILED':
        return <CreditCard className="w-4 h-4 text-red-500" />;
      case 'PAYMENT_SUCCESS':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'RENEWED':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // 비로그인 시 숨김
  if (status !== 'authenticated') {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="알림"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0"
        align="end"
        sideOffset={8}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">알림</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary hover:text-primary/80"
              onClick={() => markAllAsRead()}
            >
              모두 읽음
            </Button>
          )}
        </div>

        {/* 알림 목록 */}
        <div className="max-h-80 overflow-y-auto">
          {isLoading && notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              불러오는 중...
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              알림이 없어요
            </div>
          ) : (
            <ul className="divide-y">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.isRead ? 'font-medium' : ''}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="flex-shrink-0">
                        <span className="w-2 h-2 bg-blue-500 rounded-full block" />
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 푸터 */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-t text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500"
              onClick={() => {
                setIsOpen(false);
                // 알림 페이지로 이동 (선택사항)
                // router.push('/notifications');
              }}
            >
              전체 알림 보기
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
