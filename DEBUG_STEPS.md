# 디버그 단계

## 1. 브라우저 개발자 도구 열기
- Mac: `Cmd + Option + I`
- Windows: `F12` 또는 `Ctrl + Shift + I`

## 2. Console 탭 클릭

## 3. 확인할 로그
다음과 같은 로그가 보여야 합니다:

```
🔍 [SlidePreview] slide prop 변경됨: {type: "reportA4", propsKeys: [...], ...}
🔄 [SlidePreview] useMemo 재계산 중... {type: "reportA4", ...}
✅ [SlidePreview] HTML 생성 완료 {aspectRatio: "16:9", ...}
```

## 4. 에러 확인
- 빨간색 에러 메시지가 있는지 확인
- 특히 "TemplateEngine" 관련 에러 확인

## 5. 슬라이드 데이터 확인
콘솔에서 다음 명령 실행:
```javascript
// 현재 슬라이드 데이터 출력
console.log('현재 슬라이드:', window.__CURRENT_SLIDE__)
```

## 6. 미리보기 영역 확대
- 우측 미리보기 영역을 스크롤하거나 확대
- 스크린샷 찍어서 공유
