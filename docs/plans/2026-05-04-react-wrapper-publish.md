# React 래퍼 추가 + npm publish 준비 플랜

## Context

Headless Core 분리(2026-04-22)가 완료되어 `@wezon/wz-grid-core`(순수 TS), `@wezon/wz-grid-vue`(Vue 래퍼) 두 패키지가 모노레포로 구성된 상태. 이번 작업으로 React 지원을 추가하고 npm publish 준비까지 완료한다.

## 목표/범위

### Phase A: 기존 src/ 정리 (전제 작업)
중복으로 남아있는 `src/composables/`, `src/components/`, `src/types/`, `src/utils/`, `src/i18n/`을 삭제. 데모/테스트는 이미 packages 경로로 마이그레이션 완료된 상태.

### Phase B: React 래퍼 패키지 추가
`packages/react/`를 생성하고 코어의 엔진/순수 함수를 React hooks로 감싸 `<WZGrid />` 컴포넌트 제공.

### Phase C: npm publish 준비
README, CHANGELOG, 패키지 메타데이터 정비 후 `npm pack` 검증까지.

## 건드릴 파일

### Phase A
- 삭제: `src/composables/`, `src/components/`, `src/types/`, `src/utils/`, `src/i18n/`, `src/lib.css`, `src/index.ts`
- 유지: `src/App.vue`, `src/main.ts`, `src/demos/`, `src/mocks/`, `src/style.css`

### Phase B
- 신규: `packages/react/` (package.json, tsconfig.json, vite.config.ts, src/index.ts, src/components/WZGrid.tsx, src/hooks/*)
- 수정: `pnpm-workspace.yaml`, 루트 `package.json` (build:react 스크립트)

### Phase C
- 신규: `packages/core/README.md`, `packages/vue/README.md`, `packages/react/README.md`
- 수정: `CHANGELOG.md`, 각 패키지의 `package.json` (description, keywords, repository, homepage, license, files)

## 제약/주의

1. **React 래퍼는 코어만 의존** — vue-demi 절대 import 금지
2. **기존 Vue API 호환성 유지** — Phase A에서 src/ 삭제 시 데모 앱이 packages/vue를 통해 정상 동작해야 함
3. **publish 전 dry-run 필수** — `npm pack --dry-run`으로 포함 파일 검증
4. **단계별 검증** — Phase 별로 테스트/빌드 통과 후 다음 단계 진행

## 검증

- [ ] Phase A: `npm run dev`, `npm run test`, `npm run build:lib`, `npm run docs:build` 전부 정상
- [ ] Phase B: React 데모 앱(별도 또는 packages/react/playground) 동작, 코어 엔진과 정상 연결
- [ ] Phase C: 3개 패키지 모두 `npm pack` 검증 + README/CHANGELOG 완성
