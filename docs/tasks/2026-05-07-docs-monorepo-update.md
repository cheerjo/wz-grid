# 문서 모노레포 구조 반영 태스크

> 플랜: [2026-05-07-docs-monorepo-update.md](../plans/2026-05-07-docs-monorepo-update.md)

## 1. 현황 점검
- [x] `DOCS.md`에서 `wz-grid` 패키지명/import 예시 위치 식별
- [x] `docs/index.md`, `docs/guide/*.md`, `docs/api/*.md`에서 동일하게 식별
- [x] 사이드바 설정(`docs/.vitepress/config.ts`) 현재 구조 확인

## 2. DOCS.md 갱신
- [x] 빠른 시작 섹션의 install/import 경로 → `@wezon/wz-grid-vue`
- [x] 상단에 모노레포 패키지 안내 박스 추가
- [x] 마지막 업데이트 날짜 갱신 (2026-05-04)

## 3. VitePress 문서 갱신
- [x] `docs/index.md` (홈) — tagline 멀티 프레임워크 반영, React 사용법 action 버튼 추가, features 갱신
- [x] `docs/guide/installation.md` — 전면 재작성 (Vue/React/Core 패키지별 설치, CDN 제거, 마이그레이션 안내 추가)
- [x] `docs/guide/getting-started.md` — import 경로 → `@wezon/wz-grid-vue`
- [x] `docs/guide/i18n.md` — import 경로 갱신
- [x] `docs/guide/controlled-state.md` — import 경로 갱신
- [x] `docs/guide/accessibility.md` — import 경로 갱신
- [x] `docs/guide/sort-filter.md` — import 경로 갱신
- [x] `docs/guide/editing.md` — import 경로 갱신
- [x] `docs/guide/composables-usage.md` — import 경로 갱신
- [x] `docs/guide/export.md` — import 경로 갱신
- [x] `docs/guide/tree.md` — import 경로 갱신
- [x] `docs/guide/plugins.md` — import 경로 갱신
- [x] `docs/guide/typescript.md` — import 경로 갱신
- [x] `docs/guide/column-types.md` — import 경로 갱신
- [x] `docs/guide/performance-monitoring.md` — import 경로 갱신
- [x] `docs/api/events.md` — import 경로 갱신
- [x] `docs/api/composables.md` — import 경로 갱신

## 4. 신규 가이드 페이지
- [x] `docs/guide/react.md` 작성 — 설치, 빠른 시작, 편집, 페이징, 체크박스, 지원 기능 표, 코어 관계 다이어그램
- [x] `docs/guide/headless-core.md` 작성 — 사용 대상, 설치, API 카테고리, sort+filter 예시, Svelte 예시, CSV Node.js 예시
- [x] `docs/.vitepress/config.ts` 사이드바에 "프레임워크별 사용법" 섹션 추가 (Vue/React/Headless Core)

## 5. 검증
- [x] `npm run docs:build` 성공 (10.13s)
- [ ] (선택) `npm run docs:dev` 로컬 확인
- [x] 모든 페이지에서 `from 'wz-grid'` 잔여 없음 확인

---

## 회고

`from 'wz-grid'` 참조가 guide 12개 파일 + api 2개 파일에 흩어져 있었다. `sed -i ''` 일괄 치환으로 빠르게 처리했고, 치환 후 grep 재검증으로 잔여 없음 확인. `installation.md`는 전면 재작성이 필요해 Write 도구로 처리. 다음번 패키지명 변경 시에는 docs 빌드 전에 `grep -r "패키지명" docs/` 를 먼저 실행하는 습관이 필요.
