/**
 * Zustand 프리젠테이션 상태 관리
 */

'use client';

import { create } from 'zustand';
import type { Presentation, GenerationStep, AspectRatio, PageFormat } from '@/types/presentation';
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
import { logger } from '@/lib/logger';

interface PresentationState {
  // 현재 프리젠테이션
  currentPresentation: Presentation | null;

  // 생성 상태
  isGenerating: boolean;
  generationStep: GenerationStep;
  generationError: string | null;

  // 스타일 테마
  selectedThemeId: string;

  // 양식 설정
  aspectRatio: AspectRatio;     // 화면 비율 ('16:9' | '4:3' | 'A4-portrait')
  pageFormat: PageFormat;        // 페이지 형식 ('slides' | 'one-page')

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
  setAspectRatio: (ratio: AspectRatio) => void;
  setPageFormat: (format: PageFormat) => void;
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
  aspectRatio: '16:9', // 기본값: 16:9 비율
  pageFormat: 'slides', // 기본값: 여러 슬라이드
  researchMode: 'none', // 기본값: 자료 조사 안함
  useProContentModel: false, // 기본값: Flash (빠른속도)
  useProHtmlModel: true, // 기본값: Pro (고품질 HTML) - A/B 테스트 후 변경 고려
  targetSlideCount: 20, // 기본값: 20장 (10-40 범위)
  globalSettings: {
    slideTitleSize: 32, // 기본값: 32px (H3 태그 - 슬라이드 제목)
    bodyTitleSize: 24,  // 기본값: 24px (H4 태그 - 본문 제목)
    fontSize: 18,       // 기본값: 18px (p, li 태그 - 본문 텍스트)
    iconType: 'arrow',  // 기본값: 화살표
  },

  setCurrentPresentation: (presentation) => set({ currentPresentation: presentation }),

