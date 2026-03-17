<template>
  <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;">
    <WZGrid
      :columns="columns"
      :rows="rows"
      :height="300"
    >
      <!-- 아바타 + 볼드 이름 -->
      <template #cell-name="{ row }">
        <div style="display: flex; align-items: center; gap: 8px;">
          <img
            :src="row.avatar"
            :alt="row.name"
            style="width: 26px; height: 26px; border-radius: 50%; object-fit: cover; flex-shrink: 0;"
          />
          <span style="font-weight: 600; color: #111827;">{{ row.name }}</span>
        </div>
      </template>

      <!-- 상태 뱃지 -->
      <template #cell-status="{ value }">
        <span :style="getStatusStyle(value)">{{ value }}</span>
      </template>

      <!-- ₩ + 천 단위 포맷 -->
      <template #cell-salary="{ value }">
        <span style="font-variant-numeric: tabular-nums; font-weight: 500; color: #1d4ed8;">
          ₩{{ Number(value).toLocaleString() }}
        </span>
      </template>

      <!-- 점수 프로그레스 바 -->
      <template #cell-score="{ value }">
        <div style="display: flex; align-items: center; gap: 6px; width: 100%;">
          <div style="flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
            <div :style="getScoreBarStyle(value)" />
          </div>
          <span style="font-size: 12px; font-weight: 600; color: #374151; width: 28px; text-align: right; flex-shrink: 0;">
            {{ value }}
          </span>
        </div>
      </template>
    </WZGrid>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const getStatusStyle = (value: string) => ({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: '9999px',
  fontSize: '12px',
  fontWeight: 600,
  background: value === 'Active' ? '#dcfce7' : value === 'Pending' ? '#fef9c3' : '#fee2e2',
  color: value === 'Active' ? '#15803d' : value === 'Pending' ? '#a16207' : '#b91c1c',
});

const getScoreBarStyle = (value: number) => ({
  height: '100%',
  width: Math.min(100, Math.max(0, (value / 100) * 100)) + '%',
  background: value >= 80 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444',
  borderRadius: '4px',
  transition: 'width 0.3s',
});

const columns = ref([
  { key: 'name',   title: '이름',   width: 150 },
  { key: 'status', title: '상태',   width: 100, align: 'center' },
  { key: 'salary', title: '연봉',   width: 120, type: 'number', align: 'right' },
  { key: 'score',  title: '점수',   width: 100, type: 'number' },
]);

const rows = ref([
  { id: 1, name: '홍길동', avatar: 'https://i.pravatar.cc/38?u=11', status: 'Active',   salary: 72000000, score: 92 },
  { id: 2, name: '김철수', avatar: 'https://i.pravatar.cc/38?u=12', status: 'Pending',  salary: 58000000, score: 67 },
  { id: 3, name: '이영희', avatar: 'https://i.pravatar.cc/38?u=13', status: 'Inactive', salary: 64000000, score: 34 },
  { id: 4, name: '박민준', avatar: 'https://i.pravatar.cc/38?u=14', status: 'Active',   salary: 81000000, score: 88 },
  { id: 5, name: '최수진', avatar: 'https://i.pravatar.cc/38?u=15', status: 'Active',   salary: 75000000, score: 55 },
]);
</script>
