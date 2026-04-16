<template>
  <input
    ref="input"
    :value="modelValue"
    :type="inputType"
    class="w-full h-full px-2 text-sm border-2 border-blue-500 outline-none shadow-inner"
    @input="onInput"
    @blur="$emit('stop-editing', true)"
    @keydown.enter.exact.stop="$emit('stop-editing', true, true)"
    @keydown.esc="$emit('stop-editing', false)"
    @mousedown.stop
  />
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref, onMounted } from 'vue-demi';
import type { Column } from '../../types/grid';

export default defineComponent({
  name: 'EditorText',
  props: {
    modelValue: { type: [String, Number], default: '' },
    col:        { type: Object as PropType<Column>, required: true },
  },
  emits: ['update:modelValue', 'stop-editing', 'handle-input'],
  setup(props, { emit }) {
    const input = ref<HTMLInputElement | null>(null);

    const inputType = computed(() => {
      const type = props.col.type;
      if (type === 'number' || type === 'currency') return 'number';
      if (type === 'email') return 'email';
      return 'text';
    });

    const onInput = (e: Event) => {
      const val = (e.target as HTMLInputElement).value;
      emit('update:modelValue', val);
      emit('handle-input', props.col);
    };

    onMounted(() => {
      input.value?.focus();
    });

    return { input, inputType, onInput };
  }
});
</script>
