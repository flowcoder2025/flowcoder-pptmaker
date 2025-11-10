# 개발 스크립트

이 디렉토리는 개발 워크플로우를 자동화하는 스크립트를 포함합니다.

---

## commit-with-release-notes.sh

릴리즈 노트 업데이트를 포함한 커밋을 한 번의 푸시로 완료하는 스크립트입니다.

### 기존 워크플로우의 문제점

**비효율적인 2단계 푸시**:
```bash
# 1. 코드 커밋 및 푸시
git add .
git commit -m "feat: 새 기능 추가"
git push

# 2. 커밋 해시 확인
HASH=$(git rev-parse --short=7 HEAD)

# 3. RELEASE_NOTES.md 수정 (커밋 해시 포함)
vim RELEASE_NOTES.md

# 4. 릴리즈 노트 커밋 및 푸시 (또 푸시!)
git add RELEASE_NOTES.md
git commit -m "docs: RELEASE_NOTES.md 업데이트"
git push  # ❌ 두 번째 푸시
```

### 개선된 워크플로우

**한 번의 푸시로 완료**:
```bash
./scripts/commit-with-release-notes.sh \
  "feat: 새 기능 추가" \
  "새로운 기능 설명" \
  "- 세부 내용 1\n- 세부 내용 2"
```

**결과**: ✅ 커밋 1개 + 푸시 1번

---

## 사용법

### 기본 사용

```bash
./scripts/commit-with-release-notes.sh \
  "커밋 메시지" \
  "릴리즈 노트 제목" \
  ["세부 내용"]  # 선택사항
```

### 예시 1: 새 기능 추가 (세부 내용 포함)

```bash
./scripts/commit-with-release-notes.sh \
  "feat: 프로필 페이지 통계 연결" \
  "프로필 페이지 통계 실제 데이터 연결" \
  "- /api/user/stats: 모든 프리젠테이션 메타데이터 집계\n- 총 슬라이드 수, 사용한 크레딧 표시"
```

**생성 결과** (RELEASE_NOTES.md):
```markdown
### ✨ Features

#### 2025-11-08
- **프로필 페이지 통계 실제 데이터 연결** (a1b2c3d)
  - /api/user/stats: 모든 프리젠테이션 메타데이터 집계
  - 총 슬라이드 수, 사용한 크레딧 표시
```

### 예시 2: 버그 수정 (세부 내용 없음)

```bash
./scripts/commit-with-release-notes.sh \
  "fix: 로그인 에러 수정" \
  "NextAuth 세션 쿠키 설정 수정"
```

**생성 결과** (RELEASE_NOTES.md):
```markdown
### 🐛 Fixes

#### 2025-11-08
- **NextAuth 세션 쿠키 설정 수정** (d4e5f6g)
```

### 예시 3: 문서 업데이트

```bash
./scripts/commit-with-release-notes.sh \
  "docs: API 문서 추가" \
  "프리젠테이션 API 엔드포인트 문서 작성"
```

**생성 결과** (RELEASE_NOTES.md):
```markdown
### 📝 Documentation

#### 2025-11-08
- **프리젠테이션 API 엔드포인트 문서 작성** (h7i8j9k)
```

---

## 스크립트 동작 방식

### 1. 커밋 타입 자동 감지

커밋 메시지의 prefix를 기반으로 RELEASE_NOTES.md의 카테고리를 자동 결정합니다.

| Prefix | 카테고리 | 아이콘 |
|--------|----------|--------|
| `feat:` | Features | ✨ |
| `fix:` | Fixes | 🐛 |
| `style:`, `ui:` | UI/UX | 🎨 |
| `docs:` | Documentation | 📝 |
| `refactor:`, `chore:`, `build:` | Technical | 🔧 |

### 2. 워크플로우

```
1. RELEASE_NOTES.md를 제외한 모든 변경사항 스테이징
   ↓
2. 임시 커밋 생성 (커밋 해시 획득용)
   ↓
3. 커밋 해시 추출 (7자리 단축형)
   ↓
4. RELEASE_NOTES.md 파싱 및 업데이트
   - 커밋 타입에 따른 카테고리 결정
   - 당일 날짜 헤더 확인/생성
   - 릴리즈 노트 항목 삽입
   ↓
5. git commit --amend (커밋 병합)
   ↓
6. git push (한 번만!)
```

### 3. 에러 처리

- **백업 파일**: `RELEASE_NOTES.md.bak` 자동 생성
- **삽입 실패 시**: 백업 파일로 복구
- **잘못된 커밋 타입**: Technical 카테고리로 분류 (경고 표시)

---

## 주의사항

### 1. 커밋 메시지 형식

**올바른 형식**:
```bash
"feat: 기능 설명"
"fix: 버그 설명"
"docs: 문서 설명"
```

**잘못된 형식** (경고 발생):
```bash
"새 기능 추가"  # prefix 없음 → Technical로 분류
```

### 2. 세부 내용 포맷

**올바른 형식**:
```bash
"- 항목 1\n- 항목 2"  # \n으로 줄바꿈
```

**잘못된 형식**:
```bash
"항목 1, 항목 2"  # 줄바꿈 없음
```

### 3. Git 상태 확인

**스크립트 실행 전 확인**:
```bash
# 브랜치 확인
git branch
# → main 브랜치에서 실행 권장

# 변경사항 확인
git status
# → RELEASE_NOTES.md 외의 변경사항이 있어야 함
```

---

## 트러블슈팅

### 문제 1: Permission denied

**증상**:
```bash
./scripts/commit-with-release-notes.sh: Permission denied
```

**해결**:
```bash
chmod +x scripts/commit-with-release-notes.sh
```

### 문제 2: 스크립트가 변경사항을 찾지 못함

**증상**:
```bash
On branch main
nothing to commit, working tree clean
```

**원인**: 커밋할 변경사항이 없음

**해결**: 코드를 먼저 수정하고 스크립트 실행

### 문제 3: 릴리즈 노트 삽입 실패

**증상**:
```bash
❌ 오류: 릴리즈 노트 삽입에 실패했습니다.
```

**원인**: RELEASE_NOTES.md 형식이 예상과 다름

**해결**:
1. `RELEASE_NOTES.md.bak` 확인 (자동 백업)
2. RELEASE_NOTES.md 형식 확인
3. `### ✨ Features` 등 섹션이 존재하는지 확인

---

## 고급 사용

### 멀티라인 세부 내용

```bash
./scripts/commit-with-release-notes.sh \
  "feat: 복잡한 기능" \
  "기능 설명" \
  "- 첫 번째 항목
  - 두 번째 항목
  - 세 번째 항목"
```

### 환경 변수로 브랜치 지정

스크립트는 기본적으로 `main` 브랜치로 푸시합니다. 다른 브랜치를 사용하려면 스크립트 수정 필요:

```bash
# 스크립트 내부 수정
git push origin develop  # main → develop
```

---

## 참고 자료

- **[상위 문서](../CLAUDE.md)**: 프로젝트 전체 가이드
- **[RELEASE_NOTES.md](../RELEASE_NOTES.md)**: 릴리즈 노트 예시
- **[Git 커밋 규칙](https://www.conventionalcommits.org/)**: Conventional Commits 규칙

---

**마지막 업데이트**: 2025-11-10
**변경 이력**: commit-with-release-notes.sh 스크립트 추가
