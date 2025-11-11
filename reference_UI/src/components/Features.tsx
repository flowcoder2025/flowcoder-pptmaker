import { Wand2, Palette, FileText, Zap, Globe, Shield } from "lucide-react";

const features = [
  {
    icon: Wand2,
    title: "AI 자동 디자인",
    description: "주제만 입력하면 AI가 자동으로 레이아웃과 디자인을 생성합니다.",
    color: "from-teal-500 to-cyan-500",
  },
  {
    icon: Palette,
    title: "다양한 템플릿",
    description: "비즈니스, 교육, 마케팅 등 다양한 목적에 맞는 전문 템플릿을 제공합니다.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: FileText,
    title: "스마트 콘텐츠 생성",
    description: "AI가 키워드를 바탕으로 적절한 텍스트와 구조를 자동으로 생성합니다.",
    color: "from-teal-400 to-emerald-500",
  },
  {
    icon: Zap,
    title: "빠른 작업 속도",
    description: "몇 초 만에 프레젠테이션을 생성하고 즉시 편집할 수 있습니다.",
    color: "from-green-500 to-teal-500",
  },
  {
    icon: Globe,
    title: "다국어 지원",
    description: "한국어, 영어 등 다양한 언어로 프레젠테이션을 제작할 수 있습니다.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Shield,
    title: "안전한 저장",
    description: "클라우드에 자동 저장되어 언제 어디서나 안전하게 작업할 수 있습니다.",
    color: "from-cyan-600 to-teal-600",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900">
            강력한 기능들
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            프레젠테이션 제작에 필요한 모든 것을 한 곳에서 해결하세요
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}