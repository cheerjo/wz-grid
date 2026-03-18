// src/composables/useI18n.ts
import { computed } from 'vue-demi';
import { ko } from '../i18n/ko';
import { en } from '../i18n/en';

/** t(key, params?) 함수 시그니처 */
export type TFunction = (key: string, params?: Record<string, any>) => string;

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

/**
 * WZGrid 국제화 composable.
 * 반환되는 `t()` 함수는 Vue 반응형 컨텍스트(template/computed)에서 호출될 때
 * locale/messages 변경을 자동으로 추적합니다.
 */
export function useI18n(
  getLocale: () => string,
  getMessages: () => Record<string, any> | undefined | null
) {
  // translations는 reactive computed — locale/messages 변경 시 자동 재계산
  const translations = computed(() => {
    const base = getLocale() === 'en' ? en : ko;
    const custom = getMessages();
    return custom ? deepMerge(base, custom) : base;
  });

  /**
   * 메시지 키로 번역 문자열 반환.
   * @param key 점 구분 경로 (예: 'toolbar.add')
   * @param params 파라미터 맵 (예: { count: 3 } → '{count}' 치환)
   */
  const t: TFunction = (key: string, params?: Record<string, any>): string => {
    // translations.value 접근 → Vue가 의존성 추적 → locale/messages 변경 시 재렌더링
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

/** provide/inject 심볼 키 */
export const I18N_KEY = 'wzgrid-t';
