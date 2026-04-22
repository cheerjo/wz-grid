// packages/vue/src/composables/useColumnSettings.ts
import { ref, computed, onMounted, onBeforeUnmount } from 'vue-demi';
import type { Column } from '@wezon/wz-grid-core';

export function useColumnSettings(getColumns: () => Column[]) {
  const hiddenColKeys = ref<string[]>([]);
  const visibleColumns = computed(() => getColumns().filter(col => !hiddenColKeys.value.includes(col.key)));

  const toggleColVisibility = (key: string) => {
    if (hiddenColKeys.value.includes(key)) {
      hiddenColKeys.value = hiddenColKeys.value.filter(k => k !== key);
    } else {
      hiddenColKeys.value = [...hiddenColKeys.value, key];
    }
  };

  const colSettingsOpen = ref(false);
  const closeColSettings = () => { colSettingsOpen.value = false; };
  onMounted(() => document.addEventListener('click', closeColSettings));
  onBeforeUnmount(() => document.removeEventListener('click', closeColSettings));

  return { hiddenColKeys, visibleColumns, toggleColVisibility, colSettingsOpen };
}
