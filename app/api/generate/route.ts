/**
 * 멀티모달 슬라이드 생성 API
 * POST /api/generate
 *
 * 텍스트 + PDF/이미지 첨부 → Gemini Multimodal API → UnifiedPPTJSON
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateMultimodalSlideContent } from '@/services/gemini/multimodal-generator';
import { researchTopic } from '@/services/perplexity/researcher';
import type { SlideType } from '@/types/slide';
import { PLAN_LIMITS, isFileCountAllowed, isFileSizeAllowed } from '@/constants/multimodal';
import { logger } from '@/lib/logger';
import { generateRequestSchema, validateRequest } from '@/lib/validations';

/** 슬라이드 타입만 가진 간단한 인터페이스 (JSON 파싱 결과용) */
interface ParsedSlide {
  type: SlideType;
  [key: string]: unknown;
}

/**
 * POST /api/generate
 *
 * 요청 본문:
 * - topic: 사용자 입력 텍스트
 * - attachments: 첨부 파일 배열 (AttachmentFile[])
 * - researchMode: 자료 조사 모드 ('none', 'fast', 'deep')
 * - model: Gemini 모델 ('flash', 'pro')
 * - slideCount: 슬라이드 개수
 * - plan: 요금제 ('free', 'pro', 'premium')
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Zod 스키마 검증
    const validation = validateRequest(generateRequestSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const {
      topic,
      attachments,
      researchMode,
      model,
      slideCount,
      plan,
      aspectRatio,
      pageFormat,
    } = validation.data;

    // 1-1. A4-portrait 비율 검증 (원페이지 모드 전용)
    if (aspectRatio === 'A4-portrait' && pageFormat !== 'one-page') {
      return NextResponse.json(
        { error: 'A4 비율은 원페이지 모드에서만 사용할 수 있어요' },
        { status: 400 }
      );
    }

    // 2. 플랜별 제한 검증
    const limits = PLAN_LIMITS[plan];

    // 파일 개수 제한
    if (!isFileCountAllowed(attachments.length, plan)) {
      return NextResponse.json(
        {
          error: `${plan} 플랜은 최대 ${limits.maxFiles}개의 파일만 첨부할 수 있어요`,
        },
        { status: 400 }
      );
    }

    // 파일 크기 제한
    for (const file of attachments) {
      if (!isFileSizeAllowed(file.size, plan)) {
        return NextResponse.json(
          {
            error: `${file.name}의 크기가 너무 커요. 파일당 최대 ${(limits.maxFileSize / 1024 / 1024).toFixed(0)}MB까지 가능해요`,
          },
          { status: 400 }
        );
      }
    }

    logger.info('멀티모달 슬라이드 생성 시작', {
      topic: topic.substring(0, 50),
      attachments: attachments.length,
      researchMode,
      model,
      slideCount,
      plan,
    });

    // 3. 자료 조사 (선택적)
    let research = undefined;
    if (researchMode !== 'none') {
      try {
        logger.info('자료 조사 시작', { researchMode });
        research = await researchTopic(topic, researchMode as 'sonar' | 'sonar-reasoning');
        logger.info('자료 조사 완료', { sources: research.sources.length });
      } catch (error) {
        logger.warn('자료 조사 실패 (생성은 계속 진행)', error);
        // 자료 조사 실패해도 생성은 계속 진행
      }
    }

    // 4. Gemini Multimodal 생성
    logger.info('Gemini 콘텐츠 생성 시작', { model });
    const slideDataJson = await generateMultimodalSlideContent({
      userInput: topic,
      attachments,
      research,
      useProModel: model === 'pro',
      maxSlides: slideCount,
    });

    logger.info('멀티모달 슬라이드 생성 완료');

    // 5. 마크다운 코드 블록 제거 (```json ... ```)
    let cleanedJson = slideDataJson.trim();
    if (cleanedJson.startsWith('```json')) {
      cleanedJson = cleanedJson.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanedJson.startsWith('```')) {
      cleanedJson = cleanedJson.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    // 6. JSON 파싱 및 반환
    const slideData = JSON.parse(cleanedJson);

    // ✅ 화면 비율 및 페이지 형식 설정
    // reportA4 슬라이드가 있으면 자동으로 A4-portrait 비율로 설정
    const hasReportA4 = slideData.slides.some((slide: ParsedSlide) => slide.type === 'reportA4');
    if (hasReportA4) {
      slideData.aspectRatio = 'A4-portrait';
      logger.info('reportA4 슬라이드 감지 - AspectRatio를 A4-portrait로 자동 설정');
    } else {
      slideData.aspectRatio = aspectRatio;
    }
    slideData.pageFormat = pageFormat;
    logger.info('화면 비율 설정', { aspectRatio: slideData.aspectRatio, pageFormat });

    // ✅ 원페이지 모드 슬라이드 타입 검증
    if (pageFormat === 'one-page') {
      const validTypes: SlideType[] = ['reportTwoColumn', 'reportA4'];
      const hasValidType = slideData.slides.some((slide: ParsedSlide) => validTypes.includes(slide.type));

      if (!hasValidType) {
        const slideTypes = slideData.slides.map((s: ParsedSlide) => s.type);
        logger.error('원페이지 모드에서 잘못된 슬라이드 타입이 생성됨', { slideTypes });
        throw new Error('원페이지 모드에서는 reportTwoColumn 또는 reportA4 타입만 가능합니다. 다시 시도해주세요.');
      }

      // 원페이지 모드에서는 첫 번째 유효한 슬라이드만 유지
      const firstValidSlide = slideData.slides.find((slide: ParsedSlide) => validTypes.includes(slide.type));
      if (firstValidSlide) {
        slideData.slides = [firstValidSlide];
        logger.info('원페이지 모드 설정 완료', { slideType: firstValidSlide.type });
      }
    }

    return NextResponse.json({
      success: true,
      slideData,
      metadata: {
        slideCount: slideData.slides.length,
        attachmentCount: attachments.length,
        hasResearch: !!research,
        model,
        plan,
      },
    });

  } catch (error) {
    logger.error('멀티모달 슬라이드 생성 실패', error);

    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : '슬라이드를 생성하지 못했어요. 다시 시도해주세요',
      },
      { status: 500 }
    );
  }
}
