// packages/react/src/hooks/useClipboard.ts
// Core buildCopyText / parsePasteData 래핑 — React용 클립보드 Hook
import { useCallback } from 'react';
import { buildCopyText, parsePasteData } from '@wezon/wz-grid-core';
import type { Selection, Column, CellUpdateEvent, GridRow } from '@wezon/wz-grid-core';

export interface UseClipboardOptions {
  /** 활성화 여부 */
  enabled: boolean;
  /** 현재 셀 선택 범위 */
  selection: Selection;
  /** 보이는 컬럼 목록 */
  columns: Column[];
  /** 현재 표시 중인 행 목록 */
  rows: GridRow[];
  /** 셀 업데이트 콜백 */
  onCellUpdate?: (event: CellUpdateEvent) => void;
}

export interface UseClipboardReturn {
  /** Ctrl+C 핸들러 (keydown 이벤트에서 호출) */
  handleCopy: (e: KeyboardEvent) => void;
  /** Ctrl+V 핸들러 (keydown 이벤트에서 호출) */
  handlePaste: (e: KeyboardEvent) => void;
}

export function useClipboard({
  enabled,
  selection,
  columns,
  rows,
  onCellUpdate,
}: UseClipboardOptions): UseClipboardReturn {
  const handleCopy = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'c') return;

      const activeEl = document.activeElement;
      const tagName = activeEl?.tagName ?? null;
      const text = buildCopyText(selection, columns, rows, tagName);
      if (text === null) return; // 편집 중 input에서 기본 동작 위임

      e.preventDefault();
      navigator.clipboard.writeText(text).catch(() => {
        // clipboard API 실패 시 무시 (권한 없음 등)
      });
    },
    [enabled, selection, columns, rows]
  );

  const handlePaste = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'v') return;

      const activeEl = document.activeElement;
      const tagName = activeEl?.tagName ?? null;
      if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') return;

      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const updates = parsePasteData(text, selection, columns, rows.length, null);
        if (!updates) return;
        updates.forEach(({ rowIdx, colKey, value }) => {
          const row = rows[rowIdx];
          if (!row) return;
          const oldValue = (row as Record<string, any>)[colKey];
          onCellUpdate?.({
            rowIdx,
            row: row as GridRow,
            colKey,
            key: colKey as any,
            value,
            oldValue,
          });
        });
      }).catch(() => {
        // clipboard read 실패 시 무시
      });
    },
    [enabled, selection, columns, rows, onCellUpdate]
  );

  return { handleCopy, handlePaste };
}
