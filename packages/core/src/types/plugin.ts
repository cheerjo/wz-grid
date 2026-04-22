// packages/core/src/types/plugin.ts

/** 플러그인이 등록할 수 있는 라이프사이클 훅 이름 */
export type PluginHook = 'beforeRender' | 'afterSort' | 'afterFilter' | 'cellRender';

/** 훅 콜백 함수 타입 */
export type PluginCallback<T = any> = (data: T) => void;

/** 훅 별 콜백 데이터 타입 */
export interface PluginHookData {
  beforeRender: { items: any[] };
  afterSort:    { rows: any[]; sortConfigs: any[] };
  afterFilter:  { rows: any[] };
  cellRender:   { row: any; colKey: string; value: any };
}

/**
 * WZGrid 플러그인 설치 컨텍스트.
 * `install()` 내에서 `on()`으로 라이프사이클 훅을 등록합니다.
 */
export interface PluginContext {
  /**
   * 라이프사이클 훅을 등록합니다.
   * @param hook 훅 이름
   * @param callback 훅 실행 시 호출될 콜백
   */
  on<H extends PluginHook>(hook: H, callback: PluginCallback<PluginHookData[H]>): void;
}

/**
 * WZGrid 플러그인 인터페이스.
 *
 * @example
 * const myPlugin: WZGridPlugin = {
 *   name: 'my-plugin',
 *   install(ctx) {
 *     ctx.on('afterSort', ({ rows }) => console.log('sorted:', rows.length));
 *     ctx.on('afterFilter', ({ rows }) => console.log('filtered:', rows.length));
 *   }
 * };
 */
export interface WZGridPlugin {
  /** 플러그인 고유 이름 */
  name: string;
  /** 플러그인 설치. PluginContext로 훅 등록 등 초기화 로직을 수행합니다. */
  install(context: PluginContext): void;
}
