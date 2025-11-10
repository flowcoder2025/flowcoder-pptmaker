/**
 * Viewer 페이지
 * Phase 2: 프리젠테이션 뷰어 기능
 */

'use client';

import React, { Suspense } from 'react';
import ViewerContent from './ViewerContent';
import { TOSS_COLORS } from '@/constants/design';

export default function ViewerPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: TOSS_COLORS.background,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: `4px solid ${TOSS_COLORS.primary}`,
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            <p style={{ color: TOSS_COLORS.text }}>뷰어를 불러오고 있어요</p>
          </div>
          <style jsx>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      }
    >
      <ViewerContent />
    </Suspense>
  );
}
