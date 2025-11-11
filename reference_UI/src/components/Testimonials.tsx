import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const testimonials = [
  {
    name: "김민지",
    role: "마케팅 매니저",
    company: "테크스타트업",
    content: "PPT Maker 덕분에 프레젠테이션 준비 시간이 80% 단축되었습니다. 이제 내용에만 집중할 수 있어요.",
    rating: 5,
    avatar: "KM",
  },
  {
    name: "이준호",
    role: "대학생",
    company: "서울대학교",
    content: "과제 발표 준비할 때 정말 유용해요. 디자인 걱정 없이 전문적인 PPT를 만들 수 있습니다.",
    rating: 5,
    avatar: "LJ",
  },
  {
    name: "박서연",
    role: "영업 이사",
    company: "글로벌코퍼레이션",
    content: "클라이언트 미팅 자료를 빠르게 준비할 수 있어서 너무 좋습니다. 템플릿도 다양하고 퀄리티가 뛰어나요.",
    rating: 5,
    avatar: "PS",
  },
  {
    name: "최현우",
    role: "프로덕트 매니저",
    company: "IT기업",
    content: "팀원들과 공유하기도 쉽고, 수정도 간편합니다. 업무 효율이 크게 향상되었어요.",
    rating: 5,
    avatar: "CH",
  },
  {
    name: "정수진",
    role: "강사",
    company: "교육스타트업",
    content: "강의 자료를 만들 때 항상 사용합니다. AI가 내용을 정리해주니 시간이 많이 절약돼요.",
    rating: 5,
    avatar: "JS",
  },
  {
    name: "강태영",
    role: "컨설턴트",
    company: "전략컨설팅",
    content: "프로페셔널한 프레젠테이션을 빠르게 만들 수 있어서 고객 미팅에 자신감이 생겼습니다.",
    rating: 5,
    avatar: "KT",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900">
            사용자 후기
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            이미 많은 사용자들이 PPT Maker로 시간을 절약하고 있습니다
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:border-gray-300 transition-colors"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
                    {testimonial.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} · {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}