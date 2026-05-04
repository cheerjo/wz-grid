// packages/react/vite.config.ts — React 래퍼 패키지 빌드 + playground 개발 서버
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname),
  // playground용 index.html 위치 (dev 서버에서만 사용)
  server: {
    open: '/playground/index.html',
  },
  plugins: [
    react(),
    dts({
      include: ['src'],
      outDir: 'dist',
      // 코어 패키지는 빌드 시 external이므로 DTS에 포함하지 않음
      exclude: ['../core/**'],
    }),
  ],
  resolve: {
    alias: {
      '@wezon/wz-grid-core': resolve(__dirname, '../core/src/index.ts'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'WZGridReact',
      formats: ['es', 'cjs'],
      fileName: (format) => `wz-grid-react.${format}.js`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@wezon/wz-grid-core',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          '@wezon/wz-grid-core': 'WZGridCore',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'wz-grid-react.css';
          return assetInfo.name ?? 'asset';
        },
      },
    },
    cssCodeSplit: false,
    outDir: 'dist',
    emptyOutDir: true,
  },
});
