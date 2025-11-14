/**
 * SlidePreview 컴포넌트
 * 편집 중인 슬라이드의 실시간 미리보기
 */

'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import type { Slide } from '@/types/slide';
import type { AspectRatio } from '@/types/presentation';
import { TemplateEngine } from '@/services/template';
import { calculateSlideSize } from '@/services/template/engine/types';

interface SlidePreviewProps {
  slide: Slide;
  templateId?: string;
  aspectRatio?: AspectRatio;
}

/**
 * HTML + CSS를 iframe에 삽입하기 위한 완전한 문서 생성
 * viewer 페이지와 동일한 방식 사용
 */
function createSlideDocument(html: string, css: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * {
            box-sizing: border-box;
          }
          html, body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            width: 100%;
            height: 100%;
          }
          body {
            background: #f5f5f5;
          }
          .slide-container {
            width: 100%;
            height: 100%;
          }
          ${css}
        </style>
      </head>
      <body>
        <div class="slide-container">
          ${html}
        </div>
      </body>
    </html>
  `;
}

export default function SlidePreview({ slide, templateId = 'toss', aspectRatio = '16:9' }: SlidePreviewProps) {
  // aspectRatio에 따른 슬라이드 크기 계산
  const slideSize = calculateSlideSize(aspectRatio);

  // 🔍 DEBUG: slide prop 변경 감지
  useEffect(() => {
    console.log('🔍 [SlidePreview] slide prop 변경됨:', {
      type: slide.type,
      propsKeys: Object.keys(slide.props),
      aspectRatio,
      slideSize,
      timestamp: Date.now()
    });
  }, [slide, aspectRatio, slideSize]);

  // TemplateEngine으로 HTML 생성 (useMemo로 최적화)
  const htmlSlide = useMemo(() => {
    console.log('🔄 [SlidePreview] useMemo 재계산 중...', {
      type: slide.type,
      propsKeys: Object.keys(slide.props),
      aspectRatio,
    });

    try {
      const engine = new TemplateEngine();
      const result = engine.generateSlide(slide, templateId, aspectRatio);
      console.log('✅ [SlidePreview] HTML 생성 완료', { aspectRatio });
      return result;
    } catch (error) {
      console.error('❌ [SlidePreview] 슬라이드 HTML 생성 실패:', error);
      return null;
    }
  }, [slide, templateId, aspectRatio]);

  // 스케일 계산 (ViewerContent와 동일한 방식)
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      // 화면 크기 기준 스케일 계산
      // 너비: 화면의 90%
      const maxWidth = window.innerWidth * 0.9;
      // 높이: 화면의 75% (헤더 등 공간 고려)
      const maxHeight = window.innerHeight * 0.75;

      // 너비/높이 기준으로 스케일 계산하여 더 작은 값 사용
      const scaleByWidth = maxWidth / slideSize.width;
      const scaleByHeight = maxHeight / slideSize.height;
      const newScale = Math.min(scaleByWidth, scaleByHeight, 1); // 최대 1배 (확대 방지)

      setScale(newScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [slideSize.width, slideSize.height]);

  // 에러 처리
  if (!htmlSlide) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FEF2F2',
        border: '2px dashed #EF4444',
        borderRadius: '12px',
        padding: '20px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ fontSize: '16px', color: '#DC2626', fontWeight: 'bold' }}>
            미리보기를 생성할 수 없어요
          </div>
          <div style={{ fontSize: '14px', color: '#DC2626', marginTop: '8px' }}>
            슬라이드 데이터를 확인해 주세요
          </div>
        </div>
      </div>
    );
  }

  // HTML 문서 생성
  const slideDocument = createSlideDocument(htmlSlide.html, htmlSlide.css);

  // 스케일 적용된 크기
  const scaledWidth = slideSize.width * scale;
  const scaledHeight = slideSize.height * scale;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F9FAFB',
      padding: '40px 20px',
      overflow: 'auto',
    }}>
      {/* 외부 컨테이너: 스케일된 크기 (레이아웃 공간 차지) */}
      <div style={{
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        position: 'relative',
      }}>
        {/* 슬라이드 컨테이너: 원본 크기 + transform scale */}
        <div style={{
          width: `${slideSize.width}px`,
          height: `${slideSize.height}px`,
          background: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}>
          <iframe
            srcDoc={slideDocument}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            }}
            title="슬라이드 미리보기"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}
