/**
 * Perplexity AI를 사용한 자료 조사 (클라이언트 사이드)
 * Next.js API 라우트를 통해 서버 사이드에서 Perplexity API 호출
 */

import type { PerplexityModel, ResearchResult, SearchResult } from '@/types/research';

/**
 * 자체 API 라우트를 통해 주제에 대한 자료 조사
 */
export async function researchTopic(
  topic: string,
  model: PerplexityModel = 'sonar'
): Promise<ResearchResult> {
  const modelName =
    model === 'sonar-deep-research' ? 'Deep Research' :
    model === 'sonar-reasoning' ? 'Reasoning' :
    'Sonar';
  console.log(`🔍 [Perplexity ${modelName}] 자료 조사 시작: "${topic}"`);

  try {
    const response = await fetch('/api/research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        model,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `API 오류 (${response.status})`);
    }

    const data = await response.json();

    // 💰 토큰 사용량 로깅 (수익 분석용)
    if (data.usage) {
      const promptTokens = data.usage.prompt_tokens || 0;
      const completionTokens = data.usage.completion_tokens || 0;
      const totalTokens = data.usage.total_tokens || 0;
      const searchQueries = data.usage.num_search_queries || 0;

      console.log(`💰 [Perplexity ${modelName}] 토큰 사용량:`, {
        입력_토큰: promptTokens,
        출력_토큰: completionTokens,
        총_토큰: totalTokens,
        검색_쿼리_수: searchQueries,
        계산_검증: `${promptTokens} + ${completionTokens} = ${promptTokens + completionTokens}`,
      });
    }

    console.log(`✅ [Perplexity ${modelName}] 자료 조사 완료`);
    console.log(`📚 검색 결과 수: ${data.sources?.length || 0}개`);
    console.log(`📝 조사 내용 길이: ${data.content?.length || 0}자`);

    if (data.sources && data.sources.length > 0) {
      console.log(`🔗 출처:`, data.sources.slice(0, 3).map((s: SearchResult) => s.title));
    }

    return {
      content: data.content || '',
      sources: data.sources || [],
      usage: data.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
        num_search_queries: 0,
      },
    };
  } catch (error) {
    console.error(`❌ [Perplexity ${modelName}] 자료 조사 실패:`, error);
    throw error;
  }
}
