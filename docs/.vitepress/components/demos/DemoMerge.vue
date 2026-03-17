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

    <!-- 자동 병합 -->
    <WZGrid
      v-if="activeTab === 'auto'"
      :columns="mergeColumns"
      :rows="mergeRows"
      :height="350"
      :auto-merge-cols="['dept', 'team']"
    />

    <!-- 수동 병합 -->
    <WZGrid
      v-if="activeTab === 'manual'"
      :columns="mergeColumns"
      :rows="mergeRows"
      :height="350"
      :merge-cells="manualMergeCells"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref('auto');

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
  { id: 'auto',   label: '자동 병합 (autoMergeCols)' },
  { id: 'manual', label: '수동 병합 (mergeCells)' },
];

const mergeColumns = ref([
  { key: 'dept',  title: '부서',  width: 120, align: 'center' },
  { key: 'team',  title: '팀',    width: 120, align: 'center' },
  { key: 'name',  title: '이름',  width: 120 },
  { key: 'score', title: '점수',  width: 80, type: 'number', align: 'right' },
]);

const mergeRows = ref([
  { id: 1, dept: '개발부', team: '프론트엔드', name: '홍길동', score: 92 },
  { id: 2, dept: '개발부', team: '프론트엔드', name: '김철수', score: 88 },
  { id: 3, dept: '개발부', team: '프론트엔드', name: '이영희', score: 75 },
  { id: 4, dept: '개발부', team: '백엔드',     name: '박민준', score: 95 },
  { id: 5, dept: '개발부', team: '백엔드',     name: '최수진', score: 83 },
  { id: 6, dept: '디자인부', team: 'UX/UI',   name: '정태양', score: 87 },
  { id: 7, dept: '디자인부', team: 'UX/UI',   name: '윤하나', score: 91 },
  { id: 8, dept: '디자인부', team: '브랜드',  name: '강지훈', score: 79 },
]);

// 수동 병합: dept 0~2행(개발부 프론트엔드), team 0~1행(프론트엔드)
// mergeCells prop은 (row, colKey) => { rowspan?, colspan? } | null 형태의 함수여야 합니다
const manualMergeCells = (row: any, colKey: string) => {
  const rows = mergeRows.value;
  const rowIdx = rows.findIndex((r) => r.id === row.id);
  if (colKey === 'dept' && rowIdx === 0) return { rowspan: 3 };
  if (colKey === 'team' && rowIdx === 0) return { rowspan: 2 };
  return null;
};
</script>
