<template>
  <span :class="col.truncate !== false ? 'truncate min-w-0 block w-full' : 'whitespace-normal break-words'">
    {{ col.type === 'number' ? Number(value || 0).toLocaleString() : (value || '') }}
  </span>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue-demi';
import type { Column } from '../../types/grid';

export default defineComponent({
  name: 'CellText',
  props: {
    row:      { type: Object, required: true },
    col:      { type: Object as PropType<Column>, required: true },
    value:    { type: [String, Number], default: '' },
    itemIdx:  { type: Number, required: true },
  }
});
</script>
