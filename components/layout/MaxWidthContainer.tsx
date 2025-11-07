import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { MAX_WIDTH } from '@/constants/layout';

/**
 * MaxWidthContainer 컴포넌트
 *
 * @description
 * 1200px 최대 너비를 가진 중앙 정렬 컨테이너입니다.
 * 모든 메인 콘텐츠 페이지에서 일관된 레이아웃을 제공합니다.
 *
 * @example
 * ```tsx
 * <MaxWidthContainer>
 *   <h1>페이지 제목</h1>
 *   <p>콘텐츠</p>
 * </MaxWidthContainer>
 * ```
 */

interface MaxWidthContainerProps {
  /** 자식 컴포넌트 */
  children: ReactNode;
  /** 최대 너비 (기본값: 1200px) */
  maxWidth?: 'narrow' | 'container' | 'wide';
  /** 추가 CSS 클래스 */
  className?: string;
  /** 상하 패딩 추가 여부 (기본값: true) */
  withVerticalPadding?: boolean;
}

export default function MaxWidthContainer({
  children,
  maxWidth = 'container',
  className,
  withVerticalPadding = true,
}: MaxWidthContainerProps) {
  const maxWidthValue = MAX_WIDTH[maxWidth];

  return (
    <div
      className={cn(
        'mx-auto',
        'px-5 sm:px-8 lg:px-10', // 반응형 패딩
        withVerticalPadding && 'py-10 sm:py-12 lg:py-16', // 반응형 상하 패딩
        className
      )}
      style={{ maxWidth: maxWidthValue }}
    >
      {children}
    </div>
  );
}
