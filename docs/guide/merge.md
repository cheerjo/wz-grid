# 셀 병합

## 라이브 데모

<ClientOnly>
  <DemoMerge />
</ClientOnly>

## 자동 병합 (autoMergeCols)

지정한 컬럼에서 인접한 동일 값 셀을 위아래로 자동 병합(rowspan)합니다.

```vue
<WZGrid :autoMergeCols="['dept', 'team']" ... />
```

## 수동 병합 (mergeCells)

특정 위치의 셀을 직접 지정하여 병합합니다.

```ts
type MergeCell = {
  row: number      // 시작 행 인덱스
  col: number      // 시작 열 인덱스
  rowspan?: number // 세로 병합 수
  colspan?: number // 가로 병합 수
}
```

```vue
<WZGrid :mergeCells="[{ row: 0, col: 1, rowspan: 3, colspan: 2 }]" ... />
```

::: warning 대량 데이터 + 병합
기본 동작에서는 셀 병합이 활성화되면 가상 스크롤이 비활성화되어 모든 행이 렌더됩니다. 행이 수천 건 이상이면 렌더 성능이 크게 떨어질 수 있습니다.
:::

## 병합 + 가상 스크롤 (`virtualizeWithMerge`)

`virtualizeWithMerge: true` prop을 활성화하면 **병합이 있더라도 가상 스크롤이 유지**됩니다. 내부적으로 `useMerge.getMergeSpan`으로 viewport 경계 행이 속한 병합 블록의 전체 범위를 조회해, 렌더 범위를 블록 경계까지 확장합니다 — 결과적으로 블록이 절단되지 않으면서도 viewport 밖의 병합되지 않은 행은 렌더되지 않습니다.

```vue
<WZGrid
  :rows="largeRows"
  :auto-merge-cols="['dept']"
  :virtualize-with-merge="true"
/>
```

| Prop | 타입 | 기본값 | 설명 |
|:-----|:-----|:------:|:-----|
| `virtualizeWithMerge` | `boolean` | `false` | 병합 활성 상태에서도 가상 스크롤 유지 (opt-in) |

**언제 켜면 좋은가?**

- 대량 데이터(수천 행 이상)에서 병합이 함께 필요할 때
- 병합 블록의 최대 크기가 viewport 높이보다 작을 때 (블록이 viewport를 가득 채우면 확장 효과가 제한적)

**제약:**

- 병합 블록이 매우 크면(예: 1000행 전체가 한 블록) 확장 결과가 거의 "전체 렌더"에 수렴하므로 기본 동작과 차이가 줄어듭니다.
- 페이지 경계를 넘는 병합은 여전히 페이지 내부 범위로만 클램프됩니다(기존 규칙 그대로).
