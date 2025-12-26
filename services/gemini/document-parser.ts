/**
 * 문서 파서 서비스
 *
 * 🔒 서버 프록시를 통해 Gemini Flash Multimodal API 호출
 * 비용: ~2원/파일 (Gemini Flash 1회 호출)
 *
 * 지원 파일 타입:
 * - PDF 문서
 * - 이미지 (PNG, JPEG, WEBP, GIF)
 * - 기타 Gemini Multimodal이 지원하는 모든 파일
 */

import { logger } from '@/lib/logger';

/**
 * 파일 첨부 타입
 */
export interface FileAttachment {
  name: string;
  mimeType: string;
  data: string; // Base64 인코딩된 데이터
  size: number;
}

/**
 * 문서 파싱 결과
 */
export interface ParsedDocument {
  /** 파일명 */
  fileName: string;
  /** 추출된 텍스트 (구조화된 마크다운) */
  content: string;
  /** 추출된 섹션 목록 */
  sections: string[];
  /** 추출 성공 여부 */
  success: boolean;
  /** 에러 메시지 (실패 시) */
  error?: string;
}

/**
 * 파일에서 구조화된 텍스트 추출
 *
 * 🔒 서버 프록시를 통해 API 호출
 *
 * @param file - 파싱할 파일
 * @returns 추출된 문서 내용
 */
export async function parseDocument(file: FileAttachment): Promise<ParsedDocument> {
  logger.info('문서 파싱 시작', { fileName: file.name, mimeType: file.mimeType });

  try {
    const response = await fetch('/api/gemini/parse-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file }),
    });

    // 에러 응답 처리
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));

      logger.error('문서 파싱 API 오류', { status: response.status, error: errorData.error });

      // 상태 코드별 사용자 친화적 메시지
      if (response.status === 401) {
        return {
          fileName: file.name,
          content: '',
          sections: [],
          success: false,
          error: '로그인이 필요해요',
        };
      }
      if (response.status === 429) {
        return {
          fileName: file.name,
          content: '',
          sections: [],
          success: false,
          error: '요청이 너무 많아요. 잠시 후 다시 시도해주세요.',
        };
      }

      return {
        fileName: file.name,
        content: '',
        sections: [],
        success: false,
        error: errorData.error || '파일을 파싱하지 못했어요',
      };
    }

    const result: ParsedDocument = await response.json();

    logger.info('문서 파싱 완료', {
      fileName: file.name,
      contentLength: result.content.length,
      sections: result.sections.length,
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    logger.error('문서 파싱 실패', { fileName: file.name, error: errorMessage });

    // fetch 자체 실패 (네트워크 오류 등)
    if (error instanceof TypeError && errorMessage.includes('fetch')) {
      return {
        fileName: file.name,
        content: '',
        sections: [],
        success: false,
        error: '네트워크 연결을 확인해주세요',
      };
    }

    return {
      fileName: file.name,
      content: '',
      sections: [],
      success: false,
      error: '파일 파싱에 실패했어요. 다시 시도해주세요.',
    };
  }
}

/**
 * 여러 파일을 한 번에 파싱
 *
 * @param files - 파싱할 파일 배열
 * @returns 파싱 결과 배열
 */
export async function parseDocuments(files: FileAttachment[]): Promise<ParsedDocument[]> {
  logger.info(`${files.length}개 파일 일괄 파싱 시작`);

  const results = await Promise.all(files.map(file => parseDocument(file)));

  const successCount = results.filter(r => r.success).length;
  logger.info(`일괄 파싱 완료: ${successCount}/${files.length}개 성공`);

  return results;
}

/**
 * 파싱 결과를 단일 문자열로 통합
 *
 * @param parsedDocs - 파싱된 문서 배열
 * @returns 통합된 텍스트
 */
export function mergeParsedDocuments(parsedDocs: ParsedDocument[]): string {
  const successfulDocs = parsedDocs.filter(doc => doc.success);

  if (successfulDocs.length === 0) {
    return '';
  }

  if (successfulDocs.length === 1) {
    return successfulDocs[0].content;
  }

  // 여러 문서를 통합
  return successfulDocs
    .map((doc, index) => {
      return `# 문서 ${index + 1}: ${doc.fileName}\n\n${doc.content}`;
    })
    .join('\n\n---\n\n');
}
