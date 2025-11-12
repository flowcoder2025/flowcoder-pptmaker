/**
 * Editor 페이지
 * Phase 2: 프리젠테이션 편집 기능
 */

'use client';

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import EditorContent from './EditorContent';

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground text-lg">편집기를 불러오고 있어요</p>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
