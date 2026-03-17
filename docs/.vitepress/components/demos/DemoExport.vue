<template>
  <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;">
    <WZGrid
      :columns="columns"
      :rows="rows"
      :height="350"
      :show-excel-export="true"
      excel-filename="demo-export.xlsx"
      :use-checkbox="true"
      :show-add="false"
      :show-delete="false"
    />
    <p style="margin: 12px 0 0; font-size: 13px; color: #6b7280;">
      툴바의 Excel 버튼으로 내보내기 가능 (체크된 행이 있으면 해당 행만 내보냅니다)
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { basicRows, deptOptions } from './sampleData';

const columns = ref([
  { key: 'id',    title: 'ID',   width: 60 },
  { key: 'name',  title: '이름', width: 120 },
  { key: 'dept',  title: '부서', width: 110, type: 'select', options: deptOptions },
  { key: 'score', title: '점수', width: 80,  type: 'number', align: 'right' },
  {
    key: 'status', title: '상태', width: 90, type: 'badge', align: 'center',
    options: [
      { value: 'active',   label: '재직', color: 'bg-green-100 text-green-700' },
      { value: 'leave',    label: '휴직', color: 'bg-yellow-100 text-yellow-700' },
      { value: 'resigned', label: '퇴직', color: 'bg-red-100 text-red-700' },
    ],
  },
  { key: 'active', title: '활성', width: 70, type: 'boolean', align: 'center' },
]);

const rows = ref([...basicRows]);
</script>
