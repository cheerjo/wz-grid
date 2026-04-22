<template>
  <span :class="col.truncate !== false ? 'truncate min-w-0 block w-full' : 'whitespace-normal break-words'">
    {{ optionLabel }}
  </span>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue-demi';
import type { Column } from '@anthropic/wz-grid-core';

export default defineComponent({
  name: 'CellSelect',
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

    return { optionLabel };
  }
});
</script>
