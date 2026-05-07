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
import '@wezon/wz-grid-react/dist/wz-grid-react.css';

function EditableGrid() {
  const [rows, setRows] = useState([
    { id: 1, name: '홍길동', dept: '개발' },
    { id: 2, name: '김철수', dept: '기획' },
  ]);

  const columns = [
    { key: 'name', title: '이름', width: 150, editable: true },
    {
      key: 'dept',
      title: '부서',
      width: 120,
      editable: true,
      type: 'select',
      options: ['개발', '기획', '디자인'],
    },
  ];

  const handleUpdate = ({ row, colKey, value }) => {
    setRows(prev =>
      prev.map(r => (r.id === row.id ? { ...r, [colKey]: value } : r))
    );
  };

  return (
    <WZGrid
      rows={rows}
      columns={columns}
      height={400}
      onUpdateCell={handleUpdate}
    />
  );
}
```

::: info Vue와의 이벤트 이름 차이
Vue 버전은 `@update:cell`, React 버전은 `onUpdateCell` prop을 사용합니다.
:::

## 페이징

```tsx
import { useState } from 'react';
import { WZGrid } from '@wezon/wz-grid-react';

function PagedGrid({ rows, columns }) {
  const [page, setPage] = useState(1);

  return (
    <WZGrid
      rows={rows}
      columns={columns}
      usePaging
      pageSize={20}
      currentPage={page}
      onUpdateCurrentPage={setPage}
    />
  );
}
```

## 체크박스 선택

```tsx
import { useState } from 'react';
import { WZGrid } from '@wezon/wz-grid-react';

function SelectableGrid({ rows, columns }) {
  const [checkedIds, setCheckedIds] = useState([]);

  return (
    <WZGrid
      rows={rows}
      columns={columns}
      useCheckbox
      checkedRowIds={checkedIds}
      onUpdateCheckedRowIds={setCheckedIds}
    />
  );
}
```

## 현재 지원 기능

| 기능 | 지원 여부 |
| :--- | :---: |
| 정렬 (Sort) | O |
| 컬럼 필터 | O |
| 페이징 | O |
| 가상 스크롤 | O |
| 체크박스 선택 | O |
| 텍스트 편집 | O |
| 숫자/날짜/select 편집 | O |

## 추후 지원 예정

아래 기능들은 현재 `@wezon/wz-grid-core`에 구현되어 있으나 React 래퍼에 아직 노출되지 않았습니다. 향후 버전에서 순차적으로 추가될 예정입니다.

- 트리 구조 (`useTree`)
- 그룹핑 & 소계 (`groupBy`)
- 셀 병합 (`autoMergeCols`, `mergeCells`)
- 컬럼 드래그 재배치
- 컨텍스트 메뉴 (`useContextMenu`)
- Excel 내보내기
- 커스텀 셀 렌더러 (slot 상당)
- 마스터-디테일

## 코어와의 관계

```
@wezon/wz-grid-core   ← 정렬·필터·그룹핑·트리·병합 등 모든 로직
       |
       +-- @wezon/wz-grid-vue    (Vue 2/3 래퍼)
       +-- @wezon/wz-grid-react  (React 래퍼)
```

`@wezon/wz-grid-react`는 내부적으로 `@wezon/wz-grid-core`의 순수 함수와 엔진을 사용합니다. 두 패키지는 동일한 데이터 처리 결과를 보장합니다.

## 관련 문서

- [Props 전체 명세](/api/props)
- [Column 타입 상세](/api/column-types)
- [이벤트 목록](/api/events)
- [Headless Core 가이드](/guide/headless-core)
