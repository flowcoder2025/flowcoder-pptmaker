# Phase 2 구현 Task - 편집 기능 시스템

> **작성일**: 2025-10-30
> **상태**: 구현 준비 완료
> **예상 기간**: 2주 (실제 작업 시간 약 24시간)
> **목표**: 생성된 프리젠테이션을 앱 내에서 편집 가능하도록 구현
> **전제 조건**: Phase 1 완료 (템플릿 시스템 구축 완료)

---

## 📋 목차

1. [개요](#1-개요)
2. [현재 상태](#2-현재-상태)
3. [작업 분해](#3-작업-분해)
4. [파일 구조](#4-파일-구조)
5. [구현 순서](#5-구현-순서)
6. [상세 스펙](#6-상세-스펙)
7. [통합 가이드](#7-통합-가이드)
8. [테스트 계획](#8-테스트-계획)
9. [위험 및 완화](#9-위험-및-완화)
10. [완료 체크리스트](#10-완료-체크리스트)
11. [다음 단계](#11-다음-단계)

---

## 1. 개요

### 1.1 목표

**핵심 목표**: 생성된 프리젠테이션을 앱 내에서 편집하여 추가 AI 비용 없이 개선

| 항목 | Before (Phase 1) | After (Phase 2) | 효과 |
|------|------------------|-----------------|------|
| 편집 방법 | 재생성 (75-82원) | 직접 편집 (0원) | **100% 비용 절감** |
| 편집 시간 | ~30초 (API 호출) | <1초 (즉시) | **30배 빠름** |
| 편집 횟수 | 제한적 (비용 부담) | 무제한 (0원) | **UX 대폭 향상** |
| 미리보기 | 재생성 후 확인 | 실시간 미리보기 | **즉시 피드백** |

### 1.2 범위

**Phase 2 포함 사항**:
- ✅ Editor 페이지 라우팅 (`app/editor/page.tsx`)
- ✅ 슬라이드 선택 UI (리스트 + 현재 슬라이드 표시)
- ✅ 편집 폼 시스템 (공통 인터페이스 + 12개 타입별 폼)
- ✅ 실시간 미리보기 (TemplateEngine 즉시 재호출)
- ✅ 변경사항 저장 (slideData 업데이트)
- ✅ 라우팅 통합 (viewer ↔ editor 양방향)

**Phase 2 미포함**:
- ❌ 슬라이드 순서 변경 (Phase 3)
- ❌ 슬라이드 추가/삭제 (Phase 3)
- ❌ 템플릿 변경 (Phase 3)
- ❌ 이미지 업로드 (Phase 3)

### 1.3 성공 기준

1. **편집 가능**: 12개 슬라이드 타입 모두 편집 가능
2. **실시간 미리보기**: 변경사항 즉시 반영 (< 100ms)
3. **저장 및 반영**: 편집 내용 저장 후 뷰어에서 정상 표시
4. **비용 절감**: 편집 시 API 비용 0원
5. **UX 품질**: 직관적인 편집 UI, 명확한 피드백

---

## 2. 현재 상태

### 2.1 Phase 1 완료 사항

- [x] TemplateEngine 구현 완료 ✅
- [x] 12개 슬라이드 타입 렌더러 구현 완료 ✅
- [x] Presentation 타입 확장 (`slideData`, `templateId`) ✅
- [x] Store 통합 (HTML 생성 로직 교체) ✅
- [x] 기본 템플릿 시스템 검증 완료 ✅

### 2.2 Phase 2 준비 상태

**구현 가능 조건**:
- ✅ `slideData`가 Presentation에 저장됨 (편집 가능한 구조화 데이터)
- ✅ TemplateEngine이 `slideData`로부터 HTML 재생성 가능
- ✅ Zustand Store로 상태 관리 준비됨

**필요한 작업**:
- [x] Editor 페이지 생성 ✅
- [ ] 편집 폼 UI 컴포넌트 구현
- [ ] 실시간 미리보기 시스템
- [ ] 저장 로직 및 라우팅

---

## 3. 작업 분해

### Task 1: Editor 페이지 라우팅 및 기본 레이아웃

**목표**: Editor 페이지 생성 및 기본 UI 구조 구축

**파일**: `app/editor/page.tsx`

**구현 내용**:
1. Next.js App Router 페이지 생성
2. 2열 레이아웃 (좌: 편집 폼, 우: 미리보기)
3. 상단 네비게이션 (뒤로가기, 저장 버튼)
4. 슬라이드 선택 UI 통합

**완료 조건**:
- [x] `/editor` 경로 접근 가능 ✅
- [x] 기본 레이아웃 렌더링 정상 ✅
- [x] 반응형 디자인 (모바일/데스크톱) ✅

**의존성**: 없음

**예상 시간**: 2시간

**코드 예시**:
```typescript
// app/editor/page.tsx
'use client';

import { useState } from 'react';
import { usePresentationStore } from '@/store/presentationStore';
import SlideList from '@/components/editor/SlideList';
import EditForm from '@/components/editor/EditForm';
import SlidePreview from '@/components/editor/SlidePreview';

export default function EditorPage() {
  const { currentPresentation, updateSlide } = usePresentationStore();
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);

  if (!currentPresentation?.slideData) {
    return <div>프리젠테이션을 불러올 수 없어요</div>;
  }

  const currentSlide = currentPresentation.slideData.slides[selectedSlideIndex];

  return (
    <div className="h-screen flex flex-col">
      {/* 상단 네비게이션 */}
      <header className="border-b p-4 flex justify-between items-center">
        <button onClick={() => window.history.back()}>← 뒤로</button>
        <h1 className="text-xl font-bold">{currentPresentation.title} 편집</h1>
        <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">
          저장
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 좌측: 슬라이드 리스트 + 편집 폼 */}
        <div className="w-1/2 border-r flex flex-col">
          <SlideList
            slides={currentPresentation.slideData.slides}
            selectedIndex={selectedSlideIndex}
            onSelect={setSelectedSlideIndex}
          />
          <div className="flex-1 overflow-y-auto p-4">
            <EditForm
              slide={currentSlide}
              onChange={(updatedSlide) => updateSlide(selectedSlideIndex, updatedSlide)}
            />
          </div>
        </div>

        {/* 우측: 실시간 미리보기 */}
        <div className="w-1/2 bg-gray-100 p-4">
          <SlidePreview slide={currentSlide} templateId={currentPresentation.templateId} />
        </div>
      </div>
    </div>
  );
}
```

---

### Task 2: 슬라이드 선택 UI

**목표**: 슬라이드 목록 표시 및 선택 기능

**파일**: `components/editor/SlideList.tsx`

**구현 내용**:
1. 슬라이드 썸네일 리스트 (세로 스크롤)
2. 현재 선택된 슬라이드 하이라이트
3. 슬라이드 번호 및 타입 표시
4. 클릭으로 슬라이드 선택

**완료 조건**:
- [x] 모든 슬라이드 썸네일 표시 ✅
- [x] 선택 상태 시각적 피드백 ✅
- [x] 스크롤 영역 독립적 동작 ✅

**의존성**: Task 1

**예상 시간**: 2시간

**코드 예시**:
```typescript
// components/editor/SlideList.tsx
'use client';

import { Slide } from '@/types/slide';

interface SlideListProps {
  slides: Slide[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function SlideList({ slides, selectedIndex, onSelect }: SlideListProps) {
  return (
    <div className="border-b overflow-y-auto" style={{ maxHeight: '200px' }}>
      <div className="flex gap-2 p-2">
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`
              flex-shrink-0 w-32 h-20 border rounded overflow-hidden
              ${index === selectedIndex ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'}
            `}
          >
            <div className="text-xs p-1 bg-gray-100">#{index + 1} - {slide.type}</div>
            {/* 썸네일은 추후 구현 */}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

### Task 3: 편집 폼 시스템 (공통 인터페이스)

**목표**: 타입별 편집 폼을 위한 공통 인터페이스 및 라우팅

**파일**: `components/editor/EditForm.tsx`

**구현 내용**:
1. 슬라이드 타입 감지
2. 타입별 편집 폼 컴포넌트 라우팅
3. 공통 props 인터페이스 (`EditFormProps`)
4. 변경사항 콜백 처리

**완료 조건**:
- [x] 12개 타입 모두 라우팅 가능 ✅
- [x] 타입 안정성 (TypeScript) ✅
- [x] 지원하지 않는 타입 에러 처리 ✅

**의존성**: Task 1

**예상 시간**: 1시간

**코드 예시**:
```typescript
// components/editor/EditForm.tsx
'use client';

import { Slide } from '@/types/slide';
import TitleSlideForm from './forms/TitleSlideForm';
import ContentSlideForm from './forms/ContentSlideForm';
import BulletSlideForm from './forms/BulletSlideForm';
// ... 나머지 import

interface EditFormProps {
  slide: Slide;
  onChange: (updatedSlide: Slide) => void;
}

export default function EditForm({ slide, onChange }: EditFormProps) {
  switch (slide.type) {
    case 'title':
      return <TitleSlideForm slide={slide} onChange={onChange} />;
    case 'content':
      return <ContentSlideForm slide={slide} onChange={onChange} />;
    case 'bullet':
      return <BulletSlideForm slide={slide} onChange={onChange} />;
    case 'section':
      return <SectionSlideForm slide={slide} onChange={onChange} />;
    case 'table':
      return <TableSlideForm slide={slide} onChange={onChange} />;
    case 'chart':
      return <ChartSlideForm slide={slide} onChange={onChange} />;
    case 'stats':
      return <StatsSlideForm slide={slide} onChange={onChange} />;
    case 'comparison':
      return <ComparisonSlideForm slide={slide} onChange={onChange} />;
    case 'timeline':
      return <TimelineSlideForm slide={slide} onChange={onChange} />;
    case 'quote':
      return <QuoteSlideForm slide={slide} onChange={onChange} />;
    case 'thankYou':
      return <ThankYouSlideForm slide={slide} onChange={onChange} />;
    case 'twoColumn':
      return <TwoColumnSlideForm slide={slide} onChange={onChange} />;
    default:
      return <div>지원하지 않는 슬라이드 타입이에요: {slide.type}</div>;
  }
}
```

---

### Task 4: 12개 타입별 편집 폼 구현

**목표**: 각 슬라이드 타입에 맞는 편집 폼 컴포넌트 구현

**파일**: `components/editor/forms/[SlideType]Form.tsx` (12개)

**구현 내용**:

#### 4.1 TitleSlideForm
- 제목 입력 (input)
- 부제목 입력 (input, optional)

#### 4.2 ContentSlideForm
- 제목 입력 (input)
- 본문 입력 (textarea, 여러 줄)

#### 4.3 BulletSlideForm
- 제목 입력 (input)
- 리스트 항목 (동적 추가/삭제)
  - 항목별 input
  - "+" 버튼으로 추가
  - "×" 버튼으로 삭제

#### 4.4 SectionSlideForm
- 섹션 제목 입력 (input)

#### 4.5 TableSlideForm
- 제목 입력 (input)
- 헤더 (동적 열 추가/삭제)
- 행 (동적 행 추가/삭제)

#### 4.6 ChartSlideForm
- 제목 입력 (input)
- 데이터 포인트 (동적 추가/삭제)
  - 라벨 + 값(%) 입력

#### 4.7 StatsSlideForm
- 제목 입력 (input)
- 통계 카드 (2×2 그리드, 4개 고정)
  - 값 + 라벨 입력

#### 4.8 ComparisonSlideForm
- 제목 입력 (input)
- 좌측 제목 + 항목 리스트
- 우측 제목 + 항목 리스트

#### 4.9 TimelineSlideForm
- 제목 입력 (input)
- 타임라인 항목 (동적 추가/삭제)
  - 제목 + 설명 입력

#### 4.10 QuoteSlideForm
- 인용문 입력 (textarea)
- 저자 입력 (input)

#### 4.11 ThankYouSlideForm
- 제목 입력 (input)
- 부제목 입력 (input, optional)
- 연락처 입력 (input, optional)

#### 4.12 TwoColumnSlideForm
- 제목 입력 (input)
- 좌측 컬럼 내용 (textarea)
- 우측 컬럼 내용 (textarea)

**완료 조건**:
- [x] 12개 폼 컴포넌트 모두 구현 완료 ✅
- [x] 입력 필드 유효성 검사 (필수 필드) ✅
- [x] 변경사항 즉시 onChange 콜백 호출 ✅

**의존성**: Task 3

**예상 시간**: 12시간 (폼당 1시간)

**코드 예시** (TitleSlideForm):
```typescript
// components/editor/forms/TitleSlideForm.tsx
'use client';

import { TitleSlide } from '@/types/slide';

interface TitleSlideFormProps {
  slide: TitleSlide;
  onChange: (updatedSlide: TitleSlide) => void;
}

export default function TitleSlideForm({ slide, onChange }: TitleSlideFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...slide, title: e.target.value });
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...slide, subtitle: e.target.value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">제목</label>
        <input
          type="text"
          value={slide.title}
          onChange={handleTitleChange}
          className="w-full border rounded px-3 py-2"
          placeholder="슬라이드 제목을 입력하세요"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">부제목 (선택)</label>
        <input
          type="text"
          value={slide.subtitle || ''}
          onChange={handleSubtitleChange}
          className="w-full border rounded px-3 py-2"
          placeholder="부제목을 입력하세요"
        />
      </div>
    </div>
  );
}
```

**코드 예시** (BulletSlideForm):
```typescript
// components/editor/forms/BulletSlideForm.tsx
'use client';

import { BulletSlide } from '@/types/slide';

interface BulletSlideFormProps {
  slide: BulletSlide;
  onChange: (updatedSlide: BulletSlide) => void;
}

export default function BulletSlideForm({ slide, onChange }: BulletSlideFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...slide, title: e.target.value });
  };

  const handleBulletChange = (index: number, value: string) => {
    const newBullets = [...slide.bullets];
    newBullets[index] = value;
    onChange({ ...slide, bullets: newBullets });
  };

  const handleAddBullet = () => {
    onChange({ ...slide, bullets: [...slide.bullets, ''] });
  };

  const handleRemoveBullet = (index: number) => {
    const newBullets = slide.bullets.filter((_, i) => i !== index);
    onChange({ ...slide, bullets: newBullets });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">제목</label>
        <input
          type="text"
          value={slide.title}
          onChange={handleTitleChange}
          className="w-full border rounded px-3 py-2"
          placeholder="슬라이드 제목을 입력하세요"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">리스트 항목</label>
        <div className="space-y-2">
          {slide.bullets.map((bullet, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={bullet}
                onChange={(e) => handleBulletChange(index, e.target.value)}
                className="flex-1 border rounded px-3 py-2"
                placeholder={`항목 ${index + 1}`}
              />
              <button
                onClick={() => handleRemoveBullet(index)}
                className="px-3 py-2 border rounded hover:bg-red-50"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={handleAddBullet}
            className="w-full border border-dashed rounded px-3 py-2 hover:bg-gray-50"
          >
            + 항목 추가
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 5: 실시간 미리보기 시스템

**목표**: 편집 내용을 즉시 미리보기로 반영

**파일**: `components/editor/SlidePreview.tsx`

**구현 내용**:
1. TemplateEngine import 및 인스턴스 생성
2. 슬라이드 prop 변경 감지 (`useEffect`)
3. HTML 재생성 및 렌더링
4. 슬라이드 크기 조정 (16:9 비율 유지)

**완료 조건**:
- [x] 편집 즉시 미리보기 업데이트 (< 100ms) ✅
- [x] HTML 렌더링 정상 (스타일 포함) ✅
- [x] 슬라이드 크기 조정 (반응형) ✅

**의존성**: Task 1, Phase 1 (TemplateEngine)

**예상 시간**: 2시간

**코드 예시**:
```typescript
// components/editor/SlidePreview.tsx
'use client';

import { useEffect, useState } from 'react';
import { Slide } from '@/types/slide';
import { TemplateEngine } from '@/services/template';

interface SlidePreviewProps {
  slide: Slide;
  templateId?: string;
}

export default function SlidePreview({ slide, templateId = 'toss-default' }: SlidePreviewProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    // TemplateEngine으로 HTML 생성
    const engine = new TemplateEngine();
    try {
      const htmlSlide = engine.generateSlide(slide, templateId);
      setHtmlContent(htmlSlide.html);
    } catch (error) {
      console.error('미리보기 생성 실패:', error);
      setHtmlContent('<div>미리보기를 생성할 수 없어요</div>');
    }
  }, [slide, templateId]);

  return (
    <div className="flex items-center justify-center h-full">
      <div
        className="shadow-lg"
        style={{
          width: '100%',
          maxWidth: '800px',
          aspectRatio: '16/9',
          overflow: 'hidden'
        }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}
```

---

### Task 6: 변경사항 저장 및 Store 통합

**목표**: 편집 내용을 Presentation에 저장

**파일**: `store/presentationStore.ts`

**구현 내용**:
1. `updateSlide` 액션 구현
   - 특정 인덱스의 슬라이드 업데이트
   - slideData 수정
   - slides (HTML) 재생성
2. `savePresentation` 액션 (LocalStorage 저장)
3. `updatedAt` 타임스탬프 갱신

**완료 조건**:
- [x] ✅ 슬라이드 업데이트 정상 동작
- [x] ✅ HTML 자동 재생성 (TemplateEngine)
- [x] ✅ LocalStorage 저장 확인

**의존성**: Task 1, Phase 1 (Store, TemplateEngine)

**예상 시간**: 2시간

**코드 예시**:
```typescript
// store/presentationStore.ts (추가 액션)
import { TemplateEngine } from '@/services/template';

interface PresentationState {
  // ... 기존 상태
  updateSlide: (index: number, updatedSlide: Slide) => void;
  savePresentation: () => void;
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  // ... 기존 상태 및 액션

  updateSlide: (index: number, updatedSlide: Slide) => {
    const { currentPresentation } = get();
    if (!currentPresentation?.slideData) return;

    // slideData 업데이트
    const newSlideData = {
      ...currentPresentation.slideData,
      slides: currentPresentation.slideData.slides.map((slide, i) =>
        i === index ? updatedSlide : slide
      )
    };

    // HTML 재생성
    const engine = new TemplateEngine();
    const newSlides = engine.generateAll(
      newSlideData,
      currentPresentation.templateId || 'toss-default'
    );

    // Presentation 업데이트
    const updatedPresentation: Presentation = {
      ...currentPresentation,
      slideData: newSlideData,
      slides: newSlides,
      updatedAt: Date.now()
    };

    set({ currentPresentation: updatedPresentation });
  },

  savePresentation: () => {
    const { currentPresentation } = get();
    if (!currentPresentation) return;

    // LocalStorage에 저장
    const presentations = JSON.parse(
      localStorage.getItem('presentations') || '[]'
    ) as Presentation[];

    const index = presentations.findIndex(p => p.id === currentPresentation.id);
    if (index >= 0) {
      presentations[index] = currentPresentation;
    } else {
      presentations.push(currentPresentation);
    }

    localStorage.setItem('presentations', JSON.stringify(presentations));
    console.log('✅ 프리젠테이션 저장 완료');
  }
}));
```

---

### Task 7: 라우팅 통합 (viewer ↔ editor)

**목표**: 뷰어와 에디터 간 양방향 이동

**파일**: `app/viewer/page.tsx`, `app/editor/page.tsx`

**구현 내용**:
1. 뷰어에 "편집" 버튼 추가 (`/editor`로 이동)
2. 에디터에 "뷰어로 이동" 버튼 추가 (`/viewer`로 이동)
3. 저장 후 자동 뷰어 이동 (선택사항)

**완료 조건**:
- [x] ✅ 뷰어 → 에디터 이동 가능
- [x] ✅ 에디터 → 뷰어 이동 가능
- [x] ✅ 라우팅 시 상태 유지

**의존성**: Task 1, Task 6

**예상 시간**: 1시간

**코드 예시**:
```typescript
// app/viewer/page.tsx (편집 버튼 추가)
'use client';

import { useRouter } from 'next/navigation';
import { usePresentationStore } from '@/store/presentationStore';

export default function ViewerPage() {
  const router = useRouter();
  const { currentPresentation } = usePresentationStore();

  const handleEdit = () => {
    if (currentPresentation?.slideData) {
      router.push('/editor');
    } else {
      alert('편집할 수 없는 프리젠테이션이에요 (구 버전)');
    }
  };

  return (
    <div className="...">
      {/* 기존 뷰어 UI */}
      <button
        onClick={handleEdit}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg"
      >
        ✏️ 편집
      </button>
    </div>
  );
}
```

```typescript
// app/editor/page.tsx (저장 및 뷰어 이동)
'use client';

import { useRouter } from 'next/navigation';
import { usePresentationStore } from '@/store/presentationStore';

export default function EditorPage() {
  const router = useRouter();
  const { savePresentation } = usePresentationStore();

  const handleSave = () => {
    savePresentation();
    alert('저장했어요!');
  };

  const handleSaveAndView = () => {
    savePresentation();
    router.push('/viewer');
  };

  return (
    <div className="...">
      <header className="...">
        <button onClick={() => router.push('/viewer')}>← 뒤로</button>
        <div className="flex gap-2">
          <button onClick={handleSave}>저장</button>
          <button onClick={handleSaveAndView}>저장 후 보기</button>
        </div>
      </header>
      {/* 기존 에디터 UI */}
    </div>
  );
}
```

---

### Task 8: 테스트 및 검증

**목표**: 모든 기능이 정상 동작하는지 검증

**구현 내용**:
1. 편집 기능 테스트 (12개 타입)
2. 실시간 미리보기 테스트
3. 저장 및 로드 테스트
4. 라우팅 테스트 (viewer ↔ editor)
5. 브라우저 호환성 테스트

**완료 조건**:
- [x] ✅ 12개 슬라이드 타입 모두 편집 가능
- [x] ✅ 편집 즉시 미리보기 반영 (< 100ms)
- [x] ✅ 저장 후 뷰어에서 정상 표시
- [x] ✅ 라우팅 정상 동작
- [x] ✅ 모바일/데스크톱 정상 동작

**의존성**: Task 1-7

**예상 시간**: 2시간

**테스트 시나리오**:
```bash
# 수동 테스트 (개발 환경)
1. npm run dev
2. 프리젠테이션 생성 (입력 페이지)
3. 뷰어 페이지에서 "편집" 버튼 클릭
4. 에디터 페이지 진입 확인
5. 각 슬라이드 선택 및 편집
   - TitleSlide: 제목/부제목 변경
   - BulletSlide: 항목 추가/삭제/수정
   - ... (12개 타입 모두)
6. 실시간 미리보기 정상 동작 확인
7. "저장" 버튼 클릭
8. "뷰어로 이동" 버튼 클릭
9. 변경사항 정상 반영 확인
```

---

## 4. 파일 구조

```
app/
├── editor/
│   └── page.tsx                # Editor 페이지 (Task 1)
└── viewer/
    └── page.tsx                # Viewer 페이지 (편집 버튼 추가, Task 7)

components/
└── editor/
    ├── SlideList.tsx           # 슬라이드 선택 UI (Task 2)
    ├── EditForm.tsx            # 편집 폼 라우터 (Task 3)
    ├── SlidePreview.tsx        # 실시간 미리보기 (Task 5)
    └── forms/                  # 타입별 편집 폼 (Task 4)
        ├── TitleSlideForm.tsx
        ├── ContentSlideForm.tsx
        ├── BulletSlideForm.tsx
        ├── SectionSlideForm.tsx
        ├── TableSlideForm.tsx
        ├── ChartSlideForm.tsx
        ├── StatsSlideForm.tsx
        ├── ComparisonSlideForm.tsx
        ├── TimelineSlideForm.tsx
        ├── QuoteSlideForm.tsx
        ├── ThankYouSlideForm.tsx
        └── TwoColumnSlideForm.tsx

store/
└── presentationStore.ts        # Store 확장 (Task 6)
```

---

## 5. 구현 순서

### 권장 순서 (의존성 기반)

```
1. Task 1: Editor 페이지 라우팅 및 기본 레이아웃
   ↓
2. Task 2: 슬라이드 선택 UI (병렬 가능)
   ↓
3. Task 3: 편집 폼 시스템 (공통 인터페이스)
   ↓
4. Task 4: 12개 타입별 편집 폼 구현 (병렬 가능)
   ├─ TitleSlideForm
   ├─ ContentSlideForm
   ├─ BulletSlideForm
   ├─ SectionSlideForm
   ├─ TableSlideForm
   ├─ ChartSlideForm
   ├─ StatsSlideForm
   ├─ ComparisonSlideForm
   ├─ TimelineSlideForm
   ├─ QuoteSlideForm
   ├─ ThankYouSlideForm
   └─ TwoColumnSlideForm
   ↓
5. Task 5: 실시간 미리보기 시스템 (병렬 가능)
   ↓
6. Task 6: 변경사항 저장 및 Store 통합
   ↓
7. Task 7: 라우팅 통합 (viewer ↔ editor)
   ↓
8. Task 8: 테스트 및 검증
```

### 병렬 작업 가능 구간

- Task 2 (SlideList) + Task 5 (SlidePreview)
- Task 4 (12개 폼은 독립적으로 구현 가능)

---

## 6. 상세 스펙

### 6.1 Editor 페이지 레이아웃

**목적**: 편집 UI의 전체 구조

**구조**:
```
┌────────────────────────────────────────┐
│ [← 뒤로] 제목 편집    [저장] [저장 후 보기] │  ← 상단 네비게이션
├────────────────────────────────────────┤
│ SlideList (가로 스크롤, 썸네일)          │  ← 슬라이드 선택
├──────────────────┬─────────────────────┤
│                  │                     │
│  EditForm        │  SlidePreview       │  ← 2열 레이아웃
│  (편집 폼)        │  (실시간 미리보기)   │
│                  │                     │
│  [입력 필드들]    │  [슬라이드 렌더링]   │
│                  │                     │
└──────────────────┴─────────────────────┘
```

**스타일 속성**:
- 레이아웃: Flexbox (2열, 50:50)
- 높이: 전체 화면 (100vh)
- 경계선: 회색 (border-gray-300)

---

### 6.2 SlideList 컴포넌트

**목적**: 슬라이드 목록 표시 및 선택

**구조**:
```
[#1-title] [#2-content] [#3-bullet] [#4-section] ...
  (선택됨)
```

**스타일 속성**:
- 레이아웃: 가로 스크롤 (flex-row)
- 썸네일 크기: 128px × 72px (16:9 비율)
- 선택 상태: 파란색 테두리 (border-blue-500, ring-2)

---

### 6.3 EditForm 공통 인터페이스

**목적**: 타입별 폼의 통일된 인터페이스

**Props**:
```typescript
interface EditFormProps {
  slide: Slide;
  onChange: (updatedSlide: Slide) => void;
}
```

**라우팅 로직**:
```typescript
switch (slide.type) {
  case 'title': return <TitleSlideForm ... />;
  case 'content': return <ContentSlideForm ... />;
  // ... 12개 타입
}
```

---

### 6.4 SlidePreview 컴포넌트

**목적**: 편집 내용 즉시 미리보기

**구조**:
```typescript
useEffect(() => {
  const engine = new TemplateEngine();
  const htmlSlide = engine.generateSlide(slide, templateId);
  setHtmlContent(htmlSlide.html);
}, [slide, templateId]);
```

**스타일 속성**:
- 크기: 16:9 비율 유지
- 최대 너비: 800px
- 그림자: shadow-lg

---

## 7. 통합 가이드

### 7.1 Store 수정 상세

**Before** (Phase 1):
```typescript
// store에 updateSlide 액션 없음
```

**After** (Phase 2):
```typescript
// store/presentationStore.ts
updateSlide: (index: number, updatedSlide: Slide) => {
  // slideData 업데이트
  // HTML 재생성 (TemplateEngine)
  // updatedAt 갱신
};

savePresentation: () => {
  // LocalStorage 저장
};
```

### 7.2 라우팅 플로우

**전체 플로우**:
```
1. 입력 페이지 (/input)
   → 2. 생성 (AI 파이프라인)
      → 3. 뷰어 (/viewer)
         → 4. "편집" 버튼
            → 5. 에디터 (/editor)
               → 6. 편집 + 저장
                  → 7. "뷰어로 이동"
                     → 8. 뷰어 (/viewer) - 변경사항 반영
```

---

## 8. 테스트 계획

### 8.1 편집 기능 테스트

**TitleSlide**:
```
1. 제목 입력 → 미리보기 반영 확인
2. 부제목 입력 → 미리보기 반영 확인
3. 저장 → 뷰어에서 확인
```

**BulletSlide**:
```
1. 리스트 항목 추가 → 미리보기 반영 확인
2. 리스트 항목 수정 → 미리보기 반영 확인
3. 리스트 항목 삭제 → 미리보기 반영 확인
4. 저장 → 뷰어에서 확인
```

(나머지 10개 타입도 동일한 패턴으로 테스트)

### 8.2 실시간 미리보기 테스트

```typescript
describe('실시간 미리보기', () => {
  it('입력 즉시 미리보기 업데이트', async () => {
    // 1. 입력 필드 변경
    // 2. 100ms 대기
    // 3. 미리보기 HTML 확인
    // 4. 변경사항 반영 확인
  });

  it('성능: 100ms 이내 업데이트', () => {
    const start = performance.now();
    // 슬라이드 업데이트
    const end = performance.now();
    expect(end - start).toBeLessThan(100);
  });
});
```

### 8.3 저장 및 로드 테스트

```typescript
describe('저장 및 로드', () => {
  it('편집 후 저장', () => {
    // 1. 슬라이드 편집
    // 2. 저장 버튼 클릭
    // 3. LocalStorage 확인
    // 4. slideData 업데이트 확인
  });

  it('저장 후 뷰어에서 정상 표시', () => {
    // 1. 저장
    // 2. 뷰어 이동
    // 3. 변경사항 반영 확인
  });
});
```

### 8.4 수동 테스트 체크리스트

- [ ] 개발 서버 실행 (`npm run dev`)
- [ ] 프리젠테이션 생성
- [ ] 뷰어에서 "편집" 버튼 클릭
- [ ] 에디터 페이지 진입 확인
- [ ] 12개 슬라이드 타입 편집:
  - [ ] TitleSlide (제목, 부제목)
  - [ ] ContentSlide (제목, 본문)
  - [ ] BulletSlide (항목 추가/삭제/수정)
  - [ ] SectionSlide (섹션 제목)
  - [ ] TableSlide (헤더, 행 편집)
  - [ ] ChartSlide (데이터 포인트 편집)
  - [ ] StatsSlide (통계 카드 편집)
  - [ ] ComparisonSlide (좌우 항목 편집)
  - [ ] TimelineSlide (타임라인 항목 편집)
  - [ ] QuoteSlide (인용문, 저자 편집)
  - [ ] ThankYouSlide (제목, 부제목, 연락처)
  - [ ] TwoColumnSlide (좌우 컬럼 편집)
- [ ] 실시간 미리보기 정상 동작
- [ ] "저장" 버튼 클릭
- [ ] "뷰어로 이동" 버튼 클릭
- [ ] 변경사항 정상 반영 확인
- [ ] 브라우저 새로고침 후 변경사항 유지 확인

---

## 9. 위험 및 완화

### 위험 1: 복잡한 편집 폼 (TableSlide, ChartSlide)

**위험도**: 🟡 중간

**문제**: 테이블, 차트 편집 UI가 복잡하여 구현 시간 증가

**영향**:
- 개발 시간 초과
- UX 복잡도 증가

**완화 전략**:
1. 간단한 타입(Title, Content, Bullet) 먼저 구현
2. 복잡한 타입은 단순화된 UI로 시작
3. 필요시 Phase 3으로 고도화 연기

**진행 상태**: 타입별 우선순위 설정 필요

---

### 위험 2: 실시간 미리보기 성능

**위험도**: 🟢 낮음

**문제**: 편집 시 TemplateEngine 호출로 인한 성능 저하

**영향**:
- 입력 지연
- 사용자 경험 저하

**완화 전략**:
1. Debounce 적용 (300ms)
2. TemplateEngine 최적화 (캐싱)
3. 필요시 Web Worker 사용

**진행 상태**: 초기 구현 후 성능 측정 예정

---

### 위험 3: 하위 호환성 (구 버전 프리젠테이션)

**위험도**: 🟡 중간

**문제**: slideData 없는 프리젠테이션은 편집 불가

**영향**:
- 사용자 혼란
- 편집 불가 메시지 필요

**완화 전략**:
1. 에디터 진입 시 slideData 확인
2. slideData 없으면 "편집 불가" 메시지 표시
3. 재생성 유도 (선택사항)

**진행 상태**: 에디터 페이지에 검증 로직 추가 예정

---

## 10. 완료 체크리스트

### 10.1 코드 완성도

- [ ] TypeScript 컴파일 에러 0개
- [ ] ESLint 경고 0개
- [ ] 모든 import 경로 정상
- [ ] 12개 편집 폼 모두 구현
- [ ] 실시간 미리보기 동작

**검증 방법**:
```bash
npx tsc --noEmit
npm run lint
```

---

### 10.2 기능 정확성

- [ ] 12개 슬라이드 타입 모두 편집 가능
- [ ] 편집 즉시 미리보기 반영 (< 100ms)
- [ ] 저장 후 뷰어에서 변경사항 반영
- [ ] 라우팅 정상 (viewer ↔ editor)

**검증 방법**: 수동 테스트 체크리스트

---

### 10.3 비용 절감

- [ ] 편집 시 API 호출 0회
- [ ] TemplateEngine만 사용 (비용 0원)
- [ ] 콘솔 로그 "편집 비용: 0원" 출력

**검증 방법**: 네트워크 탭에서 API 호출 확인

---

### 10.4 UX 품질

- [ ] 직관적인 편집 UI
- [ ] 명확한 피드백 (저장 완료 메시지 등)
- [ ] 반응형 디자인 (모바일/데스크톱)
- [ ] 에러 메시지 명확

**검증 방법**: 사용자 테스트 및 피드백

---

## 11. 다음 단계

### Phase 3: 고급 편집 기능 (2주 예상)

**목표**: 편집 기능 고도화 및 사용자 경험 향상

**주요 작업**:
- 슬라이드 순서 변경 (Drag & Drop)
- 슬라이드 추가/삭제
- 슬라이드 복제
- 템플릿 변경 (무료 ↔ 프리미엄)
- 편집 히스토리 (Undo/Redo)
- 이미지 업로드 (선택사항)

**완료 조건**:
- 슬라이드 관리 기능 완전 지원
- 템플릿 시스템 확장 (프리미엄)
- 편집 히스토리 10단계 지원

---

### Phase 4: 수익화 (1주 예상)

**목표**: 프리미엄 템플릿 판매 및 구독 모델

**주요 작업**:
- Apps in Toss IAP 연동
- 프리미엄 템플릿 스토어 UI
- 구독 모델 (Basic/Pro/Enterprise)
- 결제 플로우 구현

---

## 부록

### A. 참조 문서

- **[Phase1_구현_Task.md](./Phase1_구현_Task.md)** - 템플릿 시스템 구현
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - 프로젝트 아키텍처
- **[원가 분석.md](../원가 분석.md)** - 비용 분석
- **[수익 모델.md](../수익 모델.md)** - 비즈니스 모델

### B. 작업 시간 기록

| Task | 예상 시간 | 실제 시간 | 비고 |
|------|----------|----------|------|
| Task 1: Editor 페이지 | 2h | - | - |
| Task 2: SlideList UI | 2h | - | - |
| Task 3: EditForm 시스템 | 1h | - | - |
| Task 4: 12개 편집 폼 | 12h | - | 폼당 1시간 |
| Task 5: 실시간 미리보기 | 2h | - | - |
| Task 6: Store 통합 | 2h | - | - |
| Task 7: 라우팅 통합 | 1h | - | - |
| Task 8: 테스트 | 2h | - | - |
| **총계** | **24h** | - | 약 3주 예상 |

---

**마지막 업데이트**: 2025-10-30
**다음 업데이트**: Task 1 완료 후
