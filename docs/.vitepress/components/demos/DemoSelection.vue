<template>
  <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;">
    <WZGrid
      :columns="columns"
      :rows="rows"
      :height="350"
      :use-checkbox="true"
      @update:checked="handleChecked"
      @update:cell="handleUpdateCell"
    />
    <div style="margin-top: 10px; display: flex; align-items: center; gap: 16px;">
      <span style="font-size: 14px; color: #374151;">
        선택된 행: <strong>{{ checkedRows.length }}명</strong>
        <span v-if="checkedRows.length > 0" style="margin-left: 8px; color: #6b7280;">
          ({{ checkedRows.map(r => r.name).join(', ') }})
        </span>
      </span>
    </div>
    <p style="margin-top: 8px; font-size: 12px; color: #9ca3af;">
      셀을 드래그하여 범위 선택 → Ctrl+C로 복사 가능
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { deptOptions, basicRows } from './sampleData';

const columns = ref([
  { key: 'id',       title: 'ID',   width: 60 },
  { key: 'name',     title: '이름', width: 120, editable: true },
  { key: 'dept',     title: '부서', width: 110, type: 'select', editable: true, options: deptOptions },
  { key: 'score',    title: '점수', width: 80,  type: 'number', align: 'right', editable: true },
  { key: 'joinDate', title: '입사일', width: 120, type: 'date', align: 'center' },
]);

const rows = ref(basicRows.map(r => ({ ...r })));

const checkedRows = ref<any[]>([]);

const handleChecked = (checked: any[]) => {
  checkedRows.value = checked;
};

const handleUpdateCell = ({ row, colKey, value }: any) => {
  const target = rows.value.find(r => r.id === row.id);
  if (target) (target as any)[colKey] = value;
};
</script>
