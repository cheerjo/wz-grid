<template>
  <section class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
    <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
      <div>
        <h2 class="text-sm font-bold text-gray-700">트리 구조 (Tree Grid)</h2>
        <p class="text-xs text-gray-500 mt-0.5">조직도 예제 · <code class="bg-gray-100 px-1 rounded">useTree</code> · 필터 연동 · 접기/펼치기</p>
      </div>
      <span class="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 font-semibold">Community ✓</span>
    </div>
    <div class="p-4">
      <WZGrid
        :columns="treeColumns"
        :rows="treeRows"
        :height="380"
        :useTree="true"
        treeKey="name"
        :useFilter="true"
        :showFooter="true"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import WZGrid from '../components/WZGrid.vue';
import type { Column } from '../types/grid';

// injectLicense 사용 가능 (현재 트리 데모는 라이선스 불필요)
// import { injectLicense } from './shared/useLicense';

const treeColumns: Column[] = [
  { key: 'name',   title: '이름 / 직책', width: 200, type: 'text',   pinned: true },
  { key: 'role',   title: '직책',        width: 150, type: 'text' },
  { key: 'dept',   title: '부서',        width: 110, type: 'text',   align: 'center' },
  { key: 'salary', title: '연봉 (원)',   width: 150, type: 'number', align: 'right', footer: 'sum', footerLabel: '합계' },
  { key: 'email',  title: '이메일',      width: 220, type: 'text' },
];

const treeRows = ref([
  {
    id: 1, name: '홍길동', role: '대표이사', dept: '경영', salary: 200000000, email: 'ceo@company.com',
    children: [
      {
        id: 2, name: '김개발', role: '개발팀장', dept: '개발', salary: 95000000, email: 'dev@company.com',
        children: [
          { id: 5,  name: '이주니어',  role: '주니어 개발자', dept: '개발', salary: 42000000, email: 'junior@company.com' },
          { id: 6,  name: '박시니어',  role: '시니어 개발자', dept: '개발', salary: 78000000, email: 'senior@company.com' },
          {
            id: 10, name: '최테크리드', role: '테크리드',      dept: '개발', salary: 88000000, email: 'tech@company.com',
            children: [
              { id: 11, name: '강풀스택', role: '풀스택 개발자', dept: '개발', salary: 65000000, email: 'fullstack@company.com' },
            ],
          },
        ],
      },
      {
        id: 3, name: '최디자인', role: '디자인팀장', dept: '디자인', salary: 82000000, email: 'design@company.com',
        children: [
          { id: 7, name: '정UX', role: 'UX 디자이너', dept: '디자인', salary: 58000000, email: 'ux@company.com' },
          { id: 8, name: '윤UI', role: 'UI 디자이너', dept: '디자인', salary: 55000000, email: 'ui@company.com' },
        ],
      },
      {
        id: 4, name: '박사업', role: '사업팀장', dept: '사업', salary: 92000000, email: 'biz@company.com',
        children: [
          { id: 9, name: '손영업', role: '영업 담당', dept: '사업', salary: 62000000, email: 'sales@company.com' },
        ],
      },
    ],
  },
]);
</script>
