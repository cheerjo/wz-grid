// src/composables/useFocusTrap.ts
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
 * 경량 포커스 트랩. 활성화되면 Tab/Shift+Tab이 컨테이너 안쪽 포커스 가능 요소 사이를
 * 순환하도록 강제하고, Esc 키 입력 시 `onEscape`를 호출합니다. 트랩 해제 시 호출
 * 직전에 포커스가 있던 요소로 포커스를 복귀시킵니다.
 *
 * 주의: 이 composable은 DOM 노드를 직접 관리하므로 SSR에서는 no-op이 되어야 합니다
 * (`document`를 참조하므로 브라우저 환경에서만 실행되어야 합니다).
 */
export function useFocusTrap(opts: UseFocusTrapOptions) {
  const previouslyFocused = ref<HTMLElement | null>(null);

  const getFocusable = (): HTMLElement[] => {
    const el = opts.containerRef.value;
    if (!el) return [];
    const nodes = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    // `offsetParent`는 jsdom에서 항상 null이므로 브라우저에서만 신뢰합니다. 여기서는
    // aria-hidden·hidden·disabled 같은 명시적 비활성 플래그만 걸러냅니다.
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
    // 첫 포커스 가능 요소로 포커스 이동 (마이크로태스크 큐)
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

  // `active`가 변하면 자동으로 activate/deactivate
  watch(
    () => opts.active.value,
    (isActive, prev) => {
      if (isActive && !prev) activate();
      else if (!isActive && prev) deactivate();
    },
    { immediate: true, flush: 'post' }
  );

  // 컴포넌트 setup 밖에서 호출되는 경우(예: 단독 테스트)엔 lifecycle hook을 스킵
  if (getCurrentInstance()) {
    onBeforeUnmount(() => {
      if (opts.active.value) deactivate();
    });
  }

  return { activate, deactivate };
}
