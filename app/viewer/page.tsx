/**
 * Viewer 페이지
 * Phase 2: 프리젠테이션 뷰어 기능
 */

'use client';

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ViewerContent from './ViewerContent';

export default function ViewerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground text-lg">뷰어를 불러오고 있어요</p>
        </div>
      }
    >
      <ViewerContent />
    </Suspense>
  );
}
