/**
 * 배포 환경별 텍스트 설정
 *
 * ⚠️ 이 파일은 독립 서비스와 앱인토스 모두에서 사용됩니다.
 * 플랫폼 독립적으로 작성해주세요.
 *
 * @description
 * 배포 환경에 따라 사용자 대면 텍스트를 분기합니다:
 * - standalone: 독립 서비스 (Vercel) - 비즈니스 용어 (간결하고 전문적)
 * - apps-in-toss: 앱인토스 플랫폼 - 해요체 (친근하고 대화형)
 *
 * @example
 * ```tsx
 * import { BUTTON_TEXT } from '@/lib/text-config';
 *
 * <Button>{BUTTON_TEXT.login}</Button>
 * // standalone: "로그인"
 * // apps-in-toss: "로그인해요"
 * ```
 */

// 배포 환경 감지
const DEPLOYMENT_ENV = process.env.NEXT_PUBLIC_DEPLOYMENT_ENV || 'standalone';
const isAppsInToss = DEPLOYMENT_ENV === 'apps-in-toss';

/**
 * 버튼 텍스트 설정
 *
 * 모든 버튼 및 액션 텍스트는 이 객체에서 가져와서 사용합니다.
 */
export const BUTTON_TEXT = {
  // ========================================
  // 인증 (Authentication)
  // ========================================
  login: isAppsInToss ? '로그인해요' : '로그인',
  signup: isAppsInToss ? '회원가입해요' : '회원가입',
  logout: isAppsInToss ? '로그아웃' : '로그아웃',
  loginWithGithub: isAppsInToss ? 'GitHub으로 로그인해요' : 'GitHub 로그인',
  loginWithGoogle: isAppsInToss ? 'Google로 로그인해요' : 'Google 로그인',

  // ========================================
  // 기본 액션 (Actions)
  // ========================================
  save: isAppsInToss ? '저장해요' : '저장',
  create: isAppsInToss ? '생성해요' : '생성',
  edit: isAppsInToss ? '편집해요' : '편집',
  delete: isAppsInToss ? '삭제해요' : '삭제',
  cancel: isAppsInToss ? '취소해요' : '취소',
  confirm: isAppsInToss ? '확인해요' : '확인',
  close: isAppsInToss ? '닫기' : '닫기',
  back: isAppsInToss ? '뒤로가기' : '뒤로',
  next: isAppsInToss ? '다음' : '다음',
  previous: isAppsInToss ? '이전' : '이전',
  submit: isAppsInToss ? '제출해요' : '제출',
  apply: isAppsInToss ? '적용해요' : '적용',
  reset: isAppsInToss ? '초기화해요' : '초기화',
  undo: isAppsInToss ? '되돌려요' : '되돌리기',
  redo: isAppsInToss ? '다시 실행해요' : '다시 실행',

  // ========================================
  // 프리젠테이션 관련 (Presentation)
  // ========================================
  generateSlide: isAppsInToss ? '슬라이드 생성해요' : '슬라이드 생성',
  createNew: isAppsInToss ? '새로 만들어요' : '새로 만들기',
  viewPresentation: isAppsInToss ? '프레젠테이션 보기' : '프레젠테이션 보기',
  editSlide: isAppsInToss ? '슬라이드 편집해요' : '슬라이드 편집',
  addSlide: isAppsInToss ? '슬라이드 추가해요' : '슬라이드 추가',
  deleteSlide: isAppsInToss ? '슬라이드 삭제해요' : '슬라이드 삭제',
  duplicateSlide: isAppsInToss ? '슬라이드 복제해요' : '슬라이드 복제',
  savePresentation: isAppsInToss ? '프레젠테이션 저장해요' : '프레젠테이션 저장',
  exportPPT: isAppsInToss ? 'PPT 내보내요' : 'PPT 내보내기',

  // ========================================
  // CTA (Call-to-Action)
  // ========================================
  startFree: isAppsInToss ? '무료로 시작해요' : '무료 시작',
  tryNow: isAppsInToss ? '지금 시도해요' : '지금 시도',
  learnMore: isAppsInToss ? '자세히 보기' : '자세히 보기',
  viewPricing: isAppsInToss ? '요금제 보기' : '요금제 확인',
  upgrade: isAppsInToss ? '업그레이드해요' : '업그레이드',
  subscribe: isAppsInToss ? '구독해요' : '구독하기',
  purchaseCredits: isAppsInToss ? '크레딧 구매해요' : '크레딧 구매',
  contactUs: isAppsInToss ? '문의해요' : '문의하기',

  // ========================================
  // 네비게이션 (Navigation)
  // ========================================
  home: isAppsInToss ? '홈' : '홈',
  history: isAppsInToss ? '히스토리' : '히스토리',
  profile: isAppsInToss ? '프로필' : '프로필',
  settings: isAppsInToss ? '설정' : '설정',
  myPresentations: isAppsInToss ? '내 프리젠테이션' : '내 프리젠테이션',
  subscription: isAppsInToss ? '구독' : '구독',
  credits: isAppsInToss ? '크레딧' : '크레딧',

  // ========================================
  // 프로필 관련 (Profile)
  // ========================================
  editProfile: isAppsInToss ? '프로필 수정해요' : '프로필 수정',
  changePlan: isAppsInToss ? '플랜 변경해요' : '플랜 변경',

  // ========================================
  // 파일 작업 (File Operations)
  // ========================================
  upload: isAppsInToss ? '업로드해요' : '업로드',
  download: isAppsInToss ? '다운로드해요' : '다운로드',
  selectFile: isAppsInToss ? '파일 선택해요' : '파일 선택',
  removeFile: isAppsInToss ? '파일 제거해요' : '파일 제거',

  // ========================================
  // 검색 및 필터 (Search & Filter)
  // ========================================
  search: isAppsInToss ? '검색해요' : '검색',
  filter: isAppsInToss ? '필터링해요' : '필터',
  sort: isAppsInToss ? '정렬해요' : '정렬',
  clearFilters: isAppsInToss ? '필터 초기화해요' : '필터 초기화',
} as const;

