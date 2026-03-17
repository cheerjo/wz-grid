<template>
  <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;">
    <p style="margin-bottom: 10px; font-size: 13px; color: #6b7280;">
      행을 클릭하면 파란색으로 하이라이트됩니다
    </p>
    <WZGrid
      :columns="columns"
      :rows="rows"
      :height="300"
      :row-class="getRowClass"
      :cell-class="getCellClass"
      @click:row="handleClickRow"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const selectedRowId = ref<number | null>(null);

const columns = ref([
  { key: 'id',     title: 'ID',   width: 60 },
  { key: 'name',   title: '이름', width: 120 },
  { key: 'dept',   title: '부서', width: 110 },
  { key: 'salary', title: '급여', width: 130, type: 'number', align: 'right' },
  {
    key: 'status',
    title: '상태',
    width: 90,
    type: 'badge',
    align: 'center',
    options: [
      { value: 'Active',   label: 'Active',   color: 'bg-green-100 text-green-700' },
      { value: 'Pending',  label: 'Pending',  color: 'bg-yellow-100 text-yellow-700' },
      { value: 'Inactive', label: 'Inactive', color: 'bg-red-100 text-red-700' },
    ],
  },
]);

const rows = ref([
  { id: 1, name: '홍길동', dept: '개발팀',   salary: 85000000, status: 'Active'   },
  { id: 2, name: '김철수', dept: '디자인팀', salary: 72000000, status: 'Pending'  },
  { id: 3, name: '이영희', dept: '사업팀',   salary: 68000000, status: 'Inactive' },
  { id: 4, name: '박민준', dept: '인사팀',   salary: 90000000, status: 'Active'   },
  { id: 5, name: '최수진', dept: '개발팀',   salary: 78000000, status: 'Inactive' },
  { id: 6, name: '정태양', dept: '디자인팀', salary: 75000000, status: 'Pending'  },
]);

const handleClickRow = ({ row }: any) => {
  selectedRowId.value = row.id;
};

const getRowClass = (row: any) => {
  if (row.id === selectedRowId.value) return 'demo-row-style-selected';
  if (row.status === 'Inactive') return 'demo-row-style-inactive';
  return '';
};

const getCellClass = (row: any, column: any) => {
  if (column.key === 'salary' && row.salary > 70000000) return 'demo-row-style-high-salary';
  return '';
};
</script>

<style>
.demo-row-style-selected {
  background-color: #dbeafe !important;
}
.demo-row-style-inactive {
  background-color: #fee2e2 !important;
}
.demo-row-style-high-salary {
  background-color: #fef9c3 !important;
  font-weight: 700;
}
</style>
