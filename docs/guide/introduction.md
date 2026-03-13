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
| 한국어 문서 | ✅ | ❌ | ❌ |
| 라이선스 | Commercial | MIT | Commercial |

## 주요 특징

### 고성능 가상 스크롤
화면에 보이는 행만 DOM에 렌더링하여 수십만 건의 데이터도 빠르게 처리합니다.

### 10종 이상의 컬럼 타입
`text`, `number`, `select`, `date`, `checkbox`, `button`, `link`, `image`, `custom` 등 다양한 컬럼 타입을 제공합니다.

### Excel 완벽 연동
셀 범위 선택 후 Ctrl+C로 복사하고 Excel에 붙여넣을 수 있습니다. 반대로 Excel에서 Ctrl+C한 데이터를 그리드에 붙여넣기도 가능합니다.

### 실시간 데이터 검증
`required`, `minLength`, `maxLength`, `min`, `max`, `regex`, `custom` 등 다양한 검증 규칙을 컬럼별로 설정할 수 있습니다.
