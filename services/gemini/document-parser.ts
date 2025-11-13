/**
 * 문서 파서 서비스
 *
 * Gemini Flash Multimodal API를 사용하여 파일 내용을 구조화된 텍스트로 추출
 * 비용: ~2원/파일 (Gemini Flash 1회 호출)
 *
 * 지원 파일 타입:
 * - PDF 문서
 * - 이미지 (PNG, JPEG, WEBP, GIF)
 * - 기타 Gemini Multimodal이 지원하는 모든 파일
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

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
 * @param file - 파싱할 파일
 * @returns 추출된 문서 내용
 */
export async function parseDocument(file: FileAttachment): Promise<ParsedDocument> {
  console.log(`📄 [Document Parser] 파일 파싱 시작: ${file.name} (${file.mimeType})`);

  // API 키 확인
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ [Document Parser] Gemini API 키가 설정되지 않았어요');
    return {
      fileName: file.name,
      content: '',
      sections: [],
      success: false,
      error: 'Gemini API 키가 설정되지 않았어요',
    };
  }

  try {
    // Gemini API 초기화
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 문서 파싱 프롬프트
    const prompt = `이 파일의 모든 내용을 정확하고 상세하게 추출해주세요.

**추출 규칙:**
1. **모든 텍스트를 빠짐없이 추출**하세요 (제목, 본문, 캡션, 주석 등 모두 포함)
2. **원본의 순서와 흐름을 유지**하세요 (섹션, 단락, 목록의 순서 그대로)
3. **데이터와 숫자를 정확하게 추출**하세요 (표, 차트, 통계 등)
4. **핵심 인사이트를 명확하게 표현**하세요
5. **자연스러운 문장**으로 작성하세요

**금지 사항:**
- 마크다운 문법 사용 절대 금지 (#, ##, *, **, _, -, >, 백틱 등)
- 플레이스홀더 사용 금지 ("[제목]", "[내용]", "[설명]" 같은 표현 절대 금지)
- 의미 없는 예시 금지 ("항목 1", "포인트 1" 같은 일반적인 표현 금지)
- 빈 섹션 금지 (모든 섹션은 실제 내용을 포함해야 함)

**출력 방식:**
- 추출된 모든 내용을 자연스러운 문장으로 작성하세요
- 원본 문서의 흐름을 유지하면서 모든 정보를 포함하세요
- 구조는 자연스럽게 표현하세요 (강제된 형식 없음)
- 중요한 내용은 명확하게 강조하세요 (일반 텍스트로)
- 일반 텍스트만 사용하세요 (슬라이드 생성 단계와 형식 통일)

**중요**: 실제 문서의 내용만 출력하세요. 템플릿이나 형식 예시를 출력하지 마세요.`;

    // API 요청 구성
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
      { text: prompt },
      {
        inlineData: {
          mimeType: file.mimeType,
          data: file.data,
        },
      },
    ];

    // API 호출
    const startTime = performance.now();
    const result = await model.generateContent(parts);
    const endTime = performance.now();

    const response = result.response;
    const extractedText = response.text();

    // 섹션 목록 추출 ("섹션 N:" 패턴 찾기)
    const sections = extractedText
      .split('\n')
      .filter(line => /^섹션 \d+:/.test(line.trim()))
      .map(line => line.trim());

    const duration = Math.round(endTime - startTime);
    console.log(`✅ [Document Parser] 파싱 완료 (${duration}ms)`);
    console.log(`📊 추출된 텍스트: ${extractedText.length}자`);
    console.log(`📑 섹션 수: ${sections.length}개`);

    return {
      fileName: file.name,
      content: extractedText,
      sections,
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error(`❌ [Document Parser] 파싱 실패: ${errorMessage}`);

    return {
      fileName: file.name,
      content: '',
      sections: [],
      success: false,
      error: `파일 파싱에 실패했어요: ${errorMessage}`,
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
  console.log(`📚 [Document Parser] ${files.length}개 파일 일괄 파싱 시작`);

  const results = await Promise.all(files.map(file => parseDocument(file)));

  const successCount = results.filter(r => r.success).length;
  console.log(`✅ [Document Parser] 일괄 파싱 완료: ${successCount}/${files.length}개 성공`);

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
