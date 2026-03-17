<template>
  <div class="flex flex-col gap-6">

    <!-- ── 기능 토글 컨트롤 패널 ─────────────────────────────────────────── -->
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

    <!-- 컬럼 타입 범례 -->
    <div class="flex flex-wrap gap-2 text-xs">
      <span v-for="tag in columnTypeTags" :key="tag.label"
        class="px-2 py-1 rounded-full border font-mono"
        :class="tag.class"
      >{{ tag.label }}</span>
    </div>

    <div class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
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
          <span
            :class="isProUser ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400 line-through'"
            class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
          >고급 필터 {{ isProUser ? '✓' : '🔒' }}</span>
          <span
            :class="isProUser ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400 line-through'"
            class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
          >마스터-디테일 {{ isProUser ? '✓' : '🔒' }}</span>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 font-semibold">셀 슬롯 ✓</span>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 font-semibold">행 스타일 ✓</span>
        </div>
      </div>

      <!-- 스켈레톤 로딩 -->
      <div v-if="loading" class="flex-grow flex flex-col overflow-hidden">
        <!-- 툴바 스켈레톤 -->
        <div class="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 gap-2">
          <div class="flex items-center gap-2">
            <div class="h-7 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div class="h-7 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div class="flex items-center gap-2">
            <div class="h-7 w-10 bg-gray-200 rounded animate-pulse"></div>
            <div class="h-7 w-14 bg-gray-200 rounded animate-pulse"></div>
            <div class="h-7 w-14 bg-gray-200 rounded animate-pulse"></div>
            <div class="h-7 w-14 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <!-- 그리드 스켈레톤 -->
        <div class="flex-grow overflow-hidden border border-gray-200 rounded-b mx-4 my-3">
          <!-- 헤더 행 -->
          <div class="flex border-b-2 border-gray-300 bg-gray-50">
            <div class="w-10 flex-shrink-0 px-2 py-2.5 border-r border-gray-200">
              <div class="h-3.5 w-3.5 bg-gray-300 rounded animate-pulse mx-auto"></div>
            </div>
            <div class="w-7 flex-shrink-0 border-r border-gray-200"></div>
            <div v-for="(w, i) in skeletonCols" :key="i"
              :style="{ width: w + 'px' }"
              class="flex-shrink-0 px-2 py-2.5 border-r border-gray-200 last:border-r-0"
            >
              <div class="h-2.5 bg-gray-300 rounded animate-pulse" :style="{ width: Math.round(w * 0.55) + 'px' }"></div>
            </div>
          </div>
          <!-- 필터 행 -->
          <div class="flex border-b border-gray-200 bg-white">
            <div class="w-10 flex-shrink-0 border-r border-gray-200"></div>
            <div class="w-7 flex-shrink-0 border-r border-gray-200"></div>
            <div v-for="(w, i) in skeletonCols" :key="i"
              :style="{ width: w + 'px' }"
              class="flex-shrink-0 px-2 py-1.5 border-r border-gray-200 last:border-r-0"
            >
              <div class="h-5 bg-gray-100 rounded border border-gray-200 animate-pulse"></div>
            </div>
          </div>
          <!-- 데이터 행 -->
          <div
            v-for="row in 14" :key="row"
            class="flex border-b border-gray-100 last:border-b-0"
            :class="row % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'"
          >
            <div class="w-10 flex-shrink-0 px-2 py-2.5 border-r border-gray-100 flex items-center justify-center">
              <div class="h-3.5 w-3.5 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div class="w-7 flex-shrink-0 border-r border-gray-100"></div>
            <div v-for="(w, i) in skeletonCols" :key="i"
              :style="{ width: w + 'px' }"
              class="flex-shrink-0 px-2 py-2.5 border-r border-gray-100 last:border-r-0 flex items-center"
            >
              <div v-if="i === 1" class="h-7 w-7 bg-gray-200 rounded-full animate-pulse"></div>
              <div v-else class="h-2.5 bg-gray-200 rounded animate-pulse"
                :style="{ width: Math.round(w * skeletonRowRatio(row, i)) + 'px', animationDelay: (row * 40 + i * 20) + 'ms' }"
              ></div>
            </div>
          </div>
        </div>
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
          :showColumnSettings="true"
          :showExcelExport="true"
          :licenseKey="licenseKey"
          excelFilename="wz-grid-demo.xlsx"
          :useContextMenu="true"
          :useRowDrag="true"
          :groupBy="!mergeEnabled ? groupByKey : ''"
          :autoMergeCols="mergeEnabled ? ['status', 'dept'] : []"
          :showFooter="true"
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
          :rowClass="demoRowClass"
          :cellClass="demoCellClass"
          @click:row="handleRowClick"
        >
          <!-- ── 셀 커스텀 슬롯: 이름 (아바타 + 볼드) ── -->
          <template #cell-name="{ row, value }">
            <div class="flex items-center gap-2">
              <img :src="row.avatar" class="w-6 h-6 rounded-full" />
              <span class="font-semibold text-gray-800">{{ value }}</span>
            </div>
          </template>

          <!-- ── 셀 커스텀 슬롯: 급여 (통화 포맷) ── -->
          <template #cell-salary="{ value }">
            <div class="flex items-center gap-0.5 justify-end">
              <span class="text-gray-400 text-[10px]">&#8361;</span>
              <span class="tabular-nums">{{ Number(value).toLocaleString() }}</span>
            </div>
          </template>

          <!-- ── 마스터-디테일 슬롯 ── -->
          <template #detail="{ row }">
            <div class="grid grid-cols-3 gap-4 text-sm p-2">
              <div>
                <span class="font-bold text-gray-600">기본 정보</span>
                <p class="mt-1">이름: {{ row.name }}</p>
                <p>성별: {{ row.gender === 'M' ? '남' : '여' }}</p>
                <p>휴대전화: {{ row.phone }}</p>
              </div>
              <div>
                <span class="font-bold text-gray-600">근무 정보</span>
                <p class="mt-1">부서: {{ row.dept }}</p>
                <p>상태: {{ row.status }}</p>
                <p>입사일: {{ row.joinDate }}</p>
              </div>
              <div>
                <span class="font-bold text-gray-600">급여 & 실적</span>
                <p class="mt-1">급여: {{ Number(row.salary).toLocaleString() }}원</p>
                <p>완료율: {{ row.completion }}%</p>
                <p>주소: {{ row.address }}</p>
              </div>
            </div>
          </template>

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

            <!-- 선택 항목만 인쇄 -->
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import WZGrid from '../components/WZGrid.vue';
import type { Column, SortConfig } from '../types/grid';
import { downloadCSV } from '../utils/tsv';
import { printGrid } from '../utils/print';
import { injectLicense } from './shared/useLicense';

