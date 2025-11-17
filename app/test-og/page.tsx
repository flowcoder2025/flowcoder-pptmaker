export default function TestOGPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Open Graph 이미지 테스트</h1>

      <div className="space-y-6">
        <section className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">1. 이미지 직접 확인</h2>
          <img
            src="/og-image.png"
            alt="OG Image"
            className="border max-w-2xl"
          />
        </section>

        <section className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">2. 메타 태그 정보</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
{`<meta property="og:image" content="https://pptmaker.flowcoder.co.kr/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:alt" content="PPT Maker - AI 프리젠테이션 자동 생성" />`}
          </pre>
        </section>

        <section className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">3. 테스트 도구</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <a
                href="https://www.opengraph.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Open Graph 검사기
              </a>
            </li>
            <li>
              <a
                href="https://cards-dev.twitter.com/validator"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Twitter Card Validator
              </a>
            </li>
            <li>
              <a
                href="https://developers.facebook.com/tools/debug/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Facebook Sharing Debugger
              </a>
            </li>
          </ul>
        </section>

        <section className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">4. 문제 해결 체크리스트</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>✅ 이미지 파일 존재 확인 (public/og-image.png)</li>
            <li>✅ 이미지 크기 1200x630 확인</li>
            <li>✅ 절대 URL 사용 (https://pptmaker.flowcoder.co.kr/og-image.png)</li>
            <li>✅ 메타데이터 타입 명시 (image/png)</li>
            <li>⏳ 배포 후 SNS 크롤러 캐시 클리어 필요</li>
          </ul>
        </section>

        <section className="border p-4 rounded-lg bg-yellow-50">
          <h2 className="text-xl font-semibold mb-4">⚠️ SNS 캐시 클리어 방법</h2>
          <div className="space-y-3">
            <div>
              <strong>Threads:</strong>
              <p className="text-sm text-gray-600">
                Facebook Sharing Debugger에서 URL 입력 후 &quot;새로운 스크래핑 정보 가져오기&quot; 클릭
              </p>
            </div>
            <div>
              <strong>Twitter:</strong>
              <p className="text-sm text-gray-600">
                Card Validator에서 URL 입력 후 Preview 확인
              </p>
            </div>
            <div>
              <strong>일반적인 방법:</strong>
              <p className="text-sm text-gray-600">
                URL 파라미터 추가 (예: ?v=2) 후 다시 공유
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
