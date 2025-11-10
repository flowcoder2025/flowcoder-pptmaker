/**
 * 임시저장 타입 정의
 */

export interface Draft {
  id: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface DraftResponse {
  draft: Draft | null;
}

export interface DraftSaveRequest {
  content: string;
}

export interface DraftDeleteResponse {
  success: boolean;
}
