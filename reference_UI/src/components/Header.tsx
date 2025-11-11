import { Button } from "./ui/button";
import { Presentation, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500">
              <Presentation className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl text-gray-900">PPT Maker</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              기능
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
              사용방법
            </a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">
              후기
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              요금제
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost">로그인</Button>
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
              무료로 시작하기
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-900" />
            ) : (
              <Menu className="h-6 w-6 text-gray-900" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="flex flex-col gap-4 px-4 py-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              기능
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
              사용방법
            </a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">
              후기
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              요금제
            </a>
            <div className="flex flex-col gap-2 pt-4 border-t">
              <Button variant="ghost">로그인</Button>
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                무료로 시작하기
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}