// packages/vue/src/composables/useVirtualScroll.ts
import { ref, computed, Ref } from 'vue-demi';

// rowHeight / viewportHeight는 getter 함수로 받아 부모에서 동적으로 변경될 때도 반영
export function useVirtualScroll(
  totalRows: Ref<number>,
  getRowHeight: () => number,
  getViewportHeight: () => number,
  buffer: number = 5
) {
  const scrollTop = ref(0);

  const visibleRange = computed(() => {
    const total = totalRows.value;
    const rowHeight = getRowHeight();
    const viewportHeight = getViewportHeight();
    const startIdx = Math.max(0, Math.floor(scrollTop.value / rowHeight) - buffer);
    const endIdx = Math.min(
      total,
      Math.ceil((scrollTop.value + viewportHeight) / rowHeight) + buffer
    );
    return { startIdx, endIdx };
  });

  const topPadding = computed(() => visibleRange.value.startIdx * getRowHeight());
  const bottomPadding = computed(() =>
    (totalRows.value - visibleRange.value.endIdx) * getRowHeight()
  );

  const onScroll = (e: Event | { target: HTMLElement }) => {
    const target = (e as any).target as HTMLElement;
    scrollTop.value = target.scrollTop;
  };

  return {
    visibleRange,
    topPadding,
    bottomPadding,
    onScroll
  };
}
