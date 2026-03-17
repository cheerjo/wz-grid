# 컬럼 타입 가이드

WZ-Grid는 총 17종의 컬럼 타입을 지원합니다. 각 타입에 따라 셀 렌더링 방식, 편집 방법, 필터 UI, 정렬 기준이 다르게 동작합니다.

> **인터랙티브 데모**: `npm run dev` 실행 후 **"컬럼 타입"** 탭에서 17종 컬럼 타입을 직접 조작하고 이벤트 로그를 실시간으로 확인할 수 있습니다.

## 편집 가능 여부 요약

| 타입 | 편집 방식 | 필터 UI |
| :--- | :--- | :--- |
| `text` | 더블 클릭 / 즉시 타이핑 | 텍스트 부분 일치 |
| `number` | 더블 클릭 → number input | min/max 범위 |
| `date` | Enter / 더블 클릭 → datepicker | 날짜 범위 |
| `select` | 더블 클릭 → 드롭다운 | 다중 선택 (Pro) |
| `currency` | 더블 클릭 → number input | min/max 범위 |
| `email` | 더블 클릭 → email input | 텍스트 부분 일치 |
| `datetime` | Enter / 더블 클릭 → datetime-local | from/to 범위 |
| `boolean` | 클릭 즉시 반영 | 전체/예/아니요 |
| `radio` | 클릭 즉시 반영 | 텍스트 부분 일치 |
| `rating` | 클릭 즉시 반영 | min/max 범위 |
| `color` | 클릭 즉시 반영 (색상 피커) | 텍스트 부분 일치 |
| `badge` | 편집 불가 | 다중 선택 (Pro) |
| `progress` | 편집 불가 | — |
| `image` | 편집 불가 | — |
| `button` | 편집 불가 (`@click:button` 발생) | — |
| `link` | 편집 불가 (새 탭 열림) | 텍스트 부분 일치 |
| `tag` | 편집 불가 | 텍스트 포함 여부 |

---

## 기본 타입

### `text`

일반 텍스트. 더블 클릭 또는 즉시 타이핑으로 편집합니다.

```ts
{ key: 'name', title: '이름', type: 'text' }
```

### `number`

숫자. 읽기 모드에서 `toLocaleString()`으로 천 단위 쉼표 포맷 표시. 편집 시 `<input type="number">`.

```ts
{ key: 'salary', title: '급여', type: 'number', align: 'right' }
```

### `date`

날짜. 편집 시 브라우저 기본 datepicker 사용. 값은 `YYYY-MM-DD` 형식으로 저장됩니다.
알파벳/숫자 즉시 타이핑은 무시되며, Enter 또는 더블 클릭으로 달력을 엽니다.

```ts
{ key: 'joinDate', title: '입사일', type: 'date', align: 'center' }
```

### `boolean`

체크박스. 클릭 즉시 `@update:cell` 이벤트 발생.

```ts
{ key: 'active', title: '활성', type: 'boolean', align: 'center' }
```

### `select`

드롭다운. `options`의 `value`로 저장하고 `label`로 표시합니다.

```ts
{
  key: 'dept', title: '부서', type: 'select',
  options: [
    { value: 'dev', label: '개발팀' },
    { value: 'biz', label: '사업팀' },
  ]
}
```

### `badge`

색상 태그 표시. `options`의 `color`에 Tailwind 클래스를 지정합니다. 편집 불가.

```ts
{
  key: 'status', title: '상태', type: 'badge', align: 'center',
  options: [
    { value: 'Active',   label: '활성', color: 'bg-green-100 text-green-700' },
    { value: 'Inactive', label: '중단', color: 'bg-red-100 text-red-700' },
  ]
}
```

### `progress`

0~100 숫자를 프로그레스 바로 표시. 편집 불가.

```ts
{ key: 'completion', title: '완료율', type: 'progress' }
```

### `image`

URL을 38×38 원형 썸네일로 표시. 편집 불가.

```ts
{ key: 'avatar', title: '사진', type: 'image', align: 'center' }
```

### `button`

클릭 가능한 버튼 셀. 클릭 시 `@click:button` 이벤트 발생.

```ts
{
  key: 'action', title: '관리', type: 'button', align: 'center',
  options: [{ label: '상세보기' }]
}
```

### `link`

URL을 `target="_blank"` 하이퍼링크로 표시. 편집 불가.

```ts
{ key: 'website', title: '홈페이지', type: 'link' }
```

### `radio`

인라인 라디오 버튼 그룹. 선택 즉시 `@update:cell` 이벤트 발생.

```ts
{
  key: 'gender', title: '성별', type: 'radio', align: 'center',
  options: [
    { label: '남', value: 'M' },
    { label: '여', value: 'F' },
  ]
}
```

---

## 신규 타입 (v1.4+)

### `tag`

`string[]` 배열 데이터를 칩(chip) UI로 렌더링합니다. 편집 불가.

- **필터**: 텍스트 포함 여부 (태그 문자열 전체를 대상으로 부분 일치)
- **정렬**: 태그 개수 기준 오름차순/내림차순

```ts
{ key: 'tags', title: '태그', type: 'tag', width: 200 }
```

```ts
// row 데이터 예시
{ id: 1, name: '홍길동', tags: ['긴급', '검토중'] }
```

