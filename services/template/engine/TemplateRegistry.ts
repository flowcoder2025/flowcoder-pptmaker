/**
 * 템플릿 레지스트리
 *
 * 템플릿 등록, 조회, 관리 시스템
 * Map 기반으로 효율적인 템플릿 저장 및 검색 제공
 */

import type { SlideTemplate } from './types';

/**
 * TemplateRegistry 클래스
 *
 * 모든 슬라이드 템플릿을 관리하는 중앙 저장소
 */
export class TemplateRegistry {
  /**
   * 템플릿 저장소 (Map)
   * Key: 템플릿 ID
   * Value: SlideTemplate 인스턴스
   */
  private templates: Map<string, SlideTemplate>;

  /**
   * 생성자
   */
  constructor() {
    this.templates = new Map<string, SlideTemplate>();
  }

  /**
   * 템플릿 등록
   *
   * @param template - 등록할 템플릿
   * @throws {Error} - 템플릿 ID가 비어있을 경우
   */
  register(template: SlideTemplate): void {
    // 유효성 검사
    if (!template.id || template.id.trim() === '') {
      throw new Error('템플릿 ID는 필수입니다.');
    }

    // 중복 등록 체크
    if (this.templates.has(template.id)) {
      console.warn(`⚠️ 템플릿이 이미 등록되어 있습니다: ${template.id}`);
      console.warn('기존 템플릿을 덮어씁니다.');
    }

    // 템플릿 등록
    this.templates.set(template.id, template);
    console.log(`✅ 템플릿 등록 완료: ${template.name} (${template.id})`);
  }

  /**
   * 템플릿 제거
   *
   * @param templateId - 제거할 템플릿 ID
   * @returns 제거 성공 여부
   */
  unregister(templateId: string): boolean {
    const existed = this.templates.has(templateId);

    if (existed) {
      this.templates.delete(templateId);
      console.log(`🗑️ 템플릿 제거 완료: ${templateId}`);
    } else {
      console.warn(`⚠️ 템플릿을 찾을 수 없습니다: ${templateId}`);
    }

    return existed;
  }

  /**
   * 템플릿 조회
   *
   * @param templateId - 조회할 템플릿 ID
   * @returns 템플릿 인스턴스 또는 null
   */
  get(templateId: string): SlideTemplate | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * 템플릿 존재 여부 확인
   *
   * @param templateId - 확인할 템플릿 ID
   * @returns 존재 여부
   */
  has(templateId: string): boolean {
    return this.templates.has(templateId);
  }

  /**
   * 모든 템플릿 조회
   *
   * @returns 모든 템플릿 배열
   */
  getAll(): SlideTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * 무료 템플릿만 조회
   *
   * @returns 무료 템플릿 배열
   */
  getFree(): SlideTemplate[] {
    return this.getAll().filter(template => template.category === 'free');
  }

  /**
   * 프리미엄 템플릿만 조회
   *
   * @returns 프리미엄 템플릿 배열
   */
  getPremium(): SlideTemplate[] {
    return this.getAll().filter(template => template.category === 'premium');
  }

  /**
   * 등록된 템플릿 개수
   *
   * @returns 템플릿 개수
   */
  get count(): number {
    return this.templates.size;
  }

  /**
   * 모든 템플릿 제거
   */
  clear(): void {
    const count = this.templates.size;
    this.templates.clear();
    console.log(`🗑️ 모든 템플릿 제거 완료: ${count}개`);
  }

  /**
   * 템플릿 ID 목록 조회
   *
   * @returns 템플릿 ID 배열
   */
  getIds(): string[] {
    return Array.from(this.templates.keys());
  }

  /**
   * 템플릿 정보 출력 (디버깅용)
   */
  printInfo(): void {
    console.log('\n📋 템플릿 레지스트리 정보');
    console.log(`총 ${this.count}개의 템플릿 등록됨\n`);

    const freeTemplates = this.getFree();
    const premiumTemplates = this.getPremium();

    console.log(`🆓 무료 템플릿: ${freeTemplates.length}개`);
    freeTemplates.forEach(t => {
      console.log(`  - ${t.name} (${t.id})`);
    });

    console.log(`\n💎 프리미엄 템플릿: ${premiumTemplates.length}개`);
    premiumTemplates.forEach(t => {
      console.log(`  - ${t.name} (${t.id}) - ${t.price}원`);
    });

    console.log('');
  }
}
