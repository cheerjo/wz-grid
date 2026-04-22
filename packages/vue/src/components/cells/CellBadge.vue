<template>
  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm" :class="badgeColor">
    {{ optionLabel }}
  </span>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue-demi';
import type { Column } from '@anthropic/wz-grid-core';

export default defineComponent({
  name: 'CellBadge',
  props: {
    row:      { type: Object, required: true },
    col:      { type: Object as PropType<Column>, required: true },
    value:    { type: [String, Number], default: '' },
    itemIdx:  { type: Number, required: true },
  },
  setup(props) {
    const optionLabel = computed(() => {
      const v = props.value;
      return props.col.options?.find(o => o.value === v)?.label || v || '';
    });

    const badgeColor = computed(() => {
      const v = props.value;
      return props.col.options?.find(o => o.value === v)?.color || 'bg-blue-100 text-blue-600';
    });

    return { optionLabel, badgeColor };
  }
});
</script>
