/**
 * Perplexity AI 자료 조사 API Route
 *
 * 클라이언트에서 서버의 Perplexity API를 호출하기 위한 프록시 엔드포인트
 */

import { NextRequest, NextResponse } from 'next/server';
import type { PerplexityModel } from '@/types/research';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

if (!PERPLEXITY_API_KEY) {
  console.warn('⚠️ PERPLEXITY_API_KEY가 설정되지 않았습니다. 자료 조사 기능이 비활성화됩니다.');
}

/**
 * Perplexity API 모델 선택
 */
function getPerplexityModel(model: PerplexityModel): string {
  switch (model) {
    case 'sonar-deep-research':
      return 'sonar-pro';
    case 'sonar-reasoning':
      return 'sonar-reasoning';
    case 'sonar':
    default:
      return 'sonar';
  }
}

/**
 * POST /api/research
 *
 * 요청 본문:
 * - topic: 조사할 주제
 * - model: Perplexity 모델 (sonar | sonar-reasoning | sonar-deep-research)
 */
export async function POST(request: NextRequest) {
  try {
    // API 키 확인
    if (!PERPLEXITY_API_KEY) {
      return NextResponse.json(
        { error: 'Perplexity API 키가 설정되지 않았어요. 관리자에게 문의해주세요.' },
        { status: 500 }
      );
    }

    // 요청 파라미터 파싱
    const body = await request.json();
    const { topic, model = 'sonar' } = body;

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: '주제를 입력해주세요.' },
        { status: 400 }
      );
    }

    // Perplexity API 호출
    const perplexityModel = getPerplexityModel(model as PerplexityModel);
    console.log(`🔍 [Perplexity API] 자료 조사 시작: "${topic}" (모델: ${perplexityModel})`);

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: perplexityModel,
        messages: [
          {
            role: 'system',
            content: '당신은 프레젠테이션 제작을 위한 자료 조사 전문가입니다. 주어진 주제에 대해 정확하고 최신의 정보를 수집하여 체계적으로 정리해주세요.',
          },
          {
            role: 'user',
            content: `다음 주제에 대해 프레젠테이션 제작에 필요한 자료를 조사해주세요:\n\n주제: ${topic}\n\n다음 내용을 포함해주세요:\n1. 핵심 개념 정의\n2. 주요 트렌드 및 통계\n3. 사례 연구 (있다면)\n4. 향후 전망\n\n출처를 명확히 밝혀주세요.`,
          },
        ],
        temperature: 0.2,
        max_tokens: 4000,
        return_citations: true,
        return_images: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Perplexity API] 오류 (${response.status}):`, errorText);

      return NextResponse.json(
        { error: `Perplexity API 호출에 실패했어요. (${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ [Perplexity API] 자료 조사 완료`);

    // 응답 데이터 구조화
    const content = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];
    const usage = data.usage || {};

    // 출처 정보 구조화
    const sources = citations.map((url: string, index: number) => ({
      title: `출처 ${index + 1}`,
      url,
      snippet: '',
    }));

    // 토큰 사용량 로깅
    if (usage) {
      console.log(`💰 [Perplexity API] 토큰 사용량:`, {
        입력_토큰: usage.prompt_tokens || 0,
        출력_토큰: usage.completion_tokens || 0,
        총_토큰: usage.total_tokens || 0,
      });
    }

    return NextResponse.json({
      content,
      sources,
      usage: {
        prompt_tokens: usage.prompt_tokens || 0,
        completion_tokens: usage.completion_tokens || 0,
        total_tokens: usage.total_tokens || 0,
        num_search_queries: citations.length,
      },
    });

  } catch (error) {
    console.error('❌ [Perplexity API] 예상치 못한 오류:', error);

    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : '자료 조사 중 오류가 발생했어요. 다시 시도해주세요.'
      },
      { status: 500 }
    );
  }
}
