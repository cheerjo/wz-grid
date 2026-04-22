// packages/vue/vite.lib.config.ts — Vue 래퍼 패키지 빌드
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
      outDir: 'dist',
    }),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  resolve: {
    alias: {
      // 개발 시 workspace 패키지를 소스로 직접 참조
      '@anthropic/wz-grid-core': resolve(__dirname, '../core/src/index.ts'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'WZGridVue',
      formats: ['es', 'cjs'],
      fileName: (format) => `wz-grid-vue.${format}.js`,
    },
    rollupOptions: {
      external: [
        'vue',
        'vue-demi',
        '@vue/composition-api',
        'exceljs',
        '@anthropic/wz-grid-core',
      ],
      output: {
        globals: {
          vue: 'Vue',
          'vue-demi': 'VueDemi',
          '@vue/composition-api': 'VueCompositionAPI',
          exceljs: 'ExcelJS',
          '@anthropic/wz-grid-core': 'WZGridCore',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'wz-grid-vue.css';
          return assetInfo.name ?? 'asset';
        },
      },
    },
    cssCodeSplit: false,
    outDir: 'dist',
    emptyOutDir: true,
  },
});
