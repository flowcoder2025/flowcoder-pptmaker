'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TOSS_COLORS } from '@/constants/design';

/**
 * 크레딧 관리 페이지 (준비 중)
 *
 * @description
 * Supabase 연동 후 구현 예정
 */
export default function CreditsPage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFFFF',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* 준비 중 메시지 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px',
        }}>
          🚧
        </div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: TOSS_COLORS.text,
          marginBottom: '12px',
        }}>
          크레딧 시스템 준비 중이에요
        </h2>
        <p style={{
          fontSize: '16px',
          color: TOSS_COLORS.textSecondary,
          marginBottom: '32px',
        }}>
          웹 서비스 전환 작업 중입니다.<br />
          곧 만나요!
        </p>
      </div>

      {/* 홈 버튼 */}
      <Button
        onClick={() => router.push('/')}
        size="lg"

        variant="default"
      >
        홈으로 돌아가기
      </Button>
    </div>
  );
}
