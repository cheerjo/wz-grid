<template>
  <div>
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

    <!-- 기본 그리드 -->
    <WZGrid
      v-if="activeTab === 'basic'"
      :columns="basicColumns"
      :rows="basicRows"
      :height="400"
      :use-checkbox="true"
      :use-filter="true"
      :show-column-settings="true"
      @update:cell="updateBasic"
      @sort="handleSort"
      @resize:column="handleResize"
      @reorder:columns="handleReorderColumns"
    />

    <!-- 컬럼 타입 -->
    <WZGrid
      v-if="activeTab === 'types'"
      :columns="typeColumns"
      :rows="typeRows"
      :height="400"
      :use-checkbox="true"
      @update:cell="updateType"
      @click:button="handleButton"
    />

    <!-- 페이징 -->
    <WZGrid
      v-if="activeTab === 'paging'"
      :columns="pagingColumns"
      :rows="pagingRows"
      :height="400"
      :use-paging="true"
      v-model:currentPage="currentPage"
      v-model:pageSize="pageSize"
      @sort="handleSort"
    />

    <!-- 그룹핑 -->
    <WZGrid
      v-if="activeTab === 'group'"
      :columns="groupColumns"
      :rows="groupRows"
      :height="400"
      group-by="dept"
    />

    <!-- 행 드래그 -->
    <WZGrid
      v-if="activeTab === 'drag'"
      :columns="dragColumns"
      :rows="dragRows"
      :height="400"
      :use-row-drag="true"
      :use-context-menu="true"
      :show-add="true"
      :show-delete="true"
      :use-checkbox="true"
      @reorder:rows="handleReorderRows"
      @click:add="addRow"
      @click:delete="deleteRows"
      @click:insert="insertRow"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref('basic');
const tabs = [
  { id: 'basic',  label: '기본 기능' },
  { id: 'types',  label: '컬럼 타입' },
  { id: 'paging', label: '페이징' },
  { id: 'group',  label: '그룹핑' },
  { id: 'drag',   label: '드래그 & 컨텍스트 메뉴' },
];

// ── 기본 그리드 ──────────────────────────────────────
const basicColumns = ref([
  { key: 'id',     title: 'ID',     width: 60,  pinned: true },
  { key: 'name',   title: '이름',   width: 120, editable: true, required: true },
  { key: 'dept',   title: '부서',   width: 110, editable: true, type: 'select',
    options: [
      { value: 'dev',     label: '개발팀' },
      { value: 'design',  label: '디자인팀' },
      { value: 'biz',     label: '사업팀' },
      { value: 'hr',      label: '인사팀' },
    ]
  },
  { key: 'score',  title: '점수',   width: 80,  editable: true, type: 'number', align: 'right',
    validator: (v: any) => (v < 0 || v > 100) ? '0~100 사이여야 합니다' : null },
  { key: 'status', title: '상태',   width: 90,  type: 'badge', align: 'center',
    options: [
      { value: 'active',   label: '재직', color: 'bg-green-100 text-green-700' },
      { value: 'leave',    label: '휴직', color: 'bg-yellow-100 text-yellow-700' },
      { value: 'resigned', label: '퇴직', color: 'bg-red-100 text-red-700' },
    ]
  },
  { key: 'joinDate', title: '입사일', width: 120, type: 'date', align: 'center' },
  { key: 'active',   title: '활성',  width: 60,  type: 'boolean', align: 'center' },
]);

