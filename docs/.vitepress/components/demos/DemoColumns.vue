<template>
  <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;">
    <WZGrid
      :columns="columns"
      :rows="rows"
      :height="350"
      :show-column-settings="true"
      @resize:column="handleResizeColumn"
      @reorder:columns="handleReorderColumns"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const columns = ref([
  { key: 'id',       title: 'ID',    width: 60,  pinned: true },
  { key: 'name',     title: '이름',  width: 120, pinned: true },
  { key: 'dept',     title: '부서',  width: 100 },
  { key: 'address',  title: '주소',  width: 160, truncate: true, tooltip: true },
  { key: 'salary',   title: '급여',  width: 120, type: 'number', align: 'right' },
  { key: 'score',    title: '점수',  width: 80,  type: 'number', align: 'right' },
  { key: 'email',    title: '이메일', width: 200, type: 'email' },
  { key: 'joinDate', title: '입사일', width: 120, type: 'date',   align: 'center' },
]);

const rows = ref([
  { id: 1, name: '홍길동', dept: '개발팀',   address: '서울특별시 강남구 테헤란로 427 위워크 타워 8층 개발실',     salary: 85000000, score: 92, email: 'hong@example.com',  joinDate: '2020-03-01' },
  { id: 2, name: '김철수', dept: '디자인팀', address: '서울특별시 서초구 서초대로 396 강남빌딩 12층 디자인센터',  salary: 72000000, score: 88, email: 'kim@example.com',   joinDate: '2021-07-15' },
  { id: 3, name: '이영희', dept: '사업팀',   address: '경기도 성남시 분당구 판교역로 166 카카오 판교아지트 3동',   salary: 68000000, score: 75, email: 'lee@example.com',   joinDate: '2019-11-20' },
  { id: 4, name: '박민준', dept: '인사팀',   address: '서울특별시 마포구 상암산로 34 디지털큐브 14층 인사부',      salary: 90000000, score: 95, email: 'park@example.com',  joinDate: '2022-01-10' },
  { id: 5, name: '최수진', dept: '개발팀',   address: '서울특별시 송파구 올림픽로 300 롯데타워 35층 클라우드팀',  salary: 78000000, score: 83, email: 'choi@example.com',  joinDate: '2020-09-05' },
  { id: 6, name: '정태양', dept: '디자인팀', address: '인천광역시 연수구 송도과학로 32 스마트밸리 B동 2층 UX실',  salary: 65000000, score: 67, email: 'jung@example.com',  joinDate: '2018-04-22' },
]);

const handleResizeColumn = ({ colKey, width }: { colKey: string; width: number }) => {
  const col = columns.value.find(c => c.key === colKey);
  if (col) col.width = width;
};

const handleReorderColumns = ({ srcKey, targetKey }: { srcKey: string; targetKey: string }) => {
  const cols = columns.value;
  const srcIdx    = cols.findIndex(c => c.key === srcKey);
  const targetIdx = cols.findIndex(c => c.key === targetKey);
  if (srcIdx === -1 || targetIdx === -1) return;
  const [moved] = cols.splice(srcIdx, 1);
  cols.splice(targetIdx, 0, moved);
};
</script>
