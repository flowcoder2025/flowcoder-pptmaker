/**
 * 다운로드 유틸리티 함수들
 * HTML, PDF, PPTX 다운로드 지원
 *
 * @description
 * html2canvas를 사용하여 HTML 슬라이드를 이미지로 변환한 후
 * PDF/PPTX로 내보내기합니다. 디자인 품질을 최대화하기 위해
 * 최적화된 설정을 사용합니다.
 */

import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';
import pptxgen from 'pptxgenjs';
import type { Presentation, AspectRatio } from '@/types/presentation';
import type { HTMLSlide } from '@/types/slide';
import { calculateSlideSize } from '@/services/template/engine/types';

/**
 * html-to-image 공통 설정
 * 디자인 품질과 파일 크기의 균형을 위한 최적화된 옵션
 */
const getHtmlToImageOptions = (width: number, height: number) => ({
  width, // 원본 슬라이드 크기
  height,
  quality: 0.92, // JPEG 품질
  pixelRatio: 2, // 고해상도 (2x) - pixelRatio로 스케일링
  skipFonts: false, // 폰트 포함
  cacheBust: true, // 캐시 무효화
});

/**
 * HTML 다운로드
 * 모든 슬라이드를 하나의 HTML 파일로 번들링하여 다운로드
 */
export async function downloadHTML(presentation: Presentation): Promise<void> {
  try {
    console.log('📄 HTML 다운로드 시작...');

    const { title, slides } = presentation;

    // 모든 슬라이드를 포함하는 완전한 HTML 문서 생성
    const fullHTML = generateFullHTML(slides, title);

    // Blob 생성 및 다운로드
    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sanitizeFilename(title)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('✅ HTML 다운로드 완료');
  } catch (error) {
    console.error('❌ HTML 다운로드 실패:', error);
    throw new Error('HTML 다운로드에 실패했습니다.');
  }
}

/**
 * 슬라이드를 이미지로 변환하는 공통 함수
 * iframe을 사용하여 vh/vw가 슬라이드 크기를 기준으로 계산되도록 함
 */
async function renderSlideToImage(
  slide: HTMLSlide,
  slideSize: { width: number; height: number }
): Promise<string> {
  return new Promise((resolve, reject) => {
    // iframe 생성 - vh/vw가 슬라이드 크기를 기준으로 계산되도록 함
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
      position: fixed;
      left: -9999px;
      top: 0;
      width: ${slideSize.width}px;
      height: ${slideSize.height}px;
      border: none;
      background: transparent;
    `;
    document.body.appendChild(iframe);

    // iframe이 로드되면 콘텐츠 삽입
    const setupIframe = async () => {
      try {
        const iframeDoc = iframe.contentDocument;
        if (!iframeDoc) {
          throw new Error('iframe document를 가져올 수 없습니다.');
        }

        // iframe 내 HTML 구조 생성
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              html, body {
                width: ${slideSize.width}px;
                height: ${slideSize.height}px;
                overflow: hidden;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                text-rendering: optimizeLegibility;
              }
              /* 직접 자식 요소들이 전체 크기를 채우도록 */
              body > * {
                width: 100% !important;
                height: 100% !important;
              }
              ${slide.css}
            </style>
          </head>
          <body>
            ${slide.html}
          </body>
          </html>
        `);
        iframeDoc.close();

        // 이미지 로딩 대기
        const images = iframeDoc.querySelectorAll('img');
        await Promise.all(
          Array.from(images).map(
            (img) =>
              new Promise<void>((resolve) => {
                if (img.complete) {
                  resolve();
                } else {
                  img.onload = () => resolve();
                  img.onerror = () => resolve();
                }
              })
          )
        );

        // 폰트 및 레이아웃 안정화 대기
        await new Promise(r => setTimeout(r, 150));

        // html-to-image로 이미지 생성 (iframe body 캡처)
        const imgData = await toJpeg(iframeDoc.body, getHtmlToImageOptions(slideSize.width, slideSize.height));

        // 정리
        document.body.removeChild(iframe);
        resolve(imgData);
      } catch (error) {
        document.body.removeChild(iframe);
        reject(error);
      }
    };

    // iframe 로드 후 설정
    iframe.onload = setupIframe;
    iframe.src = 'about:blank';
  });
}

/**
 * PDF 다운로드
 * HTML 슬라이드를 이미지로 변환한 후 PDF 생성
 */
