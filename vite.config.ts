// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // vue-demi가 올바른 버전을 찾도록 설정
      'vue': 'vue/dist/vue.esm-browser.js'
    }
  }
});
