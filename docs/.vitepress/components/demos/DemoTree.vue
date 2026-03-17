<template>
  <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;">
    <WZGrid
      :columns="columns"
      :rows="rows"
      :height="400"
      :use-tree="true"
      tree-key="name"
      :use-filter="true"
      :show-footer="true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { treeRows } from './sampleData';

const columns = ref([
  { key: 'name',   title: '이름',   width: 200, pinned: true },
  { key: 'role',   title: '직책',   width: 150 },
  { key: 'dept',   title: '부서',   width: 120, align: 'center' },
  {
    key: 'salary', title: '연봉 (원)', width: 150,
    type: 'number', align: 'right',
    footer: 'sum',
  },
]);

const rows = ref(treeRows.map(r => ({ ...r })));
</script>
