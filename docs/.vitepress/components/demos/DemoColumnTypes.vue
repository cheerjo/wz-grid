<template>
  <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;">
    <WZGrid
      :columns="columns"
      :rows="rows"
      :height="400"
      @update:cell="handleUpdateCell"
      @click:button="handleClickButton"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const columns = ref([
  { key: 'id',         title: 'ID',       width: 60,  type: 'number',   align: 'right' },
  { key: 'name',       title: '이름',     width: 120, type: 'text',     editable: true },
  { key: 'email',      title: '이메일',   width: 200, type: 'email',    editable: true },
  {
    key: 'dept',       title: '부서',     width: 120, type: 'select',   editable: true,
    options: [
      { value: 'dev',    label: '개발팀' },
      { value: 'hr',     label: '인사팀' },
      { value: 'biz',    label: '사업팀' },
    ],
  },
  {
    key: 'salary',     title: '연봉',     width: 140, type: 'currency', align: 'right',
    currencySymbol: '₩', decimals: 0,
  },
  { key: 'score',      title: '별점',     width: 130, type: 'rating',   align: 'center', maxRating: 5 },
  { key: 'tags',       title: '태그',     width: 180, type: 'tag' },
  { key: 'labelColor', title: '색상',     width: 80,  type: 'color',    align: 'center' },
  { key: 'joinDate',   title: '입사일',   width: 130, type: 'date',     align: 'center' },
  { key: 'updatedAt',  title: '수정일시', width: 160, type: 'datetime', align: 'center' },
  { key: 'active',     title: '활성',     width: 70,  type: 'boolean',  align: 'center' },
  {
    key: 'gender',     title: '성별',     width: 120, type: 'radio',    align: 'center',
    options: [
      { label: '남', value: 'M' },
      { label: '여', value: 'F' },
    ],
  },
  {
    key: 'status',     title: '상태',     width: 100, type: 'badge',    align: 'center',
    options: [
      { value: 'active',   label: 'Active',   color: 'bg-green-100 text-green-700' },
      { value: 'inactive', label: 'Inactive', color: 'bg-red-100 text-red-700'     },
    ],
  },
  { key: 'completion', title: '완료율',   width: 140, type: 'progress' },
  { key: 'website',    title: '웹사이트', width: 180, type: 'link' },
  { key: 'avatar',     title: '사진',     width: 70,  type: 'image',    align: 'center' },
  {
    key: 'action',     title: '액션',     width: 100, type: 'button',   align: 'center',
    options: [{ label: '상세보기' }],
  },
  {
    key: 'trend',      title: '트렌드',   width: 140, type: 'sparkline',
    sparklineColor: '#10b981',
  },
  { key: 'memo',       title: '메모',     width: 200, type: 'textarea', editable: true },
]);

const rows = ref([
  {
    id: 1,
    name: '홍길동',
    email: 'hong@example.com',
    dept: 'dev',
    salary: 72000000,
    score: 4,
    tags: ['긴급', '검토중'],
    labelColor: '#3b82f6',
    joinDate: '2020-03-01',
    updatedAt: '2026-03-10 09:30',
    active: true,
    gender: 'M',
    status: 'active',
    completion: 82,
    website: 'https://vuejs.org',
    avatar: 'https://i.pravatar.cc/38?u=1',
    action: '',
    trend: [12, 34, 28, 45, 33, 52, 41],
    memo: '신규 프로젝트 참여 중\n빠른 업무 처리 필요',
  },
  {
    id: 2,
    name: '김철수',
    email: 'kim@example.com',
    dept: 'hr',
    salary: 58000000,
    score: 3,
    tags: ['승인'],
    labelColor: '#10b981',
    joinDate: '2021-07-15',
    updatedAt: '2026-03-12 14:05',
    active: true,
    gender: 'M',
    status: 'active',
    completion: 60,
    website: 'https://vitejs.dev',
    avatar: 'https://i.pravatar.cc/38?u=2',
    action: '',
    trend: [20, 15, 25, 30, 22],
    memo: '정기 교육 수료 완료',
  },
  {
    id: 3,
    name: '이영희',
    email: 'lee@example.com',
    dept: 'biz',
    salary: 64000000,
    score: 5,
    tags: ['긴급', 'VIP', '검토중'],
    labelColor: '#f59e0b',
    joinDate: '2019-11-20',
    updatedAt: '2026-03-15 17:22',
    active: false,
    gender: 'F',
    status: 'inactive',
    completion: 35,
    website: 'https://vitepress.dev',
    avatar: 'https://i.pravatar.cc/38?u=3',
    action: '',
    trend: [50, 45, 55, 60, 48, 52],
    memo: '계약 갱신 협의 중',
  },
]);

const handleUpdateCell = ({ row, colKey, value }: any) => {
  const target = rows.value.find(r => r.id === row.id);
  if (target) (target as any)[colKey] = value;
};

const handleClickButton = ({ row }: any) => {
  alert(`[상세보기] id=${row.id}, 이름=${row.name}`);
};
</script>
