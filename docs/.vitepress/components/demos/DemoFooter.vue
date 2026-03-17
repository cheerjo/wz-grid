<template>
  <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;">
    <WZGrid
      :columns="columns"
      :rows="rows"
      :height="350"
      :show-footer="true"
      :use-filter="true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { deptOptions } from './sampleData';

const columns = ref([
  { key: 'name',   title: '이름',   width: 120, type: 'text' },
  { key: 'dept',   title: '부서',   width: 110, type: 'select', options: deptOptions },
  { key: 'salary', title: '급여',   width: 130, type: 'number', align: 'right',  footer: 'sum', footerLabel: '합계' },
  { key: 'score',  title: '점수',   width: 80,  type: 'number', align: 'right',  footer: 'avg', footerLabel: '평균' },
  { key: 'active', title: '재직여부', width: 70,  type: 'boolean', align: 'center', footer: 'count', footerLabel: '재직수' },
]);

const rows = ref([
  { id: 1, name: '홍길동', dept: 'dev',    salary: 85000000,  score: 92, active: true  },
  { id: 2, name: '김철수', dept: 'design', salary: 72000000,  score: 88, active: true  },
  { id: 3, name: '이영희', dept: 'biz',    salary: 68000000,  score: 75, active: false },
  { id: 4, name: '박민준', dept: 'hr',     salary: 90000000,  score: 95, active: true  },
  { id: 5, name: '최수진', dept: 'dev',    salary: 78000000,  score: 83, active: true  },
  { id: 6, name: '정태양', dept: 'design', salary: 65000000,  score: 67, active: false },
  { id: 7, name: '윤하나', dept: 'dev',    salary: 82000000,  score: 91, active: true  },
  { id: 8, name: '강지훈', dept: 'biz',    salary: 71000000,  score: 79, active: true  },
]);
</script>
