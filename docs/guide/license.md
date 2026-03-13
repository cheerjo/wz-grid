# 라이선스 키

WZ-Grid는 **Community / Pro / Enterprise** 3가지 티어를 제공합니다.

## 티어 비교

| 기능 | Community | Pro | Enterprise |
| :--- | :---: | :---: | :---: |
| 기본 그리드, 가상 스크롤 | ✓ | ✓ | ✓ |
| 정렬, 필터, 페이징 | ✓ | ✓ | ✓ |
| 컬럼 설정, 드래그 재배치 | ✓ | ✓ | ✓ |
| 그룹핑 & 소계, 셀 병합 | ✓ | ✓ | ✓ |
| 인쇄, CSV 내보내기 | ✓ | ✓ | ✓ |
| **Excel (.xlsx) 내보내기** | ✗ | ✓ | ✓ |
| 기술 지원 | 커뮤니티 | 이메일 | 전담 지원 |
| 소스코드 접근 | ✗ | ✗ | ✓ |

## 라이선스 키 적용

`licenseKey` prop에 발급받은 키를 전달합니다.

```vue
<WZGrid
  :license-key="'WZGRID-PRO-A1B2C3D4-XXXXXXX'"
  :show-excel-export="true"
  :columns="columns"
  :rows="rows"
/>
```

또는 앱 전역에서 관리하는 경우:

```ts
// store 또는 composable
const licenseKey = import.meta.env.VITE_WZ_GRID_LICENSE_KEY ?? ''
```

```vue
<WZGrid :license-key="licenseKey" ... />
```

## 키 형식

```
WZGRID-{TIER}-{KEY_ID}-{CHECKSUM}

예: WZGRID-PRO-A1B2C3D4-2K8M3N7
```

- **TIER**: `PRO` 또는 `ENT`
- **KEY_ID**: 8자리 영숫자 (구매 시 발급)
- **CHECKSUM**: FNV-1a 해시 기반 오프라인 검증값

## 오프라인 검증

라이선스 검증은 **완전 오프라인**으로 동작합니다.
외부 서버와 통신하지 않으므로 인트라넷 환경에서도 사용 가능합니다.

```ts
import { validateLicense, isPro } from 'wz-grid'

const tier = validateLicense('WZGRID-PRO-A1B2C3D4-XXXXXXX')
// → 'pro' | 'enterprise' | 'community'

if (isPro(tier)) {
  // Pro 기능 활성화
}
```

## 라이선스 구매

[가격 정책 페이지](/pricing)에서 플랜을 확인하고 구매할 수 있습니다.
