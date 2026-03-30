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
