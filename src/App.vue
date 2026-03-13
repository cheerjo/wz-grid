<template>
  <div class="min-h-screen p-8 bg-gray-50 flex flex-col gap-6">
    <header class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">WZ-Grid Demo</h1>
        <p class="text-sm text-gray-500 mt-1">10,000개 데이터 · 전체 컬럼 타입 예제</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="toggleMerge"
          :class="mergeEnabled ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-600 hover:bg-gray-700'"
          class="px-4 py-2 text-white rounded shadow-sm text-sm transition-colors"
        >
          셀 병합 {{ mergeEnabled ? '끄기' : '켜기' }}
        </button>
        <button
          @click="pagingEnabled = !pagingEnabled"
          :class="pagingEnabled ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-600 hover:bg-gray-700'"
          class="px-4 py-2 text-white rounded shadow-sm text-sm transition-colors"
        >
          페이징 {{ pagingEnabled ? '끄기' : '켜기' }}
        </button>
        <button @click="resetData" class="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm hover:bg-gray-100">데이터 초기화</button>
      </div>
    </header>

    <!-- 컬럼 타입 범례 -->
    <div class="flex flex-wrap gap-2 text-xs">
      <span v-for="tag in columnTypeTags" :key="tag.label"
        class="px-2 py-1 rounded-full border font-mono"
        :class="tag.class"
      >{{ tag.label }}</span>
    </div>

    <main class="flex-grow bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
      <div class="p-4 border-b bg-gray-50 flex justify-between items-center text-sm text-gray-600 flex-wrap gap-2">
        <div class="flex items-center gap-4">
          <span>전체 데이터: <strong>{{ rows.length.toLocaleString() }}</strong>건</span>
          <span v-if="checkedRows.length > 0" class="text-blue-600 font-semibold">
            {{ checkedRows.length.toLocaleString() }}건 선택됨
          </span>
        </div>
        <div class="flex items-center gap-3">
          <div v-if="pagingEnabled" class="text-orange-600 font-semibold">페이징 모드 활성</div>
          <!-- 그룹 기준 선택 -->
          <label class="flex items-center gap-1.5 text-xs text-gray-600">
            <span class="font-semibold">그룹 기준:</span>
            <select
              v-model="groupByKey"
              class="bg-white border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="">없음</option>
              <option value="status">상태</option>
              <option value="dept">부서</option>
              <option value="gender">성별</option>
              <option value="active">재직 여부</option>
            </select>
          </label>
        </div>
      </div>

      <div class="flex-grow p-4 overflow-hidden">
        <WZGrid
          :columns="columns"
          :rows="rows"
          :height="650"
          :usePaging="pagingEnabled"
          :useCheckbox="true"
          :useFilter="true"
          :showAdd="true"
          :showDelete="true"
          :showColumnSettings="true"
          :useContextMenu="true"
          :useRowDrag="true"
          :groupBy="mergeEnabled ? '' : groupByKey"
          :autoMergeCols="mergeEnabled ? ['status', 'dept'] : []"
          v-model:currentPage="currentPage"
          v-model:pageSize="pageSize"
          @update:cell="handleUpdate"
          @update:checked="checkedRows = $event"
          @click:add="handleAdd"
          @click:delete="handleDelete"
          @resize:column="handleResize"
          @sort="handleSort"
          @reorder:columns="handleReorderColumns"
          @click:insert="handleInsert"
          @reorder:rows="handleReorderRows"
          @click:button="handleButtonClick"
        >
          <!-- 커스텀 툴바 슬롯 -->
          <template #toolbar>
            <!-- CSV 내보내기 -->
            <button
              @click="exportCSV"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-all bg-white border-green-300 text-green-600 hover:bg-green-500 hover:text-white hover:border-green-500"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              CSV
            </button>

            <!-- 전체 인쇄 -->
            <button
              @click="handlePrint(false)"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-all bg-white border-gray-300 text-gray-600 hover:bg-gray-600 hover:text-white hover:border-gray-600"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              인쇄
            </button>

            <!-- 선택 항목만 인쇄 (체크된 행이 있을 때만 활성) -->
            <button
              @click="handlePrint(true)"
              :disabled="checkedRows.length === 0"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-all bg-white border-purple-300 text-purple-600 hover:bg-purple-500 hover:text-white hover:border-purple-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-purple-600 disabled:hover:border-purple-300"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              선택 인쇄<span v-if="checkedRows.length > 0" class="opacity-80">({{ checkedRows.length }})</span>
            </button>
          </template>
        </WZGrid>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import WZGrid from './components/WZGrid.vue';
