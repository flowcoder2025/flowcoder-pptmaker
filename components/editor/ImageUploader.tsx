/**
 * ImageUploader 컴포넌트
 *
 * 이미지 업로드 및 Base64 변환 (자동 압축 포함)
 * - 파일 업로드 (드래그앤드롭 지원)
 * - URL 다운로드
 * - 자동 이미지 압축 (목표: 1MB)
 * - 큰 파일 경고 (10MB 초과)
 */

'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { Camera, Loader2, Link as LinkIcon, Upload, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface ImageUploaderProps {
  currentImage?: string; // 현재 이미지 URL (base64)
  onImageChange: (imageBase64: string) => void;
  maxSizeMB?: number; // 압축 후 최대 크기 (기본: 2MB)
}

// 압축 설정
const COMPRESSION_OPTIONS = {
  maxSizeMB: 1, // 목표: 1MB
  maxWidthOrHeight: 1920, // Full HD
  useWebWorker: true,
  fileType: 'image/jpeg' as const,
};

// 파일 크기 제한
const MAX_ORIGINAL_SIZE_MB = 10; // 원본 파일 최대 10MB
const WARNING_SIZE_MB = 5; // 5MB 이상은 경고

export default function ImageUploader({
  currentImage,
  onImageChange,
  maxSizeMB = 2,
}: ImageUploaderProps) {
  // 디버깅: 컴포넌트 마운트 확인
  console.log('📸 ImageUploader 마운트:', {
    hasCurrentImage: !!currentImage,
    currentImageLength: currentImage?.length || 0,
    maxSizeMB,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 이미지 압축
   * @param file 원본 파일
   * @returns 압축된 파일
   */
  const compressImage = async (file: File): Promise<File> => {
    try {
      const originalSizeMB = file.size / 1024 / 1024;
      console.log(`원본 크기: ${originalSizeMB.toFixed(2)}MB`);

      // 압축
      const compressedFile = await imageCompression(file, {
        ...COMPRESSION_OPTIONS,
        onProgress: (progress) => {
          setCompressionProgress(progress);
        },
      });

      const compressedSizeMB = compressedFile.size / 1024 / 1024;
      console.log(`압축 후 크기: ${compressedSizeMB.toFixed(2)}MB`);

      // 압축 성공 알림
      if (originalSizeMB > 1) {
        toast.success(
          `이미지를 압축했어요 (${originalSizeMB.toFixed(1)}MB → ${compressedSizeMB.toFixed(1)}MB)`
        );
      }

      return compressedFile;
    } catch (err) {
      console.error('이미지 압축 실패:', err);
      throw new Error('이미지 압축에 실패했어요');
    }
  };

  /**
   * URL에서 이미지 다운로드
   * @param url 이미지 URL
   * @returns File 객체
   */
  const downloadImageFromUrl = async (url: string): Promise<File> => {
    try {
      // URL 유효성 검증
      new URL(url);

      const response = await fetch(url, {
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error('이미지를 다운로드할 수 없어요');
      }

      const blob = await response.blob();

      // 이미지 타입 검증
      if (!blob.type.startsWith('image/')) {
        throw new Error('이미지 파일이 아니에요');
      }

      // 파일 이름 생성
      const filename = url.split('/').pop() || 'image.jpg';
      return new File([blob], filename, { type: blob.type });
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        throw new Error('CORS 오류: 이 URL의 이미지는 다운로드할 수 없어요');
      }
      throw err;
    }
  };

  /**
   * Base64 변환
   * @param file 파일
   * @returns base64 문자열
   */
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('파일 읽기에 실패했어요'));
        }
      };
      reader.onerror = () => reject(new Error('파일 읽기에 실패했어요'));
      reader.readAsDataURL(file);
    });
  };

  /**
   * 파일 크기 검증 및 경고
   * @param file 파일
   * @returns 에러 메시지 (없으면 null)
   */
  const validateFileSize = (file: File): string | null => {
    const sizeMB = file.size / 1024 / 1024;

    // 10MB 초과: 에러
    if (sizeMB > MAX_ORIGINAL_SIZE_MB) {
      return `파일이 너무 커요 (${sizeMB.toFixed(1)}MB). 최대 ${MAX_ORIGINAL_SIZE_MB}MB까지 업로드할 수 있어요.`;
    }

    // 5MB 이상: 경고 (처리는 진행)
    if (sizeMB > WARNING_SIZE_MB) {
      toast.warning(
        `큰 파일이에요 (${sizeMB.toFixed(1)}MB). 압축에 시간이 걸릴 수 있어요.`
      );
    }

    return null;
  };

  /**
   * 파일 처리 (압축 → Base64 변환)
   * @param file 원본 파일
   */
  const handleFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    setCompressionProgress(0);

    try {
      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드할 수 있어요.');
        return;
      }

      // 파일 크기 검증
      const sizeError = validateFileSize(file);
      if (sizeError) {
        setError(sizeError);
        return;
      }

      // 이미지 압축
      const compressedFile = await compressImage(file);

      // 압축 후 크기 검증
      const compressedSizeMB = compressedFile.size / 1024 / 1024;
      if (compressedSizeMB > maxSizeMB) {
        toast.warning(
          `압축 후에도 파일이 큽니다 (${compressedSizeMB.toFixed(1)}MB). 성능에 영향을 줄 수 있어요.`
        );
      }

      // Base64 변환
      const base64 = await convertToBase64(compressedFile);
      onImageChange(base64);

      // 성공 알림
      toast.success('이미지를 업로드했어요');
    } catch (err) {
      console.error('이미지 처리 실패:', err);
      const errorMessage =
        err instanceof Error ? err.message : '이미지 처리에 실패했어요. 다시 시도해주세요.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
      setCompressionProgress(0);
    }
  };

  /**
   * URL 업로드 처리
   */
  const handleUrlUpload = async () => {
    if (!imageUrl.trim()) {
      setError('이미지 URL을 입력해주세요');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      // URL 다운로드
      const file = await downloadImageFromUrl(imageUrl);

      // 파일 처리 (압축 + Base64)
      await handleFile(file);

      // URL 입력 필드 초기화
      setImageUrl('');
    } catch (err) {
      console.error('URL 이미지 업로드 실패:', err);
      const errorMessage = err instanceof Error ? err.message : 'URL 이미지 업로드에 실패했어요';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // 파일 선택 버튼 클릭
  const handleButtonClick = () => {
    if (isProcessing) return; // 처리 중일 때는 클릭 무시
    fileInputRef.current?.click();
  };

  // 이미지 삭제
  const handleRemoveImage = () => {
    onImageChange('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* 현재 이미지 미리보기 */}
      {currentImage && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">현재 이미지</label>
          <div className="relative">
            <Image
              src={currentImage}
              alt="업로드된 이미지"
              width={1200}
              height={256}
              className="w-full max-h-64 object-contain bg-secondary rounded-lg border border-border"
              unoptimized
            />
            <Button
              onClick={handleRemoveImage}
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2"
            >
              삭제
            </Button>
          </div>
        </div>
      )}

      {/* 업로드 영역 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          {currentImage ? '새 이미지 업로드' : '이미지 업로드'}
        </label>

        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">
              <Upload className="w-4 h-4 mr-2" />
              파일 업로드
            </TabsTrigger>
            <TabsTrigger value="url">
              <LinkIcon className="w-4 h-4 mr-2" />
              URL 입력
            </TabsTrigger>
          </TabsList>

          {/* 파일 업로드 탭 */}
          <TabsContent value="file" className="mt-4">
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-secondary/30'}
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-secondary/50'}
              `}
              onClick={handleButtonClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isProcessing}
              />

              {isProcessing ? (
                <div className="text-muted-foreground flex flex-col items-center">
                  <Loader2 className="w-12 h-12 mb-2 animate-spin text-primary" />
                  <p className="text-lg font-medium mb-1">이미지를 처리하고 있어요...</p>
                  {compressionProgress > 0 && (
                    <div className="w-full max-w-xs mt-4">
                      <Progress value={compressionProgress} className="h-2" />
                      <p className="text-sm text-muted-foreground mt-2">
                        압축 중: {compressionProgress}%
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-muted-foreground flex flex-col items-center">
                  <Camera className="w-16 h-16 mb-2 text-primary" />
                  <p className="text-lg font-medium mb-1">
                    이미지를 드래그하거나 클릭해서 업로드하세요
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    JPG, PNG, GIF 지원 · 자동 압축 (최대 {MAX_ORIGINAL_SIZE_MB}MB)
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* URL 입력 탭 */}
          <TabsContent value="url" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button onClick={handleUrlUpload} disabled={isProcessing || !imageUrl.trim()}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      처리 중
                    </>
                  ) : (
                    '업로드'
                  )}
                </Button>
              </div>

              {/* URL 안내 */}
              <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">URL 업로드 안내</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>공개 이미지 URL만 가능해요</li>
                    <li>CORS 제한이 있는 사이트는 업로드할 수 없어요</li>
                    <li>다운로드 후 자동으로 압축돼요</li>
                  </ul>
                </div>
              </div>

              {/* 압축 진행률 */}
              {isProcessing && compressionProgress > 0 && (
                <div className="space-y-2">
                  <Progress value={compressionProgress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    압축 중: {compressionProgress}%
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* 에러 메시지 */}
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
