# React 사용법

`@wezon/wz-grid-react`는 WZ-Grid 코어(`@wezon/wz-grid-core`) 위에 React 래퍼를 얹은 패키지입니다. Vue 버전과 동일한 데이터 처리 로직을 공유하며, React 친화적인 props/hook 인터페이스를 제공합니다.

## 설치

```bash
npm install @wezon/wz-grid-react
```

## 빠른 시작

```tsx
import { WZGrid } from '@wezon/wz-grid-react';
import '@wezon/wz-grid-react/dist/wz-grid-react.css';

function App() {
  const columns = [
    { key: 'id',   title: 'ID',   width: 60 },
    { key: 'name', title: '이름', width: 150 },
    { key: 'age',  title: '나이', width: 80, type: 'number', align: 'right' },
  ];

  const rows = [
    { id: 1, name: '홍길동', age: 30 },
    { id: 2, name: '김철수', age: 25 },
  ];

  return <WZGrid rows={rows} columns={columns} height={500} />;
}
```

::: tip 필수 조건
각 row 객체에는 반드시 고유한 `id` 필드(`string | number`)가 있어야 합니다.
:::

## 셀 편집 처리

```tsx
import { useState } from 'react';
import { WZGrid } from '@wezon/wz-grid-react';

function EditableGrid() {
  const [rows, setRows] = useState([
    { id: 1, name: '홍길동', dept: '개발' },
    { id: 2, name: '김철수', dept: '기획' },
  ]);

  const handleUpdate = ({ row, colKey, value }) => {
    setRows(prev =>
      prev.map(r => (r.id === row.id ? { ...r, [colKey]: value } : r))
    );
  };

  return (
    <WZGrid
      rows={rows}
      columns={[
        { key: 'name', title: '이름', width: 150 },
        { key: 'dept', title: '부서', width: 120 },
      ]}
      height={400}
      onCellUpdate={handleUpdate}
    />
  );
}
```

## 트리 구조

`useTreeMode` prop을 켜고 `rows` 안 각 항목에 `children` 배열을 넣으면 트리가 활성화됩니다.

```tsx
const treeRows = [
  {
    id: 1, name: '개발팀', count: 3,
    children: [
      { id: 11, name: '프론트엔드', count: 2, children: [
        { id: 111, name: '홍길동', count: 0 },
      ]},
    ],
  },
];

<WZGrid
  rows={treeRows}
  columns={columns}
  height={400}
  useTreeMode
  treeKey="children"   // 기본값 'children', 커스텀 키 지정 가능
/>
```

## Undo/Redo

`useUndoRedo` prop을 켜면 셀 편집 이력이 자동으로 저장되고 `Ctrl+Z` / `Ctrl+Y` (또는 `Ctrl+Shift+Z`) 단축키로 되돌리기/다시 실행이 가능합니다.

```tsx
<WZGrid
  rows={rows}
  columns={columns}
  useUndoRedo
  undoRedoMaxDepth={100}
  onUndo={(event) => {
    // event: { rowIdx, row, colKey, value(복원값), oldValue }
    setRows(prev => prev.map(r =>
      r.id === event.row.id ? { ...r, [event.colKey]: event.value } : r
    ));
  }}
  onRedo={(event) => {
    setRows(prev => prev.map(r =>
      r.id === event.row.id ? { ...r, [event.colKey]: event.value } : r
    ));
  }}
  onCellUpdate={handleCellUpdate}
/>
```

## 클립보드 복사/붙여넣기

`useClipboard` prop을 켜면 선택 영역을 `Ctrl+C`로 복사하고 `Ctrl+V`로 붙여넣기할 수 있습니다.

```tsx
<WZGrid
  rows={rows}
  columns={columns}
  useClipboard
  onCellUpdate={handleCellUpdate}
/>
```

## 컬럼 표시/숨김

`useColumnSettings` prop을 켜면 헤더 우측에 ⚙ 버튼이 생겨 컬럼별 표시 여부를 토글할 수 있습니다.

```tsx
<WZGrid rows={rows} columns={columns} useColumnSettings />
```

## 컬럼 고정 (Pinned)

`Column` 정의에서 `pinned: true`를 설정하면 해당 컬럼이 좌측에 고정됩니다(sticky).

```tsx
const columns = [
  { key: 'id',   title: 'ID',   width: 60, pinned: true }, // 좌측 고정
  { key: 'name', title: '이름', width: 150 },
];
```

## 행 확장 (Detail Row)

`renderDetail` prop에 함수를 전달하면 각 행 왼쪽에 ▸/▾ 토글 버튼이 생기고, 클릭 시 해당 행 아래에 상세 패널이 펼쳐집니다.

```tsx
<WZGrid
  rows={rows}
  columns={columns}
  renderDetail={(row) => (
    <div style={{ padding: 12 }}>
      <strong>{row.name}</strong> — 상세 내용 자유롭게 구성
    </div>
  )}
/>
```

## 엑셀/CSV 내보내기

### 1. 유틸 함수 직접 호출 (권장 — React 방식)

```ts
import { exportToExcel, exportToCsv } from '@wezon/wz-grid-react';

await exportToExcel(columns, rows, { filename: 'report.xlsx' });
exportToCsv(columns, rows, { filename: 'report.csv' });
```

### 2. 그리드 내장 툴바 버튼

`onExportExcel` / `onExportCsv` prop을 전달하면 그리드 상단에 버튼이 자동으로 표시됩니다.

```tsx
<WZGrid
  rows={rows}
  columns={columns}
  onExportExcel={() => exportToExcel(columns, rows)}
  onExportCsv={() => exportToCsv(columns, rows)}
/>
```

## 다국어 (i18n)

`locale` prop으로 언어를 지정하고 `messages` prop으로 특정 텍스트를 오버라이드할 수 있습니다.

```tsx
<WZGrid
  rows={rows}
  columns={columns}
  locale="en"
  messages={{
    state: { empty: 'No results found.' },
    toolbar: { csvExport: 'Download CSV' },
  }}
/>
```

내부 UI 텍스트(빈 상태 메시지, 페이저 등)가 로케일에 맞게 표시됩니다.

## 현재 지원 기능 (v0.2.0)

| 기능 | 지원 여부 |
| :--- | :---: |
| 정렬 (Sort) | O |
| 컬럼 필터 | O |
| 페이징 | O |
| 가상 스크롤 | O |
| 체크박스 선택 | O |
| 텍스트 편집 | O |
| 트리 구조 | O |
| Undo/Redo | O |
| 클립보드 복사/붙여넣기 | O |
| 컬럼 표시/숨김 | O |
| 컬럼 고정 (pinned) | O |
| 행 확장 (detail row) | O |
| 엑셀/CSV 내보내기 | O |
| 다국어 (i18n) | O |

## 추후 지원 예정

- 그룹핑 & 소계 (`groupBy`)
- 셀 병합 (`autoMergeCols`, `mergeCells`)
- 컬럼 드래그 재배치
- 컨텍스트 메뉴
- 커스텀 셀 렌더러 (slot 상당)

## 코어와의 관계

```
@wezon/wz-grid-core   ← 정렬·필터·그룹핑·트리·병합 등 모든 로직
       |
       +-- @wezon/wz-grid-vue    (Vue 2/3 래퍼)
       +-- @wezon/wz-grid-react  (React 래퍼)
```

## 관련 문서

- [Props 전체 명세](/api/props)
- [Column 타입 상세](/api/column-types)
- [이벤트 목록](/api/events)
- [Headless Core 가이드](/guide/headless-core)
