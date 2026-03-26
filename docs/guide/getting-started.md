# 빠른 시작

## 데모 앱으로 먼저 확인하기

라이브러리를 설치하기 전에 프로젝트를 클론하여 데모 앱을 실행해볼 수 있습니다.

```bash
git clone https://github.com/cheerjo/wz-grid.git
cd wz-grid
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`을 열면 탭 기반 데모 앱이 표시됩니다.

- **종합 데모** (`#basic`): 편집, 정렬, 필터, 그룹핑, 페이징 등 핵심 기능
- **트리 그리드** (`#tree`): 계층형 데이터를 트리 뷰로 표시
- **컬럼 타입** (`#column-types`): 19종 컬럼 타입 인터랙티브 데모

## 라이브 데모

<ClientOnly>
  <DemoGettingStarted />
</ClientOnly>

## 기본 예제

```vue
<script setup lang="ts">
import { ref } from "vue";
import { WZGrid } from "wz-grid";
import type { Column } from "wz-grid";

const columns = ref<Column[]>([
  { key: "id", title: "ID", width: 60 },
  { key: "name", title: "이름", width: 150 },
  { key: "age", title: "나이", width: 80, type: "number", align: "right" },
]);

const rows = ref([
  { id: 1, name: "홍길동", age: 30 },
  { id: 2, name: "김철수", age: 25 },
]);

const handleUpdate = ({ row, colKey, value }: any) => {
  const target = rows.value.find((r) => r.id === row.id);
  if (target) (target as any)[colKey] = value;
};
</script>

<template>
  <WZGrid
    :columns="columns"
    :rows="rows"
    :height="500"
    @update:cell="handleUpdate"
  />
</template>
```

::: tip 필수 조건
각 row 객체에는 반드시 고유한 `id` 필드가 있어야 합니다.
:::

## 편집 가능한 그리드

```vue
<script setup lang="ts">
import { ref } from "vue";
import { WZGrid } from "wz-grid";
import type { Column } from "wz-grid";

const columns = ref<Column[]>([
  { key: "name", title: "이름", width: 150, editable: true },
  {
    key: "dept",
    title: "부서",
    width: 120,
    editable: true,
    type: "select",
    options: ["개발", "기획", "디자인"],
  },
  {
    key: "score",
    title: "점수",
    width: 80,
    editable: true,
    type: "number",
    rules: [
      { type: "min", value: 0 },
      { type: "max", value: 100 },
    ],
  },
  { key: "active", title: "활성", width: 60, type: "checkbox" },
]);
</script>
```

## 다음 단계

- [Props 전체 명세](/api/props)
- [Column 타입 상세](/api/column-types)
- [이벤트 목록](/api/events)
