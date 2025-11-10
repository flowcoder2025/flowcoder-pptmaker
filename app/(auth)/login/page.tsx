'use client';

import { Suspense, useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import { TOSS_COLORS } from '@/constants/design';
import { Github } from 'lucide-react';
import { toast } from 'sonner';

/**
 * 로그인 페이지 컨텐츠 (Suspense 내부)
 */
function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // URL에서 에러 메시지 확인 및 표시
  useEffect(() => {
    if (error === 'ProviderMismatch' && message) {
      toast.error(decodeURIComponent(message));
      // URL에서 에러 파라미터 제거
      router.replace('/login');
    } else if (error) {
      toast.error('로그인 중 문제가 발생했어요');
      router.replace('/login');
    }
  }, [error, message, router]);

  // 이메일 로그인
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('로그인했어요!');
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      toast.error('로그인 중 문제가 발생했어요');
    } finally {
      setIsLoading(false);
    }
  };

  // OAuth 로그인
  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl });
    } catch (error) {
      toast.error('로그인 중 문제가 발생했어요');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: TOSS_COLORS.background }}>
      <MaxWidthContainer className="py-8 w-full">
        <Card className="max-w-md mx-auto p-6 sm:p-8 w-full">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: TOSS_COLORS.text }}
            >
              로그인해요
            </h1>
            <p style={{ color: TOSS_COLORS.textSecondary }}>
              AI 프리젠테이션을 만들어보세요
            </p>
          </div>

          {/* 이메일 로그인 폼 */}
          <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
            <div>
              <Label htmlFor="email" style={{ color: TOSS_COLORS.text }}>
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password" style={{ color: TOSS_COLORS.text }}>
                비밀번호
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력해주세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              style={{
                backgroundColor: TOSS_COLORS.primary,
                color: '#FFFFFF',
              }}
            >
              {isLoading ? '로그인하고 있어요...' : '로그인해요'}
            </Button>
          </form>

          {/* 구분선 */}
          <div className="relative mb-6">
            <Separator />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <span
                className="text-sm"
                style={{ color: TOSS_COLORS.textSecondary }}
              >
                또는
              </span>
            </div>
          </div>

          {/* OAuth 로그인 버튼 */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthLogin('github')}
              disabled={isLoading}
            >
              <Github className="mr-2" size={20} />
              GitHub으로 계속해요
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
            >
              <svg className="mr-2" width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 계속해요
            </Button>
          </div>

          {/* 회원가입 링크 */}
          <div className="text-center">
            <p
              className="text-sm"
              style={{ color: TOSS_COLORS.textSecondary }}
            >
              계정이 없으신가요?{' '}
              <Link
                href="/signup"
                className="font-semibold hover:underline"
                style={{ color: TOSS_COLORS.primary }}
              >
                회원가입해요
              </Link>
            </p>
          </div>
        </Card>
      </MaxWidthContainer>
    </div>
  );
}

/**
 * 로그인 페이지
 *
 * @description
 * OAuth (GitHub, Google) + 이메일/패스워드 로그인을 지원합니다.
 * TDS 스타일 디자인을 적용했습니다.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: TOSS_COLORS.background }}>
        <div className="text-center">
          <p style={{ color: TOSS_COLORS.textSecondary }}>
            불러오고 있어요...
          </p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
