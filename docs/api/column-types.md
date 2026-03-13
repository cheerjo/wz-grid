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
  editable?: boolean    // 편집 가능 여부
  pinned?: boolean      // 좌측 고정 컬럼 여부
  required?: boolean    // 필수 입력 여부 (헤더에 * 표시)
  options?: Option[]    // select/badge/radio/button 타입에서 사용
  rules?: ValidationRule[]         // 검증 규칙
  validator?: (value: any, row: any) => string | null  // 커스텀 검증
  onInput?: (value: any) => any    // 입력 중 실시간 값 가공
  truncate?: boolean    // 말줄임표 처리 (기본 true)
  tooltip?: boolean     // hover 시 전체 내용 툴팁
}
```

## 타입별 상세

### `text` (기본값)

일반 텍스트. 더블 클릭 또는 즉시 타이핑으로 편집.

```ts
{ key: 'name', title: '이름', type: 'text', editable: true }
```

### `number`

숫자. 읽기 모드에서 천 단위 쉼표 포맷 표시.

```ts
{ key: 'salary', title: '급여', type: 'number', align: 'right', editable: true }
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
