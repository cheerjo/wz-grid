<template>
  <tr
    :style="{ height: rowHeight + 'px' }"
    class="bg-amber-50"
  >
    <!-- 고정 영역들 -->
    <td v-if="effUseRowDrag" :style="{ width: rowDragWidth + 'px', minWidth: rowDragWidth + 'px' }" class="border-b border-r border-gray-200 p-0 sticky left-0 z-10 bg-amber-50"></td>
    <td v-if="effUseDetail" :style="{ width: detailExpandWidth + 'px', minWidth: detailExpandWidth + 'px', left: (effUseRowDrag ? rowDragWidth : 0) + 'px' }" class="border-b border-r border-gray-200 p-0 sticky z-10 bg-amber-50"></td>
    <td v-if="useCheckbox" :style="{ width: checkboxWidth + 'px', minWidth: checkboxWidth + 'px', left: (effUseRowDrag ? rowDragWidth : 0) + (effUseDetail ? detailExpandWidth : 0) + 'px' }" class="border-b border-r border-gray-200 p-0 sticky z-10 bg-amber-50"></td>
    
    <!-- 컬럼별 소계 데이터 영역 -->
    <td
      v-for="(col, colIdx) in visibleColumns"
      :key="'sub-' + col.key"
      :style="getColumnStyle(col, colIdx)"
      :class="{ 'sticky left-0 z-10 bg-amber-50': col.pinned }"
      class="border-b border-r border-gray-200 px-2 py-1"
    >
      <template v-if="colIdx === 0">
        <span class="text-[11px] font-bold text-amber-700">{{ t('grid.subtotal') }}</span>
        <span class="text-[10px] text-gray-400 ml-1">({{ subtotal.count.toLocaleString() }}{{ t('grid.rowUnit') }})</span>
      </template>
      <template v-else-if="col.type === 'number'">
        <div class="text-xs font-semibold text-gray-700 text-right w-full">
          {{ subtotal.sums[col.key]?.toLocaleString() }}
        </div>
      </template>
    </td>
  </tr>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue-demi';
import type { SubtotalItem, Column } from '@anthropic/wz-grid-core';

export default defineComponent({
  name: 'WZGridSubtotal',
  props: {
    subtotal:          { type: Object as PropType<SubtotalItem>, required: true },
    rowHeight:         { type: Number, required: true },
    visibleColumns:    { type: Array as PropType<Column[]>, required: true },
    effUseRowDrag:     { type: Boolean, required: true },
    effUseDetail:      { type: Boolean, required: true },
    useCheckbox:       { type: Boolean, required: true },
    rowDragWidth:      { type: Number, required: true },
    detailExpandWidth: { type: Number, required: true },
    checkboxWidth:     { type: Number, required: true },
    getColumnStyle:    { type: Function as PropType<(col: Column, colIdx: number) => any>, required: true },
    t:                 { type: Function as PropType<(key: string) => string>, required: true },
  }
});
</script>
