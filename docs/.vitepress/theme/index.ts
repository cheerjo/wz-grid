import DefaultTheme from 'vitepress/theme';
import { WZGrid } from '@wezon/wz-grid-vue';
import '../../../packages/vue/src/lib.css';
import DemoGrid from '../components/DemoGrid.vue';

// demos/ 폴더의 Demo*.vue를 자동 글로벌 등록
const demoModules = import.meta.glob('../components/demos/Demo*.vue', { eager: true }) as Record<string, { default: any }>;

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: { app: any }) {
    app.component('WZGrid', WZGrid);
    app.component('DemoGrid', DemoGrid);

    // Demo*.vue 자동 등록 (파일명 = 컴포넌트명)
    for (const path in demoModules) {
      const name = path.split('/').pop()!.replace('.vue', '');
      app.component(name, demoModules[path].default);
    }
  },
};
