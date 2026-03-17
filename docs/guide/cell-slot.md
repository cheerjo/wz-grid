# 셀 커스텀 렌더러 (Cell Slot)

`#cell-{colKey}` 스코프드 슬롯을 사용하면 특정 컬럼의 셀 내용을 자유롭게 커스터마이즈할 수 있습니다.

## 슬롯 이름 규칙

슬롯 이름은 `cell-` 접두어 + 컬럼의 `key` 값입니다.

| 컬럼 key | 슬롯 이름 |
|:---------|:---------|
| `name` | `#cell-name` |
| `status` | `#cell-status` |
| `salary` | `#cell-salary` |

## 슬롯 스코프 데이터

| 속성 | 타입 | 설명 |
|:-----|:-----|:-----|
| `row` | `any` | 현재 행 객체 전체 |
| `column` | `Column` | 현재 컬럼 정의 |
| `value` | `any` | 현재 셀 값 (`row[column.key]`) |
| `rowIndex` | `number` | 현재 행의 인덱스 |

## 기본 사용법

```vue
<WZGrid :columns="columns" :rows="rows">
  <!-- 이름 컬럼: 아바타 + 볼드 텍스트 -->
  <template #cell-name="{ row, value }">
    <div class="flex items-center gap-2">
      <img :src="row.avatar" class="w-6 h-6 rounded-full" />
      <span class="font-bold">{{ value }}</span>
    </div>
  </template>

  <!-- 급여 컬럼: 통화 포맷 + 아이콘 -->
  <template #cell-salary="{ value }">
    <div class="flex items-center gap-1">
      <span>&#8361;</span>
      <span>{{ Number(value).toLocaleString() }}</span>
    </div>
  </template>
</WZGrid>
```

## 조건부 렌더링

```vue
<template #cell-status="{ value }">
  <span :class="{
    'text-green-600 font-semibold': value === 'Active',
    'text-yellow-600': value === 'Pending',
    'text-red-600': value === 'Inactive',
  }">
    {{ value }}
  </span>
</template>
```

## 주의사항

- **편집 모드**: 셀이 편집 모드일 때는 커스텀 슬롯이 아닌 기존 편집 UI(input/select)가 표시됩니다.
- **트리 모드**: 트리 컬럼(`treeKey`)에 커스텀 슬롯을 사용해도 접기/펼치기 토글 버튼은 독립적으로 유지됩니다.
- **기존 타입과의 관계**: 슬롯이 제공되면 해당 컬럼의 `type`에 의한 기본 렌더링(badge, progress 등)은 무시됩니다.
