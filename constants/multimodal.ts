/**
 * 멀티모달 (Multimodal) 첨부 파일 관련 상수
 *
 * PDF 및 이미지 첨부 기능의 제한 및 설정값
 */

/**
 * 요금제별 파일 첨부 제한
 */
export const PLAN_LIMITS = {
  free: {
    maxFiles: 1,        // 최대 파일 개수
    maxPdfPages: 5,     // PDF 최대 페이지 수
    maxImageCount: 1,   // 최대 이미지 개수
    maxFileSize: 5 * 1024 * 1024,  // 5MB
  },
  pro: {
    maxFiles: 3,
    maxPdfPages: 20,
    maxImageCount: 3,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },
  premium: {
    maxFiles: 5,
    maxPdfPages: 50,
    maxImageCount: 5,
    maxFileSize: 20 * 1024 * 1024, // 20MB
  },
} as const;

/**
 * 허용된 파일 타입 및 확장자
 */
export const ALLOWED_FILE_TYPES = {
  pdf: {
    mimeTypes: ['application/pdf'],
    extensions: ['.pdf'],
    label: 'PDF 문서',
  },
  image: {
    mimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    label: '이미지',
  },
} as const;

/**
 * 전체 허용 MIME 타입 목록
 */
export const ALL_ALLOWED_MIME_TYPES = [
  ...ALLOWED_FILE_TYPES.pdf.mimeTypes,
  ...ALLOWED_FILE_TYPES.image.mimeTypes,
];

/**
 * 전체 허용 파일 확장자 목록
 */
export const ALL_ALLOWED_EXTENSIONS = [
  ...ALLOWED_FILE_TYPES.pdf.extensions,
  ...ALLOWED_FILE_TYPES.image.extensions,
];

/**
 * 파일 타입 검증 헬퍼
 */
export function isAllowedMimeType(mimeType: string): boolean {
  return ALL_ALLOWED_MIME_TYPES.includes(mimeType as any);
}

/**
 * 파일 확장자 검증 헬퍼
 */
export function isAllowedExtension(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return ALL_ALLOWED_EXTENSIONS.includes(ext as any);
}

/**
 * 요금제별 파일 크기 검증
 */
export function isFileSizeAllowed(
  fileSize: number,
  plan: keyof typeof PLAN_LIMITS
): boolean {
  return fileSize <= PLAN_LIMITS[plan].maxFileSize;
}

/**
 * 요금제별 파일 개수 검증
 */
export function isFileCountAllowed(
  fileCount: number,
  plan: keyof typeof PLAN_LIMITS
): boolean {
  return fileCount <= PLAN_LIMITS[plan].maxFiles;
}
