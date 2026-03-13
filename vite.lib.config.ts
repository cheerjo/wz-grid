// vite.lib.config.ts  — 라이브러리 배포용 빌드
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src'],
      exclude: ['src/main.ts', 'src/App.vue'],
      outDir: 'dist',
    }),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'WZGrid',
      formats: ['es', 'cjs'],
      fileName: (format) => `wz-grid.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', 'vue-demi', '@vue/composition-api'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-demi': 'VueDemi',
          '@vue/composition-api': 'VueCompositionAPI',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'wz-grid.css';
          return assetInfo.name ?? 'asset';
        },
      },
    },
    cssCodeSplit: false,
    outDir: 'dist',
    emptyOutDir: false,
  },
});
