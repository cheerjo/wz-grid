<!-- src/components/WZGridRow.vue -->
<!--
  단일 데이터 행을 렌더링하는 컴포넌트.
  cell-* 슬롯과 detail 슬롯은 부모(WZGrid)의 $slots를 parentSlots prop으로 받아
  renderSlot 유틸로 렌더링합니다. (Vue 2/3 호환 슬롯 포워딩)
-->
<template>
  <tr
    role="row"
    :aria-rowindex="itemIdx + 1"
    :aria-selected="useCheckbox && row ? isRowChecked(row.id) : undefined"
    :style="{ height: rowHeight + 'px' }"
    :class="[{
      'opacity-40': effUseRowDrag && rowDragSrcIdx === itemIdx,
      'row-drag-over-top':    effUseRowDrag && rowDragOverIdx === itemIdx && rowDragOverPos === 'above',
      'row-drag-over-bottom': effUseRowDrag && rowDragOverIdx === itemIdx && rowDragOverPos === 'below',
    }, rowClass ? rowClass(row, itemIdx) : null]"
    @click="$emit('row-click', itemIdx)"
    @dragover="effUseRowDrag && $emit('row-drag-over', $event, itemIdx)"
    @drop="effUseRowDrag && $emit('row-drop', $event, itemIdx)"
    @dragend="effUseRowDrag && $emit('row-drag-end')"
  >
    <!-- 행 드래그 핸들 셀 -->
    <td
      v-if="effUseRowDrag"
      class="sticky left-0 z-10 border-b border-r border-gray-200 p-0 bg-white cursor-grab active:cursor-grabbing"
      :style="{ width: rowDragWidth + 'px', minWidth: rowDragWidth + 'px' }"
      draggable="true"
      @dragstart="$emit('row-drag-start', itemIdx)"
      @mousedown.stop
    >
      <div class="flex items-center justify-center w-full h-full text-gray-300 hover:text-gray-500 transition-colors">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm8-16a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z"/>
        </svg>
      </div>
    </td>

    <!-- 디테일 확장 버튼 셀 -->
    <td
      v-if="effUseDetail"
      class="sticky z-10 border-b border-r border-gray-200 p-0 bg-white"
      :style="{ left: (effUseRowDrag ? rowDragWidth : 0) + 'px', width: detailExpandWidth + 'px', minWidth: detailExpandWidth + 'px' }"
      @mousedown.stop
      @click.stop="$emit('toggle-detail', row && row.id)"
    >
      <div class="flex items-center justify-center w-full h-full cursor-pointer text-gray-400 hover:text-blue-600 transition-colors">
        <svg
          class="w-3.5 h-3.5 transition-transform duration-150"
          :class="isDetailExpanded(row && row.id) ? 'rotate-90' : ''"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </div>
    </td>

    <!-- 체크박스 셀 -->
    <td
      v-if="useCheckbox"
      class="sticky z-10 border-b border-r border-gray-200 p-0 transition-colors"
      :style="{ left: (effUseRowDrag ? rowDragWidth : 0) + (effUseDetail ? detailExpandWidth : 0) + 'px', width: checkboxWidth + 'px', minWidth: checkboxWidth + 'px' }"
      :class="row && isRowChecked(row.id) ? 'bg-blue-50' : 'bg-white'"
      @mousedown.stop
    >
      <div class="flex items-center justify-center w-full h-full">
        <input
          type="checkbox"
          :checked="row && isRowChecked(row.id)"
          @change="row && $emit('toggle-row', row.id)"
          class="w-4 h-4 rounded border-gray-400 cursor-pointer accent-blue-500"
        />
      </div>
    </td>

    <template v-for="(col, colIdx) in visibleColumns" :key="col.key">
    <td
      v-if="!getMerge(itemIdx, col.key)?.hidden"
      role="gridcell"
      :aria-colindex="colIdx + 1"
      :aria-expanded="useTree && col.key === effectiveTreeKey && getTreeHasChildren(itemIdx) ? isExpanded(row && row.id) : undefined"
      :tabindex="isSelected(itemIdx, colIdx) ? 0 : -1"
      :rowspan="getMerge(itemIdx, col.key)?.rowspan ?? 1"
      :colspan="getMerge(itemIdx, col.key)?.colspan ?? 1"
      :style="getColumnStyle(col, colIdx)"
      class="border-b border-r border-gray-200 p-0 relative group outline-none"
      :class="[{
        'bg-blue-50/50': isSelected(itemIdx, colIdx),
        'sticky left-0 z-10 bg-white group-hover:bg-gray-50': col.pinned,
        'bg-blue-50/80': col.pinned && isSelected(itemIdx, colIdx),
        'ring-1 ring-inset ring-red-500 bg-red-50': hasError(itemIdx, col.key)
      }, cellClass ? cellClass(row, col, itemIdx) : null]"
      @mousedown="$emit('start-selection', itemIdx, colIdx)"
      @mouseenter="$emit('update-selection', itemIdx, colIdx)"
      @mouseup="$emit('end-selection')"
      @dblclick="$emit('start-editing', itemIdx, colIdx)"
      @contextmenu="effUseContextMenu && $emit('open-context-menu', $event, itemIdx, colIdx)"
    >
      <!-- 에러 툴팁 -->
      <div v-if="hasError(itemIdx, col.key)" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-red-600 text-white text-[10px] rounded shadow-lg z-50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {{ getError(itemIdx, col.key) }}
        <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-red-600"></div>
      </div>

      <!-- 데이터 툴팁 -->
      <div
        v-else-if="col.tooltip && getTooltipValue(itemIdx, col)"
        class="absolute bottom-full left-0 mb-2 px-2.5 py-1.5 bg-gray-800 text-white text-xs leading-snug rounded shadow-xl z-50 max-w-[280px] break-words whitespace-normal opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
      >
        {{ getTooltipValue(itemIdx, col) }}
        <div class="absolute top-full left-4 border-4 border-transparent border-t-gray-800"></div>
      </div>

      <!-- 편집 모드 -->
      <div v-if="isEditing(itemIdx, colIdx)" class="absolute inset-0 z-30 bg-white">
        <input
          v-if="col.type === 'date'"
          ref="editInput" :value="editValue" type="date"
          class="w-full h-full px-2 text-sm border-2 border-blue-500 outline-none shadow-inner"
          @blur="$emit('stop-editing', true)" @keydown.enter.exact.stop="$emit('stop-editing', true, true)" @keydown.esc="$emit('stop-editing', false)" @mousedown.stop
          @input="$emit('update:editValue', getEventValue($event))"
          @change="$emit('stop-editing', true)"
        />
        <input
          v-else-if="col.type === 'datetime'"
          ref="editInput" :value="editValue" type="datetime-local"
          class="w-full h-full px-2 text-sm border-2 border-blue-500 outline-none shadow-inner"
          @blur="$emit('stop-editing', true)" @keydown.enter.exact.stop="$emit('stop-editing', true, true)" @keydown.esc="$emit('stop-editing', false)" @mousedown.stop
          @input="$emit('update:editValue', getEventValue($event))"
          @change="$emit('stop-editing', true)"
        />
        <div
          v-else-if="col.type === 'textarea'"
          class="absolute z-50 flex flex-col border-2 border-blue-500 bg-white shadow-xl rounded-sm"
          style="min-width: 100%; min-height: 120px; top: -2px; left: -2px; resize: both; overflow: hidden;"
          @mousedown.stop
        >
          <textarea
            ref="editInput"
            :value="editValue"
            class="flex-1 w-full p-2 text-sm outline-none resize-none bg-transparent"
            @blur="$emit('stop-editing', true)"
            @keydown.esc.stop="$emit('stop-editing', false)"
            @keydown.enter.stop="(e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); $emit('stop-editing', true, true); } }"
            @input="$emit('update:editValue', getEventValue($event))"
          />
          <div class="flex items-center justify-end gap-1.5 p-1.5 bg-gray-50 border-t border-gray-200">
            <button type="button" @mousedown.prevent @click.stop="$emit('stop-editing', false)" class="px-2 py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-200 rounded transition-colors">취소 (ESC)</button>
            <button type="button" @mousedown.prevent @click.stop="$emit('stop-editing', true, true)" class="px-2 py-1 text-[10px] font-medium text-white bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded transition-colors shadow-sm">확인 (Ctrl+Enter)</button>
          </div>
        </div>
        <input
          v-else-if="col.type !== 'select' && col.type !== 'boolean' && col.type !== 'tag' && col.type !== 'color' && col.type !== 'rating' && col.type !== 'sparkline'"
          ref="editInput" :value="editValue"
          :type="col.type === 'number' || col.type === 'currency' ? 'number' : col.type === 'email' ? 'email' : 'text'"
          class="w-full h-full px-2 text-sm border-2 border-blue-500 outline-none shadow-inner"
          @blur="$emit('stop-editing', true)" @keydown.enter.exact.stop="$emit('stop-editing', true, true)" @keydown.esc="$emit('stop-editing', false)" @mousedown.stop
          @input="$emit('update:editValue', getEventValue($event)); $emit('handle-input', col)"
        />
        <select v-else-if="col.type === 'select'" ref="editInput" :value="editValue" class="w-full h-full px-1 text-sm border-2 border-blue-500 outline-none" @blur="$emit('stop-editing', true)" @keydown.enter.exact.stop="$emit('stop-editing', true, true)" @change="$emit('update:editValue', getEventValue($event)); $emit('stop-editing', true)" @mousedown.stop>
          <option v-for="opt in col.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>

      <!-- 읽기 모드 -->
      <div
        v-else
        class="text-sm w-full h-full flex items-center overflow-hidden min-w-0"
        :class="[getAlignClass(col.align), (useTree && col.key === effectiveTreeKey) ? '' : 'px-2 py-1']"
        :style="useTree && col.key === effectiveTreeKey ? { paddingLeft: (getTreeLevel(itemIdx) * 16 + 4) + 'px', paddingTop: '4px', paddingBottom: '4px', paddingRight: '8px' } : {}"
      >
        <!-- 트리 토글 버튼 (트리 컬럼에만 표시) -->
        <template v-if="useTree && col.key === effectiveTreeKey">
          <button
            v-if="getTreeHasChildren(itemIdx)"
            @click.stop="$emit('toggle-node', row && row.id)"
            @mousedown.stop
            @dblclick.stop
            class="w-5 h-5 flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors mr-1"
          >
            <svg
              class="w-3 h-3 transition-transform duration-150"
              :class="isExpanded(row && row.id) ? 'rotate-90' : ''"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <span v-else class="w-5 h-5 flex-shrink-0 mr-1 flex items-center justify-center">
            <svg class="w-1.5 h-1.5 text-gray-300" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="2"/></svg>
          </span>
        </template>

        <!-- 커스텀 셀 슬롯: 부모 $slots를 포워딩 -->
        <component
          v-if="parentSlots && parentSlots['cell-' + col.key]"
          :is="renderParentSlot('cell-' + col.key, { row, column: col, value: row && row[col.key], rowIndex: itemIdx })"
        />

        <!-- 기본 렌더링 (슬롯 미제공 시) -->
        <template v-else-if="col.type === 'textarea'">
          <span class="truncate min-w-0 block w-full whitespace-pre">{{ row?.[col.key] || '' }}</span>
        </template>
        <template v-else-if="!col.type || col.type === 'text' || col.type === 'number' || col.type === 'date'">
          <span :class="col.truncate !== false ? 'truncate min-w-0 block w-full' : 'whitespace-normal break-words'">
            {{ col.type === 'number' ? Number(row?.[col.key] || 0).toLocaleString() : (row?.[col.key] || '') }}
          </span>
        </template>
        <template v-else-if="col.type === 'datetime'">
          <span :class="col.truncate !== false ? 'truncate min-w-0 block w-full' : 'whitespace-normal break-words'">
            {{ formatDatetime(row?.[col.key]) }}
          </span>
        </template>
        <template v-else-if="col.type === 'rating'">
          <div class="flex items-center gap-0.5" @mousedown.stop>
            <span
              v-for="star in (col.maxRating || 5)"
              :key="star"
              class="cursor-pointer leading-none select-none transition-colors"
              :class="star <= (row?.[col.key] || 0) ? 'text-yellow-400' : 'text-gray-300'"
              style="font-size: 16px;"
              @click="$emit('update-cell-from-item', itemIdx, col.key, star)"
            >&#9733;</span>
          </div>
        </template>
        <template v-else-if="col.type === 'select'">
          <span :class="col.truncate !== false ? 'truncate min-w-0 block w-full' : 'whitespace-normal break-words'">{{ getOptionLabel(itemIdx, col) }}</span>
        </template>
        <template v-else-if="col.type === 'boolean'">
          <div class="flex items-center justify-center w-full h-full" @mousedown.stop>
            <input type="checkbox" :checked="!!row?.[col.key]" @change="$emit('toggle-boolean', itemIdx, col.key)" class="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer" />
          </div>
        </template>
        <template v-else-if="col.type === 'badge'">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm" :class="getBadgeColor(itemIdx, col)">{{ getOptionLabel(itemIdx, col) }}</span>
        </template>
        <template v-else-if="col.type === 'progress'">
          <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200 mx-1">
            <div class="bg-blue-500 h-full transition-all duration-500" :style="{ width: (row?.[col.key] || 0) + '%' }"></div>
          </div>
        </template>
        <template v-else-if="col.type === 'image'">
          <div class="flex items-center justify-center w-full"><img :src="row?.[col.key]" class="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm" /></div>
        </template>
        <template v-else-if="col.type === 'button'">
          <div class="flex items-center justify-center w-full" @mousedown.stop>
            <button @click="$emit('button-click', itemIdx, col.key)" class="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded border border-blue-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95">{{ col.options?.[0]?.label || '액션' }}</button>
          </div>
        </template>
        <template v-else-if="col.type === 'link'">
          <div class="flex items-center w-full overflow-hidden" @mousedown.stop>
            <a :href="row?.[col.key]" target="_blank" class="text-blue-600 hover:underline truncate text-sm flex items-center gap-1">
              <span class="truncate">{{ row?.[col.key] }}</span>
              <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          </div>
        </template>
        <template v-else-if="col.type === 'color'">
          <div class="flex items-center gap-2 w-full overflow-hidden" @mousedown.stop>
            <input
              type="color"
              :value="row?.[col.key] || '#000000'"
              @change="(e) => { $emit('update-cell-from-item', itemIdx, col.key, getEventValue(e)) }"
              class="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
              style="min-width:1.5rem"
            />
            <span class="truncate text-xs font-mono text-gray-600">{{ row?.[col.key] }}</span>
          </div>
        </template>
        <template v-else-if="col.type === 'email'">
          <div class="flex items-center w-full overflow-hidden" @mousedown.stop>
            <a :href="row?.[col.key] ? 'mailto:' + row?.[col.key] : undefined" class="text-blue-600 hover:underline truncate text-sm">{{ row?.[col.key] }}</a>
          </div>
        </template>
        <template v-else-if="col.type === 'radio'">
          <div class="flex items-center gap-3 overflow-hidden px-1" @mousedown.stop>
            <label v-for="opt in col.options" :key="opt.value" class="flex items-center gap-1 cursor-pointer whitespace-nowrap text-xs text-gray-600 hover:text-blue-600 transition-colors">
              <input type="radio" :name="`radio-${row?.id}-${col.key}`" :value="opt.value" :checked="row?.[col.key] === opt.value" @change="$emit('update-cell-from-item', itemIdx, col.key, opt.value)" class="w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500" />
              {{ opt.label }}
            </label>
          </div>
        </template>
        <template v-else-if="col.type === 'tag'">
          <div class="flex flex-wrap gap-1 py-0.5 overflow-hidden">
            <span
              v-for="(tag, tagIdx) in (Array.isArray(row?.[col.key]) ? row[col.key] : [])"
              :key="tagIdx"
              class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200 leading-none whitespace-nowrap"
            >{{ tag }}</span>
          </div>
        </template>
        <template v-else-if="col.type === 'currency'">
          <span :class="col.truncate !== false ? 'truncate min-w-0 block w-full' : 'whitespace-normal break-words'">
            {{ formatCurrency(row?.[col.key], col.currencySymbol, col.decimals) }}
          </span>
        </template>
        <template v-else-if="col.type === 'sparkline'">
          <!-- line (기본) -->
          <svg
            v-if="Array.isArray(row?.[col.key]) && row[col.key].length >= 2 && (!col.sparklineType || col.sparklineType === 'line')"
            :viewBox="'0 0 100 ' + (col.sparklineHeight || 32)"
            preserveAspectRatio="none"
            class="w-full"
            :style="{ height: (col.sparklineHeight || 32) + 'px' }"
          >
            <polyline
              :points="getSparklinePoints(row[col.key], col.sparklineHeight || 32)"
              fill="none"
              :stroke="col.sparklineColor || '#3b82f6'"
              stroke-width="2"
              stroke-linejoin="round"
              stroke-linecap="round"
            />
          </svg>
          <!-- area -->
          <svg
            v-else-if="Array.isArray(row?.[col.key]) && row[col.key].length >= 2 && col.sparklineType === 'area'"
            :viewBox="'0 0 100 ' + (col.sparklineHeight || 32)"
            preserveAspectRatio="none"
            class="w-full"
            :style="{ height: (col.sparklineHeight || 32) + 'px' }"
          >
            <!-- 채움 영역 -->
            <polygon
              :points="getSparklineAreaPoints(row[col.key], col.sparklineHeight || 32)"
              :fill="col.sparklineColor || '#3b82f6'"
              fill-opacity="0.18"
              stroke="none"
            />
            <!-- 라인 -->
            <polyline
              :points="getSparklinePoints(row[col.key], col.sparklineHeight || 32)"
              fill="none"
              :stroke="col.sparklineColor || '#3b82f6'"
              stroke-width="2"
              stroke-linejoin="round"
              stroke-linecap="round"
            />
          </svg>
          <!-- bar (수평 막대) -->
          <svg
            v-else-if="Array.isArray(row?.[col.key]) && row[col.key].length >= 1 && col.sparklineType === 'bar'"
            :viewBox="'0 0 100 ' + (col.sparklineHeight || 32)"
            preserveAspectRatio="none"
            class="w-full"
            :style="{ height: (col.sparklineHeight || 32) + 'px' }"
          >
            <rect
              v-for="(r, ri) in getSparklineBarRects(row[col.key], col.sparklineHeight || 32)"
              :key="ri"
              :x="r.x"
              :y="r.y"
              :width="r.w"
              :height="r.h"
              :fill="col.sparklineColor || '#3b82f6'"
              fill-opacity="0.85"
              rx="1"
            />
          </svg>
          <!-- column (수직 막대) -->
          <svg
            v-else-if="Array.isArray(row?.[col.key]) && row[col.key].length >= 1 && col.sparklineType === 'column'"
            :viewBox="'0 0 100 ' + (col.sparklineHeight || 32)"
            preserveAspectRatio="none"
            class="w-full"
            :style="{ height: (col.sparklineHeight || 32) + 'px' }"
          >
            <rect
              v-for="(r, ri) in getSparklineColumnRects(row[col.key], col.sparklineHeight || 32)"
              :key="ri"
              :x="r.x"
              :y="r.y"
              :width="r.w"
              :height="r.h"
              :fill="col.sparklineColor || '#3b82f6'"
              fill-opacity="0.85"
              rx="1"
            />
          </svg>
          <span v-else class="text-xs text-gray-300">—</span>
        </template>
      </div>
      <div v-if="isSelected(itemIdx, colIdx)" class="absolute inset-0 pointer-events-none border-2 border-blue-500 z-10"></div>
    </td>
    </template>
  </tr>
