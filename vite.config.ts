// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // vue-demi가 올바른 버전을 찾도록 설정
      'vue': 'vue/dist/vue.esm-browser.js',
      // 패키지 소스 경로 alias (데모 앱에서 dist 없이 소스 직접 사용)
      '@wezon/wz-grid-core': path.resolve(__dirname, 'packages/core/src/index.ts'),
      '@wezon/wz-grid-vue': path.resolve(__dirname, 'packages/vue/src/index.ts'),
    }
  }
});
