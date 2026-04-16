<template>
  <tr
    :style="{ height: rowHeight + 'px' }"
    class="bg-blue-50 hover:bg-blue-100 cursor-pointer select-none"
    @click="$emit('toggle-group', groupHeader.key)"
    @mousedown.prevent
  >
    <!-- 고정 영역들 (드래그, 디테일, 체크박스) -->
    <td 
      v-if="effUseRowDrag" 
      :style="{ width: rowDragWidth + 'px', minWidth: rowDragWidth + 'px' }" 
      class="border-b border-r border-gray-200 p-0 sticky left-0 z-10 bg-blue-50"
    ></td>
    <td 
      v-if="effUseDetail" 
      :style="{ 
        width: detailExpandWidth + 'px', 
        minWidth: detailExpandWidth + 'px', 
        left: (effUseRowDrag ? rowDragWidth : 0) + 'px' 
      }" 
      class="border-b border-r border-gray-200 p-0 sticky z-10 bg-blue-50"
    ></td>
    <td 
      v-if="useCheckbox" 
      :style="{ 
        width: checkboxWidth + 'px', 
        minWidth: checkboxWidth + 'px', 
        left: (effUseRowDrag ? rowDragWidth : 0) + (effUseDetail ? detailExpandWidth : 0) + 'px' 
      }" 
      class="border-b border-r border-gray-200 p-0 sticky z-10 bg-blue-50"
    ></td>
    
    <!-- 그룹 정보 표시 영역 -->
    <td :colspan="visibleColumnsCount" class="border-b border-gray-300 px-3 py-0">
      <div class="flex items-center gap-2">
        <span class="text-blue-500 w-3 text-center flex-shrink-0">
          {{ groupHeader.collapsed ? '&#9654;' : '&#9660;' }}
        </span>
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ groupColTitle }}</span>
        <span class="text-sm font-semibold text-blue-700">{{ groupHeader.label }}</span>
        <span class="text-[11px] text-gray-400 bg-blue-100 px-1.5 py-0.5 rounded-full">
          {{ groupHeader.count.toLocaleString() }}{{ t('grid.rowUnit') }}
        </span>
      </div>
    </td>
  </tr>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue-demi';
import type { GroupHeader } from '../types/grid';

export default defineComponent({
  name: 'WZGridGroupHeader',
  props: {
    groupHeader:         { type: Object as PropType<GroupHeader>, required: true },
    rowHeight:           { type: Number, required: true },
    visibleColumnsCount: { type: Number, required: true },
    effUseRowDrag:       { type: Boolean, required: true },
    effUseDetail:        { type: Boolean, required: true },
    useCheckbox:         { type: Boolean, required: true },
    rowDragWidth:        { type: Number, required: true },
    detailExpandWidth:   { type: Number, required: true },
    checkboxWidth:       { type: Number, required: true },
    groupColTitle:       { type: String, required: true },
    t:                   { type: Function as PropType<(key: string) => string>, required: true },
  },
  emits: ['toggle-group']
});
</script>
