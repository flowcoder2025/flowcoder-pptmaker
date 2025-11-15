/**
 * 다운로드 유틸리티 함수들
 * HTML, PDF, PPTX 다운로드 지원
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import pptxgen from 'pptxgenjs';
import type { Presentation, AspectRatio } from '@/types/presentation';
import type { HTMLSlide } from '@/types/slide';
import { calculateSlideSize } from '@/services/template/engine/types';

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
 * PDF 다운로드
 * HTML 슬라이드를 캔버스로 변환한 후 PDF 생성
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
    const pdf = new jsPDF({
      orientation,
      unit: 'px',
      format: [slideSize.width, slideSize.height],
    });

    for (let i = 0; i < slides.length; i++) {
      console.log(`📄 슬라이드 ${i + 1}/${slides.length} 변환 중...`);

      const slide = slides[i];

      // 임시 div 생성하여 슬라이드 렌더링
      const tempDiv = document.createElement('div');
      tempDiv.style.width = `${slideSize.width}px`;
      tempDiv.style.height = `${slideSize.height}px`;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.innerHTML = `
        <style>${slide.css}</style>
        ${slide.html}
      `;
      document.body.appendChild(tempDiv);

      // HTML을 캔버스로 변환
      const canvas = await html2canvas(tempDiv, {
        width: slideSize.width,
        height: slideSize.height,
        scale: 2, // 고해상도
        logging: false,
        useCORS: true,
      });

      // 임시 div 제거
      document.body.removeChild(tempDiv);

      // 캔버스를 이미지로 변환하여 PDF에 추가
      const imgData = canvas.toDataURL('image/png');

      if (i > 0) {
        pdf.addPage([slideSize.width, slideSize.height], orientation);
      }

      pdf.addImage(imgData, 'PNG', 0, 0, slideSize.width, slideSize.height);
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
 * unified-ppt JSON을 PptxGenJS로 변환하여 PPTX 생성
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
    pptx.author = 'PPT Maker in Toss';
    pptx.company = 'Toss';
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

      // HTML을 캔버스로 변환
      const tempDiv = document.createElement('div');
      tempDiv.style.width = `${slideSize.width}px`;
      tempDiv.style.height = `${slideSize.height}px`;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.innerHTML = `
        <style>${slide.css}</style>
        ${slide.html}
      `;
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, {
        width: slideSize.width,
        height: slideSize.height,
        scale: 2,
        logging: false,
        useCORS: true,
      });

      document.body.removeChild(tempDiv);

      // 캔버스를 이미지로 변환하여 슬라이드에 추가
      const imgData = canvas.toDataURL('image/png');

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
