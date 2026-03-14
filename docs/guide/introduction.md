# WZ-Grid 소개

WZ-Grid는 Vue 2 & 3를 동시에 지원하는 엔터프라이즈급 데이터 그리드 컴포넌트입니다.

## 왜 WZ-Grid인가?

| 기능 | WZ-Grid | AG Grid Community | Handsontable Free |
|------|---------|-------------------|-------------------|
| Vue 2 & 3 동시 지원 | ✅ | ✅ | ❌ |
| 가상 스크롤 | ✅ | ✅ | ❌ |
| Excel 복사/붙여넣기 | ✅ | ✅ | ✅ |
| 컬럼 드래그 재배치 | ✅ | ✅ | ✅ |
| 행 드래그 재배치 | ✅ | Enterprise | ❌ |
| 그룹핑 & 소계 | ✅ | ✅ | Enterprise |
| 셀 병합 | ✅ | Enterprise | ✅ |
| 트리 구조 | ✅ | ✅ | Enterprise |
| 푸터 집계 행 | ✅ | ✅ | ✅ |
| 한국어 문서 | ✅ | ❌ | ❌ |
| 라이선스 | Commercial | MIT | Commercial |

## 주요 특징

### 고성능 가상 스크롤
화면에 보이는 행만 DOM에 렌더링하여 수십만 건의 데이터도 빠르게 처리합니다.

### 10종 이상의 컬럼 타입
`text`, `number`, `select`, `date`, `boolean`, `badge`, `progress`, `button`, `link`, `image`, `radio` 등 다양한 컬럼 타입을 제공합니다.

### Excel 완벽 연동
셀 범위 선택 후 Ctrl+C로 복사하고 Excel에 붙여넣을 수 있습니다. 반대로 Excel에서 Ctrl+C한 데이터를 그리드에 붙여넣기도 가능합니다. Pro 라이선스로 `.xlsx` 파일 직접 내보내기를 지원합니다.

### 트리 구조 (Tree Grid)
`useTree` prop으로 계층형 데이터를 트리 뷰로 표시합니다. 노드 단위 접기/펼치기, 필터와 완벽 연동, 조상 노드 자동 표시 기능을 제공합니다.

### 푸터 집계 행
`showFooter` prop과 컬럼별 `footer` 속성으로 합계·평균·개수·최솟값·최댓값을 하단에 자동 집계합니다. 필터 결과에 실시간으로 반응합니다.

### 실시간 데이터 검증
`required`, `validator` 커스텀 함수 등 다양한 검증 규칙을 컬럼별로 설정할 수 있습니다. 오류 셀은 빨간 테두리와 툴팁으로 표시됩니다.
