/**
 * Perplexity AI를 사용한 자료 조사 (클라이언트 사이드)
 * Next.js API 라우트를 통해 서버 사이드에서 Perplexity API 호출
 */

import type { PerplexityModel, ResearchResult, SearchResult } from '@/types/research';
import { logger } from '@/lib/logger';

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
  logger.info('Perplexity 자료 조사 시작', { model: modelName, topic });

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
      logger.debug('Perplexity 토큰 사용량', {
        model: modelName,
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0,
        searchQueries: data.usage.num_search_queries || 0,
      });
    }

    logger.info('Perplexity 자료 조사 완료', {
      model: modelName,
      sourcesCount: data.sources?.length || 0,
      contentLength: data.content?.length || 0,
      topSources: data.sources?.slice(0, 3).map((s: SearchResult) => s.title),
    });

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
    logger.error('Perplexity 자료 조사 실패', { model: modelName, error });
    throw error;
  }
}
