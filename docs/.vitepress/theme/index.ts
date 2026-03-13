import DefaultTheme from 'vitepress/theme';
import { WZGrid } from '../../../src/index';
import '../../../src/lib.css';
import DemoGrid from '../components/DemoGrid.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: { app: any }) {
    app.component('WZGrid', WZGrid);
    app.component('DemoGrid', DemoGrid);
  },
};
