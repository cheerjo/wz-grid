<template>
  <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;">
    <WZGrid
      :columns="columns"
      :rows="rows"
      :height="350"
      :use-filter="true"
      @sort="handleSort"
    />
    <p style="margin: 12px 0 0; font-size: 13px; color: #6b7280; text-align: center;">
      헤더 클릭으로 정렬, Shift+클릭으로 다중 정렬
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { deptOptions } from './sampleData';

const columns = ref([
  { key: 'id',       title: 'ID',    width: 60 },
  { key: 'name',     title: '이름',  width: 120 },
  { key: 'dept',     title: '부서',  width: 110, type: 'select', options: deptOptions },
  { key: 'score',    title: '점수',  width: 80,  type: 'number', align: 'right' },
  { key: 'joinDate', title: '입사일', width: 120, type: 'date',   align: 'center' },
]);

const originalRows = [
  { id: 1, name: '홍길동', dept: 'dev',    score: 92, joinDate: '2020-03-01' },
  { id: 2, name: '김철수', dept: 'design', score: 88, joinDate: '2021-07-15' },
  { id: 3, name: '이영희', dept: 'biz',    score: 75, joinDate: '2019-11-20' },
  { id: 4, name: '박민준', dept: 'hr',     score: 95, joinDate: '2022-01-10' },
  { id: 5, name: '최수진', dept: 'dev',    score: 83, joinDate: '2020-09-05' },
  { id: 6, name: '정태양', dept: 'design', score: 67, joinDate: '2018-04-22' },
  { id: 7, name: '윤하나', dept: 'dev',    score: 91, joinDate: '2023-02-14' },
  { id: 8, name: '강지훈', dept: 'biz',    score: 79, joinDate: '2021-12-01' },
];

const rows = ref([...originalRows]);

const handleSort = (configs: any[]) => {
  if (!configs.length) {
    rows.value = [...originalRows];
    return;
  }
  rows.value = [...rows.value].sort((a, b) => {
    for (const { key, order } of configs) {
      const mod = order === 'asc' ? 1 : -1;
      if ((a as any)[key] !== (b as any)[key])
        return ((a as any)[key] > (b as any)[key] ? 1 : -1) * mod;
    }
    return 0;
  });
};
</script>
