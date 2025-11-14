/**
 * Footer 컴포넌트
 *
 * @description
 * 전역 푸터 - 라이센스, 회사 정보, 문의 메일 포함
 */

import MaxWidthContainer from './MaxWidthContainer'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-8 mt-auto">
      <MaxWidthContainer>
        <div className="flex flex-col items-center gap-4 text-center">
          {/* 회사명 및 저작권 */}
          <div className="text-sm text-gray-600">
            © {currentYear} <span className="font-semibold">FlowCoder</span>. All rights reserved.
          </div>

          {/* 사업자 정보 */}
          <div className="text-xs text-gray-500">
            주식회사 테크트리아이엔씨 (636-81-00865)
          </div>

          {/* 대표자 및 주소 */}
          <div className="text-xs text-gray-500">
            박현일 | 대구광역시 중구 동덕로 115, 9층 902호 내 512(삼덕동2가)
          </div>

          {/* 문의 메일 */}
          <div className="text-xs text-gray-500">
            문의 사항이 있으신가요?{' '}
            <a
              href="mailto:flowcoder25@gmail.com"
              className="text-blue-600 hover:underline"
            >
              flowcoder25@gmail.com
            </a>
            로 연락해주세요
          </div>

          {/* 연락처 */}
          <div className="text-xs text-gray-500">
            연락처: 010-5444-8597
          </div>

          {/* 추가 링크 */}
          <div className="flex gap-4 text-xs text-gray-500">
            <a href="https://www.flow-coder.com/terms/external/privacy-policy" className="hover:text-gray-700 hover:underline">
              개인정보 처리방침
            </a>
            <span>•</span>
            <a href="https://www.flow-coder.com/terms/external/ppt-maker" className="hover:text-gray-700 hover:underline">
              서비스 이용약관
            </a>
            <span>•</span>
            <a href="https://www.flow-coder.com/terms/external/refund-policy" className="hover:text-gray-700 hover:underline">
              환불약관
            </a>
          </div>
        </div>
      </MaxWidthContainer>
    </footer>
  )
}
