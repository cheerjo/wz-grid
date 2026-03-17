# 페이징 & 가상 스크롤

## 라이브 데모

<ClientOnly>
  <DemoPaging />
</ClientOnly>

## 페이징

`usePaging`을 `true`로 설정하면 하단에 페이징 UI가 나타납니다.

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :usePaging="true"
  v-model:currentPage="currentPage"
  v-model:pageSize="pageSize"
/>
```

```ts
const currentPage = ref(1)
const pageSize = ref(20)
```

**페이징 UI 기능:**

| 요소 | 동작 |
| :--- | :--- |
| `«` / `»` | 첫 페이지 / 마지막 페이지로 이동 |
| `‹` / `›` | 이전 페이지 / 다음 페이지로 이동 |
| 숫자 입력 | 직접 페이지 번호 입력 후 Enter |
| Page Size 셀렉트 | 10, 20, 50, 100 중 선택. 변경 시 1페이지로 자동 리셋 |
| Total 표시 | 전체 `rows` 배열 길이 표시 |

## 가상 스크롤

별도 설정 없이 자동으로 적용됩니다.

- 현재 viewport에 보이는 행만 실제 DOM으로 렌더링
- 나머지 행은 `paddingTop` / `paddingBottom`으로 공간만 확보
- 기본 버퍼: 상하 각 5행 (보이는 범위 밖 미리 렌더링)
- 10만 건 이상도 끊김 없이 스크롤 가능

::: tip rowHeight 일치
`rowHeight` prop이 실제 행 높이와 일치해야 스크롤 계산이 정확합니다.
:::

::: warning 셀 병합 시 비활성화
`autoMergeCols` 또는 `mergeCells`를 사용하면 가상 스크롤이 자동으로 비활성화됩니다.
:::
