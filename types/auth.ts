/**
 * 토스 로그인 요청 데이터
 */
export interface LoginRequest {
  /** 인가 코드 */
  authorizationCode: string;
  /** 리퍼러 정보 */
  referrer: string;
}

/**
 * 토큰 리프레시 요청
 */
export interface RefreshTokenRequest {
  /** 리프레시 토큰 */
  refreshToken: string;
}

/**
 * AccessToken으로 로그아웃
 */
export type LogoutByAccessTokenRequest = Record<string, never>;

/**
 * UserKey로 로그아웃
 */
export interface LogoutByUserKeyRequest {
  /** 사용자 고유 키 */
  userKey: string;
}

/**
 * 토큰 응답 데이터
 */
export interface TokenResponse {
  data?: {
    success?: {
      /** 액세스 토큰 (1시간 유효) */
      accessToken: string;
      /** 리프레시 토큰 (30일 유효) */
      refreshToken: string;
    };
  };
}

/**
 * 로그아웃 결과
 */
export type LogoutResult = { ok: boolean } | null;

/**
 * 사용자 정보
 */
export interface UserInfo {
  /** 사용자 고유 키 */
  userKey: string;
  /** 사용자 이름 */
  userName: string;
  /** 이메일 (선택) */
  userEmail?: string;
  /** CI (고유 식별자) */
  userCI?: string;
}

/**
 * 인증 상태
 */
export interface AuthState {
  /** 액세스 토큰 */
  accessToken: string | null;
  /** 리프레시 토큰 */
  refreshToken: string | null;
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 로그인 함수 */
  login: () => Promise<void>;
  /** 토큰 재발급 함수 */
  refreshAccessToken: () => Promise<void>;
  /** AccessToken으로 로그아웃 */
  logoutByAccessToken: () => Promise<LogoutResult>;
  /** UserKey로 로그아웃 */
  logoutByUserKey: (userKey: string) => Promise<LogoutResult>;
}