import type { Column, SortConfig } from './types/grid';
import { downloadCSV } from './utils/tsv';
import { printGrid } from './utils/print';

const pagingEnabled = ref(true);
const groupByKey    = ref('');
const mergeEnabled  = ref(false);

// 셀 병합 켜면 상태+부서 기준으로 정렬 후 활성화
const toggleMerge = () => {
  if (!mergeEnabled.value) {
    rows.value = [...rows.value].sort((a, b) =>
      a.status !== b.status ? a.status.localeCompare(b.status) : a.dept.localeCompare(b.dept)
    );
    pagingEnabled.value = false; // 병합은 전체 렌더 모드에서 의미 있음
  }
  mergeEnabled.value = !mergeEnabled.value;
};
const currentPage = ref(1);
const pageSize = ref(20);
const checkedRows = ref<any[]>([]);

// ── 휴대전화 실시간 포맷 함수 ──────────────────────────────────────────────
// 입력할 때마다 숫자만 추출 후 010-XXXX-XXXX 형태로 자동 변환
const formatPhone = (v: any): string => {
  const digits = String(v).replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

// ── 컬럼 정의 (11종 타입 전부 포함) ──────────────────────────────────────
const columns = ref<Column[]>([
  // ── pinned / text ─────────────────────────────────────────────────────
  { key: 'id',     title: 'ID',   width: 60,  align: 'center', pinned: true },
  { key: 'avatar', title: '사진', width: 60,  type: 'image',   pinned: true },
  { key: 'name',   title: '이름', width: 120, type: 'text',    pinned: true, required: true },

  // ── radio ─────────────────────────────────────────────────────────────
  {
    key: 'gender', title: '성별 [radio]', width: 130, type: 'radio', align: 'center',
    options: [{ label: '남', value: 'M' }, { label: '여', value: 'F' }]
  },

  // ── text + onInput (휴대전화 자동 하이픈) ─────────────────────────────
  {
    key: 'phone', title: '휴대전화 [text+onInput]', width: 185, type: 'text',
    onInput: formatPhone,
  },

  // ── text + truncate + tooltip (주소) ──────────────────────────────────
  {
    key: 'address', title: '주소 [truncate+tooltip]', width: 200, type: 'text',
    truncate: true, tooltip: true,
  },

  // ── badge ─────────────────────────────────────────────────────────────
  {
    key: 'status', title: '상태 [badge]', width: 120, type: 'badge', align: 'center',
    options: [
      { value: 'Active',   label: '활성', color: 'bg-green-100 text-green-700' },
      { value: 'Pending',  label: '대기', color: 'bg-yellow-100 text-yellow-700' },
      { value: 'Inactive', label: '중단', color: 'bg-red-100 text-red-700' },
    ]
  },

  // ── select ────────────────────────────────────────────────────────────
  {
    key: 'dept', title: '부서 [select]', width: 140, type: 'select',
    options: [
      { value: 'dev',     label: '개발팀' },
      { value: 'design',  label: '디자인팀' },
      { value: 'biz',     label: '사업팀' },
      { value: 'hr',      label: '인사팀' },
      { value: 'finance', label: '재무팀' },
    ]
  },

  // ── number ────────────────────────────────────────────────────────────
  { key: 'salary', title: '급여 [number]', width: 140, type: 'number', align: 'right' },

  // ── date ──────────────────────────────────────────────────────────────
  { key: 'joinDate', title: '입사일 [date]', width: 130, type: 'date', align: 'center' },

  // ── boolean ───────────────────────────────────────────────────────────
  { key: 'active', title: '재직 [boolean]', width: 110, type: 'boolean', align: 'center' },

  // ── progress ──────────────────────────────────────────────────────────
  { key: 'completion', title: '완료율 [progress]', width: 160, type: 'progress' },

  // ── link ──────────────────────────────────────────────────────────────
  { key: 'profile', title: '프로필 [link]', width: 200, type: 'link' },

  // ── button ────────────────────────────────────────────────────────────
  {
    key: 'action', title: '관리 [button]', width: 110, type: 'button', align: 'center',
    options: [{ label: '상세보기' }]
  },
]);

// ── 데이터 생성 ───────────────────────────────────────────────────────────
const CITIES = ['서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시'];
const DISTRICTS = [
  '강남구 테헤란로', '마포구 월드컵북로', '송파구 올림픽로', '종로구 세종대로',
  '해운대구 해운대해변로', '수성구 달구벌대로', '남구 문현금융로', '서구 둔산대로',
  '동구 중앙대로', '북구 연암로',
];

const generateData = (count: number) => {
  const statuses  = ['Active', 'Pending', 'Inactive'];
  const genders   = ['M', 'F'];
  const depts     = ['dev', 'design', 'biz', 'hr', 'finance'];
  const baseYear  = 2015;

  return Array.from({ length: count }).map((_, i) => {
    const year    = baseYear + (i % 10);
    const month   = String((i % 12) + 1).padStart(2, '0');
    const day     = String((i % 28) + 1).padStart(2, '0');
    const phone4a = String(Math.floor(1000 + Math.random() * 9000));
    const phone4b = String(Math.floor(1000 + Math.random() * 9000));
    const city    = CITIES[i % CITIES.length];
    const district = DISTRICTS[i % DISTRICTS.length];
    const buildingNo = Math.floor(1 + Math.random() * 999);
    const apt = i % 3 === 0 ? ` ${Math.floor(100 + Math.random() * 900)}동 ${Math.floor(100 + Math.random() * 900)}호` : '';
    return {
      id:         i + 1,
      avatar:     `https://i.pravatar.cc/150?u=${i + 1}`,
      name:       `User ${i + 1}`,
      gender:     genders[i % 2],
      phone:      `010-${phone4a}-${phone4b}`,
      address:    `${city} ${district} ${buildingNo}${apt}`,
      status:     statuses[i % 3],
      dept:       depts[i % 5],
      salary:     Math.floor(Math.random() * 100000) + 30000,
      joinDate:   `${year}-${month}-${day}`,
      active:     i % 3 !== 2,
      completion: Math.floor(Math.random() * 100),
      profile:    `https://github.com/user-${i + 1}`,
    };
  });
};

const rows = ref(generateData(10000));

// ── 이벤트 핸들러 ──────────────────────────────────────────────────────────
const handleUpdate = ({ row, colKey, value }: any) => {
  const target = rows.value.find(r => r.id === row.id);
  if (target) (target as any)[colKey] = value;
};

const handleResize = ({ colKey, width }: any) => {
  const col = columns.value.find(c => c.key === colKey);
  if (col) col.width = width;
};

type Row = ReturnType<typeof generateData>[number];

const handleSort = (configs: SortConfig[]) => {
  if (configs.length === 0) return;
  rows.value = [...rows.value].sort((a, b) => {
    for (const { key, order } of configs) {
      const modifier = order === 'asc' ? 1 : -1;
      const av = a[key as keyof Row];
      const bv = b[key as keyof Row];
      if (av !== bv) return (av > bv ? 1 : -1) * modifier;
    }
    return 0;
  });
};

const handleReorderColumns = ({ srcKey, targetKey }: { srcKey: string; targetKey: string }) => {
  const cols = [...columns.value];
  const srcIdx    = cols.findIndex(c => c.key === srcKey);
  const targetIdx = cols.findIndex(c => c.key === targetKey);
  if (srcIdx === -1 || targetIdx === -1) return;
  const [moved] = cols.splice(srcIdx, 1);
  cols.splice(targetIdx, 0, moved);
  columns.value = cols;
};

const handleButtonClick = ({ row }: any) => { alert(`${row.name} 상세 보기`); };
const exportCSV  = () => { downloadCSV(rows.value, columns.value, 'wz-grid-demo.csv'); };

const handlePrint = (checkedOnly: boolean) => {
  printGrid(columns.value, rows.value, {
    title: 'WZ-Grid 데이터',
    printCheckedOnly: checkedOnly,
    checkedRows: checkedRows.value,
  });
};
const resetData  = () => { rows.value = generateData(10000); currentPage.value = 1; };

let _nextId = 10001;
const handleAdd = () => {
  const newRow = {
    id:         _nextId++,
    avatar:     `https://i.pravatar.cc/150?u=${_nextId}`,
    name:       '',
    gender:     'M',
    phone:      '',
    address:    '',
    status:     'Pending',
    dept:       'dev',
    salary:     0,
    joinDate:   new Date().toISOString().slice(0, 10),
    active:     true,
    completion: 0,
    profile:    '',
  };
  rows.value = [newRow, ...rows.value];
  currentPage.value = 1;
};

const handleReorderRows = ({ from, to, position }: { from: any; to: any; position: 'above' | 'below' }) => {
  const arr = [...rows.value];
  const fromIdx = arr.findIndex(r => r.id === from.id);
  if (fromIdx === -1) return;
  const [moved] = arr.splice(fromIdx, 1);
  const toIdx = arr.findIndex(r => r.id === to.id);
  if (toIdx === -1) return;
  arr.splice(position === 'above' ? toIdx : toIdx + 1, 0, moved);
  rows.value = arr;
};

const handleInsert = ({ position, row }: { position: 'above' | 'below'; row: any }) => {
  const idx = rows.value.findIndex(r => r.id === row?.id);
  if (idx === -1) return;
  const newRow = {
    id: _nextId++, avatar: `https://i.pravatar.cc/150?u=${_nextId}`,
    name: '', gender: 'M', phone: '', address: '', status: 'Pending',
    dept: 'dev', salary: 0, joinDate: new Date().toISOString().slice(0, 10),
    active: true, completion: 0, profile: '',
  };
  const insertAt = position === 'above' ? idx : idx + 1;
  rows.value = [...rows.value.slice(0, insertAt), newRow, ...rows.value.slice(insertAt)];
};

const handleDelete = (checkedList: any[]) => {
  if (checkedList.length === 0) return;
  if (!confirm(`선택한 ${checkedList.length}건을 삭제하시겠습니까?`)) return;
  const ids = new Set(checkedList.map(r => r.id));
  rows.value = rows.value.filter(r => !ids.has(r.id));
  checkedRows.value = [];
};

// ── 컬럼 타입 범례 태그 ────────────────────────────────────────────────────
const columnTypeTags = [
  { label: 'text',     class: 'bg-gray-100   text-gray-600   border-gray-300' },
  { label: 'number',   class: 'bg-blue-50    text-blue-600   border-blue-200' },
  { label: 'date',     class: 'bg-purple-50  text-purple-600 border-purple-200' },
  { label: 'boolean',  class: 'bg-teal-50    text-teal-600   border-teal-200' },
  { label: 'select',   class: 'bg-indigo-50  text-indigo-600 border-indigo-200' },
  { label: 'badge',    class: 'bg-green-50   text-green-600  border-green-200' },
  { label: 'progress', class: 'bg-sky-50     text-sky-600    border-sky-200' },
  { label: 'image',    class: 'bg-pink-50    text-pink-600   border-pink-200' },
  { label: 'button',   class: 'bg-orange-50  text-orange-600 border-orange-200' },
  { label: 'link',     class: 'bg-cyan-50    text-cyan-600   border-cyan-200' },
  { label: 'radio',    class: 'bg-yellow-50  text-yellow-600 border-yellow-200' },
  { label: 'onInput',  class: 'bg-rose-50    text-rose-600   border-rose-200' },
];
</script>
