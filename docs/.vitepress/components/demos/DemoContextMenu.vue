<template>
  <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;">
    <WZGrid
      :columns="columns"
      :rows="rows"
      :height="300"
      :use-context-menu="true"
      @click:insert="onInsert"
      @click:delete="onDelete"
      @update:cell="onUpdateCell"
    />
    <p style="margin: 12px 0 0; font-size: 13px; color: #6b7280;">
      행을 우클릭하면 컨텍스트 메뉴가 표시됩니다
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const columns = ref([
  { key: 'id',    title: 'ID',   width: 60 },
  { key: 'name',  title: '이름', width: 120, editable: true },
  {
    key: 'dept', title: '부서', width: 110, editable: true, type: 'select',
    options: [
      { value: 'dev',    label: '개발팀' },
      { value: 'design', label: '디자인팀' },
      { value: 'biz',    label: '사업팀' },
    ],
  },
  { key: 'score', title: '점수', width: 80, type: 'number', align: 'right', editable: true },
]);

const rows = ref([
  { id: 1, name: '홍길동', dept: 'dev',    score: 92 },
  { id: 2, name: '김철수', dept: 'design', score: 88 },
  { id: 3, name: '이영희', dept: 'biz',    score: 75 },
  { id: 4, name: '박민준', dept: 'dev',    score: 95 },
  { id: 5, name: '최수진', dept: 'design', score: 83 },
]);

function onInsert(payload: any) {
  const newRow = { id: Date.now(), name: '', dept: 'dev', score: 0 };
  const idx = rows.value.findIndex((r) => r.id === payload?.row?.id);
  if (idx !== -1) {
    const next = [...rows.value];
    next.splice(idx, 0, newRow);
    rows.value = next;
  } else {
    rows.value = [newRow, ...rows.value];
  }
}

function onDelete(selectedRows: any[]) {
  const selectedIds = new Set(selectedRows.map((r: any) => r.id));
  rows.value = rows.value.filter((r) => !selectedIds.has(r.id));
}

function onUpdateCell({ row, colKey, value }: { row: any; colKey: string; value: any }) {
  const target = rows.value.find((r) => r.id === row.id);
  if (target) {
    (target as any)[colKey] = value;
  }
}
</script>
