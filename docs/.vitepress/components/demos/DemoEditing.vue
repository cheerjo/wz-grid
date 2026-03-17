<template>
  <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;">
    <WZGrid
      :columns="columns"
      :rows="rows"
      :height="350"
      :use-filter="true"
      @update:cell="handleUpdateCell"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const columns = ref([
  {
    key: 'name',
    title: '이름',
    width: 120,
    editable: true,
    required: true,
  },
  {
    key: 'score',
    title: '점수',
    width: 100,
    type: 'number',
    align: 'right',
    editable: true,
    validator: (v: any) => {
      const n = Number(v);
      if (isNaN(n) || n < 0 || n > 100) return '0~100 사이여야 합니다';
      return null;
    },
  },
  {
    key: 'dept',
    title: '부서',
    width: 120,
    type: 'select',
    editable: true,
    options: [
      { value: 'dev',    label: '개발팀' },
      { value: 'design', label: '디자인팀' },
      { value: 'biz',    label: '사업팀' },
      { value: 'hr',     label: '인사팀' },
    ],
  },
  {
    key: 'email',
    title: '이메일',
    width: 200,
    type: 'email',
    editable: true,
  },
  {
    key: 'active',
    title: '활성',
    width: 70,
    type: 'boolean',
    align: 'center',
  },
  {
    key: 'code',
    title: '코드 (대문자)',
    width: 140,
    editable: true,
    onInput: (v: any) => String(v).toUpperCase(),
  },
]);

const rows = ref([
  { id: 1, name: '',      score: 45,  dept: 'dev',    email: 'hong@example.com',  active: true,  code: 'ALPHA' },
  { id: 2, name: '김철수', score: 88,  dept: 'design', email: 'kim@example.com',   active: true,  code: 'BRAVO' },
  { id: 3, name: '이영희', score: 110, dept: 'biz',    email: 'lee@example.com',   active: false, code: 'CHARLIE' },
  { id: 4, name: '',      score: 95,  dept: 'hr',     email: 'park@example.com',  active: true,  code: 'DELTA' },
  { id: 5, name: '최수진', score: 73,  dept: 'dev',    email: 'choi@example.com',  active: true,  code: 'ECHO' },
]);

const handleUpdateCell = ({ row, colKey, value }: any) => {
  const target = rows.value.find(r => r.id === row.id);
  if (target) (target as any)[colKey] = value;
};
</script>
