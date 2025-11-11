import { Edit, Sparkles, Download, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Edit,
    number: "01",
    title: "주제 입력",
    description: "프레젠테이션의 주제와 목적을 간단히 입력하세요.",
    color: "from-teal-500 to-cyan-500",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "AI 생성",
    description: "AI가 자동으로 콘텐츠와 디자인을 생성합니다.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Download,
    number: "03",
    title: "다운로드",
    description: "완성된 프레젠테이션을 다운로드하거나 편집하세요.",
    color: "from-blue-500 to-teal-500",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-32 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900">
            간단한 3단계
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            누구나 쉽게 전문가급 프레젠테이션을 만들 수 있습니다
          </p>
        </div>

        <div className="relative">
          {/* Desktop connector line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-200 via-cyan-200 to-blue-200 -translate-y-1/2" />
          
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="relative bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-white border-4 border-gray-50 flex items-center justify-center shadow-sm">
                    <span className={`bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}>
                      {step.number}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${step.color} mb-6`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                )}

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center py-4">
                    <ArrowRight className="h-6 w-6 text-gray-400 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}