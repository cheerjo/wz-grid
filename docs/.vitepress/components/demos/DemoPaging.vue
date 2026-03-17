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

    <!-- 탭 1: 페이징 -->
    <template v-if="activeTab === 'paging'">
      <WZGrid
        :columns="pagingColumns"
        :rows="pagingRows"
        :height="400"
        :use-paging="true"
        v-model:currentPage="currentPage"
        v-model:pageSize="pageSize"
      />
    </template>

    <!-- 탭 2: 가상 스크롤 -->
    <template v-if="activeTab === 'virtual'">
      <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
        10,000건 데이터가 가상 스크롤로 부드럽게 렌더링됩니다
      </p>
      <WZGrid
        :columns="pagingColumns"
        :rows="virtualRows"
        :height="400"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref('paging');

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
  { id: 'paging',  label: '페이징 (usePaging)' },
  { id: 'virtual', label: '가상 스크롤 (10,000건)' },
];

const currentPage = ref(1);
const pageSize = ref(20);

const pagingColumns = ref([
  { key: 'id',    title: 'ID',   width: 60 },
  { key: 'name',  title: '이름', width: 120 },
  { key: 'dept',  title: '부서', width: 110 },
  { key: 'score', title: '점수', width: 80, type: 'number', align: 'right' },
]);

const depts = ['개발팀', '디자인팀', '사업팀', '인사팀'];

const pagingRows = ref(
  Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `직원 ${i + 1}`,
    dept: depts[i % depts.length],
    score: Math.floor(60 + Math.random() * 40),
  }))
);

const virtualRows = ref(
  Array.from({ length: 10000 }, (_, i) => ({
    id: i + 1,
    name: `직원 ${i + 1}`,
    dept: depts[i % depts.length],
    score: Math.floor(60 + Math.random() * 40),
  }))
);
</script>
