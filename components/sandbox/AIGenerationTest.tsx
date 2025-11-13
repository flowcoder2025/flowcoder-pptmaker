"use client"

import { useState } from "react"
import { GeminiService } from "@/services/gemini"
import { TEST_PROMPTS } from "@/utils/sandbox/testData"
import {
  PerformanceTimer,
  validatePPTData,
  extractMetadata,
  type TestResult,
} from "@/utils/sandbox/testHelpers"
import type { UnifiedPPTJSON } from "@/types/pptJson"

export function AIGenerationTest() {
  const [selectedPromptId, setSelectedPromptId] = useState<string>("simple")
  const [customPrompt, setCustomPrompt] = useState<string>("")
  const [useResearch, setUseResearch] = useState<boolean>(false)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [generatedData, setGeneratedData] = useState<UnifiedPPTJSON | null>(null)

  const selectedPrompt = TEST_PROMPTS.find((p) => p.id === selectedPromptId)

  const handleGenerate = async () => {
    const prompt = customPrompt.trim() || selectedPrompt?.prompt || ""

    if (!prompt) {
      alert("프롬프트를 입력해주세요")
      return
    }

    setIsGenerating(true)
    setResult(null)
    setGeneratedData(null)

    const timer = new PerformanceTimer()
    timer.start()

    try {
      const geminiService = new GeminiService()
      const data = await geminiService.generateContent(prompt, useResearch)

      timer.stop()

      // 데이터 검증
      if (!validatePPTData(data)) {
        throw new Error("생성된 데이터가 올바르지 않아요")
      }

      const metadata = extractMetadata(data)

      setResult({
        success: true,
        duration: timer.getFormattedDuration(),
        metadata,
      })
      setGeneratedData(data)
    } catch (error) {
      timer.stop()
      setResult({
        success: false,
        duration: timer.getFormattedDuration(),
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했어요",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedData) return

    const dataStr = JSON.stringify(generatedData, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `ppt-${Date.now()}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="mb-4 text-lg font-semibold">AI 생성 테스트</h3>

        {/* 프롬프트 선택 */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">테스트 프롬프트</label>
          <select
            value={selectedPromptId}
            onChange={(e) => setSelectedPromptId(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            disabled={isGenerating}
          >
            {TEST_PROMPTS.map((prompt) => (
              <option key={prompt.id} value={prompt.id}>
                {prompt.title} - {prompt.description}
              </option>
            ))}
          </select>
        </div>

        {/* 커스텀 프롬프트 */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">
            커스텀 프롬프트 (선택사항)
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="여기에 직접 프롬프트를 입력할 수 있어요"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            rows={3}
            disabled={isGenerating}
          />
        </div>

        {/* 자료 조사 옵션 */}
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={useResearch}
              onChange={(e) => setUseResearch(e.target.checked)}
              disabled={isGenerating}
              className="mr-2"
            />
            <span className="text-sm">자료 조사 활성화 (Perplexity API)</span>
          </label>
        </div>

        {/* 생성 버튼 */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isGenerating ? "생성하고 있어요..." : "프리젠테이션 생성"}
        </button>
      </div>

      {/* 결과 패널 */}
      {result && (
        <div
          className={`rounded-lg border p-4 ${
            result.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
          }`}
        >
          <h4 className="mb-2 font-semibold">
            {result.success ? "✅ 생성 성공" : "❌ 생성 실패"}
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">소요 시간:</span> {result.duration}
            </div>
            {result.success && result.metadata && (
              <>
                <div>
                  <span className="font-medium">제목:</span> {result.metadata.title}
                </div>
                <div>
                  <span className="font-medium">슬라이드 수:</span>{" "}
                  {result.metadata.totalSlides}개
                </div>
                <div>
                  <span className="font-medium">슬라이드 타입:</span>
                  <ul className="ml-4 mt-1">
                    {Object.entries(result.metadata.slideTypes).map(([type, count]) => (
                      <li key={type}>
                        {type}: {count}개
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            {!result.success && <div className="text-red-700">{result.error}</div>}
          </div>

          {/* 다운로드 버튼 */}
          {result.success && generatedData && (
            <button
              onClick={handleDownload}
              className="mt-4 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              JSON 다운로드
            </button>
          )}
        </div>
      )}

      {/* 생성된 데이터 미리보기 */}
      {generatedData && (
        <details className="rounded-lg border border-gray-200 p-4">
          <summary className="cursor-pointer font-semibold">생성된 데이터 미리보기</summary>
          <pre className="mt-4 overflow-auto rounded bg-gray-100 p-4 text-xs">
            {JSON.stringify(generatedData, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}
