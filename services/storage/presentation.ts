/**
 * 프리젠테이션 저장 서비스
 * (향후 Bedrock SDK 연동)
 */

import type { Presentation } from '@/types/presentation';
import { logger } from '@/lib/logger';

export async function savePresentation(presentation: Presentation): Promise<void> {
  // TODO: Bedrock SDK Storage API 연동
  // 현재는 LocalStorage를 사용한 임시 구현

  try {
    const key = `presentation_${presentation.id}`;
    const data = JSON.stringify(presentation);
    localStorage.setItem(key, data);

    // 모든 프리젠테이션 ID 목록 업데이트
    const listKey = 'presentation_list';
    const listData = localStorage.getItem(listKey);
    const list: string[] = listData ? JSON.parse(listData) : [];

    if (!list.includes(presentation.id)) {
      list.push(presentation.id);
      localStorage.setItem(listKey, JSON.stringify(list));
    }

    logger.info('프리젠테이션 저장 완료', { id: presentation.id });
  } catch (error) {
    logger.error('프리젠테이션 저장 실패', error);
    throw new Error('프리젠테이션 저장에 실패했습니다.');
  }
}

export async function loadPresentation(id: string): Promise<Presentation | null> {
  try {
    const key = `presentation_${id}`;
    const data = localStorage.getItem(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as Presentation;
  } catch (error) {
    logger.error('프리젠테이션 불러오기 실패', error);
    return null;
  }
}

export async function listPresentations(): Promise<string[]> {
  try {
    const listKey = 'presentation_list';
    const listData = localStorage.getItem(listKey);
    return listData ? JSON.parse(listData) : [];
  } catch (error) {
    logger.error('프리젠테이션 목록 불러오기 실패', error);
    return [];
  }
}