const basicRows = ref([
  { id: 1, name: '홍길동', dept: 'dev',    score: 92, status: 'active',   joinDate: '2020-03-01', active: true  },
  { id: 2, name: '김철수', dept: 'design', score: 88, status: 'active',   joinDate: '2021-07-15', active: true  },
  { id: 3, name: '이영희', dept: 'biz',    score: 75, status: 'leave',    joinDate: '2019-11-20', active: false },
  { id: 4, name: '박민준', dept: 'hr',     score: 95, status: 'active',   joinDate: '2022-01-10', active: true  },
  { id: 5, name: '최수진', dept: 'dev',    score: 83, status: 'active',   joinDate: '2020-09-05', active: true  },
  { id: 6, name: '정태양', dept: 'design', score: 67, status: 'resigned', joinDate: '2018-04-22', active: false },
  { id: 7, name: '윤하나', dept: 'dev',    score: 91, status: 'active',   joinDate: '2023-02-14', active: true  },
  { id: 8, name: '강지훈', dept: 'biz',    score: 79, status: 'active',   joinDate: '2021-12-01', active: true  },
]);

const updateBasic = ({ row, colKey, value }: any) => {
  const t = basicRows.value.find(r => r.id === row.id);
  if (t) (t as any)[colKey] = value;
};
const handleSort = (configs: any[]) => {
  if (!configs.length) return;
  basicRows.value = [...basicRows.value].sort((a, b) => {
    for (const { key, order } of configs) {
      const mod = order === 'asc' ? 1 : -1;
      if ((a as any)[key] !== (b as any)[key])
        return ((a as any)[key] > (b as any)[key] ? 1 : -1) * mod;
    }
    return 0;
  });
};
const handleResize = ({ colKey, width }: any) => {
  const col = basicColumns.value.find(c => c.key === colKey);
  if (col) col.width = width;
};
const handleReorderColumns = ({ srcKey, targetKey }: any) => {
  const cols = [...basicColumns.value];
  const si = cols.findIndex(c => c.key === srcKey);
  const ti = cols.findIndex(c => c.key === targetKey);
  if (si === -1 || ti === -1) return;
  const [m] = cols.splice(si, 1);
  cols.splice(ti, 0, m);
  basicColumns.value = cols;
};

// ── 컬럼 타입 ──────────────────────────────────────
const typeColumns = ref([
  { key: 'text',     title: 'text',     width: 120, editable: true },
  { key: 'number',   title: 'number',   width: 100, type: 'number', align: 'right', editable: true },
  { key: 'date',     title: 'date',     width: 120, type: 'date',   align: 'center' },
  { key: 'boolean',  title: 'boolean',  width: 80,  type: 'boolean', align: 'center' },
  { key: 'select',   title: 'select',   width: 110, type: 'select', editable: true,
    options: [{ value: 'A', label: '옵션 A' }, { value: 'B', label: '옵션 B' }, { value: 'C', label: '옵션 C' }] },
  { key: 'badge',    title: 'badge',    width: 90,  type: 'badge', align: 'center',
    options: [
      { value: 'red',   label: '위험', color: 'bg-red-100 text-red-700' },
      { value: 'green', label: '안전', color: 'bg-green-100 text-green-700' },
    ]
  },
  { key: 'progress', title: 'progress', width: 130, type: 'progress' },
  { key: 'link',     title: 'link',     width: 150, type: 'link' },
  { key: 'button',   title: 'button',   width: 90,  type: 'button', align: 'center',
    options: [{ label: '클릭' }] },
]);

const typeRows = ref([
  { id: 1, text: '텍스트 셀', number: 12345, date: '2024-03-15', boolean: true,  select: 'A', badge: 'green', progress: 75,  link: 'https://vuejs.org' },
  { id: 2, text: '편집 가능', number: 9876,  date: '2024-06-01', boolean: false, select: 'B', badge: 'red',   progress: 30,  link: 'https://vitepress.dev' },
  { id: 3, text: '더블클릭', number: 55000, date: '2024-01-20', boolean: true,  select: 'C', badge: 'green', progress: 90,  link: 'https://npmjs.com' },
]);

const updateType = ({ row, colKey, value }: any) => {
  const t = typeRows.value.find(r => r.id === row.id);
  if (t) (t as any)[colKey] = value;
};
const handleButton = ({ row }: any) => {
  alert(`버튼 클릭: ${row.text}`);
};

