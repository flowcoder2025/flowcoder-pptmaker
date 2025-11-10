'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { NAV_HEIGHT } from '@/constants/layout';
import { TOSS_COLORS } from '@/constants/design';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, FileText, LogOut, ChevronDown } from 'lucide-react';

/**
 * NavigationBar 컴포넌트
 *
 * @description
 * 웹 서비스 상단 내비게이션 바입니다.
 * 로그인 상태에 따라 다른 UI를 표시합니다.
 * TDS (Toss Design System) 스타일을 적용했습니다.
 */

interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: '홈', href: '/', icon: '🏠' },
  { label: '만들기', href: '/input', icon: '✨' },
  { label: '구독', href: '/subscription', icon: '⭐' },
  { label: '크레딧', href: '/credits', icon: '💎' },
];

export default function NavigationBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  // 네비게이션 바를 숨길 페이지 목록
  const hideNav =
    pathname === '/viewer' ||
    pathname === '/editor' ||
    pathname === '/dev-tools';

  if (hideNav) {
    return null;
  }

  // 현재 활성 경로 확인
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href;
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b shadow-sm"
      style={{
        height: NAV_HEIGHT.desktop,
        backgroundColor: TOSS_COLORS.background,
        borderColor: TOSS_COLORS.muted,
      }}
    >
      <div
        className="mx-auto px-5 sm:px-8 lg:px-10 h-full flex items-center justify-between"
        style={{ maxWidth: '1200px' }}
      >
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {/* 모바일: 텍스트 2줄 로고 */}
          <div
            className="flex flex-col leading-none md:hidden"
            style={{
              background: `linear-gradient(135deg, ${TOSS_COLORS.primary} 0%, ${TOSS_COLORS.secondary} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            <div className="text-lg font-bold">PPT</div>
            <div className="text-lg font-bold">Maker</div>
          </div>

          {/* 데스크톱: 이미지 + 텍스트 로고 */}
          <img
            src="/PPT_Maker_logo_600600__1_-removebg-preview.png"
            alt="PPT Maker Logo"
            className="h-12 w-12 object-contain hidden md:block"
          />
          <div
            className="text-lg font-bold hidden md:block"
            style={{
              background: `linear-gradient(135deg, ${TOSS_COLORS.primary} 0%, ${TOSS_COLORS.secondary} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            PPT Maker by FlowCoder
          </div>
        </Link>

        {/* 네비게이션 메뉴 */}
        <div className="flex items-center gap-1 sm:gap-2">
          <ul className="flex items-center gap-1 sm:gap-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all',
                      'hover:bg-opacity-10',
                      active ? 'font-semibold' : ''
                    )}
                    style={{
                      backgroundColor: active ? `${TOSS_COLORS.primary}15` : 'transparent',
                      color: active ? TOSS_COLORS.primary : TOSS_COLORS.textSecondary,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = `${TOSS_COLORS.surface}`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.icon && <span className="text-lg">{item.icon}</span>}
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* 인증 버튼/메뉴 */}
          <div className="ml-2">
            {status === 'loading' ? (
              <div
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: TOSS_COLORS.surface }}
              >
                <span className="text-sm" style={{ color: TOSS_COLORS.textSecondary }}>
                  ...
                </span>
              </div>
            ) : session ? (
              // 로그인 시: 유저 메뉴
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: `${TOSS_COLORS.primary}20`,
                        color: TOSS_COLORS.primary,
                      }}
                    >
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt="프로필"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User size={18} />
                      )}
                    </div>
                    <span className="hidden sm:inline font-medium" style={{ color: TOSS_COLORS.text }}>
                      {session.user?.name || '사용자'}
                    </span>
                    <ChevronDown size={16} style={{ color: TOSS_COLORS.textSecondary }} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-white border shadow-lg"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: TOSS_COLORS.muted,
                    zIndex: 100,
                  }}
                >
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium" style={{ color: TOSS_COLORS.text }}>
                      {session.user?.name || '사용자'}
                    </p>
                    <p className="text-xs" style={{ color: TOSS_COLORS.textSecondary }}>
                      {session.user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className="cursor-pointer"
                  >
                    <User size={16} className="mr-2" />
                    프로필
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/history')}
                    className="cursor-pointer"
                  >
                    <FileText size={16} className="mr-2" />
                    내 프리젠테이션
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer"
                    style={{ color: TOSS_COLORS.error }}
                  >
                    <LogOut size={16} className="mr-2" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // 미로그인 시: 로그인/회원가입 버튼
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/login')}
                >
                  로그인
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push('/signup')}
                  style={{
                    backgroundColor: TOSS_COLORS.primary,
                    color: '#FFFFFF',
                  }}
                >
                  회원가입
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

