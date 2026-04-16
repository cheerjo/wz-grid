import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // vue-demi가 CJS로만 노출되어 있으므로 테스트 환경에서는 직접 vue로 aliasing해도
      // 공개 API 서명이 동일합니다(vue-demi는 vue 3 네임스페이스를 그대로 re-export).
      'vue-demi': path.resolve(__dirname, 'node_modules/vue-demi/lib/v3/index.mjs'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
