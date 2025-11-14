/**
 * Zustand 프리젠테이션 상태 관리
 */

'use client';

import { create } from 'zustand';
import type { Presentation, GenerationStep } from '@/types/presentation';
import type { ResearchMode } from '@/types/research';
import { useHistoryStore } from './historyStore';
import { researchTopic } from '@/services/perplexity/researcher';
import { generateSlideContent } from '@/services/gemini/content-generator';
import { TemplateEngine } from '@/services/template';
import { RESEARCH_MODE_CONFIG } from '@/types/research';
import type { UnifiedPPTJSON, Slide, SlideType, GlobalSlideSettings } from '@/types/slide';
import type { AttachmentFile } from '@/types/research';
import { createDefaultSlide } from '@/utils/slideDefaults';
import { DEFAULT_THEME, getThemeById } from '@/constants/themes';

interface PresentationState {
  // 현재 프리젠테이션
  currentPresentation: Presentation | null;

  // 생성 상태
  isGenerating: boolean;
  generationStep: GenerationStep;
  generationError: string | null;

  // 스타일 테마
  selectedThemeId: string;

  // 자료 조사 모드
  researchMode: ResearchMode; // 'none' | 'fast' | 'deep'

  // 콘텐츠 생성 모델 선택
  useProContentModel: boolean; // true: Pro (고품질), false: Flash (빠른속도)

  // HTML 생성 모델 선택 (독립적으로 제어)
  useProHtmlModel: boolean; // true: Pro (고품질 HTML), false: Flash (빠른 HTML)

  // 목표 슬라이드 분량
  targetSlideCount: number; // 플랜별로 동적 제한 (Free: 10, Pro: 20, Premium: 50)

  // 전역 슬라이드 설정
  globalSettings: GlobalSlideSettings;

