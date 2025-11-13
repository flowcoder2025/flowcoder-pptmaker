/**
 * SlidePreview 컴포넌트
 * 편집 중인 슬라이드의 실시간 미리보기
 */

'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import type { Slide } from '@/types/slide';
import { TemplateEngine } from '@/services/template';

interface SlidePreviewProps {
  slide: Slide;
  templateId?: string;
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

export default function SlidePreview({ slide, templateId = 'toss-default' }: SlidePreviewProps) {
  // 🔍 DEBUG: slide prop 변경 감지
  useEffect(() => {
    console.log('🔍 [SlidePreview] slide prop 변경됨:', {
      type: slide.type,
      propsKeys: Object.keys(slide.props),
      timestamp: Date.now()
    });
  }, [slide]);

  // TemplateEngine으로 HTML 생성 (useMemo로 최적화)
  const htmlSlide = useMemo(() => {
    console.log('🔄 [SlidePreview] useMemo 재계산 중...', {
      type: slide.type,
      propsKeys: Object.keys(slide.props),
    });

    try {
      const engine = new TemplateEngine();
      const result = engine.generateSlide(slide, templateId);
      console.log('✅ [SlidePreview] HTML 생성 완료');
      return result;
    } catch (error) {
      console.error('❌ [SlidePreview] 슬라이드 HTML 생성 실패:', error);
      return null;
    }
  }, [slide, templateId]);

  // 스케일 계산을 위한 ref와 state
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // 컨테이너 크기에 따라 스케일 계산
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newScale = containerWidth / 1200;
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

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
  const scaledHeight = 675 * scale;

  return (
    <div style={{
      width: '100%',
      minHeight: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F9FAFB',
      padding: '40px 20px',
    }}>
      <div
        ref={containerRef}
        style={{
          width: '90%',
          maxWidth: '1200px',
          height: `${scaledHeight}px`,
          background: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <iframe
          srcDoc={slideDocument}
          style={{
            width: '1200px',
            height: '675px',
            border: 'none',
            display: 'block',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          title="슬라이드 미리보기"
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
}
