<!-- src/components/WZGridToolbar.vue -->
<template>
  <div
    class="wz-grid-toolbar flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 border border-gray-300 border-b-0 rounded-t"
  >
    <!-- 왼쪽: 컬럼 설정 + 필터 초기화 + 트리 펼치기/접기 -->
    <div class="flex items-center gap-2">

      <!-- 컬럼 표시/숨기기 -->
      <div v-if="effShowColumnSettings" class="relative" @click.stop>
        <button
          @click="$emit('toggle-col-settings')"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-all bg-white border-gray-300 text-gray-600 hover:bg-gray-600 hover:text-white hover:border-gray-600"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          {{ t('toolbar.columnSettings') }}
          <span v-if="hiddenColKeys.length > 0" class="bg-blue-500 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center">{{ hiddenColKeys.length }}</span>
        </button>

        <!-- 드롭다운 패널 -->
        <div
          v-if="colSettingsOpen"
          class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-52 max-h-72 flex flex-col"
          @click.stop
        >
          <div class="px-3 py-2 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{{ t('toolbar.columnVisibility') }}</span>
            <button @click="$emit('show-all-cols')" class="text-[10px] text-blue-500 hover:underline">{{ t('toolbar.showAll') }}</button>
          </div>
          <div class="overflow-y-auto flex-grow">
            <label
              v-for="col in columns"
              :key="col.key"
              class="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                :checked="!hiddenColKeys.includes(col.key)"
                @change="$emit('toggle-col-visibility', col.key)"
                class="w-3.5 h-3.5 accent-blue-500 flex-shrink-0"
              />
              <span class="text-xs text-gray-700 truncate">{{ col.title }}</span>
              <span v-if="col.pinned" class="ml-auto text-[9px] text-orange-500 bg-orange-50 px-1 rounded flex-shrink-0">{{ t('toolbar.pinned') }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 트리 모두 펼치기/접기 -->
      <template v-if="useTree">
        <button
          @click="$emit('expand-all')"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-all bg-white border-gray-300 text-gray-600 hover:bg-teal-600 hover:text-white hover:border-teal-600"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          {{ t('toolbar.expandAll') }}
        </button>
        <button
          @click="$emit('collapse-all')"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-all bg-white border-gray-300 text-gray-600 hover:bg-teal-600 hover:text-white hover:border-teal-600"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
          {{ t('toolbar.collapseAll') }}
        </button>
      </template>

      <!-- 필터 초기화 -->
      <button
        v-if="useFilter && activeFilterCount > 0"
        @click="$emit('clear-all-filters')"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-all bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        {{ t('toolbar.clearFilters', { count: activeFilterCount }) }}
      </button>
    </div>

    <!-- 오른쪽: 커스텀 슬롯 + 삭제 + 추가 -->
    <div class="flex items-center gap-2">
      <slot name="toolbar" />
      <div v-if="hasToolbarSlot && (showAdd || showDelete)" class="w-px h-5 bg-gray-300 mx-1" />
      <button
        v-if="showDelete"
        @click="$emit('delete')"
        :disabled="checkedCount === 0"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-all bg-white border-red-300 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-red-600 disabled:hover:border-red-300"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        {{ t('toolbar.delete') }}<span v-if="checkedCount > 0" class="opacity-80">({{ checkedCount }})</span>
      </button>
      <button
        v-if="showAdd"
        @click="$emit('add')"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-all bg-white border-blue-300 text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ t('toolbar.add') }}
      </button>

      <!-- Excel 내보내기 -->
      <button
        v-if="effShowExcelExport"
        @click="$emit('excel-export')"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-all bg-white border-green-300 text-green-700 hover:bg-green-600 hover:text-white hover:border-green-600"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Excel
      </button>

      <!-- CSV 내보내기 -->
      <button
        v-if="effUseCsvExport"
        @click="$emit('csv-export')"
        :aria-label="t('toolbar.csvExport')"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-all bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        CSV
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, inject } from 'vue-demi';
import type { Column } from '@anthropic/wz-grid-core';
import type { TFunction } from '../composables/useI18n';
import { I18N_KEY } from '../composables/useI18n';

export default defineComponent({
  name: 'WZGridToolbar',
  props: {
    columns:             { type: Array as PropType<Column[]>, required: true },
    hiddenColKeys:       { type: Array as PropType<string[]>, required: true },
    colSettingsOpen:     { type: Boolean, required: true },
    effShowColumnSettings: { type: Boolean, required: true },
    useTree:             { type: Boolean, required: true },
    useFilter:           { type: Boolean, required: true },
    activeFilterCount:   { type: Number, required: true },
    showAdd:             { type: Boolean, required: true },
    showDelete:          { type: Boolean, required: true },
    effShowExcelExport:  { type: Boolean, required: true },
    effUseCsvExport:     { type: Boolean, required: true },
    checkedCount:        { type: Number, required: true },
    hasToolbarSlot:      { type: Boolean, required: true },
  },
  emits: [
    'toggle-col-settings',
    'show-all-cols',
    'toggle-col-visibility',
    'expand-all',
    'collapse-all',
    'clear-all-filters',
    'delete',
    'add',
    'excel-export',
    'csv-export',
  ],
  setup() {
    const t = inject<TFunction>(I18N_KEY, (key: string) => key);
    return { t };
  },
});
</script>
