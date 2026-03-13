<!-- src/components/WZGrid.vue -->
<template>
  <div class="wz-grid-wrapper flex flex-col" :style="{ height: height + 'px' }">

    <!-- ── 툴바 ─────────────────────────────────────────────────────────── -->
    <div
      v-if="showAdd || showDelete || hasToolbarSlot"
      class="wz-grid-toolbar flex items-center justify-end gap-2 px-3 py-2 bg-gray-50 border border-gray-300 border-b-0 rounded-t"
    >
      <!-- 커스텀 슬롯 (개발자가 자유롭게 추가) -->
      <slot name="toolbar" />

      <!-- 구분선 (슬롯과 기본 버튼이 함께 있을 때) -->
      <div v-if="hasToolbarSlot && (showAdd || showDelete)" class="w-px h-5 bg-gray-300 mx-1" />

      <!-- 기본 삭제 버튼 -->
      <button
        v-if="showDelete"
        @click="handleDelete"
        :disabled="checkedCount === 0"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-all
               bg-white border-red-300 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500
               disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-red-600 disabled:hover:border-red-300"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        삭제<span v-if="checkedCount > 0" class="opacity-80">({{ checkedCount }})</span>
      </button>

      <!-- 기본 추가 버튼 -->
      <button
        v-if="showAdd"
        @click="$emit('click:add')"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-all
               bg-white border-blue-300 text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        추가
      </button>
    </div>

    <div
      :class="(showAdd || showDelete || hasToolbarSlot) ? 'rounded-b border-t-0' : 'rounded'"
      class="wz-grid-container relative border border-gray-300 overflow-auto bg-white select-none focus:ring-2 focus:ring-blue-400 outline-none flex-grow"
      @scroll="onScroll"
      @copy="onCopy"
      @paste="onPaste"
      @keydown="handleKeyDown"
      tabindex="0"
    >
      <div :style="{ paddingTop: topPadding + 'px', paddingBottom: bottomPadding + 'px', minWidth: 'max-content' }">
        <table class="table-fixed border-separate border-spacing-0">
          <thead class="sticky top-0 z-30 bg-gray-100 shadow-sm">
            <tr>
              <!-- 체크박스 헤더 -->
              <th
                v-if="useCheckbox"
                class="sticky left-0 z-40 border-b border-r border-gray-300 bg-gray-100 h-[40px]"
                :style="{ width: CHECKBOX_WIDTH + 'px', minWidth: CHECKBOX_WIDTH + 'px' }"
              >
                <div class="flex items-center justify-center w-full h-full">
                  <input
                    ref="headerCheckboxEl"
                    type="checkbox"
                    :checked="isAllChecked"
                    @change="toggleAll"
                    class="w-4 h-4 rounded border-gray-400 text-blue-600 cursor-pointer accent-blue-500"
                  />
                </div>
              </th>

              <th
                v-for="(col, colIdx) in columns"
                :key="col.key"
                :style="getColumnStyle(col, colIdx, true)"
                class="border-b border-r border-gray-300 px-2 py-2 text-xs font-bold text-gray-600 uppercase tracking-wider h-[40px] relative group cursor-pointer hover:bg-gray-200 transition-colors"
                :class="{ 'sticky left-0 z-40 bg-gray-100': col.pinned }"
                @click="toggleSort(col.key)"
              >
                <div class="flex items-center w-full" :class="getAlignClass(col.headerAlign || 'center')">
                  <span class="truncate">{{ col.title }}</span>
                  <span v-if="col.required" class="ml-1 text-red-500">*</span>
                  <span v-if="sortConfig.key === col.key" class="ml-1 text-[10px]">
                    {{ sortConfig.order === 'asc' ? '▲' : '▼' }}
                  </span>
                </div>
                <div class="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 z-10" @mousedown.stop="startResize($event, colIdx)"></div>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="rowIdx in visibleRowsRange" :key="getRow(rowIdx)?.id || rowIdx" :style="{ height: rowHeight + 'px' }">
              <!-- 체크박스 셀 -->
              <td
                v-if="useCheckbox"
                class="sticky left-0 z-10 border-b border-r border-gray-200 p-0 transition-colors"
                :class="isRowChecked(getRow(rowIdx)?.id) ? 'bg-blue-50' : 'bg-white'"
                :style="{ width: CHECKBOX_WIDTH + 'px', minWidth: CHECKBOX_WIDTH + 'px' }"
                @mousedown.stop
              >
                <div class="flex items-center justify-center w-full h-full">
                  <input
                    type="checkbox"
                    :checked="isRowChecked(getRow(rowIdx)?.id)"
                    @change="toggleRow(getRow(rowIdx)?.id)"
                    class="w-4 h-4 rounded border-gray-400 text-blue-600 cursor-pointer accent-blue-500"
                  />
                </div>
              </td>

              <td
                v-for="(col, colIdx) in columns"
                :key="col.key"
                :style="getColumnStyle(col, colIdx)"
                class="border-b border-r border-gray-200 p-0 relative group"
                :class="{
                  'bg-blue-50/50': isSelected(rowIdx, colIdx),
                  'sticky left-0 z-10 bg-white group-hover:bg-gray-50': col.pinned,
                  'bg-blue-50/80': col.pinned && isSelected(rowIdx, colIdx),
                  'ring-1 ring-inset ring-red-500 bg-red-50': hasError(rowIdx, col.key)
                }"
                @mousedown="startSelection(rowIdx, colIdx)"
                @mouseenter="updateSelection(rowIdx, colIdx)"
                @mouseup="endSelection"
                @dblclick="startEditing(rowIdx, colIdx)"
              >
                <!-- 에러 툴팁 -->
                <div v-if="hasError(rowIdx, col.key)" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-red-600 text-white text-[10px] rounded shadow-lg z-50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {{ getError(rowIdx, col.key) }}
                  <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-red-600"></div>
                </div>

                <!-- 데이터 툴팁 (에러가 없고 tooltip: true인 컬럼) -->
                <div
                  v-else-if="col.tooltip && getTooltipValue(rowIdx, col)"
                  class="absolute bottom-full left-0 mb-2 px-2.5 py-1.5 bg-gray-800 text-white text-xs leading-snug rounded shadow-xl z-50 max-w-[280px] break-words whitespace-normal opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
                >
                  {{ getTooltipValue(rowIdx, col) }}
                  <div class="absolute top-full left-4 border-4 border-transparent border-t-gray-800"></div>
                </div>

                <!-- 1. 편집 모드 -->
                <div v-if="isEditing(rowIdx, colIdx)" class="absolute inset-0 z-30 bg-white">
                  <!-- 날짜: type="date" 로 브라우저 달력 UI 사용 -->
                  <input
                    v-if="col.type === 'date'"
                    ref="editInput" v-model="editValue" type="date"
                    class="w-full h-full px-2 text-sm border-2 border-blue-500 outline-none shadow-inner"
                    @blur="stopEditing(true)" @keydown.enter="stopEditing(true)" @keydown.esc="stopEditing(false)" @mousedown.stop
                    @change="stopEditing(true)"
                  />
                  <input
                    v-else-if="col.type !== 'select' && col.type !== 'boolean'"
                    ref="editInput" v-model="editValue" :type="col.type === 'number' ? 'number' : 'text'"
                    class="w-full h-full px-2 text-sm border-2 border-blue-500 outline-none shadow-inner"
                    @blur="stopEditing(true)" @keydown.enter="stopEditing(true)" @keydown.esc="stopEditing(false)" @mousedown.stop
                    @input="handleInput(col)"
                  />
                  <select v-else-if="col.type === 'select'" ref="editInput" v-model="editValue" class="w-full h-full px-1 text-sm border-2 border-blue-500 outline-none" @blur="stopEditing(true)" @change="stopEditing(true)" @mousedown.stop>
                    <option v-for="opt in col.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                </div>

                <!-- 2. 읽기 모드 -->
                <div v-else class="px-2 py-1 text-sm w-full h-full flex items-center overflow-hidden" :class="[getAlignClass(col.align), col.truncate !== false ? 'truncate' : '']">
                  <!-- 텍스트/숫자/날짜 -->
                  <template v-if="!col.type || col.type === 'text' || col.type === 'number' || col.type === 'date'">
                    {{ col.type === 'number' ? Number(getRow(rowIdx)?.[col.key] || 0).toLocaleString() : (getRow(rowIdx)?.[col.key] || '') }}
                  </template>

                  <!-- 셀렉트 (읽기 모드에서도 라벨 표시) -->
                  <template v-else-if="col.type === 'select'">
                    {{ getOptionLabel(rowIdx, col) }}
                  </template>

                  <!-- 불리언 -->
                  <template v-else-if="col.type === 'boolean'">
                    <div class="flex items-center justify-center w-full h-full" @mousedown.stop>
                      <input type="checkbox" :checked="!!getRow(rowIdx)?.[col.key]" @change="toggleBoolean(rowIdx, col.key)" class="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer" />
                    </div>
                  </template>

                  <!-- 배지 -->
                  <template v-else-if="col.type === 'badge'">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm" :class="getBadgeColor(rowIdx, col)">{{ getOptionLabel(rowIdx, col) }}</span>
                  </template>

                  <!-- 프로그레스 -->
                  <template v-else-if="col.type === 'progress'">
                    <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200 mx-1">
                      <div class="bg-blue-500 h-full transition-all duration-500" :style="{ width: (getRow(rowIdx)?.[col.key] || 0) + '%' }"></div>
                    </div>
                  </template>

                  <!-- 이미지 -->
                  <template v-else-if="col.type === 'image'">
                    <div class="flex items-center justify-center w-full"><img :src="getRow(rowIdx)?.[col.key]" class="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm" /></div>
                  </template>

                  <!-- 버튼 -->
                  <template v-else-if="col.type === 'button'">
                    <div class="flex items-center justify-center w-full" @mousedown.stop>
                      <button @click="onButtonClick(rowIdx, col.key)" class="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded border border-blue-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95">{{ col.options?.[0]?.label || '액션' }}</button>
                    </div>
                  </template>

                  <!-- 링크 -->
                  <template v-else-if="col.type === 'link'">
                    <div class="flex items-center w-full overflow-hidden" @mousedown.stop>
                      <a :href="getRow(rowIdx)?.[col.key]" target="_blank" class="text-blue-600 hover:underline truncate text-sm flex items-center gap-1">
                        <span class="truncate">{{ getRow(rowIdx)?.[col.key] }}</span>
                        <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    </div>
                  </template>

                  <!-- 라디오 버튼 -->
                  <template v-else-if="col.type === 'radio'">
                    <div class="flex items-center gap-3 overflow-hidden px-1" @mousedown.stop>
                      <label v-for="opt in col.options" :key="opt.value" class="flex items-center gap-1 cursor-pointer whitespace-nowrap text-xs text-gray-600 hover:text-blue-600 transition-colors">
                        <input
                          type="radio"
                          :name="`radio-${getRow(rowIdx)?.id}-${col.key}`"
                          :value="opt.value"
                          :checked="getRow(rowIdx)?.[col.key] === opt.value"
                          @change="updateCell(rowIdx, col.key, opt.value)"
                          class="w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        {{ opt.label }}
                      </label>
                    </div>
                  </template>
                </div>
                <div v-if="isSelected(rowIdx, colIdx)" class="absolute inset-0 pointer-events-none border-2 border-blue-500 z-10"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Paging UI -->
    <div v-if="usePaging" class="wz-grid-paging border-t border-gray-300 bg-gray-50 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
      <div class="flex items-center gap-4">
        <span>Total: <strong>{{ rows.length.toLocaleString() }}</strong></span>
        <!-- 체크박스 선택 건수 -->
        <span v-if="useCheckbox && checkedCount > 0" class="text-blue-600 font-semibold">
          {{ checkedCount.toLocaleString() }}건 선택됨
        </span>
        <div class="flex items-center gap-1">
          <span>Page Size:</span>
          <select
            :value="pageSize"
            @change="onPageSizeChange"
            class="bg-white border border-gray-300 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option v-for="size in [10, 20, 50, 100]" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="setPage(1)"
          :disabled="currentPage === 1"
          class="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
        >
          &laquo;
        </button>
        <button
          @click="setPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
        >
          &lsaquo;
        </button>
        <div class="flex items-center gap-1 px-2">
          <input
            type="number"
            :value="currentPage"
            @change="onPageInput"
            class="w-12 text-center bg-white border border-gray-300 rounded py-0.5 outline-none focus:ring-1 focus:ring-blue-400"
          />
          <span>/ {{ totalPages }}</span>
        </div>
        <button
          @click="setPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
        >
          &rsaquo;
        </button>
        <button
          @click="setPage(totalPages)"
          :disabled="currentPage === totalPages"
          class="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
        >
          &raquo;
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref, reactive, nextTick, watch, watchEffect } from 'vue-demi';
import { Column } from '../types/grid';
import { useSelection } from '../composables/useSelection';
import { useClipboard } from '../composables/useClipboard';
import { useVirtualScroll } from '../composables/useVirtualScroll';

