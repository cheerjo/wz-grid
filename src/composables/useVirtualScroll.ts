// src/composables/useVirtualScroll.ts
import { ref, computed, Ref } from 'vue-demi';

// totalRows를 Ref<number>로 받아야, 페이지가 바뀔 때 자동으로 반응할 수 있음
export function useVirtualScroll(
  totalRows: Ref<number>,
  rowHeight: number,
  viewportHeight: number,
  buffer: number = 5
) {
  const scrollTop = ref(0);

  const visibleRange = computed(() => {
    // .value로 언래핑하여 실제 숫자값에 접근
    const total = totalRows.value;
    const startIdx = Math.max(0, Math.floor(scrollTop.value / rowHeight) - buffer);
    const endIdx = Math.min(
      total,
      Math.ceil((scrollTop.value + viewportHeight) / rowHeight) + buffer
    );
    return { startIdx, endIdx };
  });

  const topPadding = computed(() => visibleRange.value.startIdx * rowHeight);
  const bottomPadding = computed(() => 
    (totalRows.value - visibleRange.value.endIdx) * rowHeight
  );

  const onScroll = (e: Event) => {
    const target = e.target as HTMLElement;
    scrollTop.value = target.scrollTop;
  };

  return {
    visibleRange,
    topPadding,
    bottomPadding,
    onScroll
  };
}
