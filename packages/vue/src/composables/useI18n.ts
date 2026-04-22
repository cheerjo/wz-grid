// packages/vue/src/composables/useI18n.ts
import { computed } from 'vue-demi';
import { ko, en, I18N_KEY } from '@wezon/wz-grid-core';
import type { TFunction } from '@wezon/wz-grid-core';

// TFunction, I18N_KEY는 코어에서 re-export됨
export type { TFunction };
export { I18N_KEY };

function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] ?? {}, source[key]);
    } else if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
}

export function useI18n(
  getLocale: () => string,
  getMessages: () => Record<string, any> | undefined | null
) {
  const translations = computed(() => {
    const base = getLocale() === 'en' ? en : ko;
    const custom = getMessages();
    return custom ? deepMerge(base, custom) : base;
  });

  const t: TFunction = (key: string, params?: Record<string, any>): string => {
    const parts = key.split('.');
    let current: any = translations.value;
    for (const part of parts) {
      current = current?.[part];
      if (current === undefined) break;
    }
    let result = typeof current === 'string' ? current : key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return result;
  };

  return { t };
}
