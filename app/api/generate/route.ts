/**
 * 멀티모달 슬라이드 생성 API
 * POST /api/generate
 *
 * 텍스트 + PDF/이미지 첨부 → Gemini Multimodal API → UnifiedPPTJSON
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateMultimodalSlideContent } from '@/services/gemini/multimodal-generator';
import { researchTopic } from '@/services/perplexity/researcher';
import type { MultimodalRequest } from '@/types/research';
import { PLAN_LIMITS, isFileCountAllowed, isFileSizeAllowed } from '@/constants/multimodal';

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
    const body: MultimodalRequest & { plan: keyof typeof PLAN_LIMITS } = await request.json();

    const {
      topic,
      attachments = [],
      researchMode = 'none',
      model = 'flash',
      slideCount = 10,
      plan = 'free',
      aspectRatio = '16:9',
      pageFormat = 'slides',
    } = body;

    // 1. 입력 검증
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        { error: '주제를 입력해주세요' },
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

    console.log(`🚀 [Multimodal Generate] 생성 시작`);
    console.log(`  - 주제: "${topic.substring(0, 50)}..."`);
    console.log(`  - 첨부 파일: ${attachments.length}개`);
    console.log(`  - 자료 조사: ${researchMode}`);
    console.log(`  - 모델: ${model}`);
    console.log(`  - 슬라이드: ${slideCount}장`);
    console.log(`  - 플랜: ${plan}`);

    // 3. 자료 조사 (선택적)
    let research = undefined;
    if (researchMode !== 'none') {
      try {
        console.log(`🔍 자료 조사 시작 (${researchMode})...`);
        research = await researchTopic(topic, researchMode as 'sonar' | 'sonar-reasoning');
        console.log(`✅ 자료 조사 완료 (${research.sources.length}개 출처)`);
      } catch (error) {
        console.error('⚠️ 자료 조사 실패 (생성은 계속 진행):', error);
        // 자료 조사 실패해도 생성은 계속 진행
      }
    }

    // 4. Gemini Multimodal 생성
    console.log(`🎨 Gemini ${model} 콘텐츠 생성 시작...`);
    const slideDataJson = await generateMultimodalSlideContent({
      userInput: topic,
      attachments,
      research,
      useProModel: model === 'pro',
      maxSlides: slideCount,
    });

    console.log(`✅ [Multimodal Generate] 생성 완료`);

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
    slideData.aspectRatio = aspectRatio;
    slideData.pageFormat = pageFormat;
    console.log(`📐 AspectRatio: ${aspectRatio}, PageFormat: ${pageFormat}`);

    // ✅ 원페이지 모드 슬라이드 타입 검증
    if (pageFormat === 'one-page') {
      const validTypes = ['reportTwoColumn', 'reportA4'];
      const hasValidType = slideData.slides.some((slide: any) => validTypes.includes(slide.type));

      if (!hasValidType) {
        console.error('❌ 원페이지 모드에서 잘못된 슬라이드 타입이 생성됨:', slideData.slides.map((s: any) => s.type));
        throw new Error('원페이지 모드에서는 reportTwoColumn 또는 reportA4 타입만 가능합니다. 다시 시도해주세요.');
      }

      // 원페이지 모드에서는 첫 번째 유효한 슬라이드만 유지
      const firstValidSlide = slideData.slides.find((slide: any) => validTypes.includes(slide.type));
      if (firstValidSlide) {
        slideData.slides = [firstValidSlide];
        console.log(`✅ 원페이지 모드: ${firstValidSlide.type} 슬라이드 1장으로 설정`);
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
    console.error('❌ [Multimodal Generate] 생성 실패:', error);

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