  // 액션
  setCurrentPresentation: (presentation: Presentation | null) => void;
  setSelectedTheme: (themeId: string) => void;
  setResearchMode: (mode: ResearchMode) => void;
  setUseProContentModel: (usePro: boolean) => void;
  setUseProHtmlModel: (usePro: boolean) => void;
  setTargetSlideCount: (count: number) => void;
  setGlobalSettings: (settings: Partial<GlobalSlideSettings>) => void;
  applyGlobalSettingsToAll: () => void;
  generatePresentation: (text: string, attachments?: AttachmentFile[]) => Promise<void>;
  savePresentation: () => Promise<void>;
  fetchPresentations: () => Promise<Presentation[]>;
  fetchPresentation: (id: string) => Promise<void>;
  updateSlide: (index: number, updatedSlide: Slide) => void;
  reorderSlides: (startIndex: number, endIndex: number) => void;
  addSlide: (slideType: SlideType, afterIndex: number) => void;
  deleteSlide: (index: number) => boolean;
  duplicateSlide: (index: number) => void;
  changeTemplate: (templateId: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearPresentation: () => void;
  clearError: () => void;
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  currentPresentation: null,
  isGenerating: false,
  generationStep: 'idle',
  generationError: null,
  selectedThemeId: DEFAULT_THEME.id, // 기본값: Toss 테마
  researchMode: 'none', // 기본값: 자료 조사 안함
  useProContentModel: false, // 기본값: Flash (빠른속도)
  useProHtmlModel: true, // 기본값: Pro (고품질 HTML) - A/B 테스트 후 변경 고려
  targetSlideCount: 20, // 기본값: 20장 (10-40 범위)
  globalSettings: {
    fontSize: 18, // 기본값: 18px
    iconType: 'arrow', // 기본값: 화살표
  },

  setCurrentPresentation: (presentation) => set({ currentPresentation: presentation }),

  setSelectedTheme: (themeId) => set({ selectedThemeId: themeId }),

  setResearchMode: (mode) => set({ researchMode: mode }),

  setUseProContentModel: (usePro) => set({ useProContentModel: usePro }),

  setUseProHtmlModel: (usePro) => set({ useProHtmlModel: usePro }),

  // 플랜별 최대값 검증은 UI 레벨(app/input/page.tsx)에서 처리
  // 최소값 5만 보장
  setTargetSlideCount: (count) => set({ targetSlideCount: Math.max(5, count) }),

  // 전역 슬라이드 설정 변경
  setGlobalSettings: (settings) => set((state) => ({
    globalSettings: { ...state.globalSettings, ...settings }
  })),

  // 전역 설정을 모든 슬라이드에 적용
  applyGlobalSettingsToAll: () => {
    const { currentPresentation, globalSettings } = get();
    if (!currentPresentation?.slideData) {
      console.warn('⚠️ 프리젠테이션이 없거나 편집 데이터가 없어요');
      return;
    }

    const updatedSlides = currentPresentation.slideData.slides.map((slide) => {
      const updatedSlide = { ...slide };

      // 슬라이드 타입별로 fontSize 적용
      switch (slide.type) {
        case 'content':
          // ContentSlide: body.fontSize 적용
          updatedSlide.style = {
            ...updatedSlide.style,
            body: {
              ...updatedSlide.style?.body,
              fontSize: globalSettings.fontSize,
            },
          };
          break;

        case 'bullet':
          // BulletSlide: bullets.fontSize, bullets.iconType 적용
          updatedSlide.style = {
            ...updatedSlide.style,
            bullets: {
              ...updatedSlide.style?.bullets,
              fontSize: globalSettings.fontSize,
              iconType: globalSettings.iconType,
            },
          };
          break;

        case 'twoColumn':
        case 'comparison':
          // TwoColumnSlide, ComparisonSlide: leftColumn.fontSize, rightColumn.fontSize, bullets.iconType 적용
          updatedSlide.style = {
            ...updatedSlide.style,
            leftColumn: {
              ...updatedSlide.style?.leftColumn,
              fontSize: globalSettings.fontSize,
            },
            rightColumn: {
              ...updatedSlide.style?.rightColumn,
              fontSize: globalSettings.fontSize,
            },
            bullets: {
              ...updatedSlide.style?.bullets,
              iconType: globalSettings.iconType,
            },
          };
          break;

        case 'imageText':
          // ImageTextSlide: bullets.fontSize, bullets.iconType 적용
          updatedSlide.style = {
            ...updatedSlide.style,
            bullets: {
              ...updatedSlide.style?.bullets,
              fontSize: globalSettings.fontSize,
              iconType: globalSettings.iconType,
            },
          };
          break;

        // 다른 슬라이드 타입은 변경하지 않음
        default:
          break;
      }

      return updatedSlide;
    });

    // slideData 업데이트
    const updatedSlideData: UnifiedPPTJSON = {
      ...currentPresentation.slideData,
      slides: updatedSlides,
    };

    // HTML 재생성
    const { selectedThemeId } = get();
    const theme = getThemeById(selectedThemeId) || DEFAULT_THEME;
    const engine = new TemplateEngine();
    const updatedHtmlSlides = engine.generateAll(updatedSlideData, theme.id); // ✅ theme.id 사용

    // 프리젠테이션 업데이트
    const updatedPresentation: Presentation = {
      ...currentPresentation,
      slideData: updatedSlideData,
      slides: updatedHtmlSlides,
    };

    // 히스토리에 추가
    useHistoryStore.getState().pushHistory(currentPresentation);

    set({ currentPresentation: updatedPresentation });

    console.log('✅ 전역 설정이 모든 슬라이드에 적용되었어요!');
  },

  generatePresentation: async (text: string, attachments?: AttachmentFile[]) => {
    set({
      isGenerating: true,
      generationStep: 'parsing',
      generationError: null
    });

    try {
      // Store 가져오기
      const subscriptionStore = await import('@/store/subscriptionStore').then(m => m.useSubscriptionStore.getState());
      const creditStore = await import('@/store/creditStore').then(m => m.useCreditStore.getState());
      const maxSlides = subscriptionStore.getMaxSlides();

      console.log('✅ 슬라이드 생성 시작');

      // 🔄 크레딧 잔액 동기화 (DB → 로컬 상태)
      await creditStore.fetchBalance();
      console.log('✅ 크레딧 정보 동기화 완료');

      const { selectedThemeId, researchMode, useProContentModel, targetSlideCount } = get();

      // 💳 크레딧 차감 로직
      // 1. 깊은 조사 사용 시
      if (researchMode === 'deep') {
        const isFirstFree = creditStore.isFirstTimeFree('deepResearch');

        if (isFirstFree) {
          console.log('🎁 깊은 조사 최초 1회 무료 사용');
          await creditStore.useFirstTimeFree('deepResearch');
        } else {
          const deepResearchCost = creditStore.getCreditCost('deepResearch');
          const hasCredits = creditStore.canUseCredits(deepResearchCost);

          if (!hasCredits) {
            throw new Error(`크레딧이 부족해요. 깊은 조사를 사용하려면 ${deepResearchCost} 크레딧이 필요해요.`);
          }

          const success = await creditStore.useCredits(deepResearchCost);
          if (!success) {
            throw new Error('크레딧 차감에 실패했어요. 다시 시도해주세요.');
          }
          console.log(`💳 깊은 조사 크레딧 차감: -${deepResearchCost}`);
        }
      }

      // 2. Pro 모델 사용 시
      if (useProContentModel) {
        const isFirstFree = creditStore.isFirstTimeFree('qualityGeneration');

        if (isFirstFree) {
          console.log('🎁 고품질 생성 최초 1회 무료 사용');
          await creditStore.useFirstTimeFree('qualityGeneration');
        } else {
          const qualityCost = creditStore.getCreditCost('qualityGeneration');
          const hasCredits = creditStore.canUseCredits(qualityCost);

          if (!hasCredits) {
            throw new Error(`크레딧이 부족해요. 고품질 생성을 사용하려면 ${qualityCost} 크레딧이 필요해요.`);
          }

          const success = await creditStore.useCredits(qualityCost);
          if (!success) {
            throw new Error('크레딧 차감에 실패했어요. 다시 시도해주세요.');
          }
          console.log(`💳 고품질 생성 크레딧 차감: -${qualityCost}`);
        }
      }

      // 멀티모달 분기: 파일 첨부가 있으면 /api/generate 엔드포인트 호출
      if (attachments && attachments.length > 0) {
        console.log(`📎 멀티모달 생성 모드 (파일 ${attachments.length}개)`);
        console.log(`🎯 목표 슬라이드 분량: ${targetSlideCount}장 (±2-3장 오차 가능)`);

        set({ generationStep: 'parsing' });

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: text,
            attachments,
            researchMode,
            model: useProContentModel ? 'pro' : 'flash',
            slideCount: targetSlideCount, // 사용자 설정값 사용
            plan: subscriptionStore.plan,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`멀티모달 생성 실패: ${errorData.error || response.statusText}`);
        }

        const { slideData, metadata } = await response.json();
        console.log('✅ 멀티모달 슬라이드 데이터 수신:', slideData.slides.length, '개');

        set({ generationStep: 'generating' });

        // HTML 생성 (TemplateEngine)
        const theme = getThemeById(selectedThemeId) || DEFAULT_THEME;
        console.log(`🎨 HTML 슬라이드 생성 중... (테마: ${theme.name}, 템플릿: ${theme.id})`);
        const engine = new TemplateEngine();
        const htmlSlides = engine.generateAll(slideData, theme.id); // ✅ theme.id 사용
        console.log('✅ HTML 생성 완료:', htmlSlides.length, '개 슬라이드');

        // Presentation 객체 생성
        const firstSlide = slideData.slides[0];
        const presentationTitle =
          firstSlide?.type === 'thankYou'
            ? firstSlide.props.message
            : ('title' in firstSlide.props ? firstSlide.props.title : '무제');

        const presentation: Presentation = {
          id: `temp_${Date.now()}`,
          title: presentationTitle || '무제',
          slides: htmlSlides,
          slideData: slideData,
          templateId: selectedThemeId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          metadata: metadata || {},
        };

        set({
          currentPresentation: presentation,
          isGenerating: false,
          generationStep: 'done',
        });

        console.log('🎉 멀티모달 프리젠테이션 생성 완료!');

        // 데이터베이스 저장
        try {
          console.log('💾 데이터베이스에 저장 중...');
          await get().savePresentation();
          console.log('✅ 데이터베이스 저장 완료!');
        } catch (saveError) {
          console.error('❌ 데이터베이스 저장 실패:', saveError);
          throw new Error(`프리젠테이션 저장에 실패했어요: ${saveError instanceof Error ? saveError.message : String(saveError)}`);
        }

        return;
      }

      // 기존 로직 (파일 첨부 없는 경우)
      let enrichedContent = text;

      console.log(`🎯 목표 슬라이드 분량: ${targetSlideCount}장 (±2-3장 오차 가능)`);

      // 1단계 (선택): 자료 조사
      if (researchMode !== 'none') {
        const config = RESEARCH_MODE_CONFIG[researchMode];
        if (config.enabled && config.model) {
          console.log(`🔍 1️⃣ 자료 조사 중... (모드: ${config.label})`);
          const researchResult = await researchTopic(text, config.model);
          console.log('✅ 자료 조사 완료');

          // 2단계: 콘텐츠 생성 (자료 조사 결과 포함)
          console.log(`📝 2️⃣ 슬라이드 콘텐츠 생성 중... (모델: ${useProContentModel ? 'Pro' : 'Flash'})`);
          enrichedContent = await generateSlideContent({
            userInput: text,
            research: researchResult,
            useProModel: useProContentModel,
            maxSlides: targetSlideCount, // 사용자 설정값 사용
          });
          console.log('✅ 슬라이드 콘텐츠 생성 완료');
        }
      } else {
        // 자료 조사 없이 콘텐츠 생성
        console.log(`📝 1️⃣ 슬라이드 콘텐츠 생성 중... (모델: ${useProContentModel ? 'Pro' : 'Flash'})`);
        enrichedContent = await generateSlideContent({
          userInput: text,
          useProModel: useProContentModel,
          maxSlides: targetSlideCount, // 사용자 설정값 사용
        });
        console.log('✅ 슬라이드 콘텐츠 생성 완료');
      }

      set({ generationStep: 'parsing' });

      // 2단계: JSON 파싱 (Parser 단계 제거 - Content generator가 직접 UnifiedPPTJSON 출력)
      console.log('🔍 2️⃣ JSON 파싱 중...');

      // 🆕 디버깅: Gemini API 원시 응답 로깅
      console.log('📝 Gemini API 원시 응답 (전체):', enrichedContent);
      console.log('📏 응답 길이:', enrichedContent.length, '자');

      // 마크다운 코드 블록 제거
      let jsonString = enrichedContent.trim();
      const lines = jsonString.split('\n');

      if (lines[0].trim().startsWith('```')) {
        lines.shift();
        console.log('✅ 첫 줄 코드 블록 마커 제거');
      }

      if (lines.length > 0 && lines[lines.length - 1].trim() === '```') {
        lines.pop();
        console.log('✅ 마지막 줄 코드 블록 마커 제거');
      }

      jsonString = lines.join('\n').trim();

      // 🆕 디버깅: 정제된 JSON 문자열 로깅
      console.log('📄 정제된 JSON (첫 1000자):', jsonString.substring(0, 1000));

      // UnifiedPPTJSON 파싱
      let slideJSON: UnifiedPPTJSON;
      try {
        slideJSON = JSON.parse(jsonString) as UnifiedPPTJSON;

        // 검증 1: 기본 구조
        if (!slideJSON.slides || !Array.isArray(slideJSON.slides) || slideJSON.slides.length === 0) {
          console.error('❌ 슬라이드 배열이 비어있습니다');
          throw new Error('슬라이드 데이터가 올바르지 않습니다.');
        }

        // 🆕 검증 2: 빈 슬라이드 감지
        const emptySlides = slideJSON.slides.filter(slide => {
          const props = slide.props as Record<string, unknown>;
          // title, body, bullets 등 주요 props가 모두 비어있는지 확인
          const hasContent = Object.keys(props).some(key => {
            const value = props[key];
            if (typeof value === 'string') return value.trim().length > 0;
            if (Array.isArray(value)) return value.length > 0;
            return value !== null && value !== undefined;
          });
          return !hasContent;
        });

        if (emptySlides.length > 0) {
          console.error(`❌ 빈 슬라이드 감지: ${emptySlides.length}개 / ${slideJSON.slides.length}개`);
          console.error('🔍 빈 슬라이드 예시:', JSON.stringify(emptySlides[0], null, 2));
        }

        // 🆕 검증 3: 모든 슬라이드가 비어있으면 에러
        if (emptySlides.length === slideJSON.slides.length) {
          console.error('❌ 모든 슬라이드가 비어있습니다!');
          console.error('🔍 원시 JSON:', jsonString.substring(0, 2000));
          throw new Error('생성된 슬라이드가 모두 비어있어요. Gemini API 응답을 확인해주세요.');
        }

        console.log('✅ JSON 파싱 완료:', slideJSON.slides.length, '개 슬라이드');
        console.log(`📊 내용 있는 슬라이드: ${slideJSON.slides.length - emptySlides.length}개`);

        // 슬라이드 수 제한 적용
        if (slideJSON.slides.length > maxSlides) {
          console.warn(`⚠️ 슬라이드 수 제한: ${slideJSON.slides.length}개 → ${maxSlides}개로 축소`);
          slideJSON.slides = slideJSON.slides.slice(0, maxSlides);
        }
      } catch (parseError) {
        console.error('❌ JSON 파싱 실패:', parseError);
        console.log('🔍 파싱 실패한 JSON (첫 1000자):', jsonString.substring(0, 1000));
        console.log('🔍 파싱 실패한 JSON (마지막 500자):', jsonString.substring(Math.max(0, jsonString.length - 500)));
        throw new Error('JSON 파싱 실패: ' + (parseError instanceof Error ? parseError.message : String(parseError)));
      }

      set({ generationStep: 'generating' });

      // 3단계: HTML 생성 (TemplateEngine)
      const theme = getThemeById(selectedThemeId) || DEFAULT_THEME;
      console.log(`🎨 3️⃣ HTML 슬라이드 생성 중... (테마: ${theme.name}, 템플릿: ${theme.id})`);
      const engine = new TemplateEngine();
      const htmlSlides = engine.generateAll(slideJSON, theme.id); // ✅ theme.id 사용
      console.log('✅ HTML 생성 완료:', htmlSlides.length, '개 슬라이드');

      // 4단계: 프리젠테이션 객체 생성
      const firstSlide = slideJSON.slides[0];
      const presentationTitle =
        firstSlide?.type === 'thankYou'
          ? firstSlide.props.message
          : ('title' in firstSlide.props ? firstSlide.props.title : '무제');

      const presentation: Presentation = {
        id: `temp_${Date.now()}`,  // 임시 ID (저장 후 실제 ID로 교체)
        title: presentationTitle || '무제',
        slides: htmlSlides,
        slideData: slideJSON,              // Phase 1: 편집용 구조화 데이터 저장
        templateId: selectedThemeId,  // Phase 1: 사용된 템플릿 ID (스타일 테마)
        createdAt: Date.now(),
        updatedAt: Date.now(),             // Phase 1: 마지막 수정 시간
      };

      set({
        currentPresentation: presentation,
        isGenerating: false,
        generationStep: 'done',
      });

      console.log('🎉 프리젠테이션 생성 완료!');

      // 생성 즉시 자동 저장 (무료 카운트는 저장 성공 후 차감)
      try {
        console.log('💾 데이터베이스에 저장 중...');
        await get().savePresentation();
        console.log('✅ 데이터베이스 저장 완료!');
      } catch (saveError) {
        console.error('❌ 데이터베이스 저장 실패:', saveError);
        // 에러를 사용자에게 명확히 전달
        throw new Error(`프리젠테이션 저장에 실패했어요: ${saveError instanceof Error ? saveError.message : String(saveError)}`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('❌ 프리젠테이션 생성 실패:', error);

      // 디버깅을 위한 추가 로깅 (프로덕션 환경)
      console.error('🔍 에러 상세 정보:', {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        geminiApiKeyExists: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        userInput: text.substring(0, 100), // 첫 100자만 로깅
      });

      set({
        generationError: `슬라이드 생성에 실패했어요. 다시 시도해주세요.\n\n오류: ${errorMessage}`,
        isGenerating: false,
        generationStep: 'error'
      });
    }
  },

  savePresentation: async () => {
    const { currentPresentation, researchMode, useProContentModel } = get();
    if (!currentPresentation) {
      throw new Error('저장할 프리젠테이션이 없어요');
    }

    try {
      // 임시 ID 체크: temp_로 시작하면 새 프리젠테이션
      const isNew = !currentPresentation.id || currentPresentation.id.startsWith('temp_');

      // API 호출: 프리젠테이션 저장 (생성 또는 업데이트)
      const method = isNew ? 'POST' : 'PATCH';
      const url = isNew
        ? '/api/presentations'
        : `/api/presentations/${currentPresentation.id}`;

      console.log(`[savePresentation] ${method} ${url}`, { isNew, id: currentPresentation.id });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentPresentation.title,
          description: currentPresentation.description || '',
          slideData: currentPresentation.slideData,
          slides: currentPresentation.slides,  // HTML 캐시 저장
          metadata: {
            templateId: currentPresentation.templateId,
            slideCount: currentPresentation.slides.length,
            ...currentPresentation.metadata,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `프리젠테이션 저장 실패: ${response.status} - ${errorData.error || response.statusText}`
        );
      }

      const data = await response.json();

      // 저장 후 ID 업데이트 (새로 생성된 경우)
      if (isNew && data.presentation?.id) {
        set({
          currentPresentation: {
            ...currentPresentation,
            id: data.presentation.id,
          },
        });
        console.log(`[savePresentation] 새 ID로 업데이트: ${data.presentation.id}`);
      }

      console.log('✅ 프리젠테이션 저장 완료!');

      // 🆕 저장 성공 후 무료 카운트 차감 및 크레딧 동기화
      if (isNew) {
        const creditStore = await import('@/store/creditStore').then(m => m.useCreditStore.getState());

        // 심층 검색 무료 카운트 차감
        if (researchMode === 'deep' && creditStore.isFirstTimeFree('deepResearch')) {
          await creditStore.useFirstTimeFree('deepResearch');
          console.log('✅ 심층 검색 최초 무료 사용 완료');
        }

        // 고품질 생성 무료 카운트 차감
        if (useProContentModel && creditStore.isFirstTimeFree('qualityGeneration')) {
          await creditStore.useFirstTimeFree('qualityGeneration');
          console.log('✅ 고품질 생성 최초 무료 사용 완료');
        }

        // 크레딧 잔액 동기화 (프레젠테이션 생성 시 서버에서 1 크레딧 차감)
        await creditStore.fetchBalance();
        console.log('✅ 크레딧 잔액 동기화 완료');
      }
    } catch (error) {
      console.error('❌ 저장 실패:', error);
      throw error;  // Fallback 없이 에러 전파
    }
  },

