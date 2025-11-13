/**
 * 슬라이드 타입별 기본 데이터 생성 유틸리티
 */

import type { Slide, SlideType } from '@/types/slide';

/**
 * 슬라이드 타입에 따른 기본 데이터 생성
 */
export function createDefaultSlide(type: SlideType): Slide {
  const defaultStyle = {}; // 빈 style 객체 (TemplateEngine이 기본값 적용)

  switch (type) {
    case 'title':
      return {
        type: 'title',
        props: {
          title: '새 제목',
          subtitle: '부제목을 입력하세요',
        },
        style: defaultStyle,
      };

    case 'section':
      return {
        type: 'section',
        props: {
          title: '새 섹션',
          number: 1,
        },
        style: defaultStyle,
      };

    case 'content':
      return {
        type: 'content',
        props: {
          title: '슬라이드 제목',
          body: '내용을 입력하세요',
        },
        style: defaultStyle,
      };

    case 'bullet':
      return {
        type: 'bullet',
        props: {
          title: '리스트 제목',
          bullets: [
            { text: '항목 1', level: 0 },
            { text: '항목 2', level: 0 },
            { text: '항목 3', level: 0 },
          ],
        },
        style: defaultStyle,
      };

    case 'twoColumn':
      return {
        type: 'twoColumn',
        props: {
          title: '2단 레이아웃',
          leftContent: '왼쪽 내용',
          rightContent: '오른쪽 내용',
        },
        style: defaultStyle,
      };

    case 'table':
      return {
        type: 'table',
        props: {
          title: '표 제목',
          headers: ['열1', '열2', '열3'],
          rows: [
            ['데이터 1-1', '데이터 1-2', '데이터 1-3'],
            ['데이터 2-1', '데이터 2-2', '데이터 2-3'],
          ],
        },
        style: defaultStyle,
      };

    case 'chart':
      return {
        type: 'chart',
        props: {
          title: '차트 제목',
          chartType: 'bar',
          data: [
            {
              name: '데이터 세트',
              labels: ['항목 A', '항목 B', '항목 C'],
              values: [30, 50, 20],
            },
          ],
        },
        style: defaultStyle,
      };

    case 'stats':
      return {
        type: 'stats',
        props: {
          title: '통계 카드',
          stats: [
            { value: '100', label: '지표 1' },
            { value: '75%', label: '지표 2' },
            { value: '50', label: '지표 3' },
            { value: '25', label: '지표 4' },
          ],
        },
        style: defaultStyle,
      };

    case 'comparison':
      return {
        type: 'comparison',
        props: {
          title: '비교 분석',
          leftLabel: '장점',
          leftContent: '• 장점 1\n• 장점 2\n• 장점 3',
          rightLabel: '단점',
          rightContent: '• 단점 1\n• 단점 2\n• 단점 3',
        },
        style: defaultStyle,
      };

    case 'timeline':
      return {
        type: 'timeline',
        props: {
          title: '타임라인',
          items: [
            { title: '2020', description: '이벤트 1' },
            { title: '2021', description: '이벤트 2' },
            { title: '2022', description: '이벤트 3' },
          ],
        },
        style: defaultStyle,
      };

    case 'quote':
      return {
        type: 'quote',
        props: {
          quote: '인용문을 입력하세요',
          author: '작성자',
          showQuoteMark: true,
        },
        style: defaultStyle,
      };

    case 'thankYou':
      return {
        type: 'thankYou',
        props: {
          message: '감사합니다',
          contact: 'your@email.com',
        },
        style: defaultStyle,
      };

    case 'image':
      return {
        type: 'image',
        props: {
          title: '이미지 슬라이드',
          arrangement: 'full',
          caption: '이미지 설명',
        },
        style: defaultStyle,
      };

    case 'featureGrid':
      return {
        type: 'featureGrid',
        props: {
          title: '기능 그리드',
          features: [
            { icon: '🚀', title: '기능 1', description: '설명을 입력하세요' },
            { icon: '💡', title: '기능 2', description: '설명을 입력하세요' },
            { icon: '⚡', title: '기능 3', description: '설명을 입력하세요' },
          ],
        },
        style: defaultStyle,
      };

    case 'teamProfile':
      return {
        type: 'teamProfile',
        props: {
          title: '팀 프로필',
          profiles: [
            { name: '이름 1', role: '역할 1', bio: '소개를 입력하세요' },
            { name: '이름 2', role: '역할 2', bio: '소개를 입력하세요' },
          ],
        },
        style: defaultStyle,
      };

    case 'process':
      return {
        type: 'process',
        props: {
          title: '프로세스',
          steps: [
            { title: '1단계', description: '설명을 입력하세요' },
            { title: '2단계', description: '설명을 입력하세요' },
            { title: '3단계', description: '설명을 입력하세요' },
          ],
        },
        style: defaultStyle,
      };

    case 'roadmap':
      return {
        type: 'roadmap',
        props: {
          title: '로드맵',
          items: [
            { period: 'Q1 2024', status: '완료', title: '마일스톤 1', description: '설명을 입력하세요' },
            { period: 'Q2 2024', status: '진행 중', title: '마일스톤 2', description: '설명을 입력하세요' },
            { period: 'Q3 2024', status: '계획', title: '마일스톤 3', description: '설명을 입력하세요' },
          ],
        },
        style: defaultStyle,
      };

    case 'pricing':
      return {
        type: 'pricing',
        props: {
          title: '가격표',
          tiers: [
            {
              name: 'Free',
              price: '0원',
              period: '월',
              description: '무료 플랜',
              features: ['기능 1', '기능 2'],
            },
            {
              name: 'Pro',
              price: '9,900원',
              period: '월',
              description: '프로 플랜',
              features: ['기능 1', '기능 2', '기능 3'],
              recommended: true,
            },
            {
              name: 'Premium',
              price: '19,900원',
              period: '월',
              description: '프리미엄 플랜',
              features: ['모든 기능', '무제한 사용'],
            },
          ],
        },
        style: defaultStyle,
      };

    case 'agenda':
      return {
        type: 'agenda',
        props: {
          title: '아젠다',
          items: [
            { title: '주제 1', description: '내용을 입력하세요' },
            { title: '주제 2', description: '내용을 입력하세요' },
            { title: '주제 3', description: '내용을 입력하세요' },
          ],
        },
        style: defaultStyle,
      };

    case 'testimonial':
      return {
        type: 'testimonial',
        props: {
          title: '추천사',
          quote: '인용문을 입력하세요',
          author: '작성자',
          role: '역할 또는 소속',
        },
        style: defaultStyle,
      };

    case 'gallery':
      return {
        type: 'gallery',
        props: {
          title: '갤러리',
          images: [
            { url: 'https://via.placeholder.com/400', caption: '이미지 1' },
            { url: 'https://via.placeholder.com/400', caption: '이미지 2' },
            { url: 'https://via.placeholder.com/400', caption: '이미지 3' },
            { url: 'https://via.placeholder.com/400', caption: '이미지 4' },
          ],
        },
        style: defaultStyle,
      };

    default:
      // Fallback: content 타입
      return {
        type: 'content',
        props: {
          title: '새 슬라이드',
          body: '내용을 입력하세요',
        },
        style: defaultStyle,
      };
  }
}
