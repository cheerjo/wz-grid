# 디버깅 가이드

## debug prop

`debug` prop을 활성화하면 WZ-Grid가 데이터 정합성을 자동으로 검사하고, 문제가 발견될 경우 브라우저 콘솔에 경고를 출력합니다.

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :debug="true"
/>
```

> **프로덕션 환경에서는 `debug`를 `false`(기본값)로 설정하세요.** 검증 로직은 매 렌더마다 실행되므로 성능에 영향을 줄 수 있습니다.

| Prop | 타입 | 기본값 | 설명 |
| :--- | :--- | :---: | :--- |
| `debug` | `boolean` | `false` | 개발 시 데이터 유효성 경고 활성화 |

## 감지하는 경고 3가지

### 1. rows에 id 필드 누락

**경고 메시지:**
```
[WZGrid debug] rows에 id 필드가 누락된 항목이 N개 있습니다.
```

**원인:** WZ-Grid는 각 row를 고유하게 식별하기 위해 `id` 필드를 필수로 요구합니다. `id`가 없으면 선택, 편집, 트리 확장 등 다양한 기능이 오동작할 수 있습니다.

**해결 방법:** 모든 row 객체에 고유한 `id` 필드를 추가하세요.

```ts
// 잘못된 예
const rows = ref([
  { name: '홍길동', age: 30 },  // id 누락
]);

// 올바른 예
const rows = ref([
  { id: 1, name: '홍길동', age: 30 },
]);
```

---

### 2. column key가 row 데이터에 없는 경우

**경고 메시지:**
```
[WZGrid debug] column key "fieldName"가 row 데이터에 존재하지 않습니다.
```

**원인:** `columns` 배열에 정의된 `key`가 `rows`의 첫 번째 항목에 존재하지 않습니다. 오타이거나, 서버 응답 필드명과 컬럼 key가 불일치하는 경우에 주로 발생합니다.

**해결 방법:** `column.key`가 row 데이터의 실제 필드명과 일치하는지 확인하세요.

```ts
// 잘못된 예 — column key는 'department'이지만 row 데이터는 'dept'
const columns = ref([
  { key: 'department', title: '부서', type: 'text' },
]);
const rows = ref([
  { id: 1, dept: '개발팀' },  // key 불일치
]);

// 올바른 예
const columns = ref([
  { key: 'dept', title: '부서', type: 'text' },
]);
```

---

### 3. select 타입 컬럼에 options 미지정

**경고 메시지:**
```
[WZGrid debug] column "fieldName"는 type이 'select'이지만 options가 지정되지 않았습니다.
```

**원인:** `type: 'select'`로 설정한 컬럼에 `options` 배열이 없거나 빈 배열입니다. `select` 타입은 드롭다운 옵션 목록이 있어야 정상 동작합니다.

**해결 방법:** `select` 타입 컬럼에 반드시 `options`를 지정하세요.

```ts
// 잘못된 예 — options 누락
const columns = ref([
  { key: 'status', title: '상태', type: 'select' },
]);

// 올바른 예
const columns = ref([
  {
    key: 'status',
    title: '상태',
    type: 'select',
    options: [
      { value: 'active', label: '활성' },
      { value: 'inactive', label: '비활성' },
    ],
  },
]);
```

## 개발 환경 설정 예시

환경 변수를 활용해 개발 환경에서만 `debug`를 활성화하는 것을 권장합니다.

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :debug="import.meta.env.DEV"
/>
```
