<template>
  <tr class="bg-gray-50">
    <td
      :colspan="totalColspan"
      class="border-b border-gray-200 p-0"
    >
      <div class="px-4 py-3">
        <slot />
      </div>
    </td>
  </tr>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue-demi';

export default defineComponent({
  name: 'WZGridDetailRow',
  props: {
    visibleColumnsCount: { type: Number, required: true },
    effUseRowDrag:       { type: Boolean, required: true },
    effUseDetail:        { type: Boolean, required: true },
    useCheckbox:         { type: Boolean, required: true },
  },
  setup(props) {
    const totalColspan = computed(() => {
      return props.visibleColumnsCount 
        + (props.effUseRowDrag ? 1 : 0) 
        + (props.effUseDetail ? 1 : 0) 
        + (props.useCheckbox ? 1 : 0);
    });

    return { totalColspan };
  }
});
</script>