</template>

<script lang="ts">
import { defineComponent, PropType, h, ref, watch, nextTick } from 'vue-demi';
import type { Column } from '../types/grid';

export default defineComponent({
  name: 'WZGridRow',
  props: {
    itemIdx:            { type: Number, required: true },
    row:                { type: Object as PropType<any>, default: null },
    rowHeight:          { type: Number, required: true },
    visibleColumns:     { type: Array as PropType<Column[]>, required: true },
    useCheckbox:        { type: Boolean, required: true },
    effUseRowDrag:      { type: Boolean, required: true },
    effUseDetail:       { type: Boolean, required: true },
    effUseContextMenu:  { type: Boolean, required: true },
    useTree:            { type: Boolean, required: true },
    effectiveTreeKey:   { type: String, required: true },
    checkboxWidth:      { type: Number, required: true },
    rowDragWidth:       { type: Number, required: true },
    detailExpandWidth:  { type: Number, required: true },
    rowDragSrcIdx:      { type: Number, required: true },
    rowDragOverIdx:     { type: Number, required: true },
    rowDragOverPos:     { type: String as PropType<'above' | 'below' | ''>, required: true },
    rowClass:           { type: Function as PropType<(row: any, rowIndex: number) => any>, default: null },
    cellClass:          { type: Function as PropType<(row: any, column: Column, rowIndex: number) => any>, default: null },
    getMerge:           { type: Function as PropType<(itemIdx: number, colKey: string) => any>, required: true },
    isSelected:         { type: Function as PropType<(rowIdx: number, colIdx: number) => boolean>, required: true },
    // selection 변경 시 WZGridRow 리렌더링을 보장하기 위한 키.
    // WZGrid의 selectionKey computed가 변경되면 shouldUpdateComponent=true → 반드시 리렌더링.
    selectionKey:       { type: String, default: '' },
    isEditing:          { type: Function as PropType<(rowIdx: number, colIdx: number) => boolean>, required: true },
    isRowChecked:       { type: Function as PropType<(rowId: any) => boolean>, required: true },
    isDetailExpanded:   { type: Function as PropType<(rowId: any) => boolean>, required: true },
    isExpanded:         { type: Function as PropType<(rowId: any) => boolean>, required: true },
    getTreeLevel:       { type: Function as PropType<(idx: number) => number>, required: true },
    getTreeHasChildren: { type: Function as PropType<(idx: number) => boolean>, required: true },
    getColumnStyle:     { type: Function as PropType<(col: Column, colIdx: number) => Record<string, any>>, required: true },
    getAlignClass:      { type: Function as PropType<(align?: string) => Record<string, boolean>>, required: true },
    getOptionLabel:     { type: Function as PropType<(idx: number, col: Column) => string>, required: true },
    getBadgeColor:      { type: Function as PropType<(idx: number, col: Column) => string>, required: true },
    getTooltipValue:    { type: Function as PropType<(idx: number, col: Column) => string>, required: true },
    hasError:           { type: Function as PropType<(idx: number, colKey: string) => boolean>, required: true },
    getError:           { type: Function as PropType<(idx: number, colKey: string) => string>, required: true },
    editValue:          { type: [String, Number, Boolean] as PropType<any>, default: '' },
    // 현재 편집 중인 행 ID와 컬럼 인덱스. 포커스 자동 부여에 사용.
    // editingRowId가 null → non-null로 바뀌면 새 편집 세션이 시작된 것.
    editingRowId:       { type: [String, Number], default: null },
    editingColIdx:      { type: Number, default: -1 },
    // 부모의 $slots 참조 — cell-* 슬롯 포워딩용
    parentSlots:        { type: Object as PropType<Record<string, any> | null>, default: null },
  },
  emits: [
    'row-click',
    'row-drag-over',
    'row-drop',
    'row-drag-end',
    'row-drag-start',
    'toggle-detail',
    'toggle-row',
    'start-selection',
    'update-selection',
    'end-selection',
    'start-editing',
    'stop-editing',
    'handle-input',
    'open-context-menu',
    'toggle-boolean',
    'toggle-node',
    'button-click',
    'update-cell-from-item',
    'update:editValue',
  ],
  setup(props) {
    /**
     * 편집 input 엘리먼트 ref.
     * editingRowId prop이 이 행을 가리키는 값으로 바뀌면 nextTick 후 자동 포커스를 부여한다.
     */
    const editInput = ref<HTMLInputElement | HTMLSelectElement | null>(null);

    // editingRowId + editingColIdx 조합 변화를 감지.
    // editingRowId가 null이 아닌 값으로 바뀌고 이 행이 편집 대상이면 포커스 부여.
    watch(
      () => [props.editingRowId, props.editingColIdx] as const,
      async ([newRowId, newColIdx]) => {
        if (newRowId === null || newColIdx === -1) return;
        if (!props.isEditing(props.itemIdx, newColIdx)) return;
        await nextTick();
        const el = Array.isArray(editInput.value) ? (editInput.value as any)[0] : editInput.value;
        el?.focus();
      },
      { flush: 'post' }
    );

    /**
     * 부모의 슬롯 함수를 호출하여 vnode를 렌더링.
     * Vue 2/3 모두 $slots[name]은 함수(Vue 3) 또는 VNode 배열(Vue 2)이므로
     * vue-demi의 h를 통해 감싸서 반환합니다.
     */
    /**
     * ISO 8601 / "YYYY-MM-DDTHH:mm..." 문자열을 "YYYY-MM-DD HH:mm" 포맷으로 변환.
     */
    const formatDatetime = (val: any): string => {
      if (!val) return '';
      const s = String(val);
      // "T" 구분자가 있으면 날짜/시간 분리, 없으면 그대로 반환
      const tIdx = s.indexOf('T');
      if (tIdx === -1) return s;
      const datePart = s.substring(0, tIdx);
      const timePart = s.substring(tIdx + 1, tIdx + 6); // HH:mm
      return `${datePart} ${timePart}`;
    };

    const renderParentSlot = (name: string, slotProps: Record<string, any>) => {
      if (!props.parentSlots) return null;
      const slotFn = props.parentSlots[name];
      if (!slotFn) return null;
      // Vue 3: slotFn is a function returning VNode[]
      // Vue 2 (via @vue/composition-api): slotFn is also callable
      try {
        const nodes = typeof slotFn === 'function' ? slotFn(slotProps) : slotFn;
        return h('span', { class: 'contents' }, Array.isArray(nodes) ? nodes : [nodes]);
      } catch {
        return null;
      }
    };

    /**
     * currency 타입 포매터.
     * currencySymbol(기본 '₩'), decimals(기본 0) 옵션을 반영한다.
     */
    const formatCurrency = (value: any, symbol?: string, decimals?: number): string => {
      const num = Number(value ?? 0);
      if (isNaN(num)) return String(value ?? '');
      const sym = symbol ?? '₩';
      const dec = decimals ?? 0;
      const formatted = num.toLocaleString(undefined, {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      });
      return `${sym}${formatted}`;
    };

    const getEventValue = (e: any): any => {
      const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      return target ? target.value : '';
    };

    // ── Sparkline 헬퍼 ────────────────────────────────────────────────────

    /**
     * number[] → SVG 공통 정규화 유틸
     * viewBox width=100, height=svgHeight, 상하 pad=2px
     * 반환: { x, y }[] (0-based normalized)
     */
    const normalizeSparkline = (values: number[], svgHeight: number, pad = 2) => {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1;
      return values.map((v, i) => ({
        x: (i / (values.length - 1)) * 100,
        y: svgHeight - pad - ((v - min) / range) * (svgHeight - pad * 2),
        v,
      }));
    };

    /**
     * line / area 타입용 — polyline points 문자열 반환.
     * viewBox width=100, height=svgHeight (2px 상하 패딩 포함)
     */
    const getSparklinePoints = (values: number[], svgHeight: number): string => {
      if (!values || values.length < 2) return '';
      return normalizeSparkline(values, svgHeight)
        .map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
        .join(' ');
    };

    /**
     * area 타입용 — 채움 polygon points 문자열 반환.
     * 라인 포인트 + 우하단 → 좌하단 으로 닫는 경로
     */
    const getSparklineAreaPoints = (values: number[], svgHeight: number): string => {
      if (!values || values.length < 2) return '';
      const pad = 2;
      const pts = normalizeSparkline(values, svgHeight, pad);
      const linePts = pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
      const baseline = (svgHeight - pad).toFixed(2);
      const firstX = pts[0].x.toFixed(2);
      const lastX  = pts[pts.length - 1].x.toFixed(2);
      return `${linePts} ${lastX},${baseline} ${firstX},${baseline}`;
    };

    /**
     * bar 타입 (수평) — rect 배열 데이터 반환.
     * 각 값을 행으로 배치: y는 등분, 막대 너비는 값에 비례 (0~100)
     */
    const getSparklineBarRects = (
      values: number[],
      svgHeight: number,
    ): { x: number; y: number; w: number; h: number }[] => {
      if (!values || values.length < 1) return [];
      const min = 0; // 0 기준 (음수 미지원)
      const max = Math.max(...values) || 1;
      const count = values.length;
      const totalH = svgHeight - 4; // 상하 2px 여유
      const barH = Math.max(1, totalH / count - 1); // 1px 간격
      return values.map((v, i) => {
        const w = ((v - min) / (max - min)) * 96; // 최대 96px
        const y = 2 + i * (barH + 1);
        return { x: 0, y, w, h: barH };
      });
    };

    /**
     * column 타입 (수직) — rect 배열 데이터 반환.
     * 각 값을 열로 배치: x는 등분, 막대 높이는 값에 비례
     */
    const getSparklineColumnRects = (
      values: number[],
      svgHeight: number,
    ): { x: number; y: number; w: number; h: number }[] => {
      if (!values || values.length < 1) return [];
      const max = Math.max(...values) || 1;
      const count = values.length;
      const pad = 2;
      const totalW = 100;
      const barW = Math.max(1, totalW / count - 1); // 1px 간격
      const usableH = svgHeight - pad * 2;
      return values.map((v, i) => {
        const h = (v / max) * usableH;
        const x = i * (barW + 1);
        const y = svgHeight - pad - h;
        return { x, y, w: barW, h: Math.max(1, h) };
      });
    };

    return {
      editInput, renderParentSlot, formatCurrency, formatDatetime, getEventValue,
      getSparklinePoints, getSparklineAreaPoints, getSparklineBarRects, getSparklineColumnRects,
    };
  },
});
</script>

<style scoped>
.sticky { position: sticky !important; }
.z-10 { z-index: 10; }
.z-30 { z-index: 30; }

.row-drag-over-top    td { box-shadow: 0 -2px 0 0 #3b82f6 inset; }
.row-drag-over-bottom td { box-shadow: 0 2px 0 0 #3b82f6; }
</style>
