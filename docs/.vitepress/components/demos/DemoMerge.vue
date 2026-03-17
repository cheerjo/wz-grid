<template>
  <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;">
    <!-- 탭 선택 -->
    <div style="display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap;">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :style="{
          padding: '6px 16px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: activeTab === tab.id ? 600 : 400,
          background: activeTab === tab.id ? '#3b82f6' : '#e5e7eb',
          color: activeTab === tab.id ? '#fff' : '#374151',
          fontSize: '13px',
        }"
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
  { dept: '개발부', team: '프론트엔드', name: '홍길동', score: 92 },
  { dept: '개발부', team: '프론트엔드', name: '김철수', score: 88 },
  { dept: '개발부', team: '프론트엔드', name: '이영희', score: 75 },
  { dept: '개발부', team: '백엔드',     name: '박민준', score: 95 },
  { dept: '개발부', team: '백엔드',     name: '최수진', score: 83 },
  { dept: '디자인부', team: 'UX/UI',   name: '정태양', score: 87 },
  { dept: '디자인부', team: 'UX/UI',   name: '윤하나', score: 91 },
  { dept: '디자인부', team: '브랜드',  name: '강지훈', score: 79 },
]);

// 수동 병합: dept 0~2행(개발부 프론트), team 0~1행(프론트엔드)
const manualMergeCells = [
  { row: 0, col: 0, rowspan: 3 },
  { row: 0, col: 1, rowspan: 2 },
];
</script>
