# UX 팁

소규모 기능 조합으로 사용성을 크게 개선하는 패턴을 모았습니다.

## 다중 정렬 (Shift+Click)

헤더를 그냥 클릭하면 단일 정렬, **Shift+Click**하면 기존 정렬에 이어 누적됩니다. 같은 컬럼을 Shift+반복 클릭하면 `asc → desc → 제거`로 순환합니다.

```vue
<WZGrid :columns="columns" :rows="rows" v-model:sort="sort" />
```

부모에서 `SortConfig[]`를 관리해 서버 쿼리·로컬 스토리지 등 외부로 동기화할 수 있습니다(자세한 내용은 [제어 상태 (v-model)](./controlled-state.md) 참고).

## 날짜 필터 프리셋

`date` / `datetime` 타입 컬럼의 필터 영역에는 **오늘 / 최근 7일 / 이번 달** 프리셋 버튼이 자동 렌더됩니다. 버튼을 누르면 `from`·`to`가 해당 범위로 즉시 채워집니다.

| 프리셋 | from | to |
|:-------|:-----|:---|
| 오늘 | 오늘 00:00 | 오늘 23:59 |
| 최근 7일 | 6일 전 00:00 | 오늘 23:59 |
| 이번 달 | 1일 00:00 | 말일 23:59 |

프리셋 버튼 라벨은 i18n `datePreset.today`, `datePreset.last7Days`, `datePreset.thisMonth`로 교체 가능합니다.

## 개별 필터 지우기 (X 버튼)

필터 행의 활성화된 컬럼 오른쪽 상단에 X 버튼이 표시됩니다. 클릭하면 해당 컬럼의 필터만 초기화됩니다. 전체 필터 초기화는 툴바 버튼(또는 `@clear-all-filters` 이벤트)을 사용하세요.

## 페이징 UX

`WZGridPagination`은 다음을 기본 제공합니다:

- `«` `»` 처음/마지막 페이지 버튼
- `‹` `›` 이전/다음 페이지 버튼
- 페이지 번호 직접 입력 필드
- 페이지 크기 셀렉트 (10 / 20 / 50 / 100)
- 선택된 행 수 표시 (`체크된 행 > 0`일 때)

`v-model:currentPage` / `v-model:pageSize`로 외부 상태와 연동하거나, 클라이언트 측 상태만으로 사용할 수 있습니다.

## 빈 상태 CTA 슬롯

데이터가 0건이고 `loading=false`일 때 `#empty` 슬롯이 렌더됩니다. CTA(새로고침, 필터 초기화 등)가 필요하면 **`#empty-actions`** 슬롯을 함께 사용하세요.

```vue
<WZGrid :columns="columns" :rows="rows" :loading="isLoading">
  <template #empty>
    <div class="text-gray-500">조건에 맞는 데이터가 없습니다</div>
  </template>
  <template #empty-actions>
    <button class="btn-outline" @click="reload">새로고침</button>
    <button class="btn-outline" @click="clearFilters">필터 초기화</button>
  </template>
</WZGrid>
```

## 키보드만으로 조작

`Home` / `End`, `Ctrl+Home` / `Ctrl+End`, `PageUp` / `PageDown` 단축키로 셀 간 **대규모 점프**가 가능합니다. 자세한 단축키는 [접근성 가이드](./accessibility.md)의 키보드 단축키 섹션을 참고하세요.

## 로딩 스켈레톤

`loading=true`일 때 기본 스켈레톤이 `loadingRowCount`(기본 5)개 렌더됩니다. 더 구체적인 스피너 UI가 필요하면 `#loading` 슬롯을 사용하세요. 로딩 중에는 `aria-busy="true"`가 자동 적용되어 스크린 리더가 작업 중임을 인식합니다.
