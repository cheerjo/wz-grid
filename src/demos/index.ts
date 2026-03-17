import { defineAsyncComponent, markRaw } from 'vue';

const DemoBasic       = markRaw(defineAsyncComponent(() => import('./DemoBasic.vue')));
const DemoTree        = markRaw(defineAsyncComponent(() => import('./DemoTree.vue')));
const DemoColumnTypes = markRaw(defineAsyncComponent(() => import('./DemoColumnTypes.vue')));

export const demos = [
  { id: 'basic',        label: '종합 데모',  component: DemoBasic },
  { id: 'tree',         label: '트리 그리드', component: DemoTree },
  { id: 'column-types', label: '컬럼 타입',  component: DemoColumnTypes },
] as const;

export type DemoId = typeof demos[number]['id'];
