#!/bin/bash
# 릴리즈 노트 자동 업데이트 커밋 스크립트
# 사용법: ./scripts/commit-with-release-notes.sh "커밋 메시지" "릴리즈 노트 제목" ["세부 내용"]
#
# 예시:
#   ./scripts/commit-with-release-notes.sh "feat: 새 기능 추가" "새로운 기능 설명" "세부 내용 1\n세부 내용 2"

set -e

# 인자 확인
if [ $# -lt 2 ]; then
    echo "사용법: $0 \"커밋 메시지\" \"릴리즈 노트 제목\" [\"세부 내용\"]"
    echo ""
    echo "예시:"
    echo "  $0 \"feat: 새 기능 추가\" \"새로운 기능 설명\" \"세부 내용 1\n세부 내용 2\""
    echo "  $0 \"fix: 버그 수정\" \"버그 수정 설명\""
    exit 1
fi

COMMIT_MSG="$1"
RELEASE_TITLE="$2"
RELEASE_DETAILS="${3:-}"  # 선택사항

# 1. 변경사항 스테이징 (RELEASE_NOTES.md 제외)
git add -A
git reset RELEASE_NOTES.md 2>/dev/null || true

# 2. 임시 커밋 (해시를 얻기 위해)
git commit -m "$COMMIT_MSG"

# 3. 커밋 해시 가져오기 (단축형 7자리)
COMMIT_HASH=$(git rev-parse --short=7 HEAD)
echo "생성된 커밋 해시: $COMMIT_HASH"

# 4. RELEASE_NOTES.md 업데이트

# 4-1. 커밋 타입에 따라 카테고리 결정
CATEGORY=""
CATEGORY_ICON=""
if [[ $COMMIT_MSG == feat:* ]]; then
    CATEGORY="Features"
    CATEGORY_ICON="✨"
elif [[ $COMMIT_MSG == fix:* ]]; then
    CATEGORY="Fixes"
    CATEGORY_ICON="🐛"
elif [[ $COMMIT_MSG == style:* ]] || [[ $COMMIT_MSG == ui:* ]]; then
    CATEGORY="UI/UX"
    CATEGORY_ICON="🎨"
elif [[ $COMMIT_MSG == docs:* ]]; then
    CATEGORY="Documentation"
    CATEGORY_ICON="📝"
elif [[ $COMMIT_MSG == refactor:* ]] || [[ $COMMIT_MSG == chore:* ]] || [[ $COMMIT_MSG == build:* ]]; then
    CATEGORY="Technical"
    CATEGORY_ICON="🔧"
else
    echo "⚠️  경고: 커밋 타입을 인식할 수 없습니다. Technical 카테고리로 분류합니다."
    CATEGORY="Technical"
    CATEGORY_ICON="🔧"
fi

echo "📂 카테고리: $CATEGORY_ICON $CATEGORY"

# 4-2. 날짜 헤더 생성
TODAY=$(date +%Y-%m-%d)
DATE_HEADER="#### $TODAY"

# 4-3. 릴리즈 노트 항목 생성
RELEASE_ENTRY="- **$RELEASE_TITLE** ($COMMIT_HASH)"
if [ -n "$RELEASE_DETAILS" ]; then
    # 세부 내용이 있으면 들여쓰기하여 추가
    RELEASE_ENTRY="$RELEASE_ENTRY\n$(echo -e "$RELEASE_DETAILS" | sed 's/^/  /')"
fi

# 4-4. RELEASE_NOTES.md 백업
cp RELEASE_NOTES.md RELEASE_NOTES.md.bak

# 4-5. 임시 파일 생성
TEMP_FILE=$(mktemp)

# 4-6. RELEASE_NOTES.md 파싱 및 업데이트
SECTION_FOUND=false
DATE_FOUND=false
INSERTED=false

while IFS= read -r line; do
    echo "$line" >> "$TEMP_FILE"

    # [Unreleased] 섹션 이후 해당 카테고리 찾기
    if [[ $line == "### $CATEGORY_ICON $CATEGORY" ]]; then
        SECTION_FOUND=true
        continue
    fi

    # 카테고리 섹션에서 날짜 헤더 확인
    if [ "$SECTION_FOUND" = true ] && [ "$INSERTED" = false ]; then
        if [[ $line == "#### $TODAY" ]]; then
            # 오늘 날짜 헤더가 이미 있음
            DATE_FOUND=true
            echo -e "$RELEASE_ENTRY" >> "$TEMP_FILE"
            INSERTED=true
        elif [[ $line == #### * ]] || [[ $line == "### "* ]]; then
            # 다른 날짜 헤더나 다음 섹션을 만남 → 새 날짜 헤더 추가
            if [ "$DATE_FOUND" = false ]; then
                echo "" >> "$TEMP_FILE"
                echo "$DATE_HEADER" >> "$TEMP_FILE"
                echo -e "$RELEASE_ENTRY" >> "$TEMP_FILE"
                INSERTED=true
            fi
        fi
    fi
done < RELEASE_NOTES.md

# 4-7. 업데이트된 내용 적용
mv "$TEMP_FILE" RELEASE_NOTES.md

# 4-8. 삽입 확인
if [ "$INSERTED" = false ]; then
    echo "❌ 오류: 릴리즈 노트 삽입에 실패했습니다."
    mv RELEASE_NOTES.md.bak RELEASE_NOTES.md
    exit 1
fi

echo "✅ RELEASE_NOTES.md 업데이트 완료"

# 5. RELEASE_NOTES.md를 커밋에 추가 (amend)
git add RELEASE_NOTES.md
git commit --amend --no-edit

# 6. 백업 파일 삭제
rm -f RELEASE_NOTES.md.bak

# 7. 한 번만 푸시
echo ""
echo "📤 변경사항을 푸시하고 있어요..."
git push origin main

echo ""
echo "✅ 커밋과 릴리즈 노트 업데이트 완료!"
echo "📝 커밋 해시: $COMMIT_HASH"
echo "📂 카테고리: $CATEGORY_ICON $CATEGORY"
echo "📅 날짜: $TODAY"
