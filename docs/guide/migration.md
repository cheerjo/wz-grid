# 마이그레이션 가이드

WZ-Grid는 prop 네이밍을 `use` 접두어로 통일하는 작업을 진행 중입니다. 기존 prop 이름은 **하위 호환을 위해 계속 동작**하지만, 콘솔에 경고가 출력됩니다.

## Deprecated Props

다음 3개의 prop이 새 이름으로 대체되었습니다.

| 기존 이름 (deprecated) | 권장 이름 | 기능 |
| :--- | :--- | :--- |
| `showColumnSettings` | `useColumnSettings` | 컬럼 표시/숨기기 설정 버튼 |
| `showExcelExport` | `useExcelExport` | 툴바 Excel 내보내기 버튼 |
| `serverSide` | `useServerSide` | 서버사이드 정렬/필터/페이징 모드 |

## 콘솔 경고 메시지

deprecated prop을 사용하면 브라우저 콘솔에 다음과 같은 경고가 **세션당 1회** 출력됩니다.

```
[WZGrid] "showColumnSettings" prop은 deprecated입니다. "useColumnSettings"을 사용하세요.
[WZGrid] "showExcelExport" prop은 deprecated입니다. "useExcelExport"을 사용하세요.
[WZGrid] "serverSide" prop은 deprecated입니다. "useServerSide"을 사용하세요.
```

> 경고는 해당 prop의 값이 `true`일 때만 출력됩니다. 동일한 경고는 페이지 로드 이후 1회만 표시됩니다.

## 코드 변경 예시

### showColumnSettings → useColumnSettings

```vue
<!-- Before -->
<WZGrid :show-column-settings="true" ... />

<!-- After -->
<WZGrid :use-column-settings="true" ... />
```

### showExcelExport → useExcelExport

```vue
<!-- Before -->
<WZGrid :show-excel-export="true" excel-filename="data.xlsx" ... />

<!-- After -->
<WZGrid :use-excel-export="true" excel-filename="data.xlsx" ... />
```

### serverSide → useServerSide

```vue
<!-- Before -->
<WZGrid :server-side="true" :total-rows="totalCount" ... />

<!-- After -->
<WZGrid :use-server-side="true" :total-rows="totalCount" ... />
```

## 주의사항

- 기존 이름과 새 이름을 **동시에** 지정할 경우, 둘 중 하나라도 `true`이면 기능이 활성화됩니다.
- deprecated prop은 향후 메이저 버전 업그레이드 시 제거될 예정입니다.
- `showAdd`, `showDelete`, `showFooter`는 "표시 여부"라는 의미가 명확하므로 변경 계획이 없습니다.
