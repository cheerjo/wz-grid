# Column 타입

## Column 인터페이스

```ts
interface Column {
  key: string           // row 객체의 데이터 키 (필수)
  title: string         // 헤더에 표시할 텍스트 (필수)
  width?: number        // 컬럼 너비(px), 기본 150
  type?: ColumnType     // 컬럼 타입 (기본 'text')
  align?: Align         // 셀 본문 정렬: 'left' | 'center' | 'right'
  headerAlign?: Align   // 헤더 텍스트 정렬 (기본 'center')
  pinned?: boolean      // 좌측 고정 컬럼 여부
  required?: boolean    // 필수 입력 여부 (헤더에 * 표시)
  options?: Option[]    // select/badge/radio/button 타입에서 사용
  validator?: (value: any, row: any) => string | null  // 커스텀 검증
  onInput?: (value: any) => any    // 입력 중 실시간 값 가공
  truncate?: boolean    // 말줄임표 처리 (기본 true)
  tooltip?: boolean     // hover 시 전체 내용 툴팁
  footer?: FooterAggr   // 푸터 집계: 'sum' | 'avg' | 'count' | 'min' | 'max' | 함수
  footerLabel?: string  // 집계값 앞 레이블 (예: '합계')
  // currency 타입 전용
  currencySymbol?: string  // 통화 기호 (기본: '₩')
  decimals?: number        // 소수점 자릿수 (기본: 0)
  // rating 타입 전용
  maxRating?: number       // 최대 별점 수 (기본: 5)
  // sparkline 타입 전용
  sparklineColor?: string  // 라인 색상 (기본: '#3b82f6')
  sparklineHeight?: number // SVG 높이 px (기본: 32)
}

// FooterAggr 타입
type FooterAggr = 'sum' | 'avg' | 'count' | 'min' | 'max' | ((rows: any[]) => any)
```

## 타입별 상세

### `text` (기본값)

일반 텍스트. 더블 클릭 또는 즉시 타이핑으로 편집.

```ts
{ key: 'name', title: '이름', type: 'text' }
```

### `number`

숫자. 읽기 모드에서 천 단위 쉼표 포맷 표시.

```ts
{ key: 'salary', title: '급여', type: 'number', align: 'right' }
```

### `date`

날짜. 편집 시 브라우저 기본 datepicker 사용. `YYYY-MM-DD` 형식으로 저장.

```ts
{ key: 'joinDate', title: '입사일', type: 'date', align: 'center' }
```

### `boolean`

체크박스. 클릭 즉시 `@update:cell` 발생.

```ts
{ key: 'active', title: '활성', type: 'boolean', align: 'center' }
```

### `select`

드롭다운. `options`의 `value`로 저장, `label`로 표시.

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

색상 태그. `options`의 `color`에 Tailwind 클래스 지정.

```ts
{
  key: 'status', title: '상태', type: 'badge',
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

클릭 가능한 버튼 셀. `@click:button` 이벤트 발생.

```ts
{
  key: 'action', title: '관리', type: 'button', align: 'center',
  options: [{ label: '상세보기' }]
}
```

### `link`

URL을 클릭 가능한 링크로 표시. 새 탭 열림.

```ts
{ key: 'website', title: '홈페이지', type: 'link' }
```

### `radio`

인라인 라디오 버튼 그룹.

```ts
{
  key: 'gender', title: '성별', type: 'radio', align: 'center',
  options: [
    { label: '남', value: 'M' },
    { label: '여', value: 'F' },
  ]
}
```

### `tag`

`string[]` 배열 데이터를 칩(chip) UI로 렌더링. 편집 불가.
필터: 텍스트 포함 여부. 정렬: 태그 개수 기준.

```ts
{ key: 'tags', title: '태그', type: 'tag', width: 200 }
// row.tags 예: ['긴급', '검토중']
```

### `currency`

숫자 데이터를 통화 기호 + 천 단위 포맷으로 표시. 편집 시 `<input type="number">`.
`currencySymbol`(기본 `'₩'`)과 `decimals`(기본 `0`) 옵션을 지원합니다.
필터: min/max 숫자 범위.

```ts
{
  key: 'price', title: '가격', type: 'currency', align: 'right', width: 140,
  currencySymbol: '₩',
  decimals: 0,
}
```

### `rating`

숫자 값(1~N)을 별점(★) UI로 표시. 클릭 즉시 `@update:cell` 이벤트 발생.
`maxRating`(기본 `5`) 옵션으로 최대 별 수를 지정합니다.
필터: min/max 숫자 범위.

```ts
{ key: 'score', title: '평점', type: 'rating', align: 'center', width: 140, maxRating: 5 }
```

### `datetime`

날짜+시간 문자열. 편집 시 `<input type="datetime-local">` 사용.
표시 형식: `YYYY-MM-DD HH:mm`. 저장 형식: `YYYY-MM-DD HH:mm`.
필터: from/to 날짜+시간 범위.

```ts
{ key: 'createdAt', title: '등록일시', type: 'datetime', width: 160, align: 'center' }
```

### `color`

CSS 색상 문자열을 색상 박스로 표시. 색상 피커 클릭 즉시 `@update:cell` 이벤트 발생.
필터: 텍스트 포함 여부.

```ts
{ key: 'labelColor', title: '색상', type: 'color', align: 'center', width: 80 }
// row.labelColor 예: '#3b82f6'
```

### `email`

이메일 문자열을 `mailto:` 링크로 표시. 편집 시 `<input type="email">`.
필터: 텍스트 포함 여부.

```ts
{ key: 'email', title: '이메일', type: 'email', width: 200 }
```

### `sparkline`

`number[]` 배열 데이터를 SVG polyline 미니 라인 차트로 렌더링합니다. 편집 불가.

| 옵션 | 타입 | 기본값 | 설명 |
| :--- | :--- | :---: | :--- |
| `sparklineColor` | `string` | `'#3b82f6'` | 라인 색상 |
| `sparklineHeight` | `number` | `32` | SVG 높이(px) |

```ts
{
  key: 'trend', title: '트렌드', type: 'sparkline', width: 140,
  sparklineColor: '#10b981',
  sparklineHeight: 32,
}
// row.trend 예: [12, 34, 28, 45, 33, 52, 41]
```