  fetchPresentations: async () => {
    try {
      const response = await fetch('/api/presentations');

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.log('⚠️ 인증 필요: 로그인 후 프리젠테이션 조회 가능');
          return [];
        }
        throw new Error(`프리젠테이션 목록 조회 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ 프리젠테이션 ${data.presentations.length}개 로드`);
      return data.presentations;
    } catch (error) {
      console.error('❌ 프리젠테이션 목록 조회 실패:', error);
      return [];
    }
  },

  fetchPresentation: async (id: string) => {
    try {
      const response = await fetch(`/api/presentations/${id}`);

      if (!response.ok) {
        throw new Error(`프리젠테이션 조회 실패: ${response.status}`);
      }

      const data = await response.json();
      const presentation = data.presentation as Presentation;

      if (presentation) {
        // metadata.templateId를 최상위로 매핑 (Prisma 스키마에 templateId 컬럼이 없음)
        const templateId = (presentation.metadata as any)?.templateId || 'toss';

        const mappedPresentation = {
          ...presentation,
          templateId: templateId,
        };

        // selectedThemeId도 함께 동기화 (편집기에서 템플릿 선택기가 올바른 테마를 표시하도록)
        set({
          currentPresentation: mappedPresentation,
          selectedThemeId: templateId,
        });
        console.log(`✅ 프리젠테이션 로드: ${presentation.title} (테마: ${templateId})`);
      }
    } catch (error) {
      console.error('❌ 프리젠테이션 조회 실패:', error);
      throw error;
    }
  },

  updateSlide: (index: number, updatedSlide: Slide) => {
    console.log('🔄 [presentationStore] updateSlide 시작', {
      index,
      슬라이드타입: updatedSlide.type,
      props키: Object.keys(updatedSlide.props),
    });

    const { currentPresentation } = get();

    // 1. 유효성 검사
    if (!currentPresentation) {
      console.error('❌ 현재 프리젠테이션이 없습니다.');
      return;
    }

    if (!currentPresentation.slideData) {
      console.error('❌ slideData가 없는 구버전 프리젠테이션은 편집할 수 없습니다.');
      return;
    }

    if (index < 0 || index >= currentPresentation.slideData.slides.length) {
      console.error('❌ 잘못된 슬라이드 인덱스:', index);
      return;
    }

    console.log('✅ [presentationStore] 유효성 검사 통과');

    // 히스토리 기록 (변경 전)
    useHistoryStore.getState().pushHistory(currentPresentation);

    // 2. slideData 업데이트
    const newSlideData: UnifiedPPTJSON = {
      ...currentPresentation.slideData,
      slides: currentPresentation.slideData.slides.map((slide, i) =>
        i === index ? updatedSlide : slide
      ),
    };

    console.log('📝 [presentationStore] slideData 업데이트 완료');

    // 3. TemplateEngine으로 HTML 재생성
    console.log('🎨 [presentationStore] TemplateEngine으로 HTML 재생성 시작...');
    const engine = new TemplateEngine();
    const htmlSlides = engine.generateAll(newSlideData, currentPresentation.templateId || 'toss');
    console.log('✅ [presentationStore] HTML 재생성 완료', {
      htmlSlides개수: htmlSlides.length,
    });

    // 4. currentPresentation 업데이트
    const updated = {
      currentPresentation: {
        ...currentPresentation,
        slideData: newSlideData,
        slides: htmlSlides,
        updatedAt: Date.now(),
      },
    };

    console.log('💾 [presentationStore] set() 호출 전');
    set(updated);
    console.log('✅ [presentationStore] set() 호출 완료 - 슬라이드 업데이트 완료:', index);
  },

  reorderSlides: (startIndex: number, endIndex: number) => {
    const { currentPresentation } = get();

    // 1. 유효성 검사
    if (!currentPresentation) {
      console.error('❌ 현재 프리젠테이션이 없습니다.');
      return;
    }

    if (!currentPresentation.slideData) {
      console.error('❌ slideData가 없는 구버전 프리젠테이션은 편집할 수 없습니다.');
      return;
    }

    const { slides } = currentPresentation.slideData;

    if (
      startIndex < 0 ||
      startIndex >= slides.length ||
      endIndex < 0 ||
      endIndex >= slides.length
    ) {
      console.error('❌ 잘못된 슬라이드 인덱스:', { startIndex, endIndex });
      return;
    }

    // 히스토리 기록 (변경 전)
    useHistoryStore.getState().pushHistory(currentPresentation);

    // 2. 슬라이드 순서 변경
    const newSlides = Array.from(slides);
    const [movedSlide] = newSlides.splice(startIndex, 1);
    newSlides.splice(endIndex, 0, movedSlide);

    const newSlideData: UnifiedPPTJSON = {
      ...currentPresentation.slideData,
      slides: newSlides,
    };

    // 3. TemplateEngine으로 HTML 전체 재생성
    const engine = new TemplateEngine();
    const htmlSlides = engine.generateAll(newSlideData, currentPresentation.templateId || 'toss-default');

    // 4. currentPresentation 업데이트
    set({
      currentPresentation: {
        ...currentPresentation,
        slideData: newSlideData,
        slides: htmlSlides,
        updatedAt: Date.now(),
      },
    });

    console.log(`✅ 슬라이드 순서 변경 완료: ${startIndex} → ${endIndex}`);
  },

  addSlide: (slideType: SlideType, afterIndex: number) => {
    const { currentPresentation } = get();

    // 1. 유효성 검사
    if (!currentPresentation) {
      console.error('❌ 현재 프리젠테이션이 없습니다.');
      return;
    }

    if (!currentPresentation.slideData) {
      console.error('❌ slideData가 없는 구버전 프리젠테이션은 편집할 수 없습니다.');
      return;
    }

    const { slides } = currentPresentation.slideData;

    if (afterIndex < -1 || afterIndex >= slides.length) {
      console.error('❌ 잘못된 삽입 위치:', afterIndex);
      return;
    }

    // 히스토리 기록 (변경 전)
    useHistoryStore.getState().pushHistory(currentPresentation);

    // 2. 기본 슬라이드 데이터 생성
    const newSlide = createDefaultSlide(slideType);

    // 3. 슬라이드 배열에 삽입
    const newSlides = [...slides];
    newSlides.splice(afterIndex + 1, 0, newSlide);

    const newSlideData: UnifiedPPTJSON = {
      ...currentPresentation.slideData,
      slides: newSlides,
    };

    // 4. TemplateEngine으로 HTML 전체 재생성
    const engine = new TemplateEngine();
    const htmlSlides = engine.generateAll(newSlideData, currentPresentation.templateId || 'toss-default');

    // 5. currentPresentation 업데이트
    set({
      currentPresentation: {
        ...currentPresentation,
        slideData: newSlideData,
        slides: htmlSlides,
        updatedAt: Date.now(),
      },
    });

    console.log(`✅ 슬라이드 추가 완료: 타입=${slideType}, 위치=${afterIndex + 1}`);
  },

  deleteSlide: (index: number): boolean => {
    const { currentPresentation } = get();

    // 1. 유효성 검사
    if (!currentPresentation) {
      console.error('❌ 현재 프리젠테이션이 없습니다.');
      return false;
    }

    if (!currentPresentation.slideData) {
      console.error('❌ slideData가 없는 구버전 프리젠테이션은 편집할 수 없습니다.');
      return false;
    }

    const { slides } = currentPresentation.slideData;

    if (index < 0 || index >= slides.length) {
      console.error('❌ 잘못된 슬라이드 인덱스:', index);
      return false;
    }

    // 2. 마지막 슬라이드 삭제 방지
    if (slides.length <= 1) {
      console.warn('⚠️ 마지막 슬라이드는 삭제할 수 없어요');
      return false;
    }

    // 히스토리 기록 (변경 전)
    useHistoryStore.getState().pushHistory(currentPresentation);

    // 3. 슬라이드 제거
    const newSlides = slides.filter((_, i) => i !== index);

    const newSlideData: UnifiedPPTJSON = {
      ...currentPresentation.slideData,
      slides: newSlides,
    };

    // 4. TemplateEngine으로 HTML 전체 재생성
    const engine = new TemplateEngine();
    const htmlSlides = engine.generateAll(newSlideData, currentPresentation.templateId || 'toss-default');

    // 5. currentPresentation 업데이트
    set({
      currentPresentation: {
        ...currentPresentation,
        slideData: newSlideData,
        slides: htmlSlides,
        updatedAt: Date.now(),
      },
    });

    console.log(`✅ 슬라이드 삭제 완료: 인덱스=${index}`);
    return true;
  },

  duplicateSlide: (index: number) => {
    const { currentPresentation } = get();

    // 1. 유효성 검사
    if (!currentPresentation) {
      console.error('❌ 현재 프리젠테이션이 없습니다.');
      return;
    }

    if (!currentPresentation.slideData) {
      console.error('❌ slideData가 없는 구버전 프리젠테이션은 편집할 수 없습니다.');
      return;
    }

    const { slides } = currentPresentation.slideData;

    if (index < 0 || index >= slides.length) {
      console.error('❌ 잘못된 슬라이드 인덱스:', index);
      return;
    }

    // 히스토리 기록 (변경 전)
    useHistoryStore.getState().pushHistory(currentPresentation);

    // 2. 슬라이드 Deep Copy (참조 문제 방지)
    const originalSlide = slides[index];
    const duplicatedSlide: Slide = JSON.parse(JSON.stringify(originalSlide));

    // 3. 제목에 "(복사본)" 추가 (title prop이 있는 경우)
    if ('title' in duplicatedSlide.props) {
      duplicatedSlide.props.title = `${duplicatedSlide.props.title} (복사본)`;
    }

    // 4. 슬라이드 배열에 삽입 (원본 바로 다음)
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, duplicatedSlide);

    const newSlideData: UnifiedPPTJSON = {
      ...currentPresentation.slideData,
      slides: newSlides,
    };

    // 5. TemplateEngine으로 HTML 전체 재생성
    const engine = new TemplateEngine();
    const htmlSlides = engine.generateAll(newSlideData, currentPresentation.templateId || 'toss-default');

    // 6. currentPresentation 업데이트
    set({
      currentPresentation: {
        ...currentPresentation,
        slideData: newSlideData,
        slides: htmlSlides,
        updatedAt: Date.now(),
      },
    });

    console.log(`✅ 슬라이드 복제 완료: 인덱스=${index} → ${index + 1}`);
  },

  changeTemplate: (templateId: string) => {
    const { currentPresentation } = get();

    // 1. 유효성 검사
    if (!currentPresentation) {
      console.error('❌ 현재 프리젠테이션이 없습니다.');
      return;
    }

    if (!currentPresentation.slideData) {
      console.error('❌ slideData가 없는 구버전 프리젠테이션은 편집할 수 없습니다.');
      return;
    }

    // 2. 현재 템플릿과 동일한 경우 스킵
    if (currentPresentation.templateId === templateId) {
      console.log('ℹ️ 이미 해당 템플릿을 사용 중이에요');
      return;
    }

    // 히스토리 기록 (변경 전)
    useHistoryStore.getState().pushHistory(currentPresentation);

    // 3. TemplateEngine으로 전체 HTML 재생성
    console.log(`🎨 템플릿 전환 중: ${currentPresentation.templateId} → ${templateId}`);
    const engine = new TemplateEngine();
    const htmlSlides = engine.generateAll(currentPresentation.slideData, templateId);

    // 4. currentPresentation 업데이트
    set({
      currentPresentation: {
        ...currentPresentation,
        templateId: templateId,
        slides: htmlSlides,
        updatedAt: Date.now(),
      },
    });

    console.log(`✅ 템플릿 전환 완료: ${templateId}`);
  },

  undo: () => {
    const { currentPresentation } = get();
    if (!currentPresentation) return;

    // 현재 상태를 미래 스택에 저장
    const historyStore = useHistoryStore.getState();
    const currentCopy: Presentation = JSON.parse(JSON.stringify(currentPresentation));
    historyStore.future.push(currentCopy);

    // 과거에서 이전 상태 가져오기
    const previousPresentation = historyStore.undo();
    if (previousPresentation) {
      set({ currentPresentation: previousPresentation });
      console.log('↶ Undo 완료');
    }
  },

  redo: () => {
    const { currentPresentation } = get();
    if (!currentPresentation) return;

    // 현재 상태를 과거 스택에 저장
    const historyStore = useHistoryStore.getState();
    const currentCopy: Presentation = JSON.parse(JSON.stringify(currentPresentation));
    historyStore.past.push(currentCopy);

    // 미래에서 다음 상태 가져오기
    const nextPresentation = historyStore.redo();
    if (nextPresentation) {
      set({ currentPresentation: nextPresentation });
      console.log('↷ Redo 완료');
    }
  },

  canUndo: () => {
    return useHistoryStore.getState().canUndo();
  },

  canRedo: () => {
    return useHistoryStore.getState().canRedo();
  },

  clearPresentation: () => set({
    currentPresentation: null,
    generationStep: 'idle',
    generationError: null
  }),

  clearError: () => set({ generationError: null }),
}));