// ── 라이선스 (App.vue에서 provide된 컨텍스트를 inject) ──────────────────────
const { licenseKey, isProUser } = injectLicense();

// ── 기능 토글 상태 ──────────────────────────────────────────────────────────
const pagingEnabled   = ref(true);
const groupByKey      = ref('');
const mergeEnabled    = ref(false);
const truncateEnabled = ref(true);
const currentPage     = ref(1);
const pageSize        = ref(20);
const checkedRows     = ref<any[]>([]);

// 셀 병합 켜면 상태+부서 기준 정렬 후 활성화
const toggleMerge = () => {
  if (!mergeEnabled.value) {
    rows.value = [...rows.value].sort((a, b) =>
      a.status !== b.status ? a.status.localeCompare(b.status) : a.dept.localeCompare(b.dept)
    );
    pagingEnabled.value = false;
  }
  mergeEnabled.value = !mergeEnabled.value;
};

// ── 휴대전화 실시간 포맷 함수 ──────────────────────────────────────────────
const formatPhone = (v: any): string => {
  const digits = String(v).replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

// ── 컬럼 너비 오버라이드 (리사이즈 반영) ──────────────────────────────────
const columnWidths = ref<Record<string, number>>({});
const w = (key: string, def: number) => columnWidths.value[key] ?? def;

// ── 컬럼 정의 ──────────────────────────────────────────────────────────────
const columns = computed<Column[]>(() => [
  { key: 'id',     title: 'ID',   width: w('id', 60),     align: 'center', pinned: true },
  { key: 'avatar', title: '사진', width: w('avatar', 60), type: 'image',   pinned: true },
  { key: 'name',   title: '이름', width: w('name', 120),  type: 'text',    pinned: true, required: true,
    truncate: truncateEnabled.value, tooltip: truncateEnabled.value },

  {
    key: 'gender', title: '성별 [radio]', width: w('gender', 130), type: 'radio', align: 'center',
    options: [{ label: '남', value: 'M' }, { label: '여', value: 'F' }]
  },

  {
    key: 'phone', title: '휴대전화 [text+onInput]', width: w('phone', 150), type: 'text',
    onInput: formatPhone,
    truncate: truncateEnabled.value,
  },

  {
    key: 'address', title: `주소 [truncate ${truncateEnabled.value ? 'ON' : 'OFF'}]`, width: w('address', 160), type: 'text',
    truncate: truncateEnabled.value, tooltip: true,
  },

  {
    key: 'status', title: '상태 [badge]', width: 120, type: 'badge', align: 'center',
    options: [
      { value: 'Active',   label: '활성', color: 'bg-green-100 text-green-700' },
      { value: 'Pending',  label: '대기', color: 'bg-yellow-100 text-yellow-700' },
      { value: 'Inactive', label: '중단', color: 'bg-red-100 text-red-700' },
    ]
  },

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

  { key: 'salary', title: '급여 [number]', width: w('salary', 140), type: 'number', align: 'right', footer: 'sum', footerLabel: '합계' },
  { key: 'joinDate', title: '입사일 [date]', width: w('joinDate', 130), type: 'date', align: 'center' },
  { key: 'active', title: '재직 [boolean]', width: w('active', 110), type: 'boolean', align: 'center', footer: 'count', footerLabel: '재직' },
  { key: 'completion', title: '완료율 [progress]', width: w('completion', 160), type: 'progress', footer: 'avg', footerLabel: '평균' },
  { key: 'profile', title: '프로필 [link]', width: w('profile', 180), type: 'link' },
  {
    key: 'action', title: '관리 [button]', width: w('action', 110), type: 'button', align: 'center',
    options: [{ label: '상세보기' }]
  },
]);

// ── API ────────────────────────────────────────────────────────────────────
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

const handleUpdate = async ({ row, colKey, value }: any) => {
  const target = rows.value.find(r => r.id === row.id);
  if (target) target[colKey] = value;
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
  columnWidths.value = { ...columnWidths.value };
};

const handleButtonClick = ({ row }: any) => { alert(`${row.name} 상세 보기`); };

const clickedRowId = ref<number | null>(null);

const handleRowClick = ({ row }: any) => {
  clickedRowId.value = row.id;
};

const demoRowClass = (row: any) => ({
  'bg-blue-50/60': row.id === clickedRowId.value,
  'bg-red-50/40': row.status === 'Inactive',
});

const demoCellClass = (row: any, column: any) => {
  if (column.key === 'salary' && row.salary > 80000) return 'bg-yellow-50/60 font-semibold';
  return null;
};

const exportCSV = () => { downloadCSV(rows.value, columns.value, 'wz-grid-demo.csv'); };

const handlePrint = (checkedOnly: boolean) => {
  printGrid(columns.value, rows.value, {
    title: 'WZ-Grid 데이터',
    printCheckedOnly: checkedOnly,
    checkedRows: checkedRows.value,
  });
};

const resetData = async () => { currentPage.value = 1; await fetchRows(); };

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

// ── 스켈레톤 로딩 헬퍼 ────────────────────────────────────────────────────
const skeletonCols = [60, 60, 120, 130, 150, 160, 120, 140, 140, 130, 110, 160, 180, 110];

const skeletonRowRatio = (row: number, col: number): number => {
  const seed = (row * 7 + col * 13) % 10;
  return 0.35 + seed * 0.045;
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