export async function downloadPDF(presentation: Presentation): Promise<void> {
  try {
    console.log('📄 PDF 다운로드 시작...');

    const { title, slides, slideData } = presentation;

    // aspectRatio 가져오기 (기본값: 16:9)
    const aspectRatio = slideData?.aspectRatio || '16:9';
    const slideSize = calculateSlideSize(aspectRatio);
    const orientation = aspectRatio === 'A4-portrait' ? 'portrait' : 'landscape';

    console.log(`📐 AspectRatio: ${aspectRatio}, 크기: ${slideSize.width}x${slideSize.height}`);

    // jsPDF 인스턴스 생성 (aspectRatio에 맞게 조정)
    // pixelRatio 2배 적용된 이미지 크기에 맞춰 PDF 크기도 조정
    const scale = 2;
    const pdfWidth = slideSize.width * scale;
    const pdfHeight = slideSize.height * scale;

    const pdf = new jsPDF({
      orientation,
      unit: 'px',
      format: [pdfWidth, pdfHeight],
      hotfixes: ['px_scaling'], // px 단위 스케일링 보정
      compress: true, // PDF 압축 활성화
    });

    for (let i = 0; i < slides.length; i++) {
      console.log(`📄 슬라이드 ${i + 1}/${slides.length} 변환 중...`);

      const slide = slides[i];

      // 슬라이드를 이미지로 변환 (html-to-image 사용)
      const imgData = await renderSlideToImage(slide, slideSize);

      if (i > 0) {
        pdf.addPage([pdfWidth, pdfHeight], orientation);
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    }

    // PDF 다운로드
    pdf.save(`${sanitizeFilename(title)}.pdf`);

    console.log('✅ PDF 다운로드 완료');
  } catch (error) {
    console.error('❌ PDF 다운로드 실패:', error);
    throw new Error('PDF 다운로드에 실패했습니다.');
  }
}

/**
 * PPTX 다운로드
 * HTML 슬라이드를 이미지로 변환하여 PPTX 생성
 *
 * @description
 * 개선된 렌더링 파이프라인을 사용하여 디자인 품질을 최대화합니다.
 * - iframe 기반 렌더링으로 스타일 격리
 * - scale 2x로 고해상도 이미지 생성
 * - PNG 포맷 사용으로 품질 손실 방지
 */
export async function downloadPPTX(presentation: Presentation): Promise<void> {
  try {
    console.log('📊 PPTX 다운로드 시작...');

    const { title, slides, slideData } = presentation;

    // aspectRatio 가져오기 (기본값: 16:9)
    const aspectRatio = slideData?.aspectRatio || '16:9';
    const slideSize = calculateSlideSize(aspectRatio);

    console.log(`📐 AspectRatio: ${aspectRatio}, 크기: ${slideSize.width}x${slideSize.height}`);

    // PptxGenJS 인스턴스 생성
    const pptx = new pptxgen();

    // 프리젠테이션 메타데이터 설정
    pptx.author = 'PPT Maker';
    pptx.company = 'FlowCoder';
    pptx.title = title;
    pptx.subject = 'AI 생성 프리젠테이션';

    // 슬라이드 크기 설정 (aspectRatio에 맞게)
    if (aspectRatio === '16:9') {
      pptx.layout = 'LAYOUT_16x9';
    } else if (aspectRatio === '4:3') {
      pptx.layout = 'LAYOUT_4x3';
    } else if (aspectRatio === 'A4-portrait') {
      // A4-portrait는 custom layout 정의 필요
      pptx.defineLayout({
        name: 'A4_PORTRAIT',
        width: slideSize.width / 96, // px → inch 변환 (96 DPI 기준)
        height: slideSize.height / 96,
      });
      pptx.layout = 'A4_PORTRAIT';
    }

    for (let i = 0; i < slides.length; i++) {
      console.log(`📊 슬라이드 ${i + 1}/${slides.length} 생성 중...`);

      const slide = slides[i];
      const pptxSlide = pptx.addSlide();

      // html-to-image로 이미지 생성
      const imgData = await renderSlideToImage(slide, slideSize);

      pptxSlide.addImage({
        data: imgData,
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
      });
    }

    // PPTX 파일 생성 및 다운로드
    await pptx.writeFile({ fileName: `${sanitizeFilename(title)}.pptx` });

    console.log('✅ PPTX 다운로드 완료');
  } catch (error) {
    console.error('❌ PPTX 다운로드 실패:', error);
    throw new Error('PPTX 다운로드에 실패했습니다.');
  }
}

/**
 * 완전한 HTML 문서 생성 (모든 슬라이드 포함)
 */
function generateFullHTML(slides: HTMLSlide[], title: string): string {
  // 첫 슬라이드의 CSS만 추출 (모든 슬라이드가 동일한 CSS 변수 사용)
  const globalCSS = slides.length > 0 && slides[0].css ? slides[0].css : '';

  // 슬라이드 HTML만 병합 (CSS 제외)
  const slidesHTML = slides
    .map(
      (slide, index) => `
    <!-- 슬라이드 ${index + 1} -->
    <div class="slide-wrapper" id="slide-${index + 1}">
      ${slide.html}
    </div>
  `
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>

  <!-- TDS 디자인 시스템 CSS 변수 (전역) -->
  ${globalCSS ? `<style>${globalCSS}</style>` : ''}

  <!-- 컨테이너 및 레이아웃 스타일 -->
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f5f5;
      overflow-x: hidden;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    h1 {
      text-align: center;
      margin-bottom: 40px;
      font-size: 32px;
      color: #333;
    }

    .slide-wrapper {
      width: 100%;
      max-width: 1200px;
      aspect-ratio: 16 / 9;
      margin: 0 auto 40px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      page-break-inside: avoid;
    }

    /* 인쇄 최적화 */
    @media print {
      body {
        background: white;
      }

      .container {
        padding: 0;
      }

      h1 {
        page-break-after: avoid;
      }

      .slide-wrapper {
        page-break-after: always;
        page-break-inside: avoid;
        margin: 0;
        box-shadow: none;
        border: 1px solid #ddd;
      }

      .slide-wrapper:last-child {
        page-break-after: auto;
      }
    }

    /* 모바일 반응형 */
    @media (max-width: 768px) {
      .container {
        padding: 20px 10px;
      }

      h1 {
        font-size: 24px;
        margin-bottom: 20px;
      }

      .slide-wrapper {
        margin-bottom: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    ${slidesHTML}
  </div>

  <script>
    // 키보드 단축키 지원
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide-wrapper');

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        if (currentSlide < slides.length - 1) {
          currentSlide++;
          slides[currentSlide].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (currentSlide > 0) {
          currentSlide--;
          slides[currentSlide].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });

    console.log('✅ ${title} - ${slides.length}개 슬라이드 로드 완료');
  </script>
</body>
</html>`;
}

/**
 * 파일명 정리 (특수문자 제거)
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '') // 윈도우 불가 문자 제거
    .replace(/\s+/g, '_') // 공백을 언더스코어로
    .trim()
    .substring(0, 100); // 최대 100자
}
