// src/composables/usePlugins.ts
import type { WZGridPlugin, PluginHook, PluginCallback, PluginContext } from '../types/plugin';

export function usePlugins() {
  const hooks = new Map<PluginHook, PluginCallback[]>();

  const on = (hook: PluginHook, callback: PluginCallback) => {
    const arr = hooks.get(hook) ?? [];
    arr.push(callback);
    hooks.set(hook, arr);
  };

  /**
   * 등록된 훅 콜백을 모두 실행합니다.
   * 개별 콜백 에러는 격리하여 그리드 동작에 영향을 주지 않습니다.
   */
  const callHook = (hook: PluginHook, data?: any) => {
    const callbacks = hooks.get(hook);
    if (!callbacks || callbacks.length === 0) return;
    for (const cb of callbacks) {
      try { cb(data); }
      catch (e) { console.error(`[WZGrid plugin] "${hook}" hook error:`, e); }
    }
  };

  /**
   * plugins 배열로 플러그인을 초기화합니다.
   * 호출 시 기존 훅 등록이 모두 초기화됩니다.
   */
  const initPlugins = (plugins: WZGridPlugin[] = []) => {
    hooks.clear();
    const context: PluginContext = { on };
    for (const plugin of plugins) {
      try { plugin.install(context); }
      catch (e) { console.error(`[WZGrid plugin] "${plugin.name}" 설치 실패:`, e); }
    }
  };

  return { callHook, initPlugins };
}
