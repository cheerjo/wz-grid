---
name: WZGrid 오픈소스 전환
description: WZGrid 라이선스 시스템 제거 및 MIT 오픈소스 공개 결정 (2026-03-17)
type: project
---

WZGrid는 2026-03-17에 라이선스 시스템을 완전히 제거하고 MIT 오픈소스로 전환되었다.

**Why:** 모든 기능을 라이선스 키 없이 무료로 공개하기로 결정.

**How to apply:**
- `licenseKey` prop, `isProLicense`, `eff*` Pro 게이팅, Pro 모달이 더 이상 존재하지 않는다.
- `src/license.ts` 및 `src/demos/shared/useLicense.ts` 파일이 삭제되었다.
- `eff*` computed는 유지되나 Pro 조건 없이 직접 prop을 반환하는 단순한 alias 역할만 한다.
- 새 기능 추가 시 Pro/Community 구분 없이 모든 기능을 기본으로 제공한다.
- docs/.vitepress/config.ts 푸터가 "MIT License"로 변경되었다.
- `src/index.ts`에서 license 관련 export가 제거되었다.
