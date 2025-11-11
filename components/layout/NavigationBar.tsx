'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { NAV_HEIGHT } from '@/constants/layout';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, FileText, LogOut, ChevronDown, Home, Sparkles, Star, Gem } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * NavigationBar 컴포넌트
 *
 * @description
 * 웹 서비스 상단 내비게이션 바입니다.
 * 로그인 상태에 따라 다른 UI를 표시합니다.
 * Tailwind CSS 4 스타일을 적용했습니다.
 */

interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { label: '홈', href: '/', icon: Home },
  { label: '만들기', href: '/input', icon: Sparkles },
  { label: '히스토리', href: '/history', icon: FileText },
  { label: '구독', href: '/subscription', icon: Star },
  { label: '크레딧', href: '/credits', icon: Gem },
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
      className="sticky top-0 z-50 border-b shadow-sm bg-background border-border"
      style={{ height: NAV_HEIGHT.desktop }}
    >
      <div
        className="mx-auto px-3 sm:px-8 lg:px-10 h-full flex items-center justify-between"
        style={{ maxWidth: '1200px' }}
      >
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {/* 모바일: 텍스트 2줄 로고 */}
          <div className="flex flex-col leading-none md:hidden bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
            <div className="text-sm font-bold">PPT</div>
            <div className="text-sm font-bold">Maker</div>
          </div>

          {/* 데스크톱: 이미지 + 텍스트 로고 */}
          <img
            src="/PPT_Maker_logo_600600__1_-removebg-preview.png"
            alt="PPT Maker Logo"
            className="h-12 w-12 object-contain hidden md:block"
          />
          <div className="text-lg font-bold hidden md:block bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
            PPT Maker by FlowCoder
          </div>
        </Link>

        {/* 네비게이션 메뉴 */}
        <div className="flex items-center gap-0 sm:gap-2">
          <ul className="flex items-center gap-0 sm:gap-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all font-semibold',
                      'hover:text-primary',
                      active ? 'text-primary' : 'text-muted-foreground'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    {Icon && (
                      <Icon
                        size={18}
                        strokeWidth={2}
                        className="transition-colors"
                      />
                    )}
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* 인증 버튼/메뉴 */}
          <div className="ml-2">
            {status === 'loading' ? (
              <div className="px-4 py-2 rounded-lg bg-secondary">
                <span className="text-sm text-muted-foreground">
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
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary">
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
                    <span className="hidden sm:inline font-medium text-foreground">
                      {session.user?.name || '사용자'}
                    </span>
                    <ChevronDown size={16} className="text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-white border border-border shadow-lg z-[100]"
                >
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium text-foreground">
                      {session.user?.name || '사용자'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className="cursor-pointer hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary transition-colors"
                  >
                    <User size={16} className="mr-2" />
                    프로필
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/history')}
                    className="cursor-pointer hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary transition-colors"
                  >
                    <FileText size={16} className="mr-2" />
                    내 프리젠테이션
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/subscription')}
                    className="cursor-pointer hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary transition-colors"
                  >
                    <Star size={16} className="mr-2" />
                    구독
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/credits')}
                    className="cursor-pointer hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary transition-colors"
                  >
                    <Gem size={16} className="mr-2" />
                    크레딧
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer hover:bg-transparent hover:text-destructive focus:bg-transparent focus:text-destructive transition-colors"
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
                  className="min-w-[80px]"
                >
                  로그인해요
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push('/signup')}
                  className="min-w-[100px]"
                >
                  회원가입해요
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
