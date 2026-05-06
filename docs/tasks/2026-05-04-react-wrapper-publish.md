# React 래퍼 + npm publish 태스크

> 플랜: [2026-05-04-react-wrapper-publish.md](../plans/2026-05-04-react-wrapper-publish.md)

## Phase A: 기존 src/ 정리
- [x] src/composables/ 삭제
- [x] src/components/ 삭제
- [x] src/types/ 삭제
- [x] src/utils/ 삭제
- [x] src/i18n/ 삭제
- [x] src/lib.css 삭제 (packages/vue/src/lib.css만 사용)
- [x] src/index.ts 삭제 (라이브러리 진입점은 packages/vue로 이동)
- [x] 루트 package.json의 build:lib 스크립트가 packages/vue를 빌드하도록 수정 (또는 제거)
- [x] 루트 vite.lib.config.ts 제거 또는 packages/vue로 이전 확인
- [x] 데모 앱 정상 동작 (npm run dev)
- [x] 테스트 66개 통과 (npm run test)
- [x] VitePress 문서 빌드 정상 (npm run docs:build)

## Phase B: React 래퍼 패키지
- [x] packages/react/ 디렉토리 + package.json + tsconfig.json 생성
- [x] React + ReactDOM peerDependencies 설정
- [x] @wezon/wz-grid-core를 dependency로 설정
- [x] vite.config.ts (lib 모드, JSX 처리)
- [x] src/hooks/useSort.ts (코어 sortRows를 useState/useMemo로 감쌈)
- [x] src/hooks/useFilter.ts
- [x] src/hooks/useTree.ts
- [x] src/hooks/usePaging.ts
- [x] src/hooks/useVirtualScroll.ts
- [x] src/hooks/useSelection.ts
- [x] src/hooks/useCheckbox.ts
- [x] src/hooks/useUndoRedo.ts
- [x] src/components/WZGrid.tsx (메인 컴포넌트)
- [x] src/components/WZGridHeader.tsx
- [x] src/components/WZGridRow.tsx
- [x] src/components/WZGridCell.tsx
- [x] src/lib.css (그리드 기본 스타일)
- [x] src/index.ts (export)
- [x] React 빌드 성공 (ES + CJS, vue/vue-demi 번들 없음)
- [x] React playground 데모 (packages/react/playground/)

## Phase C: npm publish 준비
- [x] packages/core/README.md 작성
- [x] packages/vue/README.md 작성
- [x] packages/react/README.md 작성
- [x] CHANGELOG.md 업데이트 (모노레포 전환, React 지원 추가)
- [x] 각 package.json: description, keywords, repository, homepage, license, author, files 필드 정비
- [x] @wezon 스코프 안내 (사용자가 npm 조직 등록 필요)
- [x] core, vue, react 각각 npm pack --dry-run 성공
- [ ] (선택) GitHub Actions에 publish workflow 추가

---

## 회고
Phase C 완료(2026-05-04): 3개 패키지 README · package.json · LICENSE · CHANGELOG 정비 완료. npm pack --dry-run 검증 통과(@wezon/wz-grid-core 35.6 kB, wz-grid-vue 87.2 kB, @wezon/wz-grid-react 19.6 kB). 실제 publish 전 npmjs.com/org/wezon 조직 등록이 선행되어야 함.
