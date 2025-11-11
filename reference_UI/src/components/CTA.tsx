import { Button } from "./ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const benefits = [
  "신용카드 불필요",
  "무료 플랜 영구 사용",
  "언제든지 업그레이드 가능",
];

export function CTA() {
  return (
    <section className="py-20 sm:py-32 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-white">
            지금 바로 시작하세요
          </h2>
          <p className="text-lg sm:text-xl text-cyan-100 max-w-2xl mx-auto">
            몇 분 안에 첫 프레젠테이션을 만들어보세요.
            <br />
            회원가입만 하면 바로 시작할 수 있습니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-white text-teal-600 hover:bg-gray-100"
            >
              무료로 시작하기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-white">
                <CheckCircle2 className="h-5 w-5" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}