### `currency`

숫자 데이터를 통화 기호 + 천 단위 포맷으로 표시합니다. 편집 시 `<input type="number">`.

- **필터**: min/max 숫자 범위
- **컬럼 옵션**:

| 옵션 | 타입 | 기본값 | 설명 |
| :--- | :--- | :---: | :--- |
| `currencySymbol` | `string` | `'₩'` | 금액 앞에 붙는 통화 기호 |
| `decimals` | `number` | `0` | 소수점 자릿수 |

```ts
{
  key: 'price', title: '가격', type: 'currency', align: 'right', width: 140,
  currencySymbol: '₩',
  decimals: 0,
}
// 표시 예: ₩1,200,000
```

### `rating`

숫자 값(1~N)을 별점(★) UI로 표시합니다. 별 클릭 즉시 `@update:cell` 이벤트 발생.

- **필터**: min/max 숫자 범위
- **컬럼 옵션**:

| 옵션 | 타입 | 기본값 | 설명 |
| :--- | :--- | :---: | :--- |
| `maxRating` | `number` | `5` | 최대 별 수 |

```ts
{ key: 'score', title: '평점', type: 'rating', align: 'center', width: 140, maxRating: 5 }
// row.score 예: 4 → ★★★★☆
```

### `datetime`

날짜+시간 문자열. 편집 시 `<input type="datetime-local">` 사용.

- **표시/저장 형식**: `YYYY-MM-DD HH:mm`
- **필터**: from/to 날짜+시간 범위

```ts
{ key: 'createdAt', title: '등록일시', type: 'datetime', width: 160, align: 'center' }
// row.createdAt 예: '2026-03-17 09:30'
```

### `color`

CSS 색상 문자열을 색상 박스로 표시합니다. 색상 피커 클릭 즉시 `@update:cell` 이벤트 발생.

- **필터**: 텍스트 포함 여부 (색상 코드 문자열 기준)

```ts
{ key: 'labelColor', title: '색상', type: 'color', align: 'center', width: 80 }
// row.labelColor 예: '#3b82f6'
```

### `email`

이메일 문자열을 `mailto:` 링크로 표시합니다. 편집 시 `<input type="email">`.

- **필터**: 텍스트 포함 여부

```ts
{ key: 'email', title: '이메일', type: 'email', width: 200 }
```

---

## 전체 타입을 사용하는 예제

```vue
<script setup lang="ts">
import { ref } from 'vue'
import WZGrid from 'wz-grid'
import type { Column } from 'wz-grid'

const columns = ref<Column[]>([
  { key: 'id',          title: 'ID',      type: 'number',   width: 60,  align: 'right' },
  { key: 'name',        title: '이름',    type: 'text',     width: 120 },
  { key: 'email',       title: '이메일',  type: 'email',    width: 200 },
  { key: 'dept',        title: '부서',    type: 'select',   width: 120,
    options: [
      { value: 'dev', label: '개발팀' },
      { value: 'hr',  label: '인사팀' },
    ]
  },
  { key: 'salary',      title: '급여',    type: 'currency', width: 140, align: 'right',
    currencySymbol: '₩', decimals: 0
  },
  { key: 'score',       title: '평점',    type: 'rating',   width: 130, align: 'center', maxRating: 5 },
  { key: 'tags',        title: '태그',    type: 'tag',      width: 180 },
  { key: 'labelColor',  title: '색상',    type: 'color',    width: 80,  align: 'center' },
  { key: 'joinDate',    title: '입사일',  type: 'date',     width: 130, align: 'center' },
  { key: 'updatedAt',   title: '최종수정', type: 'datetime', width: 160, align: 'center' },
  { key: 'active',      title: '활성',    type: 'boolean',  width: 70,  align: 'center' },
  { key: 'status',      title: '상태',    type: 'badge',    width: 100, align: 'center',
    options: [
      { value: 'Active',   label: '활성', color: 'bg-green-100 text-green-700' },
      { value: 'Inactive', label: '중단', color: 'bg-red-100 text-red-700' },
    ]
  },
  { key: 'completion',  title: '완료율',  type: 'progress', width: 140 },
  { key: 'website',     title: '홈페이지', type: 'link',    width: 180 },
  { key: 'avatar',      title: '사진',    type: 'image',    width: 60,  align: 'center' },
  { key: 'gender',      title: '성별',    type: 'radio',    width: 120, align: 'center',
    options: [{ label: '남', value: 'M' }, { label: '여', value: 'F' }]
  },
  { key: 'action',      title: '관리',    type: 'button',   width: 100, align: 'center',
    options: [{ label: '상세보기' }]
  },
])

const rows = ref([
  {
    id: 1, name: '홍길동', email: 'hong@example.com', dept: 'dev',
    salary: 5500000, score: 4, tags: ['긴급', '검토중'],
    labelColor: '#3b82f6', joinDate: '2022-03-15', updatedAt: '2026-03-17 09:30',
    active: true, status: 'Active', completion: 75,
    website: 'https://example.com', avatar: 'https://i.pravatar.cc/38?u=1',
    gender: 'M',
  },
])
</script>

<template>
  <WZGrid :columns="columns" :rows="rows" :useFilter="true" @update:cell="(e) => console.log(e)" />
</template>
```
