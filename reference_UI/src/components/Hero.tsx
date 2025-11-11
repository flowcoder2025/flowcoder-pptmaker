import { Button } from "./ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cyan-50 to-white py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 text-cyan-700 border border-cyan-200">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">AI 기반 프레젠테이션 제작</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-gray-900">
                몇 분 만에
                <br />
                <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  전문가급 PPT
                </span>
                를
                <br />
                만들어보세요
              </h1>
              <p className="text-lg text-gray-600 max-w-xl">
                AI가 자동으로 디자인하고, 내용을 구성합니다. 
                아이디어만 입력하면 몇 분 안에 완성된 프레젠테이션을 받아보세요.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
              >
                무료로 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                데모 보기
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="space-y-1">
                <div className="text-2xl text-gray-900">100,000+</div>
                <div className="text-sm text-gray-600">활성 사용자</div>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div className="space-y-1">
                <div className="text-2xl text-gray-900">500,000+</div>
                <div className="text-sm text-gray-600">제작된 프레젠테이션</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-2xl blur-3xl opacity-20" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              <ImageWithFallback
                src="https://images.unsplash.com/flagged/photo-1568187113326-974ff6d0c6b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVzZW50YXRpb24lMjBzbGlkZXMlMjBtb2Rlcm58ZW58MXx8fHwxNzYyODM0MDYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="PPT Maker 데모"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}