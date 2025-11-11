import { Presentation, Mail, Github, Twitter } from "lucide-react";

const footerLinks = {
  product: {
    title: "제품",
    links: [
      { name: "기능", href: "#features" },
      { name: "요금제", href: "#pricing" },
      { name: "템플릿", href: "#templates" },
      { name: "사용 사례", href: "#use-cases" },
    ],
  },
  company: {
    title: "회사",
    links: [
      { name: "소개", href: "#about" },
      { name: "블로그", href: "#blog" },
      { name: "채용", href: "#careers" },
      { name: "문의", href: "#contact" },
    ],
  },
  resources: {
    title: "리소스",
    links: [
      { name: "도움말", href: "#help" },
      { name: "가이드", href: "#guide" },
      { name: "API", href: "#api" },
      { name: "상태", href: "#status" },
    ],
  },
  legal: {
    title: "법률",
    links: [
      { name: "개인정보처리방침", href: "#privacy" },
      { name: "이용약관", href: "#terms" },
      { name: "쿠키정책", href: "#cookies" },
    ],
  },
};

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500">
                <Presentation className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl text-white">PPT Maker</span>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              AI로 만드는 전문가급 프레젠테이션
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.values(footerLinks).map((section, index) => (
            <div key={index}>
              <h3 className="text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2025 PPT Maker. All rights reserved.
          </p>
          <p className="text-sm text-gray-400">
            Made with ❤️ in Korea
          </p>
        </div>
      </div>
    </footer>
  );
}