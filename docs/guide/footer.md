# 푸터 집계 행

`showFooter` prop을 활성화하면 그리드 하단에 집계 행이 표시됩니다.
컬럼별로 `footer` 속성을 통해 집계 방식을 지정하며, 필터 결과에 실시간으로 반응합니다.

## 기본 사용

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :showFooter="true"
/>
```

```ts
const columns = [
  { key: 'name',   title: '이름',  type: 'text' },
  { key: 'salary', title: '급여',  type: 'number', align: 'right',
    footer: 'sum', footerLabel: '합계' },
  { key: 'completion', title: '완료율', type: 'progress',
    footer: 'avg', footerLabel: '평균' },
  { key: 'active', title: '재직', type: 'boolean',
    footer: 'count', footerLabel: '재직수' },
];
```

## `footer` 옵션 값

| 값 | 설명 |
| :--- | :--- |
| `'sum'` | 합계 |
| `'avg'` | 평균 (소수점 2자리) |
| `'count'` | null·undefined·빈 문자열을 제외한 값의 개수 |
| `'min'` | 최솟값 |
| `'max'` | 최댓값 |
| `(rows) => any` | 커스텀 함수 — `filteredRows` 전체를 받아 원하는 값을 반환 |

## `footerLabel`

집계값 앞에 표시되는 레이블입니다. 값이 없으면 숫자만 표시됩니다.

```ts
{ key: 'salary', footer: 'sum', footerLabel: '합계' }
// → "합계 12,345,000"
```

## 커스텀 함수

```ts
{
  key: 'salary',
  footer: (rows) => {
    const total = rows.reduce((s, r) => s + (r.salary || 0), 0);
    return `₩${total.toLocaleString()}`;
  },
}
```

## 필터 연동

푸터 집계는 `filteredRows` 기준으로 계산됩니다.
필터를 적용하면 집계값이 자동으로 갱신됩니다.

## 관련 Props

| Prop | 타입 | 기본값 | 설명 |
| :--- | :--- | :---: | :--- |
| `showFooter` | `boolean` | `false` | 푸터 집계 행 표시 여부 |

## 관련 Column 속성

| 속성 | 타입 | 설명 |
| :--- | :--- | :--- |
| `footer` | `FooterAggr` | 집계 방식 또는 커스텀 함수 |
| `footerLabel` | `string` | 집계값 앞 레이블 |
