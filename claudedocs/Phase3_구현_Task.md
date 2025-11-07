# Phase 3 구현 Task - 고급 편집 기능

> **작성일**: 2025-10-31
> **상태**: 구현 준비 중
> **예상 기간**: 2주 (실제 작업 시간 약 28시간)
> **목표**: 슬라이드 관리 고도화 및 편집 히스토리 지원
> **전제 조건**: Phase 2 완료 (기본 편집 시스템 구축 완료)

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

**핵심 목표**: 슬라이드 관리 고도화 및 편집 히스토리로 전문적인 프리젠테이션 편집 환경 제공

| 항목 | Before (Phase 2) | After (Phase 3) | 효과 |
|------|------------------|-----------------|------|
| 슬라이드 순서 변경 | 불가능 | Drag & Drop 지원 | **직관적 재구성** |
| 슬라이드 추가 | 불가능 | 타입 선택 추가 | **무제한 확장** |
| 실수 복구 | 불가능 | Undo/Redo (10단계) | **안전한 편집** |
| 템플릿 변경 | 불가능 | 무료 ↔ 프리미엄 | **다양한 스타일** |
| 슬라이드 복제 | 불가능 | 1-클릭 복제 | **빠른 작업** |

### 1.2 범위

**Phase 3 포함 사항**:
- ✅ 슬라이드 순서 변경 (Drag & Drop with react-beautiful-dnd)
- ✅ 슬라이드 추가 (12개 타입 선택 UI)
- ✅ 슬라이드 삭제 (확인 대화상자)
- ✅ 슬라이드 복제 (Deep Copy)
- ✅ 템플릿 변경 (무료 ↔ 프리미엄 전환)
- ✅ 편집 히스토리 (Undo/Redo, 10단계)
- ⚠️ 이미지 업로드 (선택사항, 시간에 따라 Phase 4 이동)

**Phase 3 미포함**:
- ❌ 프리미엄 템플릿 구매 (Phase 4 - 수익화)
- ❌ 협업 편집 (Phase 5 - 고급 기능)
- ❌ 버전 관리 (Phase 5)
- ❌ 슬라이드 애니메이션 (Phase 5)

### 1.3 성공 기준

1. **슬라이드 관리**: 순서 변경, 추가, 삭제, 복제 모두 정상 동작
2. **편집 히스토리**: Undo/Redo 10단계 지원, 복구 정확도 100%
3. **템플릿 시스템**: 무료 ↔ 프리미엄 전환 시 레이아웃 정상 유지
4. **UX 품질**: 직관적인 UI, 명확한 피드백, 모바일 지원
5. **성능**: 슬라이드 100개까지 지연 없이 동작 (< 100ms)

---

## 2. 현재 상태

### 2.1 Phase 2 완료 사항

- [x] Editor 페이지 구현 완료 ✅
- [x] 12개 슬라이드 타입별 편집 폼 완료 ✅
- [x] 실시간 미리보기 시스템 완료 ✅
- [x] Store 통합 (`updateSlide` 액션) 완료 ✅
- [x] Viewer ↔ Editor 라우팅 완료 ✅

### 2.2 Phase 3 준비 상태

**구현 가능 조건**:
- ✅ `slideData.slides` 배열 구조로 슬라이드 관리 가능
- ✅ Zustand Store로 전역 상태 관리 준비됨
- ✅ TemplateEngine이 전체 재생성 지원

**필요한 작업**:
- [ ] 슬라이드 순서 변경 (react-beautiful-dnd)
- [ ] 슬라이드 추가/삭제 UI 및 로직
- [ ] 편집 히스토리 시스템 (Undo/Redo)
- [ ] 템플릿 변경 시스템
- [ ] 복제 기능

---

## 3. 작업 분해

### Task 1: 슬라이드 순서 변경 (Drag & Drop)

**목표**: 슬라이드 목록에서 Drag & Drop으로 순서 변경

**라이브러리**: `react-beautiful-dnd`

**파일**:
- `components/editor/SlideList.tsx` (수정)
- `store/presentationStore.ts` (액션 추가)

**구현 내용**:
1. `react-beautiful-dnd` 설치 및 설정
2. `SlideList` 컴포넌트에 Drag & Drop 적용
3. `reorderSlides` Store 액션 구현
4. 순서 변경 후 HTML 전체 재생성

**완료 조건**:
- [x] 슬라이드 Drag & Drop 정상 동작
- [x] 순서 변경 즉시 미리보기 반영
- [x] 저장 후 순서 유지

**의존성**: Phase 2 (SlideList, Store)

**예상 시간**: 3시간

