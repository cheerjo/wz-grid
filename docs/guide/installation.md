# 설치

## npm

```bash
npm install wz-grid
```

## yarn

```bash
yarn add wz-grid
```

## CDN (브라우저 직접 사용)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/wz-grid/dist/wz-grid.css">
<script src="https://cdn.jsdelivr.net/npm/wz-grid/dist/wz-grid.cjs.js"></script>
```

## Optional 의존성

Excel 내보내기 기능(`showExcelExport`)을 사용하려면 ExcelJS를 추가로 설치해야 합니다.

```bash
npm install exceljs
```

ExcelJS를 설치하지 않으면 Excel 내보내기 버튼이 표시되더라도 실행 시 오류가 발생합니다. CSV 내보내기와 인쇄 기능은 ExcelJS 없이도 동작합니다.

## CSS 임포트

패키지 설치 후 CSS를 반드시 임포트해야 합니다.

```js
// main.ts 또는 main.js
import 'wz-grid/dist/wz-grid.css'
```

## 전역 등록 (Vue 3)

```js
// main.ts
import { createApp } from 'vue'
import { WZGrid } from 'wz-grid'
import 'wz-grid/dist/wz-grid.css'
import App from './App.vue'

const app = createApp(App)
app.component('WZGrid', WZGrid)
app.mount('#app')
```

## 전역 등록 (Vue 2)

```js
// main.js
import Vue from 'vue'
import { WZGrid } from 'wz-grid'
import 'wz-grid/dist/wz-grid.css'

Vue.component('WZGrid', WZGrid)
```

## 로컬 등록

```vue
<script setup lang="ts">
import { WZGrid } from 'wz-grid'
import 'wz-grid/dist/wz-grid.css'
</script>
```
