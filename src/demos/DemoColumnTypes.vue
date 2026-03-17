<template>
  <div class="flex flex-col gap-6">

    <!-- ── 범례 바 ─────────────────────────────────────────────────────────── -->
    <div class="flex flex-wrap items-center gap-3 text-xs">
      <span class="font-bold text-gray-500 uppercase tracking-wide text-[10px]">편집 정책</span>
      <span class="px-2.5 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200 font-semibold">
        편집 가능 — text, number, currency, email, date, datetime, select
      </span>
      <span class="px-2.5 py-1 rounded-full border bg-green-50 text-green-700 border-green-200 font-semibold">
        클릭 즉시 반영 — boolean, radio, rating, color
      </span>
      <span class="px-2.5 py-1 rounded-full border bg-gray-100 text-gray-500 border-gray-300 font-semibold">
        읽기 전용 — badge, tag, progress, image, link, button, sparkline
      </span>
    </div>

    <!-- ── 그리드 카드 ──────────────────────────────────────────────────────── -->
    <div class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
      <div class="p-3 border-b bg-gray-50 text-sm text-gray-600 flex items-center justify-between">
        <span>전체 <strong>{{ rows.length }}</strong>행 · 컬럼 타입 <strong>18</strong>종</span>
        <span v-if="checkedRows.length > 0" class="text-blue-600 font-semibold text-xs">
          {{ checkedRows.length }}건 선택됨
        </span>
      </div>

      <div class="p-4 overflow-hidden">
        <WZGrid
          :columns="columns"
          :rows="rows"
          :height="560"
          :useCheckbox="true"
          :useFilter="true"
          @update:cell="handleCellUpdate"
          @update:checked="checkedRows = $event"
        />
      </div>
    </div>

    <!-- ── 이벤트 로그 패널 ────────────────────────────────────────────────── -->
    <div class="bg-white rounded-lg shadow border border-gray-200">
      <div class="px-4 py-2.5 border-b bg-gray-50 flex items-center justify-between">
        <span class="text-sm font-semibold text-gray-700">이벤트 로그 <span class="text-gray-400 font-normal text-xs">(최근 10개)</span></span>
        <button
          @click="eventLogs = []"
          class="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >초기화</button>
      </div>
      <div class="divide-y divide-gray-100 min-h-[80px] max-h-[200px] overflow-y-auto">
        <div
          v-if="eventLogs.length === 0"
          class="flex items-center justify-center h-[80px] text-gray-400 text-xs"
        >
          셀 값을 변경하면 여기에 표시됩니다.
        </div>
        <div
          v-for="(log, i) in eventLogs"
          :key="i"
          class="px-4 py-1.5 text-xs font-mono flex items-center gap-2"
          :class="i === 0 ? 'bg-blue-50/60' : ''"
        >
          <span class="text-gray-400 w-16 shrink-0">{{ log.time }}</span>
          <span class="text-blue-700 font-semibold shrink-0">{{ log.col }}</span>
          <span class="text-gray-400">row #{{ log.rowId }}</span>
          <span class="text-gray-400">:</span>
          <span class="text-red-500 line-through">{{ formatLogValue(log.oldVal) }}</span>
          <span class="text-gray-400">→</span>
          <span class="text-green-600 font-semibold">{{ formatLogValue(log.newVal) }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import WZGrid from '../components/WZGrid.vue';
import type { Column } from '../types/grid';

// ── 컬럼 정의 (18종) ──────────────────────────────────────────────────────
const columns: Column[] = [
  // ── 편집 가능
  {
    key: 'colText',
    title: 'text',
    type: 'text',
    width: 130,
  },
  {
    key: 'colNumber',
    title: 'number',
    type: 'number',
    width: 100,
    align: 'right',
  },
  {
    key: 'colCurrency',
    title: 'currency',
    type: 'currency',
    width: 120,
    align: 'right',
  },
  {
    key: 'colEmail',
    title: 'email',
    type: 'email',
    width: 180,
  },
  {
    key: 'colDate',
    title: 'date',
    type: 'date',
    width: 120,
    align: 'center',
  },
  {
    key: 'colDatetime',
    title: 'datetime',
    type: 'datetime',
    width: 160,
    align: 'center',
  },
  {
    key: 'colSelect',
    title: 'select',
    type: 'select',
    width: 120,
    options: [
      { value: 'opt1', label: '옵션 1' },
      { value: 'opt2', label: '옵션 2' },
      { value: 'opt3', label: '옵션 3' },
    ],
  },
  // ── 클릭 즉시 반영
  {
    key: 'colBoolean',
    title: 'boolean',
    type: 'boolean',
    width: 90,
    align: 'center',
  },
  {
    key: 'colRadio',
    title: 'radio',
    type: 'radio',
    width: 140,
    align: 'center',
    options: [
      { label: '예', value: 'yes' },
      { label: '아니오', value: 'no' },
    ],
  },
  {
    key: 'colRating',
    title: 'rating',
    type: 'rating',
    width: 130,
    align: 'center',
  },
  {
    key: 'colColor',
    title: 'color',
    type: 'color',
    width: 90,
    align: 'center',
  },
  // ── 읽기 전용
  {
    key: 'colBadge',
    title: 'badge',
    type: 'badge',
    width: 100,
    align: 'center',
    options: [
      { value: 'active',   label: '활성', color: 'bg-green-100 text-green-700' },
      { value: 'pending',  label: '대기', color: 'bg-yellow-100 text-yellow-700' },
      { value: 'inactive', label: '중단', color: 'bg-red-100 text-red-700' },
    ],
  },
  {
    key: 'colTag',
    title: 'tag',
    type: 'tag',
    width: 160,
  },
  {
    key: 'colProgress',
    title: 'progress',
    type: 'progress',
    width: 140,
  },
  {
    key: 'colImage',
    title: 'image',
    type: 'image',
    width: 70,
    align: 'center',
  },
  {
    key: 'colLink',
    title: 'link',
    type: 'link',
    width: 160,
  },
  {
    key: 'colButton',
    title: 'button',
    type: 'button',
    width: 100,
    align: 'center',
    options: [{ label: '클릭' }],
  },
  {
    key: 'colSparkline',
    title: 'sparkline',
    type: 'sparkline',
    width: 120,
    sparklineColor: '#3b82f6',
    sparklineHeight: 28,
  },
];

// ── 정적 데이터 (12행) ────────────────────────────────────────────────────
const BADGE_VALUES = ['active', 'pending', 'inactive'] as const;
const RADIO_VALUES = ['yes', 'no'] as const;
const SELECT_VALUES = ['opt1', 'opt2', 'opt3'] as const;

const makeRow = (i: number) => ({
  id: i,
  colText:     `텍스트 ${i}`,
  colNumber:   i * 1500,
  colCurrency: i * 12000,
  colEmail:    `user${i}@example.com`,
  colDate:     `2025-0${(i % 9) + 1}-${String((i * 3) % 28 + 1).padStart(2, '0')}`,
  colDatetime: `2025-0${(i % 9) + 1}-${String((i * 3) % 28 + 1).padStart(2, '0')} 0${(i * 2) % 9}:${String(i * 5 % 60).padStart(2, '0')}`,
  colSelect:   SELECT_VALUES[i % 3],
  colBoolean:  i % 3 !== 0,
  colRadio:    RADIO_VALUES[i % 2],
  colRating:   (i % 5) + 1,
  colColor:    ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#06b6d4', '#e11d48'][i % 12],
  colBadge:    BADGE_VALUES[i % 3],
  colTag:      [`태그${i}`, `유형${i % 3 + 1}`, i % 2 === 0 ? '공개' : '비공개'],
  colProgress: Math.min(100, (i * 8) % 101),
  colImage:    `https://i.pravatar.cc/40?img=${i + 1}`,
  colLink:       `https://example.com/item/${i}`,
  colButton:     '',
  colSparkline:  Array.from({ length: 7 }, (_, j) => Math.round(10 + Math.abs(Math.sin((i + j) * 0.8) * 80))),
});

const rows = ref(Array.from({ length: 12 }, (_, i) => makeRow(i + 1)));

interface RowData {
  id: number;
  [key: string]: any;
}

interface LogEntry {
  time: string;
  col: string;
  rowId: number;
  oldVal: unknown;
  newVal: unknown;
}

const eventLogs = ref<LogEntry[]>([]);

const now = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
};

const formatLogValue = (v: unknown): string => {
  if (v === null || v === undefined) return '—';
  if (Array.isArray(v)) return v.join(', ');
  return String(v);
};

const checkedRows = ref<any[]>([]);

const handleCellUpdate = ({ row, colKey, value }: { row: any; colKey: string; value: unknown }) => {
  const target = rows.value.find(r => r.id === row.id) as RowData | undefined;
  if (!target) return;

  const col = columns.find(c => c.key === colKey);
  const oldVal = target[colKey];
  target[colKey] = value;

  eventLogs.value.unshift({
    time: now(),
    col: col?.title ?? colKey,
    rowId: row.id,
    oldVal,
    newVal: value,
  });

  if (eventLogs.value.length > 10) eventLogs.value.pop();
};
</script>
