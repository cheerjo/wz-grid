<!-- src/components/WZGridHeader.vue -->
<template>
  <thead class="sticky top-0 z-30 bg-gray-100 shadow-sm">

    <!-- 헤더 행 -->
    <tr>
      <!-- 행 드래그 핸들 헤더 -->
      <th
        v-if="effUseRowDrag"
        class="sticky left-0 z-40 border-b border-r border-gray-300 bg-gray-100 h-[40px]"
        :style="{ width: rowDragWidth + 'px', minWidth: rowDragWidth + 'px' }"
      ></th>

      <!-- 디테일 확장 헤더 -->
      <th
        v-if="effUseDetail"
        class="sticky z-40 border-b border-r border-gray-300 bg-gray-100 h-[40px]"
        :style="{ width: detailExpandWidth + 'px', minWidth: detailExpandWidth + 'px', left: (effUseRowDrag ? rowDragWidth : 0) + 'px' }"
      ></th>

      <th
        v-if="useCheckbox"
        class="sticky z-40 border-b border-r border-gray-300 bg-gray-100 h-[40px]"
        :style="{ width: checkboxWidth + 'px', minWidth: checkboxWidth + 'px', left: (effUseRowDrag ? rowDragWidth : 0) + (effUseDetail ? detailExpandWidth : 0) + 'px' }"
      >
        <div class="flex items-center justify-center w-full h-full">
          <input
            ref="headerCheckboxEl"
            type="checkbox"
            :checked="isAllChecked"
            @change="$emit('toggle-all')"
            class="w-4 h-4 rounded border-gray-400 cursor-pointer accent-blue-500"
          />
        </div>
      </th>

      <th
        v-for="(col, colIdx) in visibleColumns"
        :key="col.key"
        :style="getColumnStyle(col, colIdx)"
        class="border-b border-r border-gray-300 px-2 py-2 text-xs font-bold text-gray-600 uppercase tracking-wider h-[40px] relative group transition-colors"
        :class="{
          'sticky left-0 z-40 bg-gray-100': col.pinned,
          'bg-blue-100 border-l-2 border-l-blue-500': dragOverColIdx === colIdx && !col.pinned,
          'opacity-40': dragSourceColIdx === colIdx,
          'cursor-pointer hover:bg-gray-200': !col.pinned,
          'cursor-default': col.pinned,
        }"
        :draggable="!col.pinned"
        @dragstart="!col.pinned && $emit('col-drag-start', colIdx, $event)"
        @dragover.prevent="!col.pinned && $emit('col-drag-over', colIdx)"
        @dragleave="$emit('col-drag-leave')"
        @drop.prevent="!col.pinned && $emit('col-drop', colIdx)"
        @dragend="$emit('col-drag-end')"
        @click="$emit('header-click', col.key, $event)"
      >
        <div class="flex items-center w-full" :class="getAlignClass(col.headerAlign || 'center')">
          <!-- 드래그 핸들 (pinned 아닌 컬럼) -->
          <svg v-if="!col.pinned" class="w-3 h-3 mr-1 text-gray-400 flex-shrink-0 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm8-16a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z"/>
          </svg>
          <span class="truncate">{{ col.title }}</span>
          <span v-if="col.required" class="ml-1 text-red-500">*</span>
          <!-- 다중 정렬 표시 -->
          <span v-if="getSortEntry(col.key)" class="ml-1 text-[10px] text-blue-600 flex items-center gap-0.5 flex-shrink-0">
            {{ getSortEntry(col.key)?.order === 'asc' ? '▲' : '▼' }}<sup v-if="sortConfigs.length > 1" class="text-[8px] leading-none">{{ getSortIndex(col.key) + 1 }}</sup>
          </span>
          <!-- 활성 필터 표시 -->
          <span v-if="useFilter && isFilterActive(col.key)" class="ml-1 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 inline-block" title="필터 적용 중"></span>
        </div>
        <div class="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 z-10" @mousedown.stop="$emit('start-resize', $event, colIdx)" @dblclick.stop="$emit('auto-fit-column', colIdx)"></div>
      </th>
    </tr>

    <!-- 필터 행 -->
    <tr v-if="useFilter">
      <th v-if="effUseRowDrag" class="sticky left-0 z-40 border-b border-r border-gray-200 bg-gray-50 p-0" :style="{ width: rowDragWidth + 'px', minWidth: rowDragWidth + 'px' }"></th>
      <th v-if="effUseDetail" class="sticky z-40 border-b border-r border-gray-200 bg-gray-50 p-0" :style="{ width: detailExpandWidth + 'px', minWidth: detailExpandWidth + 'px', left: (effUseRowDrag ? rowDragWidth : 0) + 'px' }"></th>
      <th
        v-if="useCheckbox"
        class="sticky z-40 border-b border-r border-gray-200 bg-gray-50 p-0"
        :style="{ width: checkboxWidth + 'px', minWidth: checkboxWidth + 'px', left: (effUseRowDrag ? rowDragWidth : 0) + (effUseDetail ? detailExpandWidth : 0) + 'px' }"
      ></th>
      <th
        v-for="(col, colIdx) in visibleColumns"
        :key="'f-' + col.key"
        :style="getColumnStyle(col, colIdx)"
        class="border-b border-r border-gray-200 bg-gray-50 p-1 relative"
        :class="{ 'sticky left-0 z-40': col.pinned }"
        @mousedown.stop
        @click.stop
      >
        <!-- ── Pro 고급 필터 모드 ── -->
        <template v-if="effUseAdvancedFilter">
          <!-- text / link / radio / 기타 -->
          <input
            v-if="!col.type || col.type === 'text' || col.type === 'link' || col.type === 'radio'"
            v-model="filters[col.key].value"
            type="text"
            placeholder="검색..."
            class="filter-input"
          />

          <!-- number / rating: min ~ max -->
          <div v-else-if="col.type === 'number' || col.type === 'rating'" class="flex items-center gap-0.5">
            <input v-model="filters[col.key].min" type="number" placeholder="최소" class="filter-input" />
            <span class="text-[9px] text-gray-400 flex-shrink-0">~</span>
            <input v-model="filters[col.key].max" type="number" placeholder="최대" class="filter-input" />
          </div>

          <!-- date: from / to -->
          <div v-else-if="col.type === 'date'" class="flex flex-col gap-0.5">
            <input v-model="filters[col.key].from" type="date" class="filter-input" style="font-size:10px;" />
            <input v-model="filters[col.key].to"   type="date" class="filter-input" style="font-size:10px;" />
          </div>

          <!-- datetime: from / to (datetime-local) -->
          <div v-else-if="col.type === 'datetime'" class="flex flex-col gap-0.5">
            <input v-model="filters[col.key].from" type="datetime-local" class="filter-input" style="font-size:10px;" />
            <input v-model="filters[col.key].to"   type="datetime-local" class="filter-input" style="font-size:10px;" />
          </div>

          <!-- select / badge: 다중 선택 드롭다운 -->
          <div v-else-if="col.type === 'select' || col.type === 'badge'" class="relative">
            <button
              @click.stop="$emit('toggle-multi-select-filter-open', col.key)"
              class="filter-input text-left flex items-center justify-between cursor-pointer"
            >
              <span class="truncate text-[10px]">{{ filters[col.key].values && filters[col.key].values.length ? filters[col.key].values.length + '개 선택' : '전체' }}</span>
              <svg class="w-2.5 h-2.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div
              v-if="multiSelectFilterOpen === col.key"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-full max-h-48 flex flex-col"
              @click.stop
            >
              <div class="flex items-center justify-between px-2 py-1 border-b border-gray-100">
                <button @click.stop="$emit('select-all-filter-options', col)" class="text-[9px] text-blue-500 hover:text-blue-700">전체 선택</button>
                <button @click.stop="$emit('deselect-all-filter-options', col.key)" class="text-[9px] text-gray-400 hover:text-red-500">전체 해제</button>
              </div>
              <div class="overflow-auto flex-1">
                <label
                  v-for="opt in col.options"
                  :key="opt.value"
                  class="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-50 cursor-pointer text-[10px] text-gray-700 whitespace-nowrap"
                >
                  <input
                    type="checkbox"
                    :checked="filters[col.key].values && filters[col.key].values.includes(opt.value)"
                    @change="$emit('toggle-multi-select-filter', col.key, opt.value)"
                    class="w-3 h-3 rounded border-gray-300 text-blue-600"
                  />
                  {{ opt.label }}
                </label>
              </div>
            </div>
          </div>

          <!-- boolean -->
          <select v-else-if="col.type === 'boolean'" v-model="filters[col.key].value" class="filter-input">
            <option value="">전체</option>
            <option value="true">예</option>
            <option value="false">아니요</option>
          </select>

          <!-- 나머지 타입(image, button, progress): 빈 칸 -->
          <template v-else></template>
        </template>

        <!-- ── Community 기본 텍스트 필터 ── -->
        <template v-else>
          <!-- number / rating: min ~ max -->
          <div v-if="col.type === 'number' || col.type === 'rating'" class="flex items-center gap-0.5">
            <input v-model="filters[col.key].min" type="number" placeholder="최소" class="filter-input" />
            <span class="text-[9px] text-gray-400 flex-shrink-0">~</span>
            <input v-model="filters[col.key].max" type="number" placeholder="최대" class="filter-input" />
          </div>

          <!-- date: from / to -->
          <div v-else-if="col.type === 'date'" class="flex flex-col gap-0.5">
            <input v-model="filters[col.key].from" type="date" class="filter-input" style="font-size:10px;" />
            <input v-model="filters[col.key].to"   type="date" class="filter-input" style="font-size:10px;" />
          </div>

          <!-- datetime: from / to (datetime-local) -->
          <div v-else-if="col.type === 'datetime'" class="flex flex-col gap-0.5">
            <input v-model="filters[col.key].from" type="datetime-local" class="filter-input" style="font-size:10px;" />
            <input v-model="filters[col.key].to"   type="datetime-local" class="filter-input" style="font-size:10px;" />
          </div>

          <!-- select / badge: 단순 텍스트 검색 (value 기반) -->
          <input
            v-else-if="col.type === 'select' || col.type === 'badge'"
            v-model="filters[col.key].value"
            type="text"
            placeholder="검색..."
            class="filter-input"
          />

          <!-- boolean -->
          <select v-else-if="col.type === 'boolean'" v-model="filters[col.key].value" class="filter-input">
            <option value="">전체</option>
            <option value="true">예</option>
            <option value="false">아니요</option>
          </select>

          <!-- text / link / radio / 기타 (편집 불가 타입 및 별도 처리 타입 제외) -->
          <input
            v-else-if="col.type !== 'image' && col.type !== 'button' && col.type !== 'progress' && col.type !== 'rating' && col.type !== 'datetime'"
            v-model="filters[col.key].value"
            type="text"
            placeholder="검색..."
            class="filter-input"
          />
          <template v-else></template>
        </template>

        <!-- 개별 필터 초기화 -->
        <button
          v-if="isFilterActive(col.key)"
          @click.stop="$emit('clear-filter', col.key)"
          class="absolute right-0.5 top-0.5 w-3.5 h-3.5 flex items-center justify-center text-[9px] text-gray-400 hover:text-red-500 bg-white rounded-full border border-gray-200 hover:border-red-300 transition-colors z-10"
          title="필터 초기화"
        >&#10005;</button>
      </th>
    </tr>

  </thead>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watchEffect } from 'vue-demi';
