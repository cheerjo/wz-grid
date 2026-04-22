<template>
  <span :class="col.truncate !== false ? 'truncate min-w-0 block w-full' : 'whitespace-normal break-words'">
    {{ formattedValue }}
  </span>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue-demi';
import type { Column } from '@wezon/wz-grid-core';

export default defineComponent({
  name: 'CellDateTime',
  props: {
    row:      { type: Object, required: true },
    col:      { type: Object as PropType<Column>, required: true },
    value:    { type: [String, Number], default: '' },
    itemIdx:  { type: Number, required: true },
  },
  setup(props) {
    const formattedValue = computed(() => {
      if (!props.value) return '';
      const s = String(props.value);
      const tIdx = s.indexOf('T');
      if (tIdx === -1) return s;
      const datePart = s.substring(0, tIdx);
      const timePart = s.substring(tIdx + 1, tIdx + 6); // HH:mm
      return `${datePart} ${timePart}`;
    });

    return { formattedValue };
  }
});
</script>
