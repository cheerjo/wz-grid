<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">

    <!-- ── 상단: 타이틀 ─────────────────────────────────────────────── -->
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="flex justify-between items-center flex-wrap gap-3 px-6 py-3">
        <div>
          <h1 class="text-xl font-bold text-gray-800">WZ-Grid Demo</h1>
          <p class="text-xs text-gray-500 mt-0.5">전체 기능 · 컬럼 타입 예제</p>
        </div>
      </div>

      <!-- ── 탭 네비게이션 ─────────────────────────────────────────────── -->
      <nav class="flex gap-0 px-6">
        <a
          v-for="tab in tabs"
          :key="tab.hash"
          :href="tab.hash"
          @click.prevent="goTo(tab.hash)"
          class="px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors"
          :class="currentHash === tab.hash
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          {{ tab.label }}
        </a>
      </nav>
    </header>

    <!-- ── 탭 콘텐츠 ────────────────────────────────────────────────────── -->
    <main class="flex-grow p-6">
      <component :is="currentDemo" />
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { demos } from './demos/index';

// ── 탭 정의 (demos 레지스트리 기반) ─────────────────────────────────────────
const tabs = demos.map(d => ({ hash: `#${d.id}` as const, label: d.label }));
type TabHash = `#${typeof demos[number]['id']}`;

// ── URL 해시 기반 탭 상태 ────────────────────────────────────────────────────
const currentHash = ref<TabHash>('#basic');

const syncHash = () => {
  const h = window.location.hash as TabHash;
  currentHash.value = tabs.some(t => t.hash === h) ? h : '#basic';
};

const goTo = (hash: TabHash) => {
  window.location.hash = hash;
  currentHash.value = hash;
};

onMounted(() => {
  syncHash();
  window.addEventListener('hashchange', syncHash);
});

// ── 동적 컴포넌트 (레지스트리에서 조회) ──────────────────────────────────────
const currentDemo = computed(() => {
  const id = currentHash.value.slice(1);
  return demos.find(d => d.id === id)?.component ?? demos[0].component;
});
</script>
