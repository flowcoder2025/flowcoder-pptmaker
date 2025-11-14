/**
 * EditForm 컴포넌트
 * 슬라이드 타입별 편집 폼 라우팅
 */

'use client';

import type { Slide } from '@/types/slide';

// 21개 타입별 편집 폼 컴포넌트들 (모두 구현 완료)
import TitleSlideForm from './forms/TitleSlideForm';
import ContentSlideForm from './forms/ContentSlideForm';
import BulletSlideForm from './forms/BulletSlideForm';
import SectionSlideForm from './forms/SectionSlideForm';
import TableSlideForm from './forms/TableSlideForm';
import ChartSlideForm from './forms/ChartSlideForm';
import StatsSlideForm from './forms/StatsSlideForm';
import ComparisonSlideForm from './forms/ComparisonSlideForm';
import TimelineSlideForm from './forms/TimelineSlideForm';
import QuoteSlideForm from './forms/QuoteSlideForm';
import ThankYouSlideForm from './forms/ThankYouSlideForm';
import TwoColumnSlideForm from './forms/TwoColumnSlideForm';
import ImageSlideForm from './forms/ImageSlideForm';
// 9개 새 슬라이드 타입 폼 컴포넌트들
import FeatureGridSlideForm from './forms/FeatureGridSlideForm';
import TeamProfileSlideForm from './forms/TeamProfileSlideForm';
import ProcessSlideForm from './forms/ProcessSlideForm';
import RoadmapSlideForm from './forms/RoadmapSlideForm';
import PricingSlideForm from './forms/PricingSlideForm';
import ImageTextSlideForm from './forms/ImageTextSlideForm';
import AgendaSlideForm from './forms/AgendaSlideForm';
import TestimonialSlideForm from './forms/TestimonialSlideForm';
import GallerySlideForm from './forms/GallerySlideForm';
// 원페이지 보고서 폼 컴포넌트들
import ReportTwoColumnSlideForm from './forms/ReportTwoColumnSlideForm';
import ReportA4SlideForm from './forms/ReportA4SlideForm';

interface EditFormProps {
  slide: Slide;
  onChange: (updatedSlide: Slide) => void;
}

/**
 * 슬라이드 타입에 따른 편집 폼 라우팅
 */
export default function EditForm({ slide, onChange }: EditFormProps) {
  // 타입별 폼 라우팅
  /* eslint-disable @typescript-eslint/no-explicit-any */
  switch (slide.type) {
    case 'title':
      return <TitleSlideForm slide={slide as any} onChange={onChange as any} />;

    case 'content':
      return <ContentSlideForm slide={slide as any} onChange={onChange as any} />;

    case 'bullet':
      return <BulletSlideForm slide={slide as any} onChange={onChange as any} />;

    case 'section':
      return <SectionSlideForm slide={slide as any} onChange={onChange as any} />;

    case 'table':
      return <TableSlideForm slide={slide as any} onChange={onChange as any} />;

    case 'chart':
      return <ChartSlideForm slide={slide as any} onChange={onChange as any} />;

    case 'stats':
      return <StatsSlideForm slide={slide as any} onChange={onChange as any} />;

    case 'comparison':
      return <ComparisonSlideForm slide={slide as any} onChange={onChange as any} />;

    case 'timeline':
      return <TimelineSlideForm slide={slide as any} onChange={onChange as any} />;

    case 'quote':
      return <QuoteSlideForm slide={slide as any} onChange={onChange as any} />;

    case 'thankYou':
      return <ThankYouSlideForm slide={slide as any} onChange={onChange as any} />;

    case 'twoColumn':
      return <TwoColumnSlideForm slide={slide as any} onChange={onChange as any} />;

    case 'image':
      return <ImageSlideForm slide={slide as any} onChange={onChange as any} />;

    // 9개 새 슬라이드 타입
    case 'featureGrid':
      return <FeatureGridSlideForm slide={slide as any} onChange={onChange as any} />;

    case 'teamProfile':
      return <TeamProfileSlideForm slide={slide as any} onChange={onChange as any} />;

    case 'process':
      return <ProcessSlideForm slide={slide as any} onChange={onChange as any} />;

    case 'roadmap':
      return <RoadmapSlideForm slide={slide as any} onChange={onChange as any} />;

    case 'pricing':
      return <PricingSlideForm slide={slide as any} onChange={onChange as any} />;

    case 'imageText':
      return <ImageTextSlideForm slide={slide as any} onChange={onChange as any} />;

    case 'agenda':
      return <AgendaSlideForm slide={slide as any} onChange={onChange as any} />;

    case 'testimonial':
      return <TestimonialSlideForm slide={slide as any} onChange={onChange as any} />;

    case 'gallery':
      return <GallerySlideForm slide={slide as any} onChange={onChange as any} />;

    // 원페이지 보고서 타입
    case 'reportTwoColumn':
      return <ReportTwoColumnSlideForm slide={slide as any} onChange={onChange as any} />;

    case 'reportA4':
      return <ReportA4SlideForm slide={slide as any} onChange={onChange as any} />;

    default:
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-bold text-red-700 mb-2">
            지원하지 않는 슬라이드 타입이에요
          </h3>
          <p className="text-sm text-red-600">
            타입: <code className="bg-red-100 px-2 py-1 rounded">{(slide as any).type}</code>
          </p>
        </div>
      );
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

