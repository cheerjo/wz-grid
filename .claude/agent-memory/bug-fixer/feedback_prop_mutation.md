---
name: prop mutation v-model 패턴 주의
description: 자식 컴포넌트에서 prop에 v-model을 사용하면 값이 반영되지 않음 — update:propName 패턴 필수
type: feedback
---

자식 컴포넌트로 분리된 편집 UI에서 부모 ref 값을 v-model로 직접 바인딩하면 prop mutation 경고와 함께 값이 반영되지 않는다.

**Why:** WZGridRow.vue 분리 시 editValue prop에 v-model="editValue"를 그대로 사용했는데, Vue의 단방향 데이터 흐름 원칙에 의해 prop 변경이 부모 ref에 반영되지 않아 편집 내용이 유실되었다.

**How to apply:** 자식 컴포넌트에서 편집 가능한 값을 prop으로 받을 때는 반드시 `:value="prop"` + `@input="$emit('update:prop', newVal)"` 패턴을 사용하고, 부모에서는 `v-model:prop="ref"`로 바인딩한다.
