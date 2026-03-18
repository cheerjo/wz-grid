<!-- src/components/WZGridPagination.vue -->
<template>
  <div class="wz-grid-paging border-t border-gray-300 bg-gray-50 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
    <div class="flex items-center gap-4">
      <span>
        <strong>{{ totalFilteredRows.toLocaleString() }}</strong>{{ t('grid.rowUnit') }}
        <span v-if="showFilterNote" class="text-blue-600 text-xs ml-1">({{ t('pagination.totalCount', { count: totalRows.toLocaleString() }) }})</span>
      </span>
      <span v-if="checkedCount > 0" class="text-blue-600 font-semibold">{{ t('pagination.selected', { count: checkedCount.toLocaleString() }) }}</span>
      <div class="flex items-center gap-1">
        <span>{{ t('pagination.pageSize') }}</span>
        <select :value="pageSize" @change="onPageSizeChange" class="bg-white border border-gray-300 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-blue-400">
          <option v-for="s in [10, 20, 50, 100]" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button @click="$emit('go-to', 1)" :disabled="currentPage === 1" class="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors">&laquo;</button>
      <button @click="$emit('go-to', currentPage - 1)" :disabled="currentPage === 1" class="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors">&lsaquo;</button>
      <div class="flex items-center gap-1 px-2">
        <input type="number" :value="currentPage" @change="onPageInput" class="w-12 text-center bg-white border border-gray-300 rounded py-0.5 outline-none focus:ring-1 focus:ring-blue-400" />
        <span>/ {{ totalPages }}</span>
      </div>
      <button @click="$emit('go-to', currentPage + 1)" :disabled="currentPage === totalPages" class="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors">&rsaquo;</button>
      <button @click="$emit('go-to', totalPages)" :disabled="currentPage === totalPages" class="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors">&raquo;</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue-demi';
import type { TFunction } from '../composables/useI18n';
import { I18N_KEY } from '../composables/useI18n';

export default defineComponent({
  name: 'WZGridPagination',
  props: {
    totalFilteredRows: { type: Number, required: true },
    totalRows:         { type: Number, required: true },
    showFilterNote:    { type: Boolean, default: false },
    checkedCount:      { type: Number, default: 0 },
    pageSize:          { type: Number, required: true },
    currentPage:       { type: Number, required: true },
    totalPages:        { type: Number, required: true },
  },
  emits: ['update:pageSize', 'go-to'],
  setup(_, { emit }) {
    const t = inject<TFunction>(I18N_KEY, (key: string) => key);
    const onPageSizeChange = (e: Event) => {
      emit('update:pageSize', parseInt((e.target as HTMLSelectElement).value));
      emit('go-to', 1);
    };
    const onPageInput = (e: Event) => {
      const page = parseInt((e.target as HTMLInputElement).value);
      if (!isNaN(page)) emit('go-to', page);
    };
    return { onPageSizeChange, onPageInput, t };
  },
});
</script>
