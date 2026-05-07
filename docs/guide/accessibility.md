# 접근성 (a11y)

WZ-Grid는 WAI-ARIA 패턴과 키보드 단축키를 기본 탑재합니다.

## 키보드 단축키

그리드 컨테이너에 포커스를 준 뒤 아래 단축키를 사용할 수 있습니다.

| 키 | 동작 |
|:---|:-----|
| `↑` `↓` `←` `→` | 셀 이동. 연속된 그룹 헤더/소계는 자동 스킵 |
| `Shift+↑`/`↓`/`←`/`→` | 선택 영역 확장 |
| `Home` | 현재 행의 **첫 컬럼**으로 이동 |
| `End`  | 현재 행의 **마지막 컬럼**으로 이동 |
| `Ctrl+Home` / `⌘+Home` | 첫 데이터 셀로 이동 |
| `Ctrl+End` / `⌘+End`   | 마지막 데이터 셀로 이동 |
| `PageUp` | 한 페이지 위로 (기본 `pageSize` 행 단위) |
| `PageDown` | 한 페이지 아래로 |
| `Enter` | 현재 셀 편집 모드 진입 |
| `Escape` | 선택 해제, 또는 컨텍스트 메뉴·필터 드롭다운 닫기 |
| `Backspace` `Delete` | 편집 가능한 셀의 값 지우기 |
| `Ctrl+C` / `⌘+C` | 선택 영역을 TSV로 클립보드 복사 |
| `Ctrl+V` / `⌘+V` | 클립보드에서 붙여넣기 |
| 알파벳/숫자 입력 | 셀에 해당 글자로 편집 시작 |

::: tip Shift 수식자
`Shift+클릭`으로 헤더를 클릭하면 **다중 정렬**이 누적됩니다. 같은 컬럼을 반복 Shift+클릭하면 `asc → desc → 제거` 순으로 순환합니다.
:::

## 포커스 트랩

컨텍스트 메뉴·컬럼 설정·다중 선택 필터 드롭다운은 열려 있는 동안 **Tab / Shift+Tab** 포커스가 내부 요소 사이에서만 순환합니다. `Esc`를 누르면 팝업을 닫고 호출자 요소로 포커스가 복귀합니다.

내부 구현은 `useFocusTrap` composable로 노출되어 있어 커스텀 팝업에도 같은 동작을 적용할 수 있습니다:

```ts
import { ref } from 'vue'
import { useFocusTrap } from '@wezon/wz-grid-vue'

const menuEl = ref<HTMLElement | null>(null)
const visible = ref(false)

useFocusTrap({
  containerRef: menuEl,
  active: visible,
  onEscape: () => { visible.value = false },
})
```

## ARIA 속성 매트릭스

| 요소 | 속성 | 값 |
|:-----|:-----|:---|
| 테이블 컨테이너 | `role` | `grid` |
| 테이블 컨테이너 | `aria-busy` | `loading` prop과 동기화 |
| 테이블 컨테이너 | `aria-rowcount` | 전체 활성 항목 수 |
| 헤더 셀 | `role` | `columnheader` |
| 헤더 셀 | `aria-sort` | `ascending` / `descending` / `none` |
| 필터 드롭다운 | `role` | `menu` |
| 컨텍스트 메뉴 | `role` | `menu`, 각 항목 `menuitem` |
| 체크박스 (행) | `aria-label` | i18n `aria.selectRow` |
| 체크박스 (헤더) | `aria-label` | i18n `aria.selectAll` |
| 행 드래그 핸들 | `role`, `aria-label` | `button`, i18n `aria.rowDragHandle` |
| 트리 토글 | `aria-expanded`, `aria-label` | 상태에 따라, i18n `aria.toggleExpand` |
| 디테일 토글 | `aria-expanded`, `aria-label` | 상태에 따라, i18n `aria.toggleDetail` |
| 상태 라이브 영역 | `role`, `aria-live` | `status`, `polite` |
| 빈 상태 | `role`, `aria-label` | `status`, i18n `aria.empty` |

## i18n 키 — aria / datePreset

접근성 라벨은 모두 i18n을 통해 교체 가능합니다. `locale` 또는 `messages` prop으로 덮어쓰세요.

```ts
const messages = {
  aria: {
    selectRow: 'Row selection',
    rowDragHandle: 'Drag handle',
    contextMenu: 'Context menu',
  },
  datePreset: {
    today: 'Today',
    last7Days: 'Last 7 days',
    thisMonth: 'This month',
  },
}
```

## 색 대비

WZ-Grid 기본 팔레트는 WCAG 2.1 AA 기준을 목표로 설계되었습니다. 본문 텍스트·링크·활성 필터 도트 등은 **최소 4.5:1** 대비를 유지합니다. 커스텀 클래스(`rowClass`, `cellClass`, `#cell-*` 슬롯) 사용 시 대비를 직접 검증해 주세요.

- Chrome DevTools → Lighthouse → Accessibility 감사
- [axe DevTools](https://www.deque.com/axe/browser-extensions/) 확장으로 0 critical 목표

## 스크린 리더 안내

- 정렬 변경 시 `role="status"` 라이브 영역에 i18n `aria.sortChanged` 메시지가 공지됩니다.
- 필터 적용/해제 시 `aria.filterActive` / `aria.filterCleared`가 공지됩니다.
- `loading=true`일 때 `aria-busy="true"`가 부여되어 스크린 리더가 작업 중임을 인식합니다.
