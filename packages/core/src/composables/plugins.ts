// packages/core/src/composables/plugins.ts
// No Vue dependency — pure TypeScript
import type { WZGridPlugin, PluginHook, PluginCallback, PluginContext } from '../types/plugin';

export interface PluginEngine {
  callHook: (hook: PluginHook, data?: any) => void;
  initPlugins: (plugins?: WZGridPlugin[]) => void;
}

export function createPluginEngine(): PluginEngine {
  const hooks = new Map<PluginHook, PluginCallback[]>();

  const on = (hook: PluginHook, callback: PluginCallback) => {
    const arr = hooks.get(hook) ?? [];
    arr.push(callback);
    hooks.set(hook, arr);
  };

  const callHook = (hook: PluginHook, data?: any) => {
    const callbacks = hooks.get(hook);
    if (!callbacks || callbacks.length === 0) return;
    for (const cb of callbacks) {
      try { cb(data); }
      catch (e) { console.error(`[WZGrid plugin] "${hook}" hook error:`, e); }
    }
  };

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