/**
 * 상태 메시지 텍스트
 *
 * 진행 중인 작업이나 상태를 나타내는 텍스트입니다.
 */
export const STATUS_TEXT = {
  // ========================================
  // 로딩 상태 (Loading States)
  // ========================================
  loading: isAppsInToss ? '불러오고 있어요' : '로딩 중',
  generating: isAppsInToss ? '생성하고 있어요' : '생성 중',
  saving: isAppsInToss ? '저장하고 있어요' : '저장 중',
  uploading: isAppsInToss ? '업로드하고 있어요' : '업로드 중',
  processing: isAppsInToss ? '처리하고 있어요' : '처리 중',
  searching: isAppsInToss ? '검색하고 있어요' : '검색 중',

  // ========================================
  // 완료 상태 (Completion States)
  // ========================================
  completed: isAppsInToss ? '완료했어요' : '완료',
  saved: isAppsInToss ? '저장했어요' : '저장됨',
  created: isAppsInToss ? '생성했어요' : '생성됨',
  uploaded: isAppsInToss ? '업로드했어요' : '업로드됨',
  deleted: isAppsInToss ? '삭제했어요' : '삭제됨',

  // ========================================
  // 에러 상태 (Error States)
  // ========================================
  failed: isAppsInToss ? '실패했어요' : '실패',
  error: isAppsInToss ? '오류가 발생했어요' : '오류 발생',
  notFound: isAppsInToss ? '찾지 못했어요' : '찾을 수 없음',
  unauthorized: isAppsInToss ? '권한이 없어요' : '권한 없음',

  // ========================================
  // 알림 메시지 (Notifications)
  // ========================================
  success: isAppsInToss ? '성공했어요' : '성공',
  warning: isAppsInToss ? '주의가 필요해요' : '주의',
  info: isAppsInToss ? '알려드려요' : '안내',
} as const;

/**
 * 확인 다이얼로그 텍스트
 *
 * 사용자 확인이 필요한 액션에 사용되는 메시지입니다.
 */
export const CONFIRM_TEXT = {
  deletePresentation: isAppsInToss
    ? '정말 이 프리젠테이션을 삭제할까요?'
    : '이 프리젠테이션을 삭제하시겠습니까?',
  deleteSlide: isAppsInToss
    ? '정말 이 슬라이드를 삭제할까요?'
    : '이 슬라이드를 삭제하시겠습니까?',
  unsavedChanges: isAppsInToss
    ? '저장하지 않은 변경사항이 있어요. 계속할까요?'
    : '저장하지 않은 변경사항이 있습니다. 계속하시겠습니까?',
  cancelSubscription: isAppsInToss
    ? '정말 구독을 취소할까요?'
    : '구독을 취소하시겠습니까?',
  logout: isAppsInToss
    ? '정말 로그아웃할까요?'
    : '로그아웃하시겠습니까?',
} as const;

/**
 * 플레이스홀더 텍스트
 *
 * 입력 필드의 플레이스홀더로 사용되는 텍스트입니다.
 */
export const PLACEHOLDER_TEXT = {
  searchPlaceholder: isAppsInToss ? '검색어를 입력해주세요' : '검색어 입력',
  titlePlaceholder: isAppsInToss ? '제목을 입력해주세요' : '제목 입력',
  descriptionPlaceholder: isAppsInToss ? '설명을 입력해주세요' : '설명 입력',
  topicPlaceholder: isAppsInToss
    ? '프레젠테이션 주제를 입력해주세요'
    : '프레젠테이션 주제 입력',
  emailPlaceholder: isAppsInToss ? '이메일을 입력해주세요' : '이메일 입력',
} as const;

/**
 * 공지/알림 텍스트
 *
 * 시스템 공지사항이나 중요 알림에 사용되는 텍스트입니다.
 */
export const ANNOUNCEMENT_TEXT = {
  // ========================================
  // 결제 시스템 관련 (Payment System)
  // ========================================
  paymentSystemReady: isAppsInToss
    ? '🎉 결제 시스템이 완성됐어요! 이제 구독과 크레딧 결제가 가능해요.'
    : '🎉 결제 시스템이 완성되었습니다! 이제 구독과 크레딧 결제가 가능합니다.',
  paymentSystemReadyTitle: isAppsInToss
    ? '결제 시스템 오픈!'
    : '결제 시스템 오픈',
  paymentSystemReadyDescription: isAppsInToss
    ? 'Pro 구독으로 광고 없이 더 많은 슬라이드를 만들어보세요!'
    : 'Pro 구독으로 광고 없이 더 많은 슬라이드를 만들어보세요.',
} as const;

/**
 * TypeScript 타입 정의
 */
export type ButtonTextKey = keyof typeof BUTTON_TEXT;
export type StatusTextKey = keyof typeof STATUS_TEXT;
export type ConfirmTextKey = keyof typeof CONFIRM_TEXT;
export type PlaceholderTextKey = keyof typeof PLACEHOLDER_TEXT;
export type AnnouncementTextKey = keyof typeof ANNOUNCEMENT_TEXT;

/**
 * 현재 배포 환경 확인 유틸리티
 */
export const isStandalone = DEPLOYMENT_ENV === 'standalone';
export const isAppsInTossEnv = DEPLOYMENT_ENV === 'apps-in-toss';

/**
 * 배포 환경 이름 가져오기
 */
export function getDeploymentEnvName(): string {
  return isAppsInToss ? '앱인토스' : '독립 서비스';
}
