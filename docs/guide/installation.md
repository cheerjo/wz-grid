# 설치

::: tip 패키지명 변경 안내
v1.5.0부터 `wz-grid` 패키지는 deprecate되었습니다. 새 프로젝트에서는 `@wezon/wz-grid-vue`를 사용하세요.
기존 `wz-grid` 사용자는 [마이그레이션 가이드](/guide/migration)를 참고하세요.
:::

## Vue 래퍼 설치

### npm

```bash
npm install @wezon/wz-grid-vue
```

### yarn

```bash
yarn add @wezon/wz-grid-vue
```

### pnpm

```bash
pnpm add @wezon/wz-grid-vue
```

## React 래퍼 설치

```bash
npm install @wezon/wz-grid-react
```

React 사용법은 [React 가이드](/guide/react)를 참고하세요.

## 코어 단독 설치 (프레임워크 무관)

```bash
npm install @wezon/wz-grid-core
```

Svelte, Solid 등 다른 프레임워크에서 코어 로직만 사용할 때 설치합니다. 자세한 내용은 [Headless Core 가이드](/guide/headless-core)를 참고하세요.

## CSS 임포트

패키지 설치 후 CSS를 반드시 임포트해야 합니다.

```js
// main.ts 또는 main.js
import '@wezon/wz-grid-vue/dist/wz-grid.css'
```

## 전역 등록 (Vue 3)

```js
// main.ts
import { createApp } from 'vue'
import { WZGrid } from '@wezon/wz-grid-vue'
import '@wezon/wz-grid-vue/dist/wz-grid.css'
import App from './App.vue'

const app = createApp(App)
app.component('WZGrid', WZGrid)
app.mount('#app')
```

## 전역 등록 (Vue 2)

```js
// main.js
import Vue from 'vue'
import { WZGrid } from '@wezon/wz-grid-vue'
import '@wezon/wz-grid-vue/dist/wz-grid.css'

Vue.component('WZGrid', WZGrid)
```

## 로컬 등록

```vue
<script setup lang="ts">
import { WZGrid } from '@wezon/wz-grid-vue'
import '@wezon/wz-grid-vue/dist/wz-grid.css'
</script>
```
