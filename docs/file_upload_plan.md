⏺ 멀티모달 첨부 기능 설계 완료

  Sequential Thinking 분석 결과를 바탕으로 최적 설계를 제시합니다.

  ---
  🎯 1. Perplexity 프롬프트 3000자 제한 (핵심 개선!)

  효과 분석

  | 항목                        | 현재           | 제한 후         | 절감 효과        |
  |---------------------------|--------------|--------------|--------------|
  | 출력 토큰                     | 4,000 tokens | 2,000 tokens | 50% 감소       |
  | Perplexity 비용             | ₩28.6        | ₩15.6        | ₩13 절감 (46%) |
  | 전체 비용 (Reasoning + Flash) | ₩36.5        | ₩23.5        | ₩13 절감 (36%) |

  구현 방법

  app/api/research/route.ts 수정:

  const messages = [
    {
      role: 'system',
      content: `당신은 전문 조사 연구원입니다. 주어진 주제에 대해 최신 정보를 웹에서 조사하여 제공하세요.

  **중요 제약사항**:
  - 조사 결과는 **정확히 3000자 이내**로 작성하세요
  - 핵심 내용만 간결하게 요약하세요
  - 통계 데이터, 사례, 트렌드를 우선적으로 포함하세요
  - 출처는 신뢰할 수 있는 곳만 선택하세요

  **구조**:
  1. 개요 (300자)
  2. 주요 트렌드 (800자)
  3. 통계 및 데이터 (800자)
  4. 사례 및 전망 (800자)
  5. 요약 (300자)

  **글자 수 엄수**: 반드시 3000자를 초과하지 마세요.`
    },
    {
      role: 'user',
      content: topic
    }
  ]

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model === 'sonar-reasoning' ? 'sonar-reasoning' : 'sonar',
      messages,
      max_tokens: 2000, // 출력 토큰 제한 강화
      temperature: 0.2,
      search_recency_filter: 'month'
    })
  })

  services/gemini/content-generator.ts 간소화:

  // ❌ 기존: 5000자 초과 시 요약 로직 (삭제)
  if (research && research.content) {
    let researchContent = research.content;

    if (researchContent.length > 5000) {
      console.log(`⚠️ 자료 조사 결과가 너무 깁니다...`);
      researchContent = researchContent.substring(0, 3000) + '...';
    }
    // ...
  }

  // ✅ 신규: Perplexity가 이미 3000자로 제한했으므로 그대로 사용
  if (research && research.content) {
    prompt += `\n\n**조사된 자료:**\n${research.content}\n\n`;
  }

  ---
  💰 2. 고급 모델 원가 비율 분석 (귀하의 예상 정확함!)

  건당 과금 시 마진율

  | 옵션                        | 원가    | 판매가  | 마진     | 마진율   | PDF 추가 시 마진율 |
  |---------------------------|-------|------|--------|-------|--------------|
  | 심층 검색 (Reasoning + Flash) | ₩23.5 | ₩400 | ₩376.5 | 94.1% | 93.1%        |
  | 고품질 생성 (Pro)              | ₩38.2 | ₩500 | ₩461.8 | 92.4% | 89.1%        |
  | 최고 품질 (Reasoning + Pro)   | ₩54.2 | ₩900 | ₩845.8 | 94.0% | 90.8%        |

  결론:
  - ✅ PDF 추가해도 마진율 89% 이상 유지
  - ✅ 고급 옵션은 판매가가 높아 멀티모달 비용 부담 미미
  - ✅ Perplexity 3000자 제한으로 마진율 더 개선됨!

  ---
  📎 3. 멀티모달 첨부 제한 최적 설계

  플랜별 제한

  export const PLAN_LIMITS = {
    free: {
      maxImages: 0,
      maxPdfs: 0,
      maxTotalSize: 0,
      maxImageSize: 0,
      maxPdfSize: 0,
      maxPdfPages: 0,
      description: '파일 첨부는 Pro 플랜에서 이용할 수 있어요'
    },
    pro: {
      maxImages: 5,               // 이미지 최대 5장
      maxPdfs: 1,                 // PDF 최대 1개
      maxTotalSize: 15 * 1024 * 1024,  // 총 15MB
      maxImageSize: 5 * 1024 * 1024,   // 이미지당 5MB
      maxPdfSize: 10 * 1024 * 1024,    // PDF당 10MB
      maxPdfPages: 10,            // PDF 최대 10페이지
      description: '이미지 5장, PDF 1개 (10페이지)까지 첨부 가능'
    },
    premium: {
      maxImages: 10,              // 이미지 최대 10장
      maxPdfs: 2,                 // PDF 최대 2개
      maxTotalSize: 50 * 1024 * 1024,  // 총 50MB
      maxImageSize: 10 * 1024 * 1024,  // 이미지당 10MB
      maxPdfSize: 20 * 1024 * 1024,    // PDF당 20MB
      maxPdfPages: 20,            // PDF 최대 20페이지
      description: '이미지 10장, PDF 2개 (각 20페이지)까지 첨부 가능'
    }
  }

  지원 파일 형식

  export const ALLOWED_FILE_TYPES = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    pdf: ['application/pdf']
  }

  export const FILE_EXTENSIONS = {
    image: ['.jpg', '.jpeg', '.png', '.webp'],
    pdf: ['.pdf']
  }

  ---
  🏗️ 4. 타입 정의

  types/research.ts 확장:

  // 첨부 파일 타입
  export interface AttachmentFile {
    id: string                    // 고유 ID (클라이언트 생성)
    type: 'image' | 'pdf'
    file: File
    preview?: string              // 이미지 미리보기 URL (createObjectURL)
    base64?: string               // Base64 인코딩 데이터
    size: number                  // 파일 크기 (bytes)
    name: string                  // 파일명
    mimeType: string              // MIME 타입
    pageCount?: number            // PDF 페이지 수 (검증용)
  }

  // 멀티모달 생성 요청
  export interface MultimodalGenerateRequest {
    userInput: string
    useResearch: boolean
    researchModel?: PerplexityModel
    useProModel: boolean
    attachments?: AttachmentFile[]
    maxSlides?: number
  }

  // Gemini 멀티모달 파트
  export interface GeminiPart {
    text?: string
    inlineData?: {
      mimeType: string
      data: string              // Base64
    }
  }

  ---
  🎨 5. UI 컴포넌트 설계

  FileUploader 컴포넌트

  components/input/FileUploader.tsx:

  'use client'

  import { useState } from 'react'
  import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react'
  import { Button } from '@/components/ui/button'
  import { Card } from '@/components/ui/card'
  import type { AttachmentFile } from '@/types/research'
  import { PLAN_LIMITS, ALLOWED_FILE_TYPES } from '@/constants/multimodal'

  interface FileUploaderProps {
    userPlan: 'free' | 'pro' | 'premium'
    files: AttachmentFile[]
    onFilesChange: (files: AttachmentFile[]) => void
  }

  export function FileUploader({ userPlan, files, onFilesChange }: FileUploaderProps) {
    const [errors, setErrors] = useState<string[]>([])
    const limits = PLAN_LIMITS[userPlan]

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || [])
      const newFiles: AttachmentFile[] = []
      const newErrors: string[] = []

      for (const file of selectedFiles) {
        // 1. 파일 형식 검증
        const isImage = ALLOWED_FILE_TYPES.image.includes(file.type)
        const isPdf = ALLOWED_FILE_TYPES.pdf.includes(file.type)

        if (!isImage && !isPdf) {
          newErrors.push(`${file.name}: 지원하지 않는 파일 형식이에요`)
          continue
        }

        // 2. 개별 파일 크기 검증
        const maxSize = isPdf ? limits.maxPdfSize : limits.maxImageSize
        if (file.size > maxSize) {
          newErrors.push(`${file.name}: 파일이 너무 커요 (최대 ${maxSize / 1024 / 1024}MB)`)
          continue
        }

        // 3. PDF 페이지 수 검증 (향후 구현)
        let pageCount: number | undefined
        if (isPdf) {
          // TODO: PDF.js로 페이지 수 추출
          // pageCount = await getPdfPageCount(file)
          // if (pageCount > limits.maxPdfPages) {
          //   newErrors.push(`${file.name}: PDF는 최대 ${limits.maxPdfPages}페이지까지 첨부할 수 있어요`)
          //   continue
          // }
        }

        // 4. Base64 인코딩
        const base64 = await fileToBase64(file)

        newFiles.push({
          id: `${Date.now()}-${Math.random()}`,
          type: isPdf ? 'pdf' : 'image',
          file,
          preview: isImage ? URL.createObjectURL(file) : undefined,
          base64,
          size: file.size,
          name: file.name,
          mimeType: file.type,
          pageCount
        })
      }

      // 5. 총 개수 검증
      const allFiles = [...files, ...newFiles]
      const imageCount = allFiles.filter(f => f.type === 'image').length
      const pdfCount = allFiles.filter(f => f.type === 'pdf').length

      if (imageCount > limits.maxImages) {
        newErrors.push(`이미지는 최대 ${limits.maxImages}장까지 첨부할 수 있어요`)
        setErrors(newErrors)
        return
      }

      if (pdfCount > limits.maxPdfs) {
        newErrors.push(`PDF는 최대 ${limits.maxPdfs}개까지 첨부할 수 있어요`)
        setErrors(newErrors)
        return
      }

      // 6. 총 용량 검증
      const totalSize = allFiles.reduce((sum, f) => sum + f.size, 0)
      if (totalSize > limits.maxTotalSize) {
        newErrors.push(`총 용량은 ${limits.maxTotalSize / 1024 / 1024}MB를 초과할 수 없어요`)
        setErrors(newErrors)
        return
      }

      setErrors(newErrors)
      onFilesChange(allFiles)
    }

    const handleRemove = (id: string) => {
      const newFiles = files.filter(f => f.id !== id)
      onFilesChange(newFiles)
    }

    return (
      <div className="space-y-4">
        {/* 업로드 버튼 */}
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={userPlan === 'free'}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            파일 첨부
          </Button>

          <input
            id="file-input"
            type="file"
            multiple
            accept={[...FILE_EXTENSIONS.image, ...FILE_EXTENSIONS.pdf].join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />

          <p className="text-sm text-gray-500">
            {limits.description}
          </p>
        </div>

        {/* 업로드된 파일 목록 */}
        {files.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {files.map((file) => (
              <Card key={file.id} className="relative p-3">
                {/* 삭제 버튼 */}
                <button
                  onClick={() => handleRemove(file.id)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* 미리보기 */}
                {file.type === 'image' && file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center mb-2">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                )}

                {/* 파일명 */}
                <p className="text-xs truncate" title={file.name}>
                  {file.name}
                </p>

                {/* 파일 크기 */}
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>

                {/* PDF 페이지 수 */}
                {file.pageCount && (
                  <p className="text-xs text-gray-500">
                    {file.pageCount}페이지
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* 에러 메시지 */}
        {errors.length > 0 && (
          <div className="space-y-1">
            {errors.map((error, i) => (
              <p key={i} className="text-sm text-red-500">{error}</p>
            ))}
          </div>
        )}

        {/* 용량 표시 */}
        {files.length > 0 && (
          <div className="text-sm text-gray-500">
            총 용량: {(files.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)} MB / {limits.maxTotalSize / 1024 / 1024} MB
          </div>
        )}
      </div>
    )
  }

  // 유틸리티 함수
  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  ---
  🔧 6. API 구현

  API Route: 멀티모달 생성

  app/api/generate/route.ts:

  import { NextResponse } from 'next/server'
  import { auth } from '@/lib/auth'
  import { prisma } from '@/lib/prisma'
  import { generateWithMultimodal } from '@/services/gemini/multimodal-generator'
  import { PLAN_LIMITS } from '@/constants/multimodal'
  import type { MultimodalGenerateRequest } from '@/types/research'

  export async function POST(request: Request) {
    try {
      // 1. 인증 확인
      const session = await auth()
      if (!session) {
        return NextResponse.json(
          { error: '인증이 필요해요' },
          { status: 401 }
        )
      }

      // 2. 요청 파싱
      const body: MultimodalGenerateRequest = await request.json()
      const { userInput, attachments, useProModel, useResearch, researchModel } = body

      // 3. 사용자 플랜 조회
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { subscription: true }
      })

      const plan = user?.subscription?.plan || 'free'
      const limits = PLAN_LIMITS[plan]

      // 4. 첨부 파일 검증
      if (attachments && attachments.length > 0) {
        // 무료 플랜은 첨부 불가
        if (plan === 'free') {
          return NextResponse.json(
            { error: 'Pro 플랜에서 파일 첨부를 이용할 수 있어요' },
            { status: 403 }
          )
        }

        const imageCount = attachments.filter(a => a.type === 'image').length
        const pdfCount = attachments.filter(a => a.type === 'pdf').length

        // 이미지 개수 검증
        if (imageCount > limits.maxImages) {
          return NextResponse.json(
            { error: `이미지는 최대 ${limits.maxImages}장까지 첨부할 수 있어요` },
            { status: 400 }
          )
        }

        // PDF 개수 검증
        if (pdfCount > limits.maxPdfs) {
          return NextResponse.json(
            { error: `PDF는 최대 ${limits.maxPdfs}개까지 첨부할 수 있어요` },
            { status: 400 }
          )
        }

        // 총 용량 검증
        const totalSize = attachments.reduce((sum, a) => sum + a.size, 0)
        if (totalSize > limits.maxTotalSize) {
          return NextResponse.json(
            { error: `총 용량은 ${limits.maxTotalSize / 1024 / 1024}MB를 초과할 수 없어요` },
            { status: 400 }
          )
        }

        // 개별 파일 크기 검증
        for (const attachment of attachments) {
          const maxSize = attachment.type === 'pdf' ? limits.maxPdfSize : limits.maxImageSize
          if (attachment.size > maxSize) {
            return NextResponse.json(
              { error: `${attachment.name}: 파일이 너무 커요 (최대 ${maxSize / 1024 / 1024}MB)` },
              { status: 400 }
            )
          }
        }
      }

      // 5. 자료 조사 (선택)
      let research
      if (useResearch) {
        const researchResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/research`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: userInput, model: researchModel })
        })
        research = await researchResponse.json()
      }

      // 6. 멀티모달 생성
      const result = await generateWithMultimodal({
        userInput,
        research,
        useProModel,
        attachments
      })

      return NextResponse.json(result)

    } catch (error) {
      console.error('생성 실패:', error)
      return NextResponse.json(
        { error: '프리젠테이션을 생성하지 못했어요. 다시 시도해주세요.' },
        { status: 500 }
      )
    }
  }

  Gemini 멀티모달 서비스

  services/gemini/multimodal-generator.ts:

  import { GoogleGenerativeAI } from '@google/generative-ai'
  import type { AttachmentFile } from '@/types/research'
  import type { ResearchResult } from '@/types/research'
  import type { GeminiPart } from '@/types/research'

  interface MultimodalOptions {
    userInput: string
    research?: ResearchResult
    useProModel: boolean
    attachments?: AttachmentFile[]
    maxSlides?: number
  }

  export async function generateWithMultimodal(options: MultimodalOptions): Promise<string> {
    const { userInput, research, useProModel, attachments, maxSlides = 25 } = options

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({
      model: useProModel ? 'gemini-2.5-pro' : 'gemini-2.5-flash'
    })

    const modelName = useProModel ? 'Pro' : 'Flash'
    console.log(`📝 [Gemini ${modelName}] 멀티모달 콘텐츠 생성 시작`)

    // 1. 프롬프트 구성 (기존 content-generator.ts와 동일)
    let prompt = buildBasePrompt(userInput, research, maxSlides)

    // 2. 멀티모달 파트 구성
    const parts: GeminiPart[] = [{ text: prompt }]

    if (attachments && attachments.length > 0) {
      console.log(`📎 첨부 파일: 이미지 ${attachments.filter(a => a.type === 'image').length}장, PDF ${attachments.filter(a => a.type === 'pdf').length}개`)

      // 이미지/PDF 추가
      for (const attachment of attachments) {
        if (!attachment.base64) {
          console.warn(`⚠️ ${attachment.name}: Base64 데이터 없음, 건너뜀`)
          continue
        }

        parts.push({
          inlineData: {
            mimeType: attachment.mimeType,
            data: attachment.base64
          }
        })
      }

      // 프롬프트에 첨부 파일 안내 추가
      const imageCount = attachments.filter(a => a.type === 'image').length
      const pdfCount = attachments.filter(a => a.type === 'pdf').length

      parts[0].text += `\n\n**📎 첨부된 자료:**\n`
      if (imageCount > 0) {
        parts[0].text += `- 이미지 ${imageCount}장\n`
      }
      if (pdfCount > 0) {
        parts[0].text += `- PDF 문서 ${pdfCount}개\n`
      }
      parts[0].text += `\n위 자료를 참고하여 슬라이드를 구성하세요.\n`
      parts[0].text += `- 이미지가 있으면 imageText, gallery 슬라이드 활용\n`
      parts[0].text += `- PDF 내용이 있으면 해당 정보를 슬라이드에 반영\n`
      parts[0].text += `- 차트나 통계가 있으면 chart, stats 슬라이드로 시각화\n`
    }

    // 3. API 호출 (재시도 로직 포함)
    const MAX_RETRIES = 3
    const RETRY_DELAYS = [2000, 4000, 8000]

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          const delay = RETRY_DELAYS[attempt - 1]
          console.log(`⏳ [Gemini ${modelName}] ${attempt}차 재시도 중... (${delay / 1000}초 대기 후)`)
          await sleep(delay)
        }

        const result = await model.generateContent(parts)
        const content = result.response.text()

        console.log(`✅ [Gemini ${modelName}] 멀티모달 콘텐츠 생성 완료`)
        console.log(`📏 생성된 콘텐츠 길이: ${content.length}자`)

        // 토큰 사용량 로깅
        if (result.response.usageMetadata) {
          const usage = result.response.usageMetadata
          console.log(`💰 [Gemini ${modelName}] 토큰 사용량:`, {
            입력_토큰: usage.promptTokenCount,
            출력_토큰: usage.candidatesTokenCount,
            총_토큰: usage.totalTokenCount,
          })
        }

        return content

      } catch (error: unknown) {
        const isLastAttempt = attempt === MAX_RETRIES
        const errorMessage = error instanceof Error ? error.message : String(error)
        const isServerOverloaded = errorMessage.includes('503') || errorMessage.includes('overloaded')

        console.error(`❌ [Gemini ${modelName}] 생성 실패 (시도 ${attempt + 1}/${MAX_RETRIES + 1}):`, errorMessage)

        if (!isServerOverloaded || isLastAttempt) {
          throw error
        }
      }
    }

    throw new Error('Gemini 요청 실패: 알 수 없는 오류')
  }

  function buildBasePrompt(userInput: string, research: ResearchResult | undefined, maxSlides: number): string {
    // content-generator.ts의 프롬프트 로직 재사용
    // ...
  }

  async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  ---
  📊 7. 최종 비용 구조 (Perplexity 3000자 제한 적용)

  개선된 비용 구조

  | 옵션                        | Perplexity | Gemini | 멀티모달 | 총 원가  | 판매가  | 마진율   |
  |---------------------------|------------|--------|------|-------|------|-------|
  | 기본 Flash                  | ₩0         | ₩7.9   | -    | ₩7.9  | -    | -     |
  | 심층 검색 (Reasoning + Flash) | ₩15.6      | ₩7.9   | -    | ₩23.5 | ₩400 | 94.1% |
  | + 이미지 5장                  | ₩15.6      | ₩8.9   | -    | ₩24.5 | ₩400 | 93.9% |
  | + PDF 10페이지               | ₩15.6      | ₩11.8  | -    | ₩27.4 | ₩400 | 93.2% |
  | 고품질 생성 (Pro)              | ₩0         | ₩38.2  | -    | ₩38.2 | ₩500 | 92.4% |
  | + PDF 10페이지               | ₩0         | ₩54.4  | -    | ₩54.4 | ₩500 | 89.1% |
  | 최고 품질 (Reasoning + Pro)   | ₩15.6      | ₩38.2  | -    | ₩53.8 | ₩900 | 94.0% |
  | + PDF 10페이지               | ₩15.6      | ₩54.4  | -    | ₩70.0 | ₩900 | 92.2% |

  이전 대비 개선 효과

  | 항목            | 이전    | 현재    | 절감 효과        |
  |---------------|-------|-------|--------------|
  | Perplexity 비용 | ₩28.6 | ₩15.6 | ₩13 절감 (46%) |
  | 심층 검색 전체 비용   | ₩36.5 | ₩23.5 | ₩13 절감 (36%) |
  | 마진율 (심층 검색)   | 90.9% | 94.1% | +3.2%p 개선    |

  ---
  ✅ 8. 구현 체크리스트

  Phase 1: Perplexity 프롬프트 개선 (즉시 적용 가능)

  - app/api/research/route.ts 수정
    - System 프롬프트에 3000자 제한 추가
    - max_tokens: 2000 설정
    - 구조화된 응답 포맷 추가 (개요/트렌드/데이터/사례/요약)
  - services/gemini/content-generator.ts 간소화
    - 5000자 축약 로직 제거
    - 코드 단순화
  - docs/COST_AND_REVENUE.md 업데이트
    - Perplexity 비용: ₩28.6 → ₩15.6
    - 전체 비용 재계산

  Phase 2: 멀티모달 타입 및 상수 (1일)

  - types/research.ts 확장
    - AttachmentFile 인터페이스 추가
    - MultimodalGenerateRequest 인터페이스 추가
    - GeminiPart 타입 추가
  - constants/multimodal.ts 생성
    - PLAN_LIMITS 정의
    - ALLOWED_FILE_TYPES 정의
    - FILE_EXTENSIONS 정의

  Phase 3: UI 컴포넌트 (2일)

  - components/input/FileUploader.tsx 구현
    - 파일 선택 및 검증 로직
    - 미리보기 컴포넌트
    - 에러 처리 및 안내 메시지
    - Base64 인코딩
  - shadcn/ui 컴포넌트 추가
    - Card 컴포넌트
    - lucide-react 아이콘

  Phase 4: 백엔드 API (2일)

  - services/gemini/multimodal-generator.ts 구현
    - Google Generative AI SDK 멀티모달 API 활용
    - 파트 구성 로직
    - 재시도 로직
    - 토큰 사용량 로깅
  - app/api/generate/route.ts 수정
    - 첨부 파일 검증 로직
    - 플랜 확인 및 제한 적용
    - 멀티모달 생성 호출

  Phase 5: PDF 페이지 수 검증 (선택 - 1일)

  - PDF.js 통합
    - pdf-lib 또는 pdfjs-dist 패키지 설치
    - 페이지 수 추출 함수 구현
    - FileUploader에 페이지 검증 추가

  Phase 6: 테스트 및 배포 (1일)

  - 플랜별 제한 테스트
    - 무료 플랜: 첨부 차단
    - Pro 플랜: 이미지 5장, PDF 1개 제한
    - Premium 플랜: 이미지 10장, PDF 2개 제한
  - 에러 시나리오 테스트
    - 용량 초과
    - 개수 초과
    - 지원하지 않는 형식
  - 실제 Gemini API 호출 테스트
    - 이미지 첨부 생성
    - PDF 첨부 생성
    - 토큰 사용량 확인

  ---
  🎯 9. 최종 권장사항

  즉시 적용 (High Priority)

  1. ✅ Perplexity 3000자 제한 (1시간 작업)
    - 비용 36% 절감 (₩13/회)
    - 코드 간소화
    - 일관성 향상

  우선 구현 (Medium Priority)

  2. 📎 멀티모달 첨부 기능 (1주일 작업)
    - Pro 플랜 차별화
    - 마진율 89% 이상 유지
    - 사용자 경험 개선

  향후 고려 (Low Priority)

  3. PDF 페이지 수 검증
    - 사용자가 직접 선택하도록 위임 가능
    - 초기 버전에서는 생략 가능

  ---
  구현 순서 제안: Perplexity 개선 (즉시) → 타입/상수 (1일) → UI (2일) → API (2일) → 테스트 (1일) = 총 6일 작업량

  이 설계로 비용은 36% 절감하면서 Pro 플랜 가치를 크게 향상시킬 수 있습니다! 🚀