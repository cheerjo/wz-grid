<template>
  <div class="min-h-screen p-8 bg-gray-50 flex flex-col gap-6">
    <header class="flex flex-col gap-3">
      <!-- 상단: 제목 + 라이선스 입력 -->
      <div class="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">WZ-Grid Demo</h1>
          <p class="text-sm text-gray-500 mt-1">10,000개 데이터 · 전체 컬럼 타입 예제</p>
        </div>

        <!-- 라이선스 키 입력 -->
        <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
          <span class="text-xs font-semibold text-gray-500 whitespace-nowrap">라이선스 키</span>
          <input
            v-model="licenseKey"
            type="text"
            placeholder="WZGRID-PRO-XXXXXXXX-XXXXXXX"
            class="text-xs font-mono border border-gray-300 rounded px-2 py-1 w-64 outline-none focus:ring-1 focus:ring-blue-400"
          />
          <span
            :class="licenseTierLabel.class"
            class="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
          >{{ licenseTierLabel.text }}</span>
          <button
            @click="applyDemoKey"
            class="text-[10px] font-semibold px-2 py-1 bg-amber-400 hover:bg-amber-500 text-white rounded transition-colors whitespace-nowrap"
          >
            데모키 입력
          </button>
        </div>
      </div>

      <!-- 하단: 기능 토글 컨트롤 패널 -->
      <div class="flex flex-wrap items-center gap-2">

        <!-- Community 기능 -->
        <div class="flex items-center gap-1.5 mr-1">
          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Community</span>
        </div>
        <button
          @click="pagingEnabled = !pagingEnabled"
          :class="pagingEnabled ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500' : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-300'"
          class="px-3 py-1.5 rounded border shadow-sm text-xs font-semibold transition-colors"
        >
          페이징 {{ pagingEnabled ? 'ON' : 'OFF' }}
        </button>
        <!-- truncate 토글 -->
        <button
          @click="truncateEnabled = !truncateEnabled"
          :class="truncateEnabled ? 'bg-teal-500 hover:bg-teal-600 text-white border-teal-500' : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-300'"
          class="px-3 py-1.5 rounded border shadow-sm text-xs font-semibold transition-colors"
        >
          말줄임 {{ truncateEnabled ? 'ON' : 'OFF' }}
        </button>

        <button @click="resetData" class="px-3 py-1.5 bg-white border border-gray-300 rounded shadow-sm text-xs font-semibold hover:bg-gray-50 text-gray-600">
          데이터 초기화
        </button>

        <div class="w-px h-5 bg-gray-300 mx-1" />

        <!-- Pro 기능 -->
        <div class="flex items-center gap-1.5 mr-1">
          <span class="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Pro</span>
          <span v-if="!isProUser" class="text-[10px] text-gray-400">(잠김 🔒)</span>
        </div>

        <!-- 그룹핑 선택 -->
        <div class="relative">
          <select
            v-model="groupByKey"
            :disabled="!isProUser || mergeEnabled"
            class="bg-white border rounded px-2 py-1.5 text-xs outline-none transition-colors"
            :class="isProUser ? 'border-gray-300 focus:ring-1 focus:ring-blue-400 text-gray-700' : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'"
          >
            <option value="">그룹 없음</option>
            <option value="status">그룹: 상태</option>
            <option value="dept">그룹: 부서</option>
            <option value="gender">그룹: 성별</option>
            <option value="active">그룹: 재직</option>
          </select>
          <span v-if="!isProUser" class="absolute -top-1.5 -right-1.5 text-[10px]">🔒</span>
        </div>

        <!-- 셀 병합 -->
        <div class="relative">
          <button
            @click="isProUser && toggleMerge()"
            :disabled="!isProUser"
            :class="[
              isProUser
                ? mergeEnabled ? 'bg-purple-500 hover:bg-purple-600 text-white border-purple-500' : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-300'
                : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
            ]"
            class="px-3 py-1.5 rounded border shadow-sm text-xs font-semibold transition-colors"
          >
            셀 병합 {{ mergeEnabled ? 'ON' : 'OFF' }}
          </button>
          <span v-if="!isProUser" class="absolute -top-1.5 -right-1.5 text-[10px]">🔒</span>
        </div>
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
        <!-- 활성 기능 배지 -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">정렬/필터 ✓</span>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">인쇄/CSV ✓</span>
          <span
            :class="isProUser ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400 line-through'"
            class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
          >그룹핑 {{ isProUser ? '✓' : '🔒' }}</span>
          <span
            :class="isProUser ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400 line-through'"
            class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
          >셀 병합 {{ isProUser ? '✓' : '🔒' }}</span>
          <span
            :class="isProUser ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400 line-through'"
            class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
          >행 드래그 {{ isProUser ? '✓' : '🔒' }}</span>
          <span
            :class="isProUser ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400 line-through'"
            class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
          >컬럼 설정 {{ isProUser ? '✓' : '🔒' }}</span>
          <span
            :class="isProUser ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400 line-through'"
            class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
          >컨텍스트 메뉴 {{ isProUser ? '✓' : '🔒' }}</span>
          <span
            :class="isProUser ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400 line-through'"
            class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
          >Excel {{ isProUser ? '✓' : '🔒' }}</span>
        </div>
      </div>

      <!-- 로딩 -->
      <div v-if="loading" class="flex-grow flex items-center justify-center text-gray-400 text-sm gap-2">
        <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
        데이터 불러오는 중...
      </div>
      <!-- 에러 -->
      <div v-else-if="error" class="flex-grow flex items-center justify-center text-red-500 text-sm gap-2">
        ⚠ {{ error }}
        <button @click="fetchRows" class="ml-2 px-3 py-1 bg-red-50 border border-red-300 rounded text-xs hover:bg-red-100">다시 시도</button>
      </div>

      <div v-else class="flex-grow p-4 overflow-hidden">
        <WZGrid
          :columns="columns"
          :rows="rows"
          :height="650"
          :usePaging="pagingEnabled"
          :useCheckbox="true"
          :useFilter="true"
          :showAdd="true"
          :showDelete="true"
          :showColumnSettings="isProUser"
          :showExcelExport="true"
          :licenseKey="licenseKey"
          excelFilename="wz-grid-demo.xlsx"
          :useContextMenu="isProUser"
          :useRowDrag="isProUser"
          :groupBy="isProUser && !mergeEnabled ? groupByKey : ''"
          :autoMergeCols="isProUser && mergeEnabled ? ['status', 'dept'] : []"
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
      </div><!-- v-else -->
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import WZGrid from './components/WZGrid.vue';
import type { Column, SortConfig } from './types/grid';
import { downloadCSV } from './utils/tsv';
import { printGrid } from './utils/print';
import { validateLicense, isPro, generateKey } from './license';

// ── 라이선스 ────────────────────────────────────────────────────────────────
const licenseKey = ref('');
const licenseTier = computed(() => validateLicense(licenseKey.value));
const isProUser   = computed(() => isPro(licenseTier.value));
const licenseTierLabel = computed(() => {
  const t = licenseTier.value;
  if (t === 'enterprise') return { text: 'Enterprise ✓', class: 'bg-purple-100 text-purple-700' };
  if (t === 'pro')        return { text: 'Pro ✓',        class: 'bg-amber-100 text-amber-700' };
  return                         { text: 'Community',    class: 'bg-gray-100 text-gray-500' };
});
const applyDemoKey = () => { licenseKey.value = generateKey('PRO', 'DEMO0001'); };

const pagingEnabled  = ref(true);
const groupByKey     = ref('');
const mergeEnabled   = ref(false);
const truncateEnabled = ref(true);

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

// ── 컬럼 너비 오버라이드 (리사이즈 반영) ──────────────────────────────────
const columnWidths = ref<Record<string, number>>({});
const w = (key: string, def: number) => columnWidths.value[key] ?? def;

// ── 컬럼 정의 (11종 타입 전부 포함) ──────────────────────────────────────
const columns = computed<Column[]>(() => [
  // ── pinned / text ─────────────────────────────────────────────────────
  { key: 'id',     title: 'ID',   width: w('id', 60),     align: 'center', pinned: true },
  { key: 'avatar', title: '사진', width: w('avatar', 60), type: 'image',   pinned: true },
  { key: 'name',   title: '이름', width: w('name', 120),  type: 'text',    pinned: true, required: true,
    truncate: truncateEnabled.value, tooltip: truncateEnabled.value },

  // ── radio ─────────────────────────────────────────────────────────────
  {
    key: 'gender', title: '성별 [radio]', width: w('gender', 130), type: 'radio', align: 'center',
    options: [{ label: '남', value: 'M' }, { label: '여', value: 'F' }]
  },

  // ── text + onInput (휴대전화 자동 하이픈) ─────────────────────────────
  {
    key: 'phone', title: '휴대전화 [text+onInput]', width: w('phone', 150), type: 'text',
    onInput: formatPhone,
    truncate: truncateEnabled.value,
  },

  // ── text + truncate + tooltip (주소) ──────────────────────────────────
  {
    key: 'address', title: `주소 [truncate ${truncateEnabled.value ? 'ON' : 'OFF'}]`, width: w('address', 160), type: 'text',
    truncate: truncateEnabled.value, tooltip: true,
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
    key: 'dept', title: '부서 [select]', width: w('dept', 140), type: 'select',
    truncate: truncateEnabled.value,
    options: [
      { value: 'dev',     label: '개발팀' },
      { value: 'design',  label: '디자인팀' },
      { value: 'biz',     label: '사업팀' },
      { value: 'hr',      label: '인사팀' },
      { value: 'finance', label: '재무팀' },
    ]
  },

  // ── number ────────────────────────────────────────────────────────────
  { key: 'salary', title: '급여 [number]', width: w('salary', 140), type: 'number', align: 'right' },

  // ── date ──────────────────────────────────────────────────────────────
  { key: 'joinDate', title: '입사일 [date]', width: w('joinDate', 130), type: 'date', align: 'center' },

  // ── boolean ───────────────────────────────────────────────────────────
  { key: 'active', title: '재직 [boolean]', width: w('active', 110), type: 'boolean', align: 'center' },

  // ── progress ──────────────────────────────────────────────────────────
  { key: 'completion', title: '완료율 [progress]', width: w('completion', 160), type: 'progress' },

  // ── link ──────────────────────────────────────────────────────────────
  { key: 'profile', title: '프로필 [link]', width: w('profile', 180), type: 'link' },

  // ── button ────────────────────────────────────────────────────────────
  {
    key: 'action', title: '관리 [button]', width: w('action', 110), type: 'button', align: 'center',
    options: [{ label: '상세보기' }]
  },
]);

// ── 데이터 생성 ───────────────────────────────────────────────────────────
// ── API ──────────────────────────────────────────────────────────────────────
const API = '/api/employees';

const rows    = ref<any[]>([]);
const loading = ref(false);
const error   = ref('');

const fetchRows = async () => {
  loading.value = true; error.value = '';
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    rows.value = await res.json();
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRows);

// ── 이벤트 핸들러 ──────────────────────────────────────────────────────────

// 셀 편집 → PATCH /api/employees/:id
const handleUpdate = async ({ row, colKey, value }: any) => {
  const target = rows.value.find(r => r.id === row.id);
  if (target) target[colKey] = value; // 낙관적 업데이트
  await fetch(`${API}/${row.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ [colKey]: value }),
  });
};

const handleResize = ({ colKey, width }: any) => {
  columnWidths.value[colKey] = width;
};

const handleSort = (configs: SortConfig[]) => {
  if (configs.length === 0) return;
  rows.value = [...rows.value].sort((a, b) => {
    for (const { key, order } of configs) {
      const modifier = order === 'asc' ? 1 : -1;
      const av = a[key]; const bv = b[key];
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
  columnWidths.value = { ...columnWidths.value }; // 컬럼 순서 변경 시 widths 유지
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

// 데이터 새로고침 → GET /api/employees
const resetData = async () => { currentPage.value = 1; await fetchRows(); };

// 행 추가 → POST /api/employees
const newRowTemplate = () => ({
  avatar: '', name: '', gender: 'M', phone: '', address: '',
  status: 'Pending', dept: 'dev', salary: 0,
  joinDate: new Date().toISOString().slice(0, 10),
  active: true, completion: 0, profile: '',
});

const handleAdd = async () => {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newRowTemplate()),
  });
  const created = await res.json();
  created.avatar = `https://i.pravatar.cc/150?u=${created.id}`;
  rows.value = [created, ...rows.value];
  currentPage.value = 1;
};

// 행 위치 변경 (클라이언트 상태만)
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

// 위/아래 삽입 → POST /api/employees
const handleInsert = async ({ position, row }: { position: 'above' | 'below'; row: any }) => {
  const idx = rows.value.findIndex(r => r.id === row?.id);
  if (idx === -1) return;
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newRowTemplate()),
  });
  const created = await res.json();
  created.avatar = `https://i.pravatar.cc/150?u=${created.id}`;
  const insertAt = position === 'above' ? idx : idx + 1;
  rows.value = [...rows.value.slice(0, insertAt), created, ...rows.value.slice(insertAt)];
};

// 행 삭제 → DELETE /api/employees
const handleDelete = async (checkedList: any[]) => {
  if (checkedList.length === 0) return;
  if (!confirm(`선택한 ${checkedList.length}건을 삭제하시겠습니까?`)) return;
  const ids = checkedList.map(r => r.id);
  await fetch(API, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  const idSet = new Set(ids);
  rows.value = rows.value.filter(r => !idSet.has(r.id));
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
