/**
 * Viewer 페이지
 * Phase 2: 프리젠테이션 뷰어 기능
 */

'use client';

import React, { Suspense } from 'react';
import ViewerContent from './ViewerContent';

export default function ViewerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-foreground">뷰어를 불러오고 있어요</p>
          </div>
        </div>
      }
    >
      <ViewerContent />
    </Suspense>
  );
}