// ── 페이징 ──────────────────────────────────────────
const currentPage = ref(1);
const pageSize = ref(10);
const pagingColumns = ref([
  { key: 'id',   title: 'ID',   width: 60 },
  { key: 'name', title: '이름', width: 150 },
  { key: 'dept', title: '부서', width: 120 },
  { key: 'score', title: '점수', width: 80, type: 'number', align: 'right' },
]);
const pagingRows = ref(
  Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `사용자 ${i + 1}`,
    dept: ['개발팀', '디자인팀', '사업팀', '인사팀'][i % 4],
    score: Math.floor(Math.random() * 40) + 60,
  }))
);

// ── 그룹핑 ──────────────────────────────────────────
const groupColumns = ref([
  { key: 'dept',  title: '부서', width: 120 },
  { key: 'name',  title: '이름', width: 120 },
  { key: 'score', title: '점수', width: 80, type: 'number', align: 'right' },
  { key: 'joinDate', title: '입사일', width: 120, type: 'date', align: 'center' },
]);
const groupRows = ref([
  { id: 1, dept: '개발팀', name: '홍길동', score: 92, joinDate: '2020-03-01' },
  { id: 2, dept: '개발팀', name: '최수진', score: 83, joinDate: '2020-09-05' },
  { id: 3, dept: '개발팀', name: '윤하나', score: 91, joinDate: '2023-02-14' },
  { id: 4, dept: '디자인팀', name: '김철수', score: 88, joinDate: '2021-07-15' },
  { id: 5, dept: '디자인팀', name: '정태양', score: 67, joinDate: '2018-04-22' },
  { id: 6, dept: '사업팀', name: '이영희', score: 75, joinDate: '2019-11-20' },
  { id: 7, dept: '사업팀', name: '강지훈', score: 79, joinDate: '2021-12-01' },
  { id: 8, dept: '인사팀', name: '박민준', score: 95, joinDate: '2022-01-10' },
]);

// ── 행 드래그 ────────────────────────────────────────
let nextId = 10;
const dragColumns = ref([
  { key: 'id',   title: 'ID',   width: 60 },
  { key: 'name', title: '이름', width: 150, editable: true },
  { key: 'dept', title: '부서', width: 120, editable: true, type: 'select',
    options: [
      { value: 'dev',    label: '개발팀' },
      { value: 'design', label: '디자인팀' },
      { value: 'biz',    label: '사업팀' },
    ]
  },
]);
const dragRows = ref([
  { id: 1, name: '홍길동', dept: 'dev'    },
  { id: 2, name: '김철수', dept: 'design' },
  { id: 3, name: '이영희', dept: 'biz'    },
  { id: 4, name: '박민준', dept: 'dev'    },
  { id: 5, name: '최수진', dept: 'design' },
]);

const handleReorderRows = ({ from, to, position }: any) => {
  const arr = [...dragRows.value];
  const fi = arr.findIndex(r => r.id === from.id);
  if (fi === -1) return;
  const [moved] = arr.splice(fi, 1);
  const ti = arr.findIndex(r => r.id === to.id);
  if (ti === -1) return;
  arr.splice(position === 'above' ? ti : ti + 1, 0, moved);
  dragRows.value = arr;
};
const addRow = () => {
  dragRows.value.push({ id: nextId++, name: '새 사용자', dept: 'dev' });
};
const deleteRows = (rows: any[]) => {
  const ids = new Set(rows.map(r => r.id));
  dragRows.value = dragRows.value.filter(r => !ids.has(r.id));
};
const insertRow = ({ position, row }: any) => {
  const idx = dragRows.value.findIndex(r => r.id === row.id);
  const newRow = { id: nextId++, name: '새 사용자', dept: 'dev' };
  dragRows.value.splice(position === 'above' ? idx : idx + 1, 0, newRow);
};
</script>