const CHECKBOX_WIDTH = 40;

export default defineComponent({
  name: 'WZGrid',
  props: {
    columns:      { type: Array as PropType<Column[]>, required: true },
    rows:         { type: Array as PropType<any[]>, required: true },
    height:       { type: Number, default: 500 },
    rowHeight:    { type: Number, default: 40 },
    usePaging:    { type: Boolean, default: false },
    pageSize:     { type: Number, default: 20 },
    currentPage:  { type: Number, default: 1 },
    useCheckbox:  { type: Boolean, default: false },
    showAdd:      { type: Boolean, default: false },
    showDelete:   { type: Boolean, default: false },
  },
  setup(props, { emit, slots }) {
    const hasToolbarSlot = computed(() => !!slots.toolbar);
    const { selection, startSelection, updateSelection, endSelection, isSelected, clearSelection, moveSelection } = useSelection();

    // --- 1. Paging Logic ---
    const totalPages = computed(() => Math.ceil(props.rows.length / props.pageSize) || 1);

    watch(() => props.rows.length, () => {
      if (props.currentPage > totalPages.value) setPage(totalPages.value);
    });

    const setPage = (page: number) => {
      const target = Math.max(1, Math.min(page, totalPages.value));
      emit('update:currentPage', target);
    };

    const onPageSizeChange = (e: Event) => {
      const size = parseInt((e.target as HTMLSelectElement).value);
      emit('update:pageSize', size);
      emit('update:currentPage', 1);
    };

    const onPageInput = (e: Event) => {
      setPage(parseInt((e.target as HTMLInputElement).value));
    };

    const pagedRows = computed(() => {
      if (!props.usePaging) return props.rows;
      const start = (props.currentPage - 1) * props.pageSize;
      return props.rows.slice(start, start + props.pageSize);
    });

    // --- 2. Virtual Scroll ---
    const { visibleRange, topPadding, bottomPadding, onScroll } = useVirtualScroll(
      computed(() => pagedRows.value.length),
      props.rowHeight,
      props.height
    );

    const visibleRowsRange = computed(() => {
      const range = [];
      for (let i = visibleRange.value.startIdx; i < visibleRange.value.endIdx; i++) {
        if (i < pagedRows.value.length) range.push(i);
      }
      return range;
    });

    const getRow = (idx: number) => pagedRows.value[idx];

    // --- 3. Checkbox ---
    // checkedIds: 체크된 row.id 집합. Set 변경 감지를 위해 ref + 새 Set 재할당 방식 사용
    const checkedIds = ref<Set<any>>(new Set());

    const isAllChecked = computed(
      () => props.rows.length > 0 && props.rows.every(r => checkedIds.value.has(r.id))
    );
    const isIndeterminate = computed(
      () => !isAllChecked.value && props.rows.some(r => checkedIds.value.has(r.id))
    );
    const checkedCount = computed(() => checkedIds.value.size);

    const isRowChecked = (id: any) => checkedIds.value.has(id);

    const emitChecked = () => {
      emit('update:checked', props.rows.filter(r => checkedIds.value.has(r.id)));
    };

    const toggleAll = () => {
      checkedIds.value = isAllChecked.value
        ? new Set()
        : new Set(props.rows.map(r => r.id));
      emitChecked();
    };

    const toggleRow = (id: any) => {
      const next = new Set(checkedIds.value);
      next.has(id) ? next.delete(id) : next.add(id);
      checkedIds.value = next;
      emitChecked();
    };

    // rows 교체 시(예: resetData) 체크 상태 초기화
    watch(() => props.rows, () => { checkedIds.value = new Set(); }, { deep: false });

    // 헤더 체크박스 indeterminate 상태 — DOM 속성이라 watchEffect로 직접 설정
    const headerCheckboxEl = ref<HTMLInputElement | null>(null);
    watchEffect(() => {
      if (headerCheckboxEl.value) {
        headerCheckboxEl.value.indeterminate = isIndeterminate.value;
      }
    });

    // --- 4. Error & Validation ---
    const errors = reactive<Record<string, string>>({});
    const hasError = (rowIdx: number, colKey: string) => {
      const row = getRow(rowIdx);
      return row ? !!errors[`${row.id}:${colKey}`] : false;
    };
    const getError = (rowIdx: number, colKey: string) => {
      const row = getRow(rowIdx);
      return row ? errors[`${row.id}:${colKey}`] : '';
    };

    const validateCell = (row: any, col: Column, value: any) => {
      const errorKey = `${row.id}:${col.key}`;
      if (col.required && (value === null || value === undefined || value === '')) {
        errors[errorKey] = `${col.title}은(는) 필수 입력 항목입니다.`;
        return false;
      }
      if (col.validator) {
        const customError = col.validator(value, row);
        if (customError) { errors[errorKey] = customError; return false; }
      }
      delete errors[errorKey];
      return true;
    };

    watch(() => props.rows, () => {
      props.rows.forEach(row => props.columns.forEach(col => validateCell(row, col, row[col.key])));
    }, { immediate: true });

    // --- 5. Styling & Resizing ---
    // pinned 컬럼의 left 오프셋: 체크박스 컬럼 너비만큼 추가 확보
    const getColumnStyle = (col: Column, colIdx: number, isHeader = false) => {
      const style: Record<string, any> = { width: (col.width || 150) + 'px' };
      if (col.pinned) {
        let leftOffset = props.useCheckbox ? CHECKBOX_WIDTH : 0;
        for (let i = 0; i < colIdx; i++) {
          if (props.columns[i].pinned) leftOffset += (props.columns[i].width || 150);
        }
        style.left = leftOffset + 'px';
      }
      return style;
    };

    const getAlignClass = (align?: string) => ({
      'justify-start': !align || align === 'left',
      'justify-center': align === 'center',
      'justify-end': align === 'right',
    });

    const startResize = (e: MouseEvent, colIdx: number) => {
      const startX = e.pageX; const startWidth = props.columns[colIdx].width || 150;
      const onMouseMove = (ev: MouseEvent) => { emit('resize:column', { colIdx, width: Math.max(50, startWidth + (ev.pageX - startX)) }); };
      const onMouseUp = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
      document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp);
    };

    // --- 6. Sort & Keyboard ---
    const sortConfig = reactive({ key: '', order: 'asc' as 'asc' | 'desc' });
    const toggleSort = (key: string) => {
      if (sortConfig.key === key) sortConfig.order = sortConfig.order === 'asc' ? 'desc' : 'asc';
      else { sortConfig.key = key; sortConfig.order = 'asc'; }
      emit('sort', { ...sortConfig });
    };

    const handleInput = (col: Column) => {
      if (col.onInput) editValue.value = col.onInput(editValue.value);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (editing.rowId !== null) return;
      const dirs: any = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
      if (dirs[e.key]) {
        e.preventDefault();
        moveSelection(dirs[e.key], e.shiftKey, pagedRows.value.length, props.columns.length);
      }
      else if (e.key === 'Enter') { e.preventDefault(); startEditing(selection.startRow, selection.startCol); }
      else if (e.key === 'Escape') clearSelection();
      else if (e.key === 'Backspace' || e.key === 'Delete') {
        const row = getRow(selection.startRow);
        if (row) updateCell(selection.startRow, props.columns[selection.startCol].key, '');
      }
      else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const rowIdx = selection.startRow; const colIdx = selection.startCol;
        if (rowIdx !== -1) { e.preventDefault(); startEditing(rowIdx, colIdx, e.key); }
      }
    };

    // --- 7. Editing State ---
    const editing = reactive({ rowId: null as any, colIdx: -1 });
    const editValue = ref<any>('');
    const editInput = ref<any>(null);
    const isEditing = (rIdx: number, cIdx: number) => {
      const row = getRow(rIdx);
      return row && editing.rowId === row.id && editing.colIdx === cIdx;
    };

    const startEditing = async (rIdx: number, cIdx: number, initialValue?: string) => {
      const row = getRow(rIdx); const col = props.columns[cIdx];
      if (!row || ['boolean', 'progress', 'badge', 'image', 'button', 'link', 'radio'].includes(col.type || '')) return;
      editing.rowId = row.id; editing.colIdx = cIdx;
      const useInitial = initialValue !== undefined && col.type !== 'date';
      editValue.value = useInitial ? initialValue : row[col.key];
      clearSelection(); await nextTick();
      const el = Array.isArray(editInput.value) ? editInput.value[0] : editInput.value; el?.focus();
      if (initialValue !== undefined) handleInput(col);
    };

    const stopEditing = (save: boolean) => {
      if (save && editing.rowId !== null) {
        const fullRowIdx = props.rows.findIndex(r => r.id === editing.rowId);
        if (fullRowIdx !== -1) {
          const col = props.columns[editing.colIdx];
          validateCell(props.rows[fullRowIdx], col, editValue.value);
          updateCell(fullRowIdx, col.key, editValue.value);
        }
      }
      editing.rowId = null; editing.colIdx = -1;
    };

    const toggleBoolean = (pagedIdx: number, key: string) => {
      const row = getRow(pagedIdx);
      if (row) { const fullIdx = props.rows.findIndex(r => r.id === row.id); updateCell(fullIdx, key, !row[key]); }
    };

    const updateCell = (fullIdx: number, key: string, val: any) => {
      const row = props.rows[fullIdx];
      if (row) emit('update:cell', { rowIdx: fullIdx, row, colKey: key, value: val });
    };

    const onButtonClick = (pagedIdx: number, key: string) => {
      const row = getRow(pagedIdx);
      if (row) { const fullIdx = props.rows.findIndex(r => r.id === row.id); emit('click:button', { rowIdx: fullIdx, row, colKey: key }); }
    };

    const getOptionLabel = (idx: number, col: Column) => {
      const r = getRow(idx); const v = r?.[col.key];
      return col.options?.find(o => o.value === v)?.label || v || '';
    };

    const getBadgeColor = (idx: number, col: Column) => {
      const r = getRow(idx); const v = r?.[col.key];
      const opt = col.options?.find(o => o.value === v);
      return opt?.color || 'bg-blue-100 text-blue-600';
    };

    const getTooltipValue = (rowIdx: number, col: Column): string => {
      const row = getRow(rowIdx);
      if (!row) return '';
      const val = row[col.key];
      if (col.type === 'select' || col.type === 'badge') return col.options?.find(o => o.value === val)?.label || String(val ?? '');
      if (col.type === 'number') return Number(val || 0).toLocaleString();
      return String(val ?? '');
    };

    const handleDelete = () => {
      const checked = props.rows.filter(r => checkedIds.value.has(r.id));
      emit('click:delete', checked);
    };

    const { onCopy, onPaste } = useClipboard(selection, props.columns, pagedRows, updateCell);

    return {
      CHECKBOX_WIDTH,
      topPadding, bottomPadding, onScroll, visibleRowsRange,
      isSelected, startSelection, updateSelection, endSelection,
      onCopy, onPaste,
      isEditing, startEditing, stopEditing, editValue, editInput,
      toggleBoolean, getOptionLabel, getBadgeColor, getTooltipValue, getRow,
      startResize, toggleSort, sortConfig, handleKeyDown, getColumnStyle, getAlignClass,
      onButtonClick, hasError, getError, handleInput,
      totalPages, setPage, onPageSizeChange, onPageInput, updateCell,
      // checkbox
      headerCheckboxEl, isAllChecked, isIndeterminate, checkedCount,
      isRowChecked, toggleAll, toggleRow,
      // toolbar
      hasToolbarSlot, handleDelete,
    };
  }
});
</script>

<style scoped>
.wz-grid-wrapper { overflow: hidden; }
.wz-grid-container:focus { outline: none; }
.sticky { position: sticky !important; }
.z-40 { z-index: 40; }
.z-30 { z-index: 30; }
.z-10 { z-index: 10; }
</style>
