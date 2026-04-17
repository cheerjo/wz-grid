<template>
  <div class="flex items-center justify-center w-full h-full" @mousedown.stop>
    <input 
      type="checkbox" 
      :checked="!!value" 
      @change="$emit('toggle-boolean', itemIdx, col.key)" 
      class="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer" 
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue-demi';
import type { Column } from '../../types/grid';

export default defineComponent({
  name: 'CellBoolean',
  props: {
    row:      { type: Object, required: true },
    col:      { type: Object as PropType<Column>, required: true },
    value:    { type: Boolean, default: false },
    itemIdx:  { type: Number, required: true },
  },
  emits: ['toggle-boolean']
});
</script>
