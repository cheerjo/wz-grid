// packages/react/src/hooks/useI18n.ts
// Core createI18nEngine 래핑 — React용 다국어 Hook
import { useMemo } from 'react';
import { createI18nEngine } from '@wezon/wz-grid-core';
import type { TFunction, Locale, Messages } from '@wezon/wz-grid-core';

export interface UseI18nOptions {
  locale?: Locale;
  messages?: Partial<Messages>;
}

export interface UseI18nReturn {
  /** 번역 함수 */
  t: TFunction;
}

/**
 * locale + messages를 받아 t() 번역 함수를 반환.
 * locale/messages가 변경될 때마다 engine을 재생성해 최신 번역을 반영.
 */
export function useI18n({ locale = 'ko', messages }: UseI18nOptions = {}): UseI18nReturn {
  const { t } = useMemo(
    () => createI18nEngine(
      () => locale,
      () => messages as Record<string, any> | undefined
    ),
    [locale, messages]
  );

  return { t };
}
