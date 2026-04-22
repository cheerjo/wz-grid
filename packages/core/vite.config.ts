import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      outDir: 'dist',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'WZGridCore',
      formats: ['es', 'cjs'],
      fileName: (format) => `wz-grid-core.${format}.js`,
    },
    rollupOptions: {
      // exceljs도 external로 처리 (소비자가 설치)
      external: ['exceljs'],
      output: {
        globals: {
          exceljs: 'ExcelJS',
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
