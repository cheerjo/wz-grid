<!-- src/components/WZContextMenu.vue -->
<template>
  <teleport to="body">
    <div
      v-if="visible"
      ref="menuEl"
      class="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-2xl py-1 min-w-[168px] select-none"
      :style="{ top: y + 'px', left: x + 'px' }"
      role="menu"
      :aria-label="t('aria.contextMenu')"
      @click.stop
    >
      <button @click="$emit('clear-cell')" class="ctx-item" role="menuitem">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        {{ t('contextMenu.clearCell') }}
        <span class="ctx-hint">Del</span>
      </button>

      <div class="ctx-divider" role="separator"/>

      <button @click="$emit('insert', 'above')" class="ctx-item" role="menuitem">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        {{ t('contextMenu.insertAbove') }}
      </button>
      <button @click="$emit('insert', 'below')" class="ctx-item" role="menuitem">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        {{ t('contextMenu.insertBelow') }}
      </button>

      <div class="ctx-divider" role="separator"/>

      <button @click="$emit('delete-row')" class="ctx-item text-red-600 hover:bg-red-50" role="menuitem">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        {{ t('contextMenu.deleteRow') }}
      </button>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, inject, ref, toRefs } from 'vue-demi';
import type { TFunction } from '../composables/useI18n';
import { I18N_KEY } from '../composables/useI18n';
import { useFocusTrap } from '../composables/useFocusTrap';

export default defineComponent({
  name: 'WZContextMenu',
  props: {
    visible: { type: Boolean, default: false },
    x:       { type: Number,  default: 0 },
    y:       { type: Number,  default: 0 },
  },
  emits: ['clear-cell', 'insert', 'delete-row', 'close'],
  setup(props, { emit }) {
    const t = inject<TFunction>(I18N_KEY, (key: string) => key);
    const menuEl = ref<HTMLElement | null>(null);
    const { visible } = toRefs(props);

    useFocusTrap({
      containerRef: menuEl,
      active: visible,
      onEscape: () => emit('close'),
    });

    return { t, menuEl };
  },
});
</script>

<style scoped>
.ctx-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 12px;
  font-size: 12px;
  color: #374151;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
}
.ctx-item:hover,
.ctx-item:focus-visible {
  background-color: #f3f4f6;
  outline: none;
}
.ctx-item:focus-visible { box-shadow: inset 2px 0 0 #3b82f6; }
.ctx-hint { margin-left: auto; font-size: 10px; color: #9ca3af; }
.ctx-divider { height: 1px; background-color: #e5e7eb; margin: 3px 0; }
</style>
