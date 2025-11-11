/**
 * 파일 처리 유틸리티 함수
 */

import type { AttachmentFile } from '@/types/research';

/**
 * File 객체를 Base64 문자열로 변환
 *
 * @param file - 변환할 파일
 * @returns Promise<AttachmentFile> - 파일 정보 + Base64 데이터
 *
 * @example
 * ```typescript
 * const file = event.target.files[0];
 * const attachment = await fileToBase64(file);
 * // attachment.data: "iVBORw0KGgoAAAANSUhEUgAA..." (Base64 문자열)
 * ```
 */
export async function fileToBase64(file: File): Promise<AttachmentFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      // data:image/jpeg;base64,... 형식에서 base64 부분만 추출
      const base64Data = result.split(',')[1];

      resolve({
        name: file.name,
        mimeType: file.type,
        data: base64Data,
        size: file.size,
      });
    };

    reader.onerror = () => {
      reject(new Error('파일을 읽지 못했어요'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 여러 파일을 Base64로 변환
 *
 * @param files - 변환할 파일 배열
 * @returns Promise<AttachmentFile[]> - 파일 정보 배열
 */
export async function filesToBase64(files: File[]): Promise<AttachmentFile[]> {
  return Promise.all(files.map(file => fileToBase64(file)));
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형식으로 변환
 *
 * @param bytes - 바이트 단위 크기
 * @returns 포맷된 문자열 (예: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * 파일 확장자 추출
 *
 * @param filename - 파일명
 * @returns 확장자 (예: ".pdf", ".jpg")
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? '' : filename.substring(lastDot).toLowerCase();
}

/**
 * MIME 타입에서 파일 타입 카테고리 추출
 *
 * @param mimeType - MIME 타입 (예: "image/jpeg")
 * @returns 카테고리 (예: "image", "application")
 */
export function getFileTypeCategory(mimeType: string): string {
  return mimeType.split('/')[0];
}

/**
 * 파일이 이미지인지 확인
 *
 * @param mimeType - MIME 타입
 * @returns true if image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * 파일이 PDF인지 확인
 *
 * @param mimeType - MIME 타입
 * @returns true if PDF
 */
export function isPdfFile(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}
