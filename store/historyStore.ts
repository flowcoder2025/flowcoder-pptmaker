/**
 * History Store
 * Undo/Redo 기능을 위한 히스토리 관리
 */

import { create } from 'zustand';
import type { Presentation } from '@/types/presentation';

interface HistoryState {
  past: Presentation[];
  future: Presentation[];

  // 히스토리 기록
  pushHistory: (presentation: Presentation) => void;

  // Undo/Redo
  undo: () => Presentation | null;
  redo: () => Presentation | null;

  // 히스토리 상태 확인
  canUndo: () => boolean;
  canRedo: () => boolean;

  // 히스토리 초기화
  clearHistory: () => void;
}

const MAX_HISTORY = 10;

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],

  pushHistory: (presentation: Presentation) => {
    const { past } = get();

    // Deep copy to prevent reference issues
    const presentationCopy: Presentation = JSON.parse(JSON.stringify(presentation));

    // 과거 스택에 추가 (최대 10개 유지)
    const newPast = [...past, presentationCopy].slice(-MAX_HISTORY);

    set({
      past: newPast,
      future: [], // 새 변경 시 미래 스택 초기화
    });

    console.log(`📜 히스토리 기록: ${newPast.length}개 (최대 ${MAX_HISTORY}개)`);
  },

  undo: () => {
    const { past } = get();

    if (past.length === 0) {
      console.log('⚠️ Undo할 내역이 없어요');
      return null;
    }

    // 과거 스택에서 마지막 상태 꺼내기
    const newPast = [...past];
    const previousPresentation = newPast.pop()!;

    // 현재 상태를 미래 스택에 보관 (위해서는 외부에서 current 전달 필요)
    // 하지만 historyStore는 presentationStore를 import하지 않으므로
    // 이 부분은 presentationStore에서 처리

    set({
      past: newPast,
    });

    console.log('↶ Undo 실행');
    return previousPresentation;
  },

  redo: () => {
    const { future } = get();

    if (future.length === 0) {
      console.log('⚠️ Redo할 내역이 없어요');
      return null;
    }

    // 미래 스택에서 마지막 상태 꺼내기
    const newFuture = [...future];
    const nextPresentation = newFuture.pop()!;

    set({
      future: newFuture,
    });

    console.log('↷ Redo 실행');
    return nextPresentation;
  },

  canUndo: () => {
    return get().past.length > 0;
  },

  canRedo: () => {
    return get().future.length > 0;
  },

  clearHistory: () => {
    set({
      past: [],
      future: [],
    });
    console.log('🗑️ 히스토리 초기화');
  },
}));
