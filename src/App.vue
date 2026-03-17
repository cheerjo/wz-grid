<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">

    <!-- ── 상단: 타이틀 + 라이선스 입력 바 ─────────────────────────────── -->
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="flex justify-between items-center flex-wrap gap-3 px-6 py-3">
        <div>
          <h1 class="text-xl font-bold text-gray-800">WZ-Grid Demo</h1>
          <p class="text-xs text-gray-500 mt-0.5">전체 기능 · 컬럼 타입 예제</p>
        </div>

        <!-- 라이선스 키 입력 -->
        <div class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <span class="text-xs font-semibold text-gray-500 whitespace-nowrap">라이선스 키</span>
          <input
            v-model="licenseKey"
            type="text"
            placeholder="WZGRID-PRO-XXXXXXXX-XXXXXXX"
            class="text-xs font-mono border border-gray-300 rounded px-2 py-1 w-64 outline-none focus:ring-1 focus:ring-blue-400"
          />
          <span
            :class="licenseTierLabel.class"
            class="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
          >{{ licenseTierLabel.text }}</span>
          <button
            @click="applyDemoKey"
            class="text-[10px] font-semibold px-2 py-1 bg-amber-400 hover:bg-amber-500 text-white rounded transition-colors whitespace-nowrap"
          >
            데모키 입력
          </button>
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
import { ref, computed, onMounted, defineAsyncComponent, markRaw } from 'vue';
import { provideLicense } from './demos/shared/useLicense';

// ── 라이선스 (provide → 하위 데모 컴포넌트에서 inject 가능) ─────────────────
const { licenseKey, licenseTierLabel, applyDemoKey } = provideLicense();

// ── 탭 정의 ─────────────────────────────────────────────────────────────────
const tabs = [
  { hash: '#basic', label: '기본 데모 (Basic)' },
  { hash: '#tree',  label: '트리 데모 (Tree)' },
] as const;

type TabHash = typeof tabs[number]['hash'];

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

// ── 동적 컴포넌트 매핑 ────────────────────────────────────────────────────────
const DemoBasic = markRaw(defineAsyncComponent(() => import('./demos/DemoBasic.vue')));
const DemoTree  = markRaw(defineAsyncComponent(() => import('./demos/DemoTree.vue')));

const demoMap: Record<TabHash, ReturnType<typeof markRaw>> = {
  '#basic': DemoBasic,
  '#tree':  DemoTree,
};

const currentDemo = computed(() => demoMap[currentHash.value]);
</script>
