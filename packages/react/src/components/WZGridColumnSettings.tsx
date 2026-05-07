// packages/react/src/components/WZGridColumnSettings.tsx
// 컬럼 표시/숨김 설정 패널 컴포넌트
import React, { useEffect, useRef } from 'react';
import type { Column } from '@wezon/wz-grid-core';
import type { TFunction } from '@wezon/wz-grid-core';

export interface WZGridColumnSettingsProps {
  /** 전체 컬럼 목록 */
  columns: Column[];
  /** 컬럼별 표시 여부 */
  isColVisible: (key: string) => boolean;
  /** 컬럼 토글 핸들러 */
  onToggle: (key: string) => void;
  /** 전체 표시 핸들러 */
  onShowAll: () => void;
  /** 패널 닫기 핸들러 */
  onClose: () => void;
  /** 번역 함수 */
  t?: TFunction;
}

export function WZGridColumnSettings({
  columns,
  isColVisible,
  onToggle,
  onShowAll,
  onClose,
  t,
}: WZGridColumnSettingsProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // 패널 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const label = t ? t('toolbar.columnSettings') : '컬럼 설정';
  const showAllLabel = t ? t('toolbar.showAll') : '전체 표시';

  return (
    <div ref={panelRef} className="wz-col-settings-panel">
      <div className="wz-col-settings-header">
        <span>{label}</span>
        <button
          className="wz-col-settings-show-all"
          onClick={onShowAll}
        >
          {showAllLabel}
        </button>
      </div>
      <ul className="wz-col-settings-list">
        {columns.map(col => (
          <li key={col.key} className="wz-col-settings-item">
            <label>
              <input
                type="checkbox"
                className="wz-checkbox"
                checked={isColVisible(col.key)}
                onChange={() => onToggle(col.key)}
              />
              <span>{col.title}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
