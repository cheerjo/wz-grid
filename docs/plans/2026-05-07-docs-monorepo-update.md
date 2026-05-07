# 문서 모노레포 구조 반영 플랜

## Context

`wz-grid` → 모노레포(`@wezon/wz-grid-{core,vue,react}`)로 전환 + npm publish 완료된 상태. 현재 문서들은 여전히 단일 패키지 시절의 `wz-grid` 이름과 사용법으로 작성되어 있어 신규 사용자가 혼란을 겪을 수 있다.

## 목표/범위

문서 전반에 모노레포 구조를 반영하고, React 사용법과 코어 직접 사용법 가이드를 추가한다.

### 영향 받는 문서
- `DOCS.md` (루트, 한국어 사용 가이드)
- `docs/index.md` (VitePress 홈)
- `docs/guide/*.md` (가이드 페이지들)
- `docs/api/*.md` (API 레퍼런스)
- `docs/.vitepress/config.ts` (사이드바 — 새 페이지 추가 시)
- `README.md` (루트, 모노레포 소개 — 이미 업데이트됨)
- `CHANGELOG.md` (이미 업데이트됨)

## 건드릴 파일

### 수정
- `DOCS.md` — 빠른 시작 섹션의 install/import 경로 변경, 헤더 안내 추가
- `docs/index.md` — 첫 화면의 install 안내, hero 섹션 정비
- `docs/guide/getting-started.md` (또는 유사 파일) — Vue 빠른 시작 갱신
- 기타 `docs/guide/*.md` 안의 import 예시들

### 신규 (필요 시)
- `docs/guide/react.md` — React 래퍼 사용 가이드
- `docs/guide/headless-core.md` — `@wezon/wz-grid-core` 직접 사용 가이드
- `docs/.vitepress/config.ts` 사이드바에 위 페이지 등록

### 점검
- VitePress 문서 빌드 정상 여부

## 제약/주의

1. **기존 가이드의 Vue 예시는 import 경로만 갱신**, 콘텐츠는 그대로 유지 (사용자 친숙성)
2. **DOCS.md 200자 룰**은 코드/문서 본문에는 적용 안 됨 (CLAUDE.md 자체 업데이트 룰임)
3. **마이그레이션 안내**: 기존 `wz-grid` 사용자가 `@wezon/wz-grid-vue`로 옮길 때 필요한 변경 사항 한 곳에 정리
4. **React 가이드 범위**: 현재 지원 기능만 명시 (sort, filter, paging, virtual scroll, checkbox, text edit). 미지원 기능은 "추후 지원 예정"으로 표시
5. **코어 가이드 범위**: 프레임워크 무관하게 사용 가능한 순수 함수/엔진 소개

## 검증

- [ ] `DOCS.md`의 install/import 예시가 모두 `@wezon/wz-grid-vue` 사용
- [ ] `docs/index.md`의 첫 화면 install 안내가 정확
- [ ] `docs/guide/`의 모든 `wz-grid` 패키지명 언급이 갱신됨
- [ ] 새 가이드 페이지(react.md, headless-core.md) 작성 + 사이드바 등록
- [ ] `npm run docs:build` 성공
- [ ] `npm run docs:dev`로 로컬에서 사이드바/페이지 동작 확인
