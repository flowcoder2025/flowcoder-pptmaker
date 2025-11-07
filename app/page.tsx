'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TOSS_COLORS } from '@/constants/design';
import MenuModal from '@/components/MenuModal';

export default function HomePage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <MenuModal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div style={{
        minHeight: '100vh',
        background: '#FFFFFF',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        {/* 메뉴 버튼 */}
        <button
          onClick={() => setIsMenuOpen(true)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1px solid #E5E7EB',
            background: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: TOSS_COLORS.text,
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F9FAFB';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFFFFF';
          }}
          aria-label="메뉴"
        >
          ⋮
        </button>

        {/* 타이틀 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: TOSS_COLORS.text,
            margin: '0 0 10px 0',
          }}>
            FlowCoder PPT Maker
          </h1>
          <p style={{
            fontSize: '16px',
            color: TOSS_COLORS.textSecondary,
            margin: 0,
          }}>
            AI가 만들어주는 간편한 프리젠테이션
          </p>
        </div>

        {/* 시작 버튼 */}
        <Button
          onClick={() => router.push('/input')}
          size="lg"
        >
          시작해요
        </Button>

        {/* 설명 */}
        <div style={{
          marginTop: '60px',
          maxWidth: '400px',
          background: '#F9FAFB',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #E5E7EB',
        }}>
          <h3 style={{
            fontSize: '18px',
            color: TOSS_COLORS.text,
            margin: '0 0 12px 0',
          }}>
            사용 방법
          </h3>
          <ol style={{
            fontSize: '14px',
            color: TOSS_COLORS.textSecondary,
            margin: 0,
            paddingLeft: '20px',
            lineHeight: 1.6,
          }}>
            <li>프리젠테이션 내용을 텍스트로 입력해요</li>
            <li>AI가 자동으로 슬라이드 구조를 분석해요</li>
            <li>심플하고 정돈된 슬라이드로 생성해요</li>
            <li>저장하고 공유해요</li>
          </ol>
        </div>

        {/* FlowCoder 로고 - 하단 중앙 */}
        <div style={{
          position: 'absolute',
          bottom: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '24px',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #3182F6 0%, #8B95A1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em',
          opacity: 0.7,
        }}>
          FlowCoder
        </div>
      </div>
    </>
  );
}
