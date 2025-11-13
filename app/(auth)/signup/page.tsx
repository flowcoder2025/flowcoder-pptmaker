'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import { toast } from 'sonner';
import { BUTTON_TEXT } from '@/lib/text-config';

/**
 * 회원가입 페이지
 *
 * @description
 * 이메일/패스워드로 회원가입합니다.
 * TDS 스타일 디자인을 적용했습니다.
 */
export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 유효성 검사
    if (formData.password !== formData.confirmPassword) {
      toast.error('비밀번호가 일치하지 않아요');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('비밀번호는 최소 6자 이상이어야 해요');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || '회원가입 중 문제가 발생했어요');
        return;
      }

      toast.success(data.message);
      router.push('/login');
    } catch {
      toast.error('회원가입 중 문제가 발생했어요. 다시 시도해주세요');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <MaxWidthContainer className="py-8 w-full">
        <Card className="max-w-md mx-auto p-6 sm:p-8 w-full">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-foreground">
              회원가입
            </h1>
            <p className="text-muted-foreground">
              AI 프리젠테이션을 무료로 시작해보세요
            </p>
          </div>

          {/* 회원가입 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-foreground">
                이름 (선택)
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="홍길동"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                className="mt-1"
              />
              <p className="text-xs mt-1 text-muted-foreground">
                이름을 입력하지 않으면 이메일 앞부분을 사용해요
              </p>
            </div>

            <div>
              <Label htmlFor="email" className="text-foreground">
                이메일
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-foreground">
                비밀번호
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="최소 6자 이상"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-foreground">
                비밀번호 확인
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력해주세요"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-white"
              disabled={isLoading}
            >
              {isLoading ? '가입하고 있어요...' : BUTTON_TEXT.signup}
            </Button>
          </form>

          {/* 로그인 링크 */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <Link
                href="/login"
                className="font-semibold hover:underline text-primary"
              >
                {BUTTON_TEXT.login}
              </Link>
            </p>
          </div>

          {/* 이용약관 및 개인정보처리방침 */}
          <div className="text-center mt-6">
            <p className="text-xs text-muted-foreground">
              회원가입 시{' '}
              <button
                className="underline text-muted-foreground"
                onClick={() => toast.info('이용약관 페이지 준비 중이에요')}
              >
                이용약관
              </button>
              {' '}및{' '}
              <button
                className="underline text-muted-foreground"
                onClick={() => toast.info('개인정보처리방침 페이지 준비 중이에요')}
              >
                개인정보처리방침
              </button>
              에 동의하는 것으로 간주해요
            </p>
          </div>
        </Card>
      </MaxWidthContainer>
    </div>
  );
}
