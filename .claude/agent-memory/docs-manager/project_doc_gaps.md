---
name: wz-grid 문서 주요 불일치 항목
description: 코드와 문서 간 확인된 불일치 및 주의해야 할 사항
type: project
---

`printGrid` (`src/utils/print.ts`)는 구현되어 있으나 `src/index.ts`에서 export되지 않는다. npm 패키지 소비자는 직접 사용할 수 없다. DOCS.md 섹션 24에 주의사항 명시 완료 (2026-03-17).

**Why:** 라이브러리 빌드에서 public API로 노출하지 않기로 결정된 내부 유틸.

**How to apply:** printGrid 관련 문서 작성 시 항상 "라이브러리 패키지 미포함" 주의사항 포함. export 추가 여부는 코드 변경 없이 판단 불가.

---

`downloadCSV`, `parseTSV`, `stringifyTSV` (`src/utils/tsv.ts`)는 `src/index.ts`에서 `export * from './utils/tsv'`로 공개 export됨. 패키지 소비자는 `import { downloadCSV } from 'wz-grid'`로 사용 가능.

---

`mergeCells` prop의 실제 타입은 `MergeCell[]`이 아니라 함수 시그니처: `(row: any, colKey: string) => { rowspan?: number; colspan?: number } | null | void`. 기본값은 `null`. (2026-03-17 수정)

---

`docs/api/props.md`에 누락되어 있던 props (2026-03-17 추가):
- Community: `rowClass`, `cellClass`
- Pro: `useColumnSettings`, `useExcelExport`, `useServerSide`, `serverSide`(deprecated), `showColumnSettings`(deprecated), `showExcelExport`(deprecated), `totalRows`

`docs/api/events.md`에 누락되어 있던 이벤트 (2026-03-17 추가):
- `@click:row`: `{ rowIdx, row }`
- `@update:filters`: `Record<string, any>` (서버사이드 모드 전용)

---

컬럼 타입 6종 추가 (2026-03-17, v1.4+):
- `tag`: string[] → 칩 UI, 편집 불가, 텍스트 필터, 개수 정렬
- `currency`: 숫자 → 통화 포맷, number input 편집, min/max 필터. 컬럼 옵션: `currencySymbol`(기본 '₩'), `decimals`(기본 0)
- `rating`: 숫자 1~N → 별점 UI, 클릭 즉시 반영, min/max 필터. 컬럼 옵션: `maxRating`(기본 5)
- `datetime`: 날짜+시간 문자열, datetime-local input 편집, YYYY-MM-DD HH:mm 표시, from/to 범위 필터
- `color`: CSS 색상 → 색상 박스, 피커 클릭 즉시 반영, 텍스트 필터
- `email`: 이메일 → mailto 링크, email input 편집, 텍스트 필터
Column 인터페이스에 `currencySymbol`, `decimals`, `maxRating` 필드 추가됨.
docs/guide/column-types.md 신규 생성 + sidebar 등록 완료.

---

`textarea` 컬럼 타입 추가 (2026-03-17): 멀티라인 텍스트 편집. `<textarea>` 오버레이. 편집 중 Enter → 다음 행 이동(Excel 동작), Shift+Enter → 줄바꿈, Esc → 취소. 읽기 모드: whitespace-pre로 줄바꿈 유지. 편집 가능 타입으로 분류. ColumnType 유니온 총 19종.

---

엑셀 내보내기 라이브러리 마이그레이션 완료 (2026-03-17):
- SheetJS(xlsx) → ExcelJS(exceljs) 로 peerDependency 변경.
- progress 컬럼의 data bar 조건부 서식이 ExcelJS에서 정식 동작.
- 업데이트된 파일: DOCS.md, docs/guide/export.md, docs/guide/installation.md, LICENSE.md, CLAUDE.md.
- `.xlsx` 파일 확장자 언급은 파일 포맷으로 올바른 사용이므로 변경 불필요 (docs/api/props.md, docs/guide/*.md).

---

라이선스 시스템 제거 완료 (2026-03-17, 오픈소스 전환):
- `licenseKey` prop 제거. 모든 기능 무료 사용 가능.
- `eff*` computed는 Pro 게이팅 제거 후 prop alias 역할만 수행.
- 문서에서 Pro 배지/안내 및 licenseKey 예제 코드 모두 제거 완료.
- 영향 파일: advanced-filter.md, master-detail.md, server-side.md, columns.md, export.md, cell-slot.md, row-style.md, introduction.md, getting-started.md, CLAUDE.md
