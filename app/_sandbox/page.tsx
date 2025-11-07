"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

// 클라이언트 전용 컴포넌트로 dynamic import
const AIGenerationTest = dynamic(
  () => import("@/components/sandbox/AIGenerationTest").then((mod) => ({ default: mod.AIGenerationTest })),
  { ssr: false }
)

const TemplateRenderTest = dynamic(
  () => import("@/components/sandbox/TemplateRenderTest").then((mod) => ({ default: mod.TemplateRenderTest })),
  { ssr: false }
)

type TabType = "ai-generation" | "template-render"

export default function SandboxPage() {
  const [activeTab, setActiveTab] = useState<TabType>("ai-generation")
  const [systemInfo, setSystemInfo] = useState({
    hasGeminiKey: false,
    storageUsage: "0B",
    storageAvailable: false,
  })

  useEffect(() => {
    // 클라이언트에서만 동적으로 testHelpers import
    import("@/utils/sandbox/testHelpers").then(({ apiKeyTest, storageTest }) => {
      setSystemInfo({
        hasGeminiKey: apiKeyTest.hasGeminiKey(),
        storageUsage: storageTest.getFormattedUsage(),
        storageAvailable: storageTest.isAvailable(),
      })
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="mb-2 text-2xl font-bold">🧪 PPT Maker 샌드박스</h1>
          <p className="text-gray-600">
            PPT Maker의 기능을 독립적으로 테스트할 수 있는 환경이에요
          </p>
        </div>

        {/* 시스템 정보 */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">시스템 정보</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-2 text-sm font-medium text-gray-600">Gemini API</div>
              <div
                className={`text-lg font-bold ${systemInfo.hasGeminiKey ? "text-green-600" : "text-red-600"}`}
              >
                {systemInfo.hasGeminiKey ? "✅ 설정됨" : "❌ 미설정"}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-2 text-sm font-medium text-gray-600">
                로컬 스토리지
              </div>
              <div
                className={`text-lg font-bold ${systemInfo.storageAvailable ? "text-green-600" : "text-red-600"}`}
              >
                {systemInfo.storageAvailable
                  ? `✅ ${systemInfo.storageUsage}`
                  : "❌ 사용 불가"}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-2 text-sm font-medium text-gray-600">환경</div>
              <div className="text-lg font-bold text-blue-600">
                {process.env.NODE_ENV === "production" ? "🚀 프로덕션" : "🔧 개발"}
              </div>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("ai-generation")}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "ai-generation"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              AI 생성 테스트
            </button>
            <button
              onClick={() => setActiveTab("template-render")}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "template-render"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              템플릿 렌더링 테스트
            </button>
          </div>

          <div className="p-6">
            {activeTab === "ai-generation" && <AIGenerationTest />}
            {activeTab === "template-render" && <TemplateRenderTest />}
          </div>
        </div>

        {/* 사용 안내 */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-2 font-semibold text-blue-900">💡 사용 안내</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>
              • <strong>AI 생성 테스트</strong>: Gemini API를 사용해서 프리젠테이션을 생성해요
            </li>
            <li>
              • <strong>템플릿 렌더링 테스트</strong>: 템플릿 엔진으로 HTML을 생성해요
            </li>
            <li>• 생성된 결과는 다운로드하거나 미리보기할 수 있어요</li>
            <li>
              • 이 페이지는 개발 환경에서만 사용하고, 프로덕션에서는 숨겨야 해요
            </li>
          </ul>
        </div>

        {/* 디버그 정보 */}
        <details className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <summary className="cursor-pointer font-semibold text-gray-700">
            🐛 디버그 정보
          </summary>
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <div>
              <strong>User Agent:</strong> {navigator.userAgent}
            </div>
            <div>
              <strong>Screen Resolution:</strong> {window.screen.width} x{" "}
              {window.screen.height}
            </div>
            <div>
              <strong>Viewport:</strong> {window.innerWidth} x {window.innerHeight}
            </div>
            <div>
              <strong>언어:</strong> {navigator.language}
            </div>
            <div>
              <strong>온라인 상태:</strong> {navigator.onLine ? "✅ 온라인" : "❌ 오프라인"}
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}
