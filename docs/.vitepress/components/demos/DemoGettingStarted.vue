<template>
  <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;">
    <WZGrid
      :columns="columns"
      :rows="rows"
      :height="300"
      :use-checkbox="true"
      :use-filter="true"
      @update:cell="handleUpdateCell"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { basicColumns, basicRows } from './sampleData';

const columns = ref(basicColumns.map(c => ({ ...c })));
const rows = ref(basicRows.map(r => ({ ...r })));

const handleUpdateCell = ({ row, colKey, value }: any) => {
  const target = rows.value.find(r => r.id === row.id);
  if (target) (target as any)[colKey] = value;
};
</script>
