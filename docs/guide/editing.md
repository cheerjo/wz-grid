# 편집 & 검증

## 셀 편집

`text`, `number`, `date`, `select` 타입 컬럼은 기본적으로 편집 가능합니다.
`boolean`은 클릭 즉시 토글, `badge`/`progress`/`image`/`button`/`link`/`radio`는 편집 불가입니다.

- 더블 클릭 또는 알파벳/숫자 키 입력으로 편집 모드 진입
- `Enter` 또는 포커스 이탈로 저장 → `@update:cell` 이벤트 발생
- `Esc`로 편집 취소

```ts
const handleUpdate = ({ row, colKey, value }: any) => {
  const target = rows.value.find(r => r.id === row.id)
  if (target) (target as any)[colKey] = value
}
```

## 데이터 검증

### required — 필수 입력

```ts
{ key: 'name', title: '이름', required: true }
```

- 헤더에 빨간 `*` 표시
- 빈 값 저장 시 셀에 빨간 테두리 + 오류 메시지
- 셀 호버 시 툴팁으로 오류 내용 표시

### validator — 커스텀 검증

```ts
{
  key: 'age', title: '나이', type: 'number',
  validator: (value, row) => {
    if (value < 0 || value > 150) return '나이는 0~150 사이여야 합니다.'
    return null
  }
}
```

### onInput — 실시간 입력 가공

타이핑 중 값을 실시간으로 변환합니다.

```ts
// 대문자로 자동 변환
{ key: 'code', title: '코드', onInput: (v) => String(v).toUpperCase() }

// 숫자만 허용
{ key: 'phone', title: '전화번호', onInput: (v) => v.replace(/\D/g, '') }
```

**검증 동작 시점:**
- 컴포넌트 마운트 시 전체 rows에 대해 즉시 실행
- `rows` prop 변경 시 자동 재검증
- 셀 편집 후 저장 시 해당 셀 재검증
