// packages/react/src/hooks/useColumnSettings.ts
// Core createColumnSettingsEngine 래핑 — React용 컬럼 표시/숨김 Hook
import { useState, useCallback, useRef } from 'react';
import { createColumnSettingsEngine } from '@wezon/wz-grid-core';
import type { Column, ColumnSettingsEngine } from '@wezon/wz-grid-core';

export interface UseColumnSettingsReturn {
  /** 패널 열림 여부 */
  isOpen: boolean;
  /** 패널 토글 */
  toggleOpen: () => void;
  /** 패널 닫기 */
  closePanel: () => void;
  /** 숨겨진 컬럼 키 목록 */
  hiddenColKeys: string[];
  /** 특정 컬럼이 보이는지 */
  isColVisible: (key: string) => boolean;
  /** 컬럼 표시/숨김 토글 */
  toggleColVisibility: (key: string) => void;
  /** 모든 컬럼 표시 */
  showAllColumns: () => void;
  /** 필터링된 (보이는) 컬럼 목록 */
  getVisibleColumns: (columns: Column[]) => Column[];
}

export function useColumnSettings(): UseColumnSettingsReturn {
  const engineRef = useRef<ColumnSettingsEngine>(createColumnSettingsEngine());
  const [hiddenColKeys, setHiddenColKeys] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const sync = () => setHiddenColKeys(engineRef.current.getHiddenColKeys());

  const toggleOpen = useCallback(() => {
    const next = !engineRef.current.isOpen();
    engineRef.current.setOpen(next);
    setIsOpen(next);
  }, []);

  const closePanel = useCallback(() => {
    engineRef.current.setOpen(false);
    setIsOpen(false);
  }, []);

  const isColVisible = useCallback(
    (key: string) => !hiddenColKeys.includes(key),
    [hiddenColKeys]
  );

  const toggleColVisibility = useCallback((key: string) => {
    engineRef.current.toggleColVisibility(key);
    sync();
  }, []);

  const showAllColumns = useCallback(() => {
    const engine = engineRef.current;
    // 모든 숨겨진 컬럼을 하나씩 다시 보이게
    [...engine.getHiddenColKeys()].forEach(k => engine.toggleColVisibility(k));
    sync();
  }, []);

  const getVisibleColumns = useCallback(
    (columns: Column[]) => engineRef.current.getVisibleColumns(columns),
    [hiddenColKeys] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return {
    isOpen,
    toggleOpen,
    closePanel,
    hiddenColKeys,
    isColVisible,
    toggleColVisibility,
    showAllColumns,
    getVisibleColumns,
  };
}
