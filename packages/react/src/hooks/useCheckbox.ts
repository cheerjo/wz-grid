// packages/react/src/hooks/useCheckbox.ts
import { useState, useCallback, useRef } from 'react';
import { createCheckboxEngine } from '@wezon/wz-grid-core';
import type { CheckboxEngine } from '@wezon/wz-grid-core';

export interface UseCheckboxReturn {
  /** 체크된 id Set */
  checkedIds: Set<any>;
  /** 체크된 행 수 */
  checkedCount: number;
  /** 전체 체크 여부 */
  isAllChecked: (filteredRows: any[]) => boolean;
  /** 중간(indeterminate) 여부 */
  isIndeterminate: (filteredRows: any[]) => boolean;
  /** 특정 행 체크 여부 */
  isRowChecked: (id: any) => boolean;
  /** 전체 체크 토글 */
  toggleAll: (filteredRows: any[], allRows: any[]) => void;
  /** 단일 행 체크 토글 */
  toggleRow: (id: any, allRows: any[]) => void;
  /** 체크 상태 초기화 */
  reset: () => void;
}

export function useCheckbox(
  onCheckedChange?: (checked: any[]) => void
): UseCheckboxReturn {
  const engineRef = useRef<CheckboxEngine>(createCheckboxEngine());
  const [checkedIds, setCheckedIds] = useState<Set<any>>(new Set());

  const sync = () => setCheckedIds(new Set(engineRef.current.getCheckedIds()));

  const isAllChecked = useCallback(
    (filteredRows: any[]) => engineRef.current.isAllChecked(filteredRows),
    [checkedIds] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const isIndeterminate = useCallback(
    (filteredRows: any[]) => engineRef.current.isIndeterminate(filteredRows),
    [checkedIds] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const isRowChecked = useCallback(
    (id: any) => engineRef.current.isRowChecked(id),
    [checkedIds] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const toggleAll = useCallback(
    (filteredRows: any[], allRows: any[]) => {
      engineRef.current.toggleAll(filteredRows, allRows, (checked) => {
        onCheckedChange?.(checked);
      });
      sync();
    },
    [onCheckedChange] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const toggleRow = useCallback(
    (id: any, allRows: any[]) => {
      engineRef.current.toggleRow(id, allRows, (checked) => {
        onCheckedChange?.(checked);
      });
      sync();
    },
    [onCheckedChange] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const reset = useCallback(() => {
    engineRef.current.reset();
    sync();
  }, []);

  return {
    checkedIds,
    checkedCount: checkedIds.size,
    isAllChecked,
    isIndeterminate,
    isRowChecked,
    toggleAll,
    toggleRow,
    reset,
  };
}