  setSelectedTheme: (themeId) => set({ selectedThemeId: themeId }),

  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),

  setPageFormat: (format) => set({ pageFormat: format }),

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
      logger.warn('프리젠테이션이 없거나 편집 데이터가 없어요');
      return;
    }

    const updatedSlides = currentPresentation.slideData.slides.map((slide) => {
      const updatedSlide = { ...slide };

      // 모든 슬라이드에 공통 적용 (title, section 제외)
      if (slide.type !== 'title' && slide.type !== 'section') {
        updatedSlide.style = {
          ...updatedSlide.style,
          slideTitle: {
            ...updatedSlide.style?.slideTitle,
            fontSize: globalSettings.slideTitleSize,
          },
          bodyTitle: {
            ...updatedSlide.style?.bodyTitle,
            fontSize: globalSettings.bodyTitleSize,
          },
        };
      }

      // 슬라이드 타입별로 추가 설정 적용
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

        case 'reportA4':
        case 'reportTwoColumn':
          // ReportA4Slide, ReportTwoColumnSlide: body.fontSize, bullets.fontSize, bullets.iconType 적용
          updatedSlide.style = {
            ...updatedSlide.style,
            body: {
              ...updatedSlide.style?.body,
              fontSize: globalSettings.fontSize,
            },
            bullets: {
              ...updatedSlide.style?.bullets,
              fontSize: globalSettings.fontSize,
              iconType: globalSettings.iconType,
            },
          };
          break;

        // title, section 슬라이드는 변경하지 않음
        // 다른 슬라이드 타입도 slideTitle, bodyTitle만 적용됨 (위에서)
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

    logger.info('전역 설정이 모든 슬라이드에 적용되었어요');
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

      logger.info('슬라이드 생성 시작');

      // 🔄 크레딧 잔액 동기화 (DB → 로컬 상태)
      await creditStore.fetchBalance();
      logger.debug('크레딧 정보 동기화 완료');

      const { selectedThemeId, researchMode, useProContentModel, targetSlideCount } = get();

      // 💳 크레딧 차감 로직
      // 1. 깊은 조사 사용 시
      if (researchMode === 'deep') {
        const isFirstFree = creditStore.isFirstTimeFree('deepResearch');

        if (isFirstFree) {
          logger.info('깊은 조사 최초 1회 무료 사용');
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
          logger.info('깊은 조사 크레딧 차감', { cost: deepResearchCost });
        }
      }

      // 2. Pro 모델 사용 시
      if (useProContentModel) {
        const isFirstFree = creditStore.isFirstTimeFree('qualityGeneration');

        if (isFirstFree) {
          logger.info('고품질 생성 최초 1회 무료 사용');
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
          logger.info('고품질 생성 크레딧 차감', { cost: qualityCost });
        }
      }

      // 3. Pro 플랜 초과 슬라이드 크레딧 차감 (20장 초과 시 2 크레딧/장)
      const { getExtraSlideCount, getExtraSlideCreditCost } = await import('@/constants/subscription');
      const { CREDIT_COST } = await import('@/constants/credits');

      if (subscriptionStore.plan === 'pro') {
        const extraSlides = getExtraSlideCount('pro', targetSlideCount);

        if (extraSlides > 0) {
          const extraSlideCost = getExtraSlideCreditCost('pro', targetSlideCount, CREDIT_COST.EXTRA_SLIDE);
          const hasCredits = creditStore.canUseCredits(extraSlideCost);

          if (!hasCredits) {
            throw new Error(`크레딧이 부족해요. 초과 슬라이드 ${extraSlides}장을 생성하려면 ${extraSlideCost} 크레딧이 필요해요.`);
          }

          const success = await creditStore.useCredits(extraSlideCost);
          if (!success) {
            throw new Error('크레딧 차감에 실패했어요. 다시 시도해주세요.');
          }
          logger.info('초과 슬라이드 크레딧 차감', { cost: extraSlideCost, extraSlides, perSlide: CREDIT_COST.EXTRA_SLIDE });
        }
      }

      // 멀티모달 분기: 파일 첨부가 있으면 /api/generate 엔드포인트 호출
      if (attachments && attachments.length > 0) {
        logger.info('멀티모달 생성 모드', { fileCount: attachments.length });
        logger.debug('목표 슬라이드 분량', { targetSlideCount });

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
            aspectRatio: get().aspectRatio, // 화면 비율 전달
            pageFormat: get().pageFormat,   // 페이지 형식 전달
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`멀티모달 생성 실패: ${errorData.error || response.statusText}`);
        }

        const { slideData, metadata } = await response.json();
        logger.info('멀티모달 슬라이드 데이터 수신', { slideCount: slideData.slides.length });

        set({ generationStep: 'generating' });

        // HTML 생성 (TemplateEngine)
        const theme = getThemeById(selectedThemeId) || DEFAULT_THEME;
        logger.debug('HTML 슬라이드 생성 중', { themeName: theme.name, templateId: theme.id });
        const engine = new TemplateEngine();
        const htmlSlides = engine.generateAll(slideData, theme.id); // ✅ theme.id 사용
        logger.info('HTML 생성 완료', { slideCount: htmlSlides.length });

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

        logger.info('멀티모달 프리젠테이션 생성 완료');

        // 데이터베이스 저장
        try {
          logger.debug('데이터베이스에 저장 중');
          await get().savePresentation();
          logger.info('데이터베이스 저장 완료');
        } catch (saveError) {
          logger.error('데이터베이스 저장 실패', saveError);
          throw new Error(`프리젠테이션 저장에 실패했어요: ${saveError instanceof Error ? saveError.message : String(saveError)}`);
        }

        return;
      }

      // 기존 로직 (파일 첨부 없는 경우)
      let enrichedContent = text;

      logger.debug('목표 슬라이드 분량', { targetSlideCount });

      // 1단계 (선택): 자료 조사
      if (researchMode !== 'none') {
        const config = RESEARCH_MODE_CONFIG[researchMode];
        if (config.enabled && config.model) {
          logger.info('자료 조사 시작', { mode: config.label });
          const researchResult = await researchTopic(text, config.model);
          logger.info('자료 조사 완료');

          // 2단계: 콘텐츠 생성 (자료 조사 결과 포함)
          logger.info('슬라이드 콘텐츠 생성 시작', { model: useProContentModel ? 'Pro' : 'Flash' });
          enrichedContent = await generateSlideContent({
            userInput: text,
            research: researchResult,
            useProModel: useProContentModel,
            maxSlides: targetSlideCount, // 사용자 설정값 사용
            aspectRatio: get().aspectRatio,
            pageFormat: get().pageFormat,
          });
          logger.info('슬라이드 콘텐츠 생성 완료');
        }
      } else {
        // 자료 조사 없이 콘텐츠 생성
        logger.info('슬라이드 콘텐츠 생성 시작', { model: useProContentModel ? 'Pro' : 'Flash' });
        enrichedContent = await generateSlideContent({
          userInput: text,
          useProModel: useProContentModel,
          maxSlides: targetSlideCount, // 사용자 설정값 사용
          aspectRatio: get().aspectRatio,
          pageFormat: get().pageFormat,
        });
        logger.info('슬라이드 콘텐츠 생성 완료');
      }

      set({ generationStep: 'parsing' });

      // 2단계: JSON 파싱 (Parser 단계 제거 - Content generator가 직접 UnifiedPPTJSON 출력)
      logger.debug('JSON 파싱 시작');

      // 🆕 디버깅: Gemini API 원시 응답 로깅
      logger.debug('Gemini API 원시 응답', { length: enrichedContent.length });

      // 마크다운 코드 블록 제거
      let jsonString = enrichedContent.trim();
      const lines = jsonString.split('\n');

      if (lines[0].trim().startsWith('```')) {
        lines.shift();
        logger.debug('첫 줄 코드 블록 마커 제거');
      }

      if (lines.length > 0 && lines[lines.length - 1].trim() === '```') {
        lines.pop();
        logger.debug('마지막 줄 코드 블록 마커 제거');
      }

      jsonString = lines.join('\n').trim();

      // 🆕 디버깅: 정제된 JSON 문자열 로깅
      logger.debug('정제된 JSON 미리보기', { preview: jsonString.substring(0, 200) });

      // UnifiedPPTJSON 파싱
      let slideJSON: UnifiedPPTJSON;
      try {
        slideJSON = JSON.parse(jsonString) as UnifiedPPTJSON;

        // ✅ 화면 비율 및 페이지 형식 설정
        slideJSON.aspectRatio = get().aspectRatio;
        slideJSON.pageFormat = get().pageFormat;
        logger.debug('화면 설정', { aspectRatio: slideJSON.aspectRatio, pageFormat: slideJSON.pageFormat });

        // 검증 1: 기본 구조
        if (!slideJSON.slides || !Array.isArray(slideJSON.slides) || slideJSON.slides.length === 0) {
          logger.error('슬라이드 배열이 비어있습니다');
          throw new Error('슬라이드 데이터가 올바르지 않습니다.');
        }

        // 검증 1-1: 원페이지 모드 슬라이드 타입 검증
        if (slideJSON.pageFormat === 'one-page') {
          const validTypes = ['reportTwoColumn', 'reportA4'];
          const hasValidType = slideJSON.slides.some(slide => validTypes.includes(slide.type));

          if (!hasValidType) {
            logger.error('원페이지 모드에서 잘못된 슬라이드 타입 생성', { types: slideJSON.slides.map(s => s.type) });
            throw new Error('원페이지 모드에서는 reportTwoColumn 또는 reportA4 타입만 가능합니다. 다시 시도해주세요.');
          }

          // 원페이지 모드에서는 첫 번째 슬라이드만 유지
          const firstValidSlide = slideJSON.slides.find(slide => validTypes.includes(slide.type));
          if (firstValidSlide) {
            slideJSON.slides = [firstValidSlide];
            logger.info('원페이지 모드 슬라이드 설정', { type: firstValidSlide.type });
          }
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
          logger.warn('빈 슬라이드 감지', { emptyCount: emptySlides.length, totalCount: slideJSON.slides.length });
        }

        // 🆕 검증 3: 모든 슬라이드가 비어있으면 에러
        if (emptySlides.length === slideJSON.slides.length) {
          logger.error('모든 슬라이드가 비어있습니다');
          throw new Error('생성된 슬라이드가 모두 비어있어요. Gemini API 응답을 확인해주세요.');
        }

        logger.info('JSON 파싱 완료', { slideCount: slideJSON.slides.length, contentSlides: slideJSON.slides.length - emptySlides.length });

        // 슬라이드 수 제한 적용
        if (slideJSON.slides.length > maxSlides) {
          logger.warn('슬라이드 수 제한 적용', { from: slideJSON.slides.length, to: maxSlides });
          slideJSON.slides = slideJSON.slides.slice(0, maxSlides);
        }
      } catch (parseError) {
        logger.error('JSON 파싱 실패', parseError);
        throw new Error('JSON 파싱 실패: ' + (parseError instanceof Error ? parseError.message : String(parseError)));
      }

      set({ generationStep: 'generating' });

      // 3단계: HTML 생성 (TemplateEngine)
      const theme = getThemeById(selectedThemeId) || DEFAULT_THEME;
      logger.info('HTML 슬라이드 생성 중', { themeName: theme.name, templateId: theme.id });
      const engine = new TemplateEngine();
      const htmlSlides = engine.generateAll(slideJSON, theme.id); // ✅ theme.id 사용
      logger.info('HTML 생성 완료', { slideCount: htmlSlides.length });

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

      logger.info('프리젠테이션 생성 완료');

      // 생성 즉시 자동 저장 (무료 카운트는 저장 성공 후 차감)
      try {
        logger.debug('데이터베이스에 저장 중');
        await get().savePresentation();
        logger.info('데이터베이스 저장 완료');
      } catch (saveError) {
        logger.error('데이터베이스 저장 실패', saveError);
        // 에러를 사용자에게 명확히 전달
        throw new Error(`프리젠테이션 저장에 실패했어요: ${saveError instanceof Error ? saveError.message : String(saveError)}`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      logger.error('프리젠테이션 생성 실패', error);

      // 디버깅을 위한 추가 로깅 (프로덕션 환경)
      logger.error('에러 상세 정보', {
        message: errorMessage,
        geminiApiKeyExists: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
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

      logger.debug('프리젠테이션 저장 요청', { method, isNew, id: currentPresentation.id });

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
        logger.debug('새 ID로 업데이트', { id: data.presentation.id });
      }

      logger.info('프리젠테이션 저장 완료');

      // 🆕 저장 성공 후 무료 카운트 차감 및 크레딧 동기화
      if (isNew) {
        const creditStore = await import('@/store/creditStore').then(m => m.useCreditStore.getState());

        // 심층 검색 무료 카운트 차감
        if (researchMode === 'deep' && creditStore.isFirstTimeFree('deepResearch')) {
          await creditStore.useFirstTimeFree('deepResearch');
          logger.info('심층 검색 최초 무료 사용 완료');
        }

        // 고품질 생성 무료 카운트 차감
        if (useProContentModel && creditStore.isFirstTimeFree('qualityGeneration')) {
          await creditStore.useFirstTimeFree('qualityGeneration');
          logger.info('고품질 생성 최초 무료 사용 완료');
        }

        // 크레딧 잔액 동기화 (프레젠테이션 생성 시 서버에서 1 크레딧 차감)
        await creditStore.fetchBalance();
        logger.debug('크레딧 잔액 동기화 완료');
      }
    } catch (error) {
      logger.error('저장 실패', error);
      throw error;  // Fallback 없이 에러 전파
    }
  },

  fetchPresentations: async () => {
    try {
      const response = await fetch('/api/presentations');

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          logger.debug('인증 필요: 로그인 후 프리젠테이션 조회 가능');
          return [];
        }
        throw new Error(`프리젠테이션 목록 조회 실패: ${response.status}`);
      }

      const data = await response.json();
      logger.info('프리젠테이션 목록 로드 완료', { count: data.presentations.length });
      return data.presentations;
    } catch (error) {
      logger.error('프리젠테이션 목록 조회 실패', error);
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
        logger.info('프리젠테이션 로드 완료', { title: presentation.title, themeId: templateId });
      }
    } catch (error) {
      logger.error('프리젠테이션 조회 실패', error);
      throw error;
    }
  },

  updateSlide: (index: number, updatedSlide: Slide) => {
    logger.debug('슬라이드 업데이트 시작', {
      index,
      slideType: updatedSlide.type,
    });

    const { currentPresentation } = get();

    // 1. 유효성 검사
    if (!currentPresentation) {
      logger.error('현재 프리젠테이션이 없습니다');
      return;
    }

    if (!currentPresentation.slideData) {
      logger.error('slideData가 없는 구버전 프리젠테이션은 편집할 수 없습니다');
      return;
    }

    if (index < 0 || index >= currentPresentation.slideData.slides.length) {
      logger.error('잘못된 슬라이드 인덱스', { index });
      return;
    }

    logger.debug('유효성 검사 통과');

    // 히스토리 기록 (변경 전)
    useHistoryStore.getState().pushHistory(currentPresentation);

    // 2. slideData 업데이트
    const newSlideData: UnifiedPPTJSON = {
      ...currentPresentation.slideData,
      slides: currentPresentation.slideData.slides.map((slide, i) =>
        i === index ? updatedSlide : slide
      ),
    };

    logger.debug('slideData 업데이트 완료');

    // 3. TemplateEngine으로 HTML 재생성
    logger.debug('TemplateEngine으로 HTML 재생성 시작');
    const engine = new TemplateEngine();
    const htmlSlides = engine.generateAll(newSlideData, currentPresentation.templateId || 'toss');
    logger.debug('HTML 재생성 완료', { slideCount: htmlSlides.length });

    // 4. currentPresentation 업데이트
    const updated = {
      currentPresentation: {
        ...currentPresentation,
        slideData: newSlideData,
        slides: htmlSlides,
        updatedAt: Date.now(),
      },
    };

    set(updated);
    logger.info('슬라이드 업데이트 완료', { index });
  },

  reorderSlides: (startIndex: number, endIndex: number) => {
    const { currentPresentation } = get();

    // 1. 유효성 검사
    if (!currentPresentation) {
      logger.error('현재 프리젠테이션이 없습니다');
      return;
    }

    if (!currentPresentation.slideData) {
      logger.error('slideData가 없는 구버전 프리젠테이션은 편집할 수 없습니다');
      return;
    }

    const { slides } = currentPresentation.slideData;

    if (
      startIndex < 0 ||
      startIndex >= slides.length ||
      endIndex < 0 ||
      endIndex >= slides.length
    ) {
      logger.error('잘못된 슬라이드 인덱스', { startIndex, endIndex });
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

    logger.info('슬라이드 순서 변경 완료', { from: startIndex, to: endIndex });
  },

  addSlide: (slideType: SlideType, afterIndex: number) => {
    const { currentPresentation } = get();

    // 1. 유효성 검사
    if (!currentPresentation) {
      logger.error('현재 프리젠테이션이 없습니다');
      return;
    }

    if (!currentPresentation.slideData) {
      logger.error('slideData가 없는 구버전 프리젠테이션은 편집할 수 없습니다');
      return;
    }

    const { slides } = currentPresentation.slideData;

    if (afterIndex < -1 || afterIndex >= slides.length) {
      logger.error('잘못된 삽입 위치', { afterIndex });
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

    logger.info('슬라이드 추가 완료', { slideType, position: afterIndex + 1 });
  },

  deleteSlide: (index: number): boolean => {
    const { currentPresentation } = get();

    // 1. 유효성 검사
    if (!currentPresentation) {
      logger.error('현재 프리젠테이션이 없습니다');
      return false;
    }

    if (!currentPresentation.slideData) {
      logger.error('slideData가 없는 구버전 프리젠테이션은 편집할 수 없습니다');
      return false;
    }

    const { slides } = currentPresentation.slideData;

    if (index < 0 || index >= slides.length) {
      logger.error('잘못된 슬라이드 인덱스', { index });
      return false;
    }

    // 2. 마지막 슬라이드 삭제 방지
    if (slides.length <= 1) {
      logger.warn('마지막 슬라이드는 삭제할 수 없어요');
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

    logger.info('슬라이드 삭제 완료', { index });
    return true;
  },

  duplicateSlide: (index: number) => {
    const { currentPresentation } = get();

    // 1. 유효성 검사
    if (!currentPresentation) {
      logger.error('현재 프리젠테이션이 없습니다');
      return;
    }

    if (!currentPresentation.slideData) {
      logger.error('slideData가 없는 구버전 프리젠테이션은 편집할 수 없습니다');
      return;
    }

    const { slides } = currentPresentation.slideData;

    if (index < 0 || index >= slides.length) {
      logger.error('잘못된 슬라이드 인덱스', { index });
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

    logger.info('슬라이드 복제 완료', { from: index, to: index + 1 });
  },

  changeTemplate: (templateId: string) => {
    const { currentPresentation } = get();

    // 1. 유효성 검사
    if (!currentPresentation) {
      logger.error('현재 프리젠테이션이 없습니다');
      return;
    }

    if (!currentPresentation.slideData) {
      logger.error('slideData가 없는 구버전 프리젠테이션은 편집할 수 없습니다');
      return;
    }

    // 2. 현재 템플릿과 동일한 경우 스킵
    if (currentPresentation.templateId === templateId) {
      logger.debug('이미 해당 템플릿을 사용 중이에요');
      return;
    }

    // 히스토리 기록 (변경 전)
    useHistoryStore.getState().pushHistory(currentPresentation);

    // 3. TemplateEngine으로 전체 HTML 재생성
    logger.info('템플릿 전환 중', { from: currentPresentation.templateId, to: templateId });
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

    logger.info('템플릿 전환 완료', { templateId });
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
      logger.debug('Undo 완료');
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
      logger.debug('Redo 완료');
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
