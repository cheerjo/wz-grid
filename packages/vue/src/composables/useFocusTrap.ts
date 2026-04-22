// packages/vue/src/composables/useFocusTrap.ts
import { getCurrentInstance, onBeforeUnmount, ref, watch } from 'vue-demi';
import type { Ref } from 'vue-demi';

export interface UseFocusTrapOptions {
  /** 트랩 컨테이너 DOM 요소 ref */
  containerRef: Ref<HTMLElement | null>;
  /** 트랩 활성화 여부 (reactive) */
  active: Ref<boolean>;
  /** 트랩 해제 시 포커스를 복귀시킬 요소. 미지정 시 활성 전 document.activeElement */
  returnFocusTo?: Ref<HTMLElement | null>;
  /** Esc 키 입력 시 호출되는 콜백 (트랩 종료 로직은 호출자가 담당) */
  onEscape?: () => void;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * 경량 포커스 트랩. DOM/lifecycle 전용이라 코어 변환 없이 Vue 래퍼에 직접 유지.
 */
export function useFocusTrap(opts: UseFocusTrapOptions) {
  const previouslyFocused = ref<HTMLElement | null>(null);

  const getFocusable = (): HTMLElement[] => {
    const el = opts.containerRef.value;
    if (!el) return [];
    const nodes = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    return nodes.filter((n) =>
      !n.hasAttribute('aria-hidden') && !n.hidden && !(n as HTMLButtonElement).disabled
    );
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const container = opts.containerRef.value;
    if (!container) return;

    if (e.key === 'Escape') {
      e.stopPropagation();
      opts.onEscape?.();
      return;
    }

    if (e.key !== 'Tab') return;

    const focusable = getFocusable();
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (e.shiftKey) {
      if (active === first || !container.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last || !container.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const activate = () => {
    if (typeof document === 'undefined') return;
    previouslyFocused.value = (document.activeElement as HTMLElement | null) ?? null;
    document.addEventListener('keydown', onKeyDown, true);
    Promise.resolve().then(() => {
      const focusable = getFocusable();
      if (focusable.length > 0) focusable[0].focus();
    });
  };

  const deactivate = () => {
    if (typeof document === 'undefined') return;
    document.removeEventListener('keydown', onKeyDown, true);
    const returnTarget = opts.returnFocusTo?.value ?? previouslyFocused.value;
    if (returnTarget && typeof returnTarget.focus === 'function') {
      try { returnTarget.focus(); } catch { /* 무시 */ }
    }
    previouslyFocused.value = null;
  };

  watch(
    () => opts.active.value,
    (isActive, prev) => {
      if (isActive && !prev) activate();
      else if (!isActive && prev) deactivate();
    },
    { immediate: true, flush: 'post' }
  );

  if (getCurrentInstance()) {
    onBeforeUnmount(() => {
      if (opts.active.value) deactivate();
    });
  }

  return { activate, deactivate };
}
