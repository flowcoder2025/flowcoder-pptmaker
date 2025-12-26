"use client"

import { useState } from "react"
import { logger } from '@/lib/logger'
import { TemplateEngine } from "@/services/template"
import { SAMPLE_PPT_DATA } from "@/utils/sandbox/testData"
import { PerformanceTimer } from "@/utils/sandbox/testHelpers"
import type { UnifiedPPTJSON } from "@/types/pptJson"

// SAMPLE_PPT_DATA의 슬라이드를 타입별로 매핑
const SLIDE_TYPE_INDEX_MAP: Record<string, number> = {
  title: 0,
  content: 1,
  bullet: 2,
  section: 3,
  table: 4,
  stats: 5,
  comparison: 6,
  quote: 7,
  thankyou: 8,
}

type SlideType = keyof typeof SLIDE_TYPE_INDEX_MAP

export function TemplateRenderTest() {
  const [selectedTest, setSelectedTest] = useState<"full" | "single">("full")
  const [selectedSlideType, setSelectedSlideType] = useState<SlideType>("title")
  const [isRendering, setIsRendering] = useState<boolean>(false)
  const [renderTime, setRenderTime] = useState<string>("")
  const [renderedHTML, setRenderedHTML] = useState<string>("")

  const handleRenderFull = () => {
    setIsRendering(true)
    setRenderTime("")
    setRenderedHTML("")

    const timer = new PerformanceTimer()
    timer.start()

    try {
      const engine = new TemplateEngine()
      const htmlSlides = engine.generateAll(SAMPLE_PPT_DATA as unknown as UnifiedPPTJSON, "toss-default")

      timer.stop()

      // HTMLSlide[] → 단일 HTML 문자열 변환
      const combinedHTML = htmlSlides.map(slide => slide.html).join('\n')
      const combinedCSS = htmlSlides.map(slide => slide.css).join('\n')
      const fullHTML = `<style>${combinedCSS}</style>\n${combinedHTML}`

      setRenderTime(timer.getFormattedDuration())
      setRenderedHTML(fullHTML)
    } catch (error) {
      logger.error('렌더링 실패', error)
      alert(`렌더링 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
    } finally {
      setIsRendering(false)
    }
  }

  const handleRenderSingle = () => {
    setIsRendering(true)
    setRenderTime("")
    setRenderedHTML("")

    const timer = new PerformanceTimer()
    timer.start()

    try {
      const engine = new TemplateEngine()

      // SAMPLE_PPT_DATA에서 해당 타입의 슬라이드 가져오기
      const slideIndex = SLIDE_TYPE_INDEX_MAP[selectedSlideType]
      const slide = SAMPLE_PPT_DATA.slides[slideIndex]

      // 단일 슬라이드를 위한 임시 프리젠테이션 데이터
      const tempPPT = {
        title: `${selectedSlideType} 타입 테스트`,
        slides: [slide],
      } as unknown as UnifiedPPTJSON

      const htmlSlides = engine.generateAll(tempPPT, "toss-default")

      timer.stop()

      // HTMLSlide[] → 단일 HTML 문자열 변환
      const combinedHTML = htmlSlides.map(slide => slide.html).join('\n')
      const combinedCSS = htmlSlides.map(slide => slide.css).join('\n')
      const fullHTML = `<style>${combinedCSS}</style>\n${combinedHTML}`

      setRenderTime(timer.getFormattedDuration())
      setRenderedHTML(fullHTML)
    } catch (error) {
      logger.error('렌더링 실패', error)
      alert(`렌더링 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
    } finally {
      setIsRendering(false)
    }
  }

  const handleRender = () => {
    if (selectedTest === "full") {
      handleRenderFull()
    } else {
      handleRenderSingle()
    }
  }

  const handlePreview = () => {
    if (!renderedHTML) return

    const previewWindow = window.open("", "_blank")
    if (previewWindow) {
      previewWindow.document.write(renderedHTML)
      previewWindow.document.close()
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="mb-4 text-lg font-semibold">템플릿 렌더링 테스트</h3>

        {/* 테스트 타입 선택 */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">테스트 타입</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="test-type"
                value="full"
                checked={selectedTest === "full"}
                onChange={(e) => setSelectedTest(e.target.value as "full" | "single")}
                disabled={isRendering}
                className="mr-2"
              />
              <span>전체 프리젠테이션 (9개 슬라이드)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="test-type"
                value="single"
                checked={selectedTest === "single"}
                onChange={(e) => setSelectedTest(e.target.value as "full" | "single")}
                disabled={isRendering}
                className="mr-2"
              />
              <span>단일 슬라이드 타입</span>
            </label>
          </div>
        </div>

        {/* 슬라이드 타입 선택 (단일 테스트 시) */}
        {selectedTest === "single" && (
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">슬라이드 타입</label>
            <select
              value={selectedSlideType}
              onChange={(e) => setSelectedSlideType(e.target.value as SlideType)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              disabled={isRendering}
            >
              {Object.keys(SLIDE_TYPE_INDEX_MAP).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 렌더링 버튼 */}
        <button
          onClick={handleRender}
          disabled={isRendering}
          className="w-full rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:bg-gray-400"
        >
          {isRendering ? "렌더링하고 있어요..." : "HTML 렌더링"}
        </button>
      </div>

      {/* 결과 패널 */}
      {renderTime && (
        <div className="rounded-lg border border-green-500 bg-green-50 p-4">
          <h4 className="mb-2 font-semibold">✅ 렌더링 성공</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">소요 시간:</span> {renderTime}
            </div>
            <div>
              <span className="font-medium">HTML 크기:</span>{" "}
              {(renderedHTML.length / 1024).toFixed(2)}KB
            </div>
          </div>

          {/* 미리보기 버튼 */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handlePreview}
              className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              새 창에서 미리보기
            </button>
          </div>
        </div>
      )}

      {/* HTML 소스 미리보기 */}
      {renderedHTML && (
        <details className="rounded-lg border border-gray-200 p-4">
          <summary className="cursor-pointer font-semibold">HTML 소스 미리보기</summary>
          <pre className="mt-4 overflow-auto rounded bg-gray-100 p-4 text-xs">
            {renderedHTML}
          </pre>
        </details>
      )}
    </div>
  )
}
