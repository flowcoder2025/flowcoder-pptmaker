/**
 * Gemini API 설정
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Static Export 모드에서 환경 변수 접근 방식 개선
// typeof window === 'undefined' 체크로 서버/클라이언트 환경 구분
const getApiKey = (): string => {
  // 빌드 타임에 주입된 값 사용 (Static Export 모드 대응)
  const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  if (!key) {
    console.error('🚨 CRITICAL: NEXT_PUBLIC_GEMINI_API_KEY가 설정되지 않았습니다!');
    console.error('📝 환경 변수 확인 방법:');
    console.error('1. .env.production 파일 확인');
    console.error('2. NEXT_PUBLIC_GEMINI_API_KEY 값 존재 여부 확인');
    console.error('3. npm run build 재실행 후 배포');
    throw new Error('Gemini API 키가 설정되지 않았어요. 앱을 재배포해야 해요.');
  }

  return key;
};

const API_KEY = getApiKey();

// Gemini AI 인스턴스
export const genAI = new GoogleGenerativeAI(API_KEY);

// Gemini Flash 모델 (빠른 HTML 생성용)
export const geminiFlash = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
});

// Gemini Pro 모델 (고품질 HTML 생성용)
export const geminiPro = genAI.getGenerativeModel({
  model: 'gemini-2.5-pro',
});

// 기본 설정
export const GEMINI_CONFIG = {
  flash: {
    temperature: 0.3, // 낮은 온도로 더 안정적인 JSON 생성
    maxOutputTokens: 16384, // 토큰 한도 증가 (자료 조사 시 충분한 출력 보장)
    responseMimeType: 'application/json', // JSON 형식으로 직접 응답 (파싱 안정성 향상)
  },
  pro: {
    temperature: 0.3, // 낮은 온도로 더 안정적인 JSON 생성
    maxOutputTokens: 32768, // 토큰 한도를 크게 늘림 (많은 슬라이드 처리 가능)
    responseMimeType: 'application/json', // JSON 형식으로 직접 응답 (파싱 안정성 향상)
  },
} as const;
