<template>
  <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;">
    <WZGrid
      :columns="columns"
      :rows="rows"
      :height="400"
      :use-filter="true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { deptOptions } from './sampleData';

const columns = ref([
  {
    key: 'name',
    title: '이름',
    width: 120,
    editable: true,
  },
  {
    key: 'dept',
    title: '부서',
    width: 110,
    type: 'select',
    options: deptOptions,
  },
  {
    key: 'salary',
    title: '급여',
    width: 130,
    type: 'number',
    align: 'right',
  },
  {
    key: 'joinDate',
    title: '입사일',
    width: 130,
    type: 'date',
    align: 'center',
  },
  {
    key: 'status',
    title: '상태',
    width: 90,
    type: 'badge',
    align: 'center',
    options: [
      { value: 'active',   label: '재직', color: 'bg-green-100 text-green-700' },
      { value: 'leave',    label: '휴직', color: 'bg-yellow-100 text-yellow-700' },
      { value: 'resigned', label: '퇴직', color: 'bg-red-100 text-red-700' },
    ],
  },
  {
    key: 'active',
    title: '재직중',
    width: 70,
    type: 'boolean',
    align: 'center',
  },
]);

const rows = ref([
  { id:  1, name: '홍길동', dept: 'dev',    salary: 85000000, joinDate: '2020-03-01', status: 'active',   active: true  },
  { id:  2, name: '김철수', dept: 'design', salary: 72000000, joinDate: '2021-07-15', status: 'active',   active: true  },
  { id:  3, name: '이영희', dept: 'biz',    salary: 45000000, joinDate: '2019-11-20', status: 'leave',    active: false },
  { id:  4, name: '박민준', dept: 'hr',     salary: 90000000, joinDate: '2022-01-10', status: 'active',   active: true  },
  { id:  5, name: '최수진', dept: 'dev',    salary: 58000000, joinDate: '2020-09-05', status: 'active',   active: true  },
  { id:  6, name: '정태양', dept: 'design', salary: 38000000, joinDate: '2018-04-22', status: 'resigned', active: false },
  { id:  7, name: '윤하나', dept: 'dev',    salary: 95000000, joinDate: '2023-02-14', status: 'active',   active: true  },
  { id:  8, name: '강지훈', dept: 'biz',    salary: 62000000, joinDate: '2021-12-01', status: 'active',   active: true  },
  { id:  9, name: '서민정', dept: 'hr',     salary: 42000000, joinDate: '2017-06-30', status: 'leave',    active: false },
  { id: 10, name: '오재원', dept: 'dev',    salary: 110000000, joinDate: '2015-08-12', status: 'resigned', active: false },
]);
</script>
