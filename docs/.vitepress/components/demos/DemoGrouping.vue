<template>
  <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;">
    <!-- 탭 선택 -->
    <div style="display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap;">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :style="getTabStyle(tab.id)"
      >{{ tab.label }}</button>
    </div>

    <!-- 탭 1: 그룹핑 -->
    <template v-if="activeTab === 'grouping'">
      <WZGrid
        :columns="groupColumns"
        :rows="groupRows"
        :height="400"
        group-by="dept"
      />
    </template>

    <!-- 탭 2: 행 드래그 -->
    <template v-if="activeTab === 'drag'">
      <WZGrid
        :columns="dragColumns"
        :rows="dragRows"
        :height="350"
        :use-row-drag="true"
        :use-context-menu="true"
        :show-add="true"
        :show-delete="true"
        :use-checkbox="true"
        @reorder:rows="onReorderRows"
        @click:add="onAddRow"
        @click:delete="onDeleteRow"
        @click:insert="onInsertRow"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { deptOptions } from './sampleData';

const activeTab = ref('grouping');

const getTabStyle = (tabId: string) => ({
  padding: '6px 16px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: activeTab.value === tabId ? 600 : 400,
  background: activeTab.value === tabId ? '#3b82f6' : '#e5e7eb',
  color: activeTab.value === tabId ? '#fff' : '#374151',
  fontSize: '13px',
});
const tabs = [
  { id: 'grouping', label: '그룹핑 + 소계 (groupBy)' },
  { id: 'drag',     label: '행 드래그 재배치' },
];

// 그룹핑 탭 데이터
const groupColumns = ref([
  { key: 'dept',   title: '부서',   width: 120 },
  { key: 'name',   title: '이름',   width: 120 },
  { key: 'score',  title: '점수',   width: 80,  type: 'number', align: 'right' },
  { key: 'salary', title: '연봉',   width: 130, type: 'number', align: 'right' },
]);

const groupRows = ref([
  { id: 1, dept: '개발팀',   name: '홍길동', score: 92, salary: 65000000 },
  { id: 2, dept: '개발팀',   name: '김철수', score: 88, salary: 58000000 },
  { id: 3, dept: '개발팀',   name: '이영희', score: 75, salary: 52000000 },
  { id: 4, dept: '디자인팀', name: '박민준', score: 95, salary: 60000000 },
  { id: 5, dept: '디자인팀', name: '최수진', score: 83, salary: 55000000 },
  { id: 6, dept: '사업팀',   name: '정태양', score: 67, salary: 48000000 },
  { id: 7, dept: '사업팀',   name: '윤하나', score: 91, salary: 62000000 },
  { id: 8, dept: '사업팀',   name: '강지훈', score: 79, salary: 50000000 },
]);

// 행 드래그 탭 데이터
const dragColumns = ref([
  { key: 'id',   title: 'ID',   width: 60 },
  { key: 'name', title: '이름', width: 150, editable: true },
  { key: 'dept', title: '부서', width: 120, editable: true, type: 'select', options: deptOptions },
]);

const dragRows = ref([
  { id: 1, name: '홍길동', dept: 'dev'    },
  { id: 2, name: '김철수', dept: 'design' },
  { id: 3, name: '이영희', dept: 'biz'    },
  { id: 4, name: '박민준', dept: 'hr'     },
  { id: 5, name: '최수진', dept: 'dev'    },
]);

function onReorderRows(newRows: any[]) {
  dragRows.value = newRows;
}

function onAddRow() {
  const newId = Date.now();
  dragRows.value = [...dragRows.value, { id: newId, name: '', dept: 'dev' }];
}

function onDeleteRow(selectedRows: any[]) {
  const selectedIds = new Set(selectedRows.map((r: any) => r.id));
  dragRows.value = dragRows.value.filter((r) => !selectedIds.has(r.id));
}

function onInsertRow(payload: any) {
  const newRow = { id: Date.now(), name: '', dept: 'dev' };
  const idx = dragRows.value.findIndex((r) => r.id === payload?.row?.id);
  if (idx !== -1) {
    const next = [...dragRows.value];
    next.splice(idx, 0, newRow);
    dragRows.value = next;
  } else {
    dragRows.value = [newRow, ...dragRows.value];
  }
}
</script>
