// packages/core/src/composables/i18n.ts
// No Vue dependency — pure TypeScript
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

/** locale + custom messages로 번역 객체 계산 */
export function buildTranslations(locale: string, messages?: Record<string, any> | null): Record<string, any> {
  const base = locale === 'en' ? en : ko;
  return messages ? deepMerge(base, messages) : base;
}

/**
 * 번역 객체에서 키로 문자열을 찾아 파라미터를 치환해 반환.
 * 키가 없으면 키 자체를 반환.
 */
export function translate(
  translations: Record<string, any>,
  key: string,
  params?: Record<string, any>
): string {
  const parts = key.split('.');
  let current: any = translations;
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
}

/**
 * 순수 i18n 엔진 팩토리.
 * getLocale / getMessages는 getter 함수 — 호출 시점에 최신 값을 읽음.
 */
export function createI18nEngine(
  getLocale: () => string,
  getMessages: () => Record<string, any> | undefined | null
): { t: TFunction } {
  const t: TFunction = (key, params) => {
    const translations = buildTranslations(getLocale(), getMessages());
    return translate(translations, key, params);
  };
  return { t };
}

/** provide/inject 심볼 키 (Vue 래퍼에서 재사용) */
export const I18N_KEY = 'wzgrid-t';