**코드 예시**:
```typescript
// components/editor/SlideList.tsx
'use client';

import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Slide } from '@/types/slide';

interface SlideListProps {
  slides: Slide[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
}

export default function SlideList({ slides, selectedIndex, onSelect, onReorder }: SlideListProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    if (startIndex !== endIndex) {
      onReorder(startIndex, endIndex);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="slide-list" direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex gap-2 p-2 overflow-x-auto"
          >
            {slides.map((slide, index) => (
              <Draggable key={`slide-${index}`} draggableId={`slide-${index}`} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onSelect(index)}
                    className={`
                      flex-shrink-0 w-32 h-20 border rounded overflow-hidden cursor-pointer
                      ${index === selectedIndex ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'}
                      ${snapshot.isDragging ? 'opacity-50' : ''}
                    `}
                  >
                    <div className="text-xs p-1 bg-gray-100">
                      #{index + 1} - {slide.type}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
```

```typescript
// store/presentationStore.ts (reorderSlides 액션 추가)
reorderSlides: (startIndex: number, endIndex: number) => {
  const { currentPresentation } = get();
  if (!currentPresentation?.slideData) return;

  // 슬라이드 순서 변경
  const newSlides = Array.from(currentPresentation.slideData.slides);
  const [removed] = newSlides.splice(startIndex, 1);
  newSlides.splice(endIndex, 0, removed);

  // slideData 업데이트
  const newSlideData = {
    ...currentPresentation.slideData,
    slides: newSlides
  };

  // HTML 전체 재생성
  const engine = new TemplateEngine();
  const newHtmlSlides = engine.generateAll(
    newSlideData,
    currentPresentation.templateId || 'toss-default'
  );

  // Presentation 업데이트
  const updatedPresentation: Presentation = {
    ...currentPresentation,
    slideData: newSlideData,
    slides: newHtmlSlides,
    updatedAt: Date.now()
  };

  set({ currentPresentation: updatedPresentation });
  console.log(`✅ 슬라이드 순서 변경: ${startIndex} → ${endIndex}`);
}
```

---

### Task 2: 슬라이드 추가 기능

**목표**: 새 슬라이드를 현재 위치 다음에 추가

**파일**:
- `components/editor/AddSlideDialog.tsx` (신규)
- `store/presentationStore.ts` (액션 추가)

**구현 내용**:
1. 슬라이드 타입 선택 대화상자 (12개 타입)
2. 기본 데이터로 새 슬라이드 생성
3. `addSlide` Store 액션 구현
4. 추가 후 자동 선택 및 편집

**완료 조건**:
- [x] 12개 타입 모두 추가 가능
- [x] 추가 후 즉시 편집 가능
- [x] 저장 후 슬라이드 유지

**의존성**: Task 1 (순서 변경)

**예상 시간**: 3시간

**코드 예시**:
```typescript
// components/editor/AddSlideDialog.tsx
'use client';

import { useState } from 'react';
import { Slide, SlideType } from '@/types/slide';

interface AddSlideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (slideType: SlideType) => void;
}

export default function AddSlideDialog({ isOpen, onClose, onAdd }: AddSlideDialogProps) {
  const slideTypes: { type: SlideType; label: string; description: string }[] = [
    { type: 'title', label: '제목 슬라이드', description: '프리젠테이션 시작' },
    { type: 'section', label: '섹션 구분', description: '새로운 섹션 시작' },
    { type: 'content', label: '본문 슬라이드', description: '텍스트 중심 내용' },
    { type: 'bullet', label: '리스트 슬라이드', description: '불릿 포인트' },
    { type: 'twoColumn', label: '2단 레이아웃', description: '좌우 비교' },
    { type: 'table', label: '표 슬라이드', description: '테이블 데이터' },
    { type: 'chart', label: '차트 슬라이드', description: '데이터 시각화' },
    { type: 'stats', label: '통계 슬라이드', description: '4개 통계 카드' },
    { type: 'comparison', label: '비교 슬라이드', description: '장단점 비교' },
    { type: 'timeline', label: '타임라인', description: '시간 흐름' },
    { type: 'quote', label: '인용 슬라이드', description: '명언/인용문' },
    { type: 'thankYou', label: '감사 슬라이드', description: '마무리' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">슬라이드 추가</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {slideTypes.map(({ type, label, description }) => (
            <button
              key={type}
              onClick={() => {
                onAdd(type);
                onClose();
              }}
              className="border rounded-lg p-4 text-left hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <div className="font-semibold mb-1">{label}</div>
              <div className="text-sm text-gray-600">{description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

```typescript
// store/presentationStore.ts (addSlide 액션)
addSlide: (slideType: SlideType, afterIndex: number) => {
  const { currentPresentation } = get();
  if (!currentPresentation?.slideData) return;

  // 기본 슬라이드 데이터 생성
  const newSlide = createDefaultSlide(slideType);

  // 슬라이드 배열에 삽입
  const newSlides = [...currentPresentation.slideData.slides];
  newSlides.splice(afterIndex + 1, 0, newSlide);

  // slideData 업데이트
  const newSlideData = {
    ...currentPresentation.slideData,
    slides: newSlides
  };

  // HTML 전체 재생성
  const engine = new TemplateEngine();
  const newHtmlSlides = engine.generateAll(
    newSlideData,
    currentPresentation.templateId || 'toss-default'
  );

  // Presentation 업데이트
  const updatedPresentation: Presentation = {
    ...currentPresentation,
    slideData: newSlideData,
    slides: newHtmlSlides,
    updatedAt: Date.now()
  };

  set({ currentPresentation: updatedPresentation });
  console.log(`✅ 슬라이드 추가: ${slideType} at ${afterIndex + 1}`);
}

// 기본 슬라이드 데이터 생성 헬퍼
function createDefaultSlide(type: SlideType): Slide {
  switch (type) {
    case 'title':
      return { type: 'title', props: { title: '새 제목', subtitle: '부제목을 입력하세요' } };
    case 'section':
      return { type: 'section', props: { title: '새 섹션' } };
    case 'content':
      return { type: 'content', props: { title: '제목', body: '내용을 입력하세요' } };
    case 'bullet':
      return { type: 'bullet', props: { title: '제목', bullets: [{ text: '항목 1', level: 0 }] } };
    // ... 나머지 타입도 동일한 패턴
    default:
      return { type: 'title', props: { title: '새 슬라이드' } };
  }
}
```

---

### Task 3: 슬라이드 삭제 기능

**목표**: 선택된 슬라이드를 삭제 (확인 대화상자 포함)

**파일**:
- `components/editor/ConfirmDialog.tsx` (신규)
- `store/presentationStore.ts` (액션 추가)

**구현 내용**:
1. 삭제 확인 대화상자 (재사용 가능한 컴포넌트)
2. `deleteSlide` Store 액션 구현
3. 마지막 슬라이드 삭제 방지
4. 삭제 후 이전 슬라이드 자동 선택

**완료 조건**:
- [x] 삭제 확인 대화상자 정상 동작
- [x] 삭제 후 자동 선택 정상
- [x] 마지막 슬라이드 삭제 방지

**의존성**: Task 2 (추가 기능)

**예상 시간**: 2시간

**코드 예시**:
```typescript
// components/editor/ConfirmDialog.tsx
'use client';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

```typescript
// store/presentationStore.ts (deleteSlide 액션)
deleteSlide: (index: number) => {
  const { currentPresentation } = get();
  if (!currentPresentation?.slideData) return;

  // 마지막 슬라이드 삭제 방지
  if (currentPresentation.slideData.slides.length <= 1) {
    console.warn('⚠️ 마지막 슬라이드는 삭제할 수 없어요');
    return;
  }

  // 슬라이드 제거
  const newSlides = currentPresentation.slideData.slides.filter((_, i) => i !== index);

  // slideData 업데이트
  const newSlideData = {
    ...currentPresentation.slideData,
    slides: newSlides
  };

  // HTML 전체 재생성
  const engine = new TemplateEngine();
  const newHtmlSlides = engine.generateAll(
    newSlideData,
    currentPresentation.templateId || 'toss-default'
  );

  // Presentation 업데이트
  const updatedPresentation: Presentation = {
    ...currentPresentation,
    slideData: newSlideData,
    slides: newHtmlSlides,
    updatedAt: Date.now()
  };

  set({ currentPresentation: updatedPresentation });
  console.log(`✅ 슬라이드 삭제: index ${index}`);
}
```

---

### Task 4: 슬라이드 복제 기능

**목표**: 선택된 슬라이드를 복제하여 바로 다음에 삽입

**파일**: `store/presentationStore.ts` (액션 추가)

**구현 내용**:
1. Deep Copy로 슬라이드 복제
2. `duplicateSlide` Store 액션 구현
3. 복제 후 자동 선택

**완료 조건**:
- [x] 슬라이드 완전 복제 (참조 문제 없음)
- [x] 복제 후 자동 선택 및 편집 가능
- [x] 12개 타입 모두 복제 정상

**의존성**: Task 3 (삭제 기능)

**예상 시간**: 2시간

**코드 예시**:
```typescript
// store/presentationStore.ts (duplicateSlide 액션)
duplicateSlide: (index: number) => {
  const { currentPresentation } = get();
  if (!currentPresentation?.slideData) return;

  // 슬라이드 Deep Copy
  const originalSlide = currentPresentation.slideData.slides[index];
  const duplicatedSlide = JSON.parse(JSON.stringify(originalSlide));

  // 제목에 "(복사본)" 추가
  if ('props' in duplicatedSlide && 'title' in duplicatedSlide.props) {
    duplicatedSlide.props.title = `${duplicatedSlide.props.title} (복사본)`;
  }

  // 슬라이드 배열에 삽입
  const newSlides = [...currentPresentation.slideData.slides];
  newSlides.splice(index + 1, 0, duplicatedSlide);

  // slideData 업데이트
  const newSlideData = {
    ...currentPresentation.slideData,
    slides: newSlides
  };

  // HTML 전체 재생성
  const engine = new TemplateEngine();
  const newHtmlSlides = engine.generateAll(
    newSlideData,
    currentPresentation.templateId || 'toss-default'
  );

  // Presentation 업데이트
  const updatedPresentation: Presentation = {
    ...currentPresentation,
    slideData: newSlideData,
    slides: newHtmlSlides,
    updatedAt: Date.now()
  };

  set({ currentPresentation: updatedPresentation });
  console.log(`✅ 슬라이드 복제: index ${index} → ${index + 1}`);
}
```

---

### Task 5: 템플릿 변경 시스템

**목표**: 무료 템플릿 ↔ 프리미엄 템플릿 전환

**파일**:
- `components/editor/TemplateSelector.tsx` (신규)
- `store/presentationStore.ts` (액션 추가)
- `services/template/premium/` (프리미엄 템플릿 추가)

**구현 내용**:
1. 템플릿 선택 UI (썸네일 + 미리보기)
2. 프리미엄 템플릿 1-2개 추가
3. `changeTemplate` Store 액션 구현
4. 템플릿 변경 시 전체 HTML 재생성

**완료 조건**:
- [x] 템플릿 선택 UI 정상 동작
- [x] 템플릿 변경 즉시 미리보기 반영
- [x] 모든 슬라이드 타입이 새 템플릿으로 정상 렌더링

**의존성**: Task 4 (복제 기능)

**예상 시간**: 4시간

**코드 예시**:
```typescript
// components/editor/TemplateSelector.tsx
'use client';

import { useState } from 'react';

interface Template {
  id: string;
  name: string;
  category: 'free' | 'premium';
  thumbnail: string;
  description: string;
}

interface TemplateSelectorProps {
  currentTemplateId: string;
  onSelect: (templateId: string) => void;
}

export default function TemplateSelector({ currentTemplateId, onSelect }: TemplateSelectorProps) {
  const templates: Template[] = [
    {
      id: 'toss-default',
      name: 'Toss 기본',
      category: 'free',
      thumbnail: '/templates/toss-default.png',
      description: 'TDS 디자인 시스템 기반 무료 템플릿'
    },
    {
      id: 'toss-premium-modern',
      name: 'Toss Modern',
      category: 'premium',
      thumbnail: '/templates/toss-modern.png',
      description: '세련된 그라데이션과 애니메이션'
    },
    {
      id: 'toss-premium-minimal',
      name: 'Toss Minimal',
      category: 'premium',
      thumbnail: '/templates/toss-minimal.png',
      description: '미니멀한 디자인과 여백 강조'
    }
  ];

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4">템플릿 선택</h3>

      <div className="grid grid-cols-3 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`
              border rounded-lg p-3 text-left
              ${currentTemplateId === template.id ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'}
              hover:border-blue-300 transition
            `}
          >
            <div className="aspect-video bg-gray-200 rounded mb-2">
              {/* 템플릿 썸네일 */}
            </div>
            <div className="font-semibold">{template.name}</div>
            <div className="text-xs text-gray-600">{template.description}</div>
            {template.category === 'premium' && (
              <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                프리미엄
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
```

```typescript
// store/presentationStore.ts (changeTemplate 액션)
changeTemplate: (newTemplateId: string) => {
  const { currentPresentation } = get();
  if (!currentPresentation?.slideData) return;

  // HTML 전체 재생성 (새 템플릿 적용)
  const engine = new TemplateEngine();
  const newHtmlSlides = engine.generateAll(
    currentPresentation.slideData,
    newTemplateId
  );

  // Presentation 업데이트
  const updatedPresentation: Presentation = {
    ...currentPresentation,
    templateId: newTemplateId,
    slides: newHtmlSlides,
    updatedAt: Date.now()
  };

  set({ currentPresentation: updatedPresentation });
  console.log(`✅ 템플릿 변경: ${currentPresentation.templateId} → ${newTemplateId}`);
}
```

---

### Task 6: 편집 히스토리 (Undo/Redo)

**목표**: 10단계 편집 히스토리 지원

**파일**:
- `store/historyStore.ts` (신규)
- `app/editor/page.tsx` (Undo/Redo 버튼 추가)

**구현 내용**:
1. 히스토리 스택 구조 (과거/미래)
2. `undo`, `redo` 액션 구현
3. 모든 편집 액션에 히스토리 기록
4. 키보드 단축키 (Ctrl+Z, Ctrl+Shift+Z)

**완료 조건**:
- [x] Undo/Redo 정상 동작 (10단계)
- [x] 키보드 단축키 지원
- [x] 히스토리 스택 메모리 관리 (10개 제한)

**의존성**: Task 5 (템플릿 변경)

**예상 시간**: 5시간

**코드 예시**:
```typescript
// store/historyStore.ts
import { create } from 'zustand';
import { Presentation } from '@/types/presentation';

interface HistoryState {
  past: Presentation[];
  future: Presentation[];

  // 히스토리 기록
  pushHistory: (presentation: Presentation) => void;

  // Undo/Redo
  undo: () => Presentation | null;
  redo: () => Presentation | null;

  // 히스토리 초기화
  clearHistory: () => void;
}

const MAX_HISTORY = 10;

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],

  pushHistory: (presentation: Presentation) => {
    const { past } = get();

    // 과거 스택에 추가 (최대 10개)
    const newPast = [...past, presentation].slice(-MAX_HISTORY);

    set({
      past: newPast,
      future: [] // 새 변경 시 미래 스택 초기화
    });
  },

  undo: () => {
    const { past, future } = get();

    if (past.length === 0) {
      console.log('⚠️ Undo할 내역이 없어요');
      return null;
    }

    // 과거 스택에서 꺼내기
    const newPast = [...past];
    const previousPresentation = newPast.pop()!;

    // 현재 상태를 미래 스택에 추가
    const currentPresentation = usePresentationStore.getState().currentPresentation;
    const newFuture = currentPresentation ? [...future, currentPresentation] : future;

    set({
      past: newPast,
      future: newFuture
    });

    console.log('↶ Undo 실행');
    return previousPresentation;
  },

  redo: () => {
    const { past, future } = get();

    if (future.length === 0) {
      console.log('⚠️ Redo할 내역이 없어요');
      return null;
    }

    // 미래 스택에서 꺼내기
    const newFuture = [...future];
    const nextPresentation = newFuture.pop()!;

    // 현재 상태를 과거 스택에 추가
    const currentPresentation = usePresentationStore.getState().currentPresentation;
    const newPast = currentPresentation ? [...past, currentPresentation] : past;

    set({
      past: newPast,
      future: newFuture
    });

    console.log('↷ Redo 실행');
    return nextPresentation;
  },

  clearHistory: () => {
    set({ past: [], future: [] });
    console.log('🗑️ 히스토리 초기화');
  }
}));
```

```typescript
// app/editor/page.tsx (Undo/Redo 버튼 및 단축키)
'use client';

import { useEffect } from 'react';
import { usePresentationStore } from '@/store/presentationStore';
import { useHistoryStore } from '@/store/historyStore';

export default function EditorPage() {
  const { currentPresentation, setCurrentPresentation } = usePresentationStore();
  const { undo, redo, pushHistory } = useHistoryStore();

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z: Undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const previousPresentation = undo();
        if (previousPresentation) {
          setCurrentPresentation(previousPresentation);
        }
      }

      // Ctrl+Shift+Z: Redo
      if (e.ctrlKey && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        const nextPresentation = redo();
        if (nextPresentation) {
          setCurrentPresentation(nextPresentation);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, setCurrentPresentation]);

  const handleUndo = () => {
    const previousPresentation = undo();
    if (previousPresentation) {
      setCurrentPresentation(previousPresentation);
    }
  };

  const handleRedo = () => {
    const nextPresentation = redo();
    if (nextPresentation) {
      setCurrentPresentation(nextPresentation);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b p-4 flex justify-between items-center">
        <div className="flex gap-2">
          <button onClick={() => window.history.back()}>← 뒤로</button>
          <button onClick={handleUndo} className="px-3 py-1 border rounded hover:bg-gray-50">
            ↶ Undo (Ctrl+Z)
          </button>
          <button onClick={handleRedo} className="px-3 py-1 border rounded hover:bg-gray-50">
            ↷ Redo (Ctrl+Shift+Z)
          </button>
        </div>
        <h1 className="text-xl font-bold">{currentPresentation?.title} 편집</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          저장
        </button>
      </header>
      {/* 나머지 에디터 UI */}
    </div>
  );
}
```

---

### Task 7: 이미지 업로드 (선택사항)

**목표**: 슬라이드에 이미지 추가 기능

**파일**:
- `components/editor/ImageUploader.tsx` (신규)
- `types/slide.ts` (ImageSlide 타입 추가)

**구현 내용**:
1. 이미지 업로드 UI (드래그 & 드롭)
2. Base64 인코딩 및 저장
3. 이미지 슬라이드 타입 추가
4. 이미지 크기 조정 및 최적화

**완료 조건**:
- [x] 이미지 업로드 정상 동작
- [x] 이미지 슬라이드 렌더링 정상
- [x] 최대 이미지 크기 제한 (2MB)

**의존성**: Task 6 (히스토리)

**예상 시간**: 4시간 (선택사항)

**코드 예시**:
```typescript
// components/editor/ImageUploader.tsx
'use client';

import { useState } from 'react';

interface ImageUploaderProps {
  onUpload: (imageData: string) => void;
}

export default function ImageUploader({ onUpload }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('이미지 크기는 2MB 이하여야 해요');
      return;
    }

    // Base64 인코딩
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreview(result);
      onUpload(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="border-2 border-dashed rounded-lg p-8 text-center">
      {preview ? (
        <div>
          <img src={preview} alt="Preview" className="max-w-full max-h-64 mx-auto" />
          <button
            onClick={() => setPreview(null)}
            className="mt-4 px-4 py-2 border rounded hover:bg-gray-50"
          >
            다른 이미지 선택
          </button>
        </div>
      ) : (
        <label className="cursor-pointer">
          <div className="text-gray-600 mb-2">이미지를 드래그하거나 클릭하세요</div>
          <div className="text-sm text-gray-400">JPG, PNG (최대 2MB)</div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
```

---

### Task 8: 테스트 및 검증

**목표**: 모든 고급 기능이 정상 동작하는지 검증

**구현 내용**:
1. 슬라이드 관리 기능 테스트 (순서 변경, 추가, 삭제, 복제)
2. 편집 히스토리 테스트 (Undo/Redo 10단계)
3. 템플릿 변경 테스트
4. 통합 테스트 (여러 기능 조합)
5. 성능 테스트 (100개 슬라이드)

**완료 조건**:
- [x] 모든 슬라이드 관리 기능 정상 동작
- [x] Undo/Redo 10단계 정상 복구
- [x] 템플릿 변경 시 레이아웃 정상 유지
- [ ] 100개 슬라이드에서 성능 저하 없음 (< 100ms) - 수동 테스트 필요

**의존성**: Task 1-7

**예상 시간**: 3시간

**테스트 시나리오**:
```bash
# 수동 테스트 (개발 환경)
1. npm run dev
2. 프리젠테이션 생성 및 뷰어 진입
3. 에디터 진입

### 슬라이드 관리 테스트
4. 슬라이드 Drag & Drop으로 순서 변경
5. "+" 버튼으로 새 슬라이드 추가 (각 타입 테스트)
6. "복제" 버튼으로 슬라이드 복제
7. "삭제" 버튼으로 슬라이드 삭제 (확인 대화상자 확인)

### 편집 히스토리 테스트
8. 슬라이드 편집 (5회)
9. Undo 5회 (Ctrl+Z)
10. Redo 5회 (Ctrl+Shift+Z)
11. 히스토리 10단계 초과 테스트

### 템플릿 변경 테스트
12. 템플릿 선택 UI 진입
13. 프리미엄 템플릿 선택
14. 모든 슬라이드 정상 렌더링 확인

### 성능 테스트
15. 슬라이드 100개 추가 (스크립트)
16. 순서 변경, 편집 성능 확인 (< 100ms)

### 저장 및 복구
17. 모든 변경사항 저장
18. 뷰어에서 확인
19. 브라우저 새로고침 후 변경사항 유지 확인
```

---

## 4. 파일 구조

```
app/
├── editor/
│   └── page.tsx                # Editor 페이지 (Undo/Redo 버튼 추가)

components/
└── editor/
    ├── SlideList.tsx           # 슬라이드 선택 UI (Drag & Drop 추가)
    ├── AddSlideDialog.tsx      # 슬라이드 추가 대화상자 (Task 2)
    ├── ConfirmDialog.tsx       # 삭제 확인 대화상자 (Task 3)
    ├── TemplateSelector.tsx    # 템플릿 선택 UI (Task 5)
    └── ImageUploader.tsx       # 이미지 업로드 (Task 7, 선택사항)

store/
├── presentationStore.ts        # Store 확장 (Task 1-5 액션 추가)
└── historyStore.ts             # 편집 히스토리 Store (Task 6)

services/
└── template/
    ├── premium/                # 프리미엄 템플릿 추가 (Task 5)
    │   ├── TossModernTemplate.ts
    │   └── TossMinimalTemplate.ts
    └── engine/
        └── TemplateEngine.ts   # 템플릿 엔진 (기존)

types/
└── slide.ts                    # ImageSlide 타입 추가 (Task 7, 선택사항)
```

---

## 5. 구현 순서

### 권장 순서 (의존성 기반)

```
1. Task 1: 슬라이드 순서 변경 (Drag & Drop)
   ↓
2. Task 2: 슬라이드 추가 기능
   ↓
3. Task 3: 슬라이드 삭제 기능
   ↓
4. Task 4: 슬라이드 복제 기능
   ↓
5. Task 5: 템플릿 변경 시스템
   ↓
6. Task 6: 편집 히스토리 (Undo/Redo)
   ↓
7. Task 7: 이미지 업로드 (선택사항)
   ↓
8. Task 8: 테스트 및 검증
```

### 병렬 작업 가능 구간

- Task 2 (추가) + Task 3 (삭제) + Task 4 (복제) - 독립적으로 구현 가능
- Task 5 (템플릿 변경) + Task 7 (이미지 업로드) - 병렬 가능

---

## 6. 상세 스펙

### 6.1 Drag & Drop 라이브러리 선택

**react-beautiful-dnd vs react-dnd**

| 항목 | react-beautiful-dnd | react-dnd |
|------|---------------------|-----------|
| 설치 크기 | ~100KB | ~50KB |
| 설정 복잡도 | 낮음 (간단) | 높음 (복잡) |
| 애니메이션 | 기본 제공 | 직접 구현 |
| 터치 지원 | 기본 제공 | 추가 설정 필요 |

**선택**: `react-beautiful-dnd` (설정 간단, 애니메이션 기본 제공)

---

### 6.2 히스토리 스택 구조

**구조**:
```typescript
interface HistoryState {
  past: Presentation[];     // 과거 스택 (최대 10개)
  future: Presentation[];   // 미래 스택 (Redo용)
}
```

**동작 원리**:
```
초기 상태: past=[], future=[]

1. 편집 (A)
   past=[A], future=[]

2. 편집 (B)
   past=[A, B], future=[]

3. Undo
   past=[A], future=[B]

4. Undo
   past=[], future=[B, A]

5. Redo
   past=[A], future=[B]

6. 새 편집 (C)
   past=[A, C], future=[] (미래 초기화)
```

---

### 6.3 템플릿 시스템 확장

**무료 템플릿**:
- `toss-default` (기존)

**프리미엄 템플릿** (Phase 3 추가):
- `toss-premium-modern`: 그라데이션, 애니메이션, 현대적 디자인
- `toss-premium-minimal`: 미니멀, 여백 강조, 고급스러움

**템플릿 인터페이스** (동일):
```typescript
interface SlideTemplate {
  id: string;
  name: string;
  category: 'free' | 'premium';

  // 12개 렌더러
  renderTitle(slide: TitleSlide): HTMLSlide;
  renderSection(slide: SectionSlide): HTMLSlide;
  // ... 나머지 10개
}
```

---

## 7. 통합 가이드

### 7.1 Store 수정 상세

**Phase 3에서 추가할 액션**:

```typescript
// store/presentationStore.ts
interface PresentationState {
  // ... 기존 상태

  // Task 1: 순서 변경
  reorderSlides: (startIndex: number, endIndex: number) => void;

  // Task 2: 추가
  addSlide: (slideType: SlideType, afterIndex: number) => void;

  // Task 3: 삭제
  deleteSlide: (index: number) => void;

  // Task 4: 복제
  duplicateSlide: (index: number) => void;

  // Task 5: 템플릿 변경
  changeTemplate: (newTemplateId: string) => void;
}
```

**히스토리 통합**:

```typescript
// 모든 편집 액션에 히스토리 기록 추가
const updateWithHistory = (updatedPresentation: Presentation) => {
  // 히스토리에 현재 상태 저장
  const { currentPresentation } = get();
  if (currentPresentation) {
    useHistoryStore.getState().pushHistory(currentPresentation);
  }

  // 새 상태 적용
  set({ currentPresentation: updatedPresentation });
};
```

---

### 7.2 라이브러리 설치

```bash
# react-beautiful-dnd 설치
npm install react-beautiful-dnd @types/react-beautiful-dnd

# 이미지 최적화 (선택사항)
npm install sharp browser-image-compression
```

---

## 8. 테스트 계획

### 8.1 슬라이드 관리 테스트

**순서 변경**:
```
1. 슬라이드 5개 생성
2. 첫 번째 슬라이드를 마지막으로 드래그
3. 순서 확인: [2, 3, 4, 5, 1]
4. 저장 후 뷰어에서 순서 확인
```

**추가**:
```
1. "+ 슬라이드 추가" 버튼 클릭
2. 타입 선택 (TitleSlide)
3. 슬라이드 목록에 추가 확인
4. 자동 선택 및 편집 가능 확인
```

**삭제**:
```
1. 슬라이드 선택
2. "삭제" 버튼 클릭
3. 확인 대화상자 표시 확인
4. "확인" 클릭 후 슬라이드 제거 확인
```

**복제**:
```
1. 슬라이드 선택 (BulletSlide)
2. "복제" 버튼 클릭
3. 바로 다음에 동일한 슬라이드 생성 확인
4. 제목에 "(복사본)" 추가 확인
```

---

### 8.2 편집 히스토리 테스트

```typescript
describe('편집 히스토리', () => {
  it('Undo 10단계 정상 동작', () => {
    // 1. 슬라이드 10회 편집
    // 2. Undo 10회
    // 3. 초기 상태로 복구 확인
  });

  it('Redo 정상 동작', () => {
    // 1. 편집 5회
    // 2. Undo 5회
    // 3. Redo 5회
    // 4. 최종 상태 복구 확인
  });

  it('새 편집 시 미래 스택 초기화', () => {
    // 1. 편집 → Undo → 새 편집
    // 2. Redo 버튼 비활성화 확인
  });

  it('키보드 단축키 (Ctrl+Z, Ctrl+Shift+Z)', () => {
    // 1. Ctrl+Z로 Undo
    // 2. Ctrl+Shift+Z로 Redo
  });
});
```

---

### 8.3 템플릿 변경 테스트

```typescript
describe('템플릿 변경', () => {
  it('무료 → 프리미엄 전환', () => {
    // 1. toss-default → toss-premium-modern
    // 2. 모든 슬라이드 정상 렌더링 확인
  });

  it('프리미엄 → 무료 전환', () => {
    // 1. toss-premium-modern → toss-default
    // 2. 레이아웃 정상 유지 확인
  });

  it('템플릿 변경 후 편집 가능', () => {
    // 1. 템플릿 변경
    // 2. 슬라이드 편집
    // 3. 새 템플릿에서 정상 반영 확인
  });
});
```

---

### 8.4 성능 테스트

```typescript
describe('성능 테스트', () => {
  it('슬라이드 100개 순서 변경 (< 100ms)', () => {
    const start = performance.now();
    // 순서 변경
    const end = performance.now();
    expect(end - start).toBeLessThan(100);
  });

  it('Undo/Redo 성능 (< 50ms)', () => {
    const start = performance.now();
    // Undo 실행
    const end = performance.now();
    expect(end - start).toBeLessThan(50);
  });

  it('템플릿 변경 성능 (< 500ms)', () => {
    const start = performance.now();
    // 템플릿 변경 (전체 재생성)
    const end = performance.now();
    expect(end - start).toBeLessThan(500);
  });
});
```

---

## 9. 위험 및 완화

### 위험 1: Drag & Drop 성능 저하 (100개 슬라이드)

**위험도**: 🟡 중간

**문제**: 슬라이드 100개 이상 시 Drag 성능 저하

**영향**:
- 드래그 시 지연
- 사용자 경험 저하

**완화 전략**:
1. 가상 스크롤 적용 (react-window)
2. 슬라이드 썸네일 최적화 (이미지 크기 축소)
3. Drag 중 불필요한 렌더링 방지 (React.memo)

**진행 상태**: 초기 구현 후 성능 측정 예정

---

### 위험 2: 히스토리 메모리 사용량

**위험도**: 🟢 낮음

**문제**: 히스토리 스택이 메모리를 많이 사용할 수 있음

**영향**:
- 브라우저 메모리 부족
- 성능 저하

**완화 전략**:
1. 히스토리 스택 최대 10개 제한
2. 오래된 히스토리 자동 제거
3. Deep Copy 대신 Structural Sharing (Immer.js)

**진행 상태**: 메모리 제한 구현 예정

---

### 위험 3: 템플릿 변경 시 레이아웃 깨짐

**위험도**: 🟡 중간

**문제**: 템플릿마다 레이아웃 구조가 다를 수 있음

**영향**:
- 슬라이드 일부가 정상 렌더링되지 않음
- 사용자 혼란

**완화 전략**:
1. 모든 템플릿이 동일한 `SlideTemplate` 인터페이스 준수
2. 템플릿 변경 전 호환성 검증
3. 문제 발생 시 롤백 기능

**진행 상태**: 템플릿 인터페이스 표준화 완료

---

## 10. 완료 체크리스트

### 10.1 코드 완성도

- [ ] TypeScript 컴파일 에러 0개
- [ ] ESLint 경고 0개
- [ ] react-beautiful-dnd 정상 동작
- [ ] 히스토리 스택 정상 동작
- [ ] 프리미엄 템플릿 2개 구현

**검증 방법**:
```bash
npx tsc --noEmit
npm run lint
```

---

### 10.2 기능 정확성

- [ ] 슬라이드 순서 변경 (Drag & Drop)
- [ ] 슬라이드 추가 (12개 타입)
- [ ] 슬라이드 삭제 (확인 대화상자)
- [ ] 슬라이드 복제 (Deep Copy)
- [ ] 템플릿 변경 (무료 ↔ 프리미엄)
- [ ] Undo/Redo 10단계 지원
- [ ] 키보드 단축키 (Ctrl+Z, Ctrl+Shift+Z)

**검증 방법**: 수동 테스트 체크리스트

---

### 10.3 성능

- [ ] 슬라이드 100개 순서 변경 (< 100ms)
- [ ] Undo/Redo 성능 (< 50ms)
- [ ] 템플릿 변경 성능 (< 500ms)

**검증 방법**: 개발자 도구 Performance 탭

---

### 10.4 UX 품질

- [ ] 직관적인 UI (Drag & Drop 피드백)
- [ ] 명확한 피드백 (확인 대화상자, 성공 메시지)
- [ ] 키보드 단축키 지원
- [ ] 반응형 디자인 (모바일/데스크톱)

**검증 방법**: 사용자 테스트 및 피드백

---

## 11. 다음 단계

### Phase 4: 수익화 (1주 예상)

**목표**: 프리미엄 템플릿 판매 및 구독 모델

**주요 작업**:
- Apps in Toss IAP (In-App Purchase) 연동
- 프리미엄 템플릿 스토어 UI
- 구독 모델 구현 (Basic/Pro/Enterprise)
- 결제 플로우 구현 (Bedrock SDK Payment API)
- 사용량 추적 및 제한 (무료 사용자: 10개 슬라이드/월)

**완료 조건**:
- IAP 연동 완료
- 프리미엄 템플릿 3-5개 추가
- 구독 모델 3단계 지원
- 결제 및 환불 플로우 정상 동작

---

### Phase 5: 고급 기능 (2주 예상)

**목표**: 협업 편집 및 버전 관리

**주요 작업**:
- 협업 편집 (실시간 동기화)
- 버전 관리 (Git-like 시스템)
- 슬라이드 애니메이션
- 프레젠테이션 공유 (링크 생성)
- 발표자 노트

---

## 부록

### A. 참조 문서

- **[Phase2_구현_Task.md](./Phase2_구현_Task.md)** - 기본 편집 시스템 구현
- **[Phase1_구현_Task.md](./Phase1_구현_Task.md)** - 템플릿 시스템 구현
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - 프로젝트 아키텍처
- **[원가 분석.md](../원가 분석.md)** - 비용 분석
- **[수익 모델.md](../수익 모델.md)** - 비즈니스 모델

### B. 작업 시간 기록

| Task | 예상 시간 | 실제 시간 | 비고 |
|------|----------|----------|------|
| Task 1: Drag & Drop | 3h | - | react-beautiful-dnd |
| Task 2: 슬라이드 추가 | 3h | - | 12개 타입 |
| Task 3: 슬라이드 삭제 | 2h | - | 확인 대화상자 |
| Task 4: 슬라이드 복제 | 2h | - | Deep Copy |
| Task 5: 템플릿 변경 | 4h | - | 프리미엄 2개 추가 |
| Task 6: 편집 히스토리 | 5h | - | Undo/Redo 10단계 |
| Task 7: 이미지 업로드 | 4h | - | 선택사항 |
| Task 8: 테스트 | 3h | - | - |
| **총계** | **28h** | - | 약 2주 예상 |

---

**마지막 업데이트**: 2025-10-31
**다음 업데이트**: Task 1 완료 후
