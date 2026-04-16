import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ref, nextTick } from 'vue-demi';
import { useFocusTrap } from '../../src/composables/useFocusTrap';

function dispatchKey(key: string, opts: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...opts });
  document.dispatchEvent(event);
  return event;
}

describe('useFocusTrap', () => {
  let container: HTMLDivElement;
  let outsideButton: HTMLButtonElement;
  const deactivators: Array<() => void> = [];

  beforeEach(() => {
    outsideButton = document.createElement('button');
    outsideButton.textContent = 'outside';
    document.body.appendChild(outsideButton);

    container = document.createElement('div');
    container.innerHTML = `
      <button id="b1">one</button>
      <button id="b2">two</button>
      <button id="b3">three</button>
    `;
    document.body.appendChild(container);

    outsideButton.focus();
  });

  afterEach(() => {
    // 테스트는 컴포넌트 외부에서 실행되므로 onBeforeUnmount가 동작하지 않음.
    // 남아있는 document keydown 리스너를 명시적으로 제거.
    while (deactivators.length) deactivators.pop()!();
    container.remove();
    outsideButton.remove();
  });

  it('focuses the first focusable on activation and restores focus on deactivation', async () => {
    const containerRef = ref<HTMLElement | null>(container);
    const active = ref(false);
    const trap = useFocusTrap({ containerRef, active });
    deactivators.push(() => { active.value = false; trap.deactivate(); });

    await nextTick();
    expect(document.activeElement).toBe(outsideButton);

    active.value = true;
    await nextTick();
    // focus is moved in a microtask
    await Promise.resolve();
    expect(document.activeElement?.id).toBe('b1');

    active.value = false;
    await nextTick();
    expect(document.activeElement).toBe(outsideButton);
  });

  it('wraps Tab from last → first and Shift+Tab from first → last', async () => {
    const containerRef = ref<HTMLElement | null>(container);
    const active = ref(true);
    const trap = useFocusTrap({ containerRef, active });
    deactivators.push(() => { active.value = false; trap.deactivate(); });

    await nextTick();
    await Promise.resolve();

    const b1 = container.querySelector<HTMLButtonElement>('#b1')!;
    const b3 = container.querySelector<HTMLButtonElement>('#b3')!;

    // Tab from last button → first
    b3.focus();
    const tabEvt = dispatchKey('Tab');
    expect(tabEvt.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(b1);

    // Shift+Tab from first button → last
    b1.focus();
    const shiftTabEvt = dispatchKey('Tab', { shiftKey: true });
    expect(shiftTabEvt.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(b3);
  });

  it('calls onEscape when Esc is pressed', async () => {
    const containerRef = ref<HTMLElement | null>(container);
    const active = ref(true);
    let escaped = 0;
    const trap = useFocusTrap({ containerRef, active, onEscape: () => { escaped++; } });
    deactivators.push(() => { active.value = false; trap.deactivate(); });

    await nextTick();
    await Promise.resolve();

    dispatchKey('Escape');
    expect(escaped).toBe(1);
  });

  it('no-op when active=false — Tab is not intercepted', async () => {
    const containerRef = ref<HTMLElement | null>(container);
    const active = ref(false);
    const trap = useFocusTrap({ containerRef, active });
    deactivators.push(() => { active.value = false; trap.deactivate(); });

    await nextTick();
    const tabEvt = dispatchKey('Tab');
    expect(tabEvt.defaultPrevented).toBe(false);
  });
});
