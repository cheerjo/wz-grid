# 셀 병합

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

::: warning
셀 병합이 활성화되면 가상 스크롤은 자동으로 비활성화됩니다.
:::
