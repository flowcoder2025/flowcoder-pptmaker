/**
 * ImageUploader 컴포넌트
 * 이미지 업로드 및 Base64 변환
 */

'use client';

import { useState, useRef } from 'react';

interface ImageUploaderProps {
  currentImage?: string; // 현재 이미지 URL (base64)
  onImageChange: (imageBase64: string) => void;
  maxSizeMB?: number; // 최대 파일 크기 (기본: 2MB)
}

export default function ImageUploader({
  currentImage,
  onImageChange,
  maxSizeMB = 2,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // 파일 검증
  const validateFile = (file: File): string | null => {
    // 파일 크기 검증
    if (file.size > maxSizeBytes) {
      return `파일 크기가 너무 커요. 최대 ${maxSizeMB}MB까지 업로드할 수 있어요.`;
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      return '이미지 파일만 업로드할 수 있어요.';
    }

    return null;
  };

  // Base64 변환
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

  // 파일 처리
  const handleFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);

    try {
      // 파일 검증
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Base64 변환
      const base64 = await convertToBase64(file);
      onImageChange(base64);
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
      setError('이미지 업로드에 실패했어요. 다시 시도해주세요.');
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
          <label className="block text-sm font-medium text-gray-700">
            현재 이미지
          </label>
          <div className="relative">
            <img
              src={currentImage}
              alt="업로드된 이미지"
              className="w-full max-h-64 object-contain bg-gray-100 rounded-lg"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm"
            >
              삭제
            </button>
          </div>
        </div>
      )}

      {/* 업로드 영역 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {currentImage ? '새 이미지 업로드' : '이미지 업로드'}
        </label>

        {/* 드래그 앤 드롭 영역 */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onClick={!isProcessing ? handleButtonClick : undefined}
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
            <div className="text-gray-600">
              <span className="text-2xl mb-2 block">⏳</span>
              <p>이미지를 처리하고 있어요...</p>
            </div>
          ) : (
            <div className="text-gray-600">
              <span className="text-4xl mb-2 block">📷</span>
              <p className="text-lg font-medium mb-1">
                이미지를 드래그하거나 클릭해서 업로드하세요
              </p>
              <p className="text-sm text-gray-500">
                최대 {maxSizeMB}MB, JPG, PNG, GIF 지원
              </p>
            </div>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