import type { Column, SortConfig } from '../types/grid';

export default defineComponent({
  name: 'WZGridHeader',
  props: {
    visibleColumns:        { type: Array as PropType<Column[]>, required: true },
    useCheckbox:           { type: Boolean, required: true },
    effUseRowDrag:         { type: Boolean, required: true },
    effUseDetail:          { type: Boolean, required: true },
    effUseAdvancedFilter:  { type: Boolean, required: true },
    useFilter:             { type: Boolean, required: true },
    isAllChecked:          { type: Boolean, required: true },
    isIndeterminate:       { type: Boolean, default: false },
    sortConfigs:           { type: Array as PropType<SortConfig[]>, required: true },
    getSortEntry:          { type: Function as PropType<(key: string) => SortConfig | undefined>, required: true },
    getSortIndex:          { type: Function as PropType<(key: string) => number>, required: true },
    isFilterActive:        { type: Function as PropType<(key: string) => boolean>, required: true },
    filters:               { type: Object as PropType<Record<string, any>>, required: true },
    multiSelectFilterOpen: { type: String, required: true },
    dragSourceColIdx:      { type: Number, required: true },
    dragOverColIdx:        { type: Number, required: true },
    getColumnStyle:        { type: Function as PropType<(col: Column, colIdx: number) => Record<string, any>>, required: true },
    getAlignClass:         { type: Function as PropType<(align?: string) => Record<string, boolean>>, required: true },
    checkboxWidth:         { type: Number, required: true },
    rowDragWidth:          { type: Number, required: true },
    detailExpandWidth:     { type: Number, required: true },
  },
  setup(props) {
    const headerCheckboxEl = ref<HTMLInputElement | null>(null);
    watchEffect(() => {
      if (headerCheckboxEl.value) {
        headerCheckboxEl.value.indeterminate = props.isIndeterminate;
      }
    });
    return { headerCheckboxEl };
  },
  emits: [
    'toggle-all',
    'col-drag-start',
    'col-drag-over',
    'col-drag-leave',
    'col-drop',
    'col-drag-end',
    'header-click',
    'start-resize',
    'auto-fit-column',
    'clear-filter',
    'toggle-multi-select-filter-open',
    'select-all-filter-options',
    'deselect-all-filter-options',
    'toggle-multi-select-filter',
  ],
});
</script>

<style scoped>
.sticky { position: sticky !important; }
.z-40 { z-index: 40; }

.filter-input {
  width: 100%;
  font-size: 11px;
  padding: 2px 16px 2px 4px;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  outline: none;
  background: white;
  color: #374151;
  min-width: 0;
}
.filter-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6; }
.filter-input::placeholder { color: #9ca3af; }
</style>
