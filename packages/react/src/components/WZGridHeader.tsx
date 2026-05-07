// packages/react/src/components/WZGridHeader.tsx
import React from 'react';
import type { Column, SortConfig } from '@wezon/wz-grid-core';
import type { TFunction } from '@wezon/wz-grid-core';

export interface WZGridHeaderProps {
  columns: Column[];
  sortConfigs: SortConfig[];
  showCheckbox?: boolean;
  isAllChecked: boolean;
  isIndeterminate: boolean;
  onSort: (key: string, shiftKey: boolean) => void;
  onToggleAll: () => void;
  rowHeight?: number;
  /** 컬럼 설정 버튼 표시 여부 */
  showColumnSettings?: boolean;
  /** 컬럼 설정 버튼 클릭 핸들러 */
  onColumnSettingsClick?: () => void;
  /** 행 확장 컬럼 표시 여부 */
  hasDetail?: boolean;
  /** 번역 함수 */
  t?: TFunction;
  /** 전체 선택 aria-label */
  ariaSelectAll?: string;
}

function SortIcon({ order }: { order: 'asc' | 'desc' }) {
  return (
    <span className="wz-sort-icon" aria-hidden="true">
      {order === 'asc' ? '▲' : '▼'}
    </span>
  );
}

export function WZGridHeader({
  columns,
  sortConfigs,
  showCheckbox = false,
  isAllChecked,
  isIndeterminate,
  onSort,
  onToggleAll,
  rowHeight = 40,
  showColumnSettings = false,
  onColumnSettingsClick,
  hasDetail = false,
  t,
  ariaSelectAll,
}: WZGridHeaderProps) {
  const getSortEntry = (key: string) => sortConfigs.find(s => s.key === key);
  const getSortIndex = (key: string) => sortConfigs.findIndex(s => s.key === key);

  const getAriaSortAttr = (key: string): 'ascending' | 'descending' | 'none' => {
    const entry = getSortEntry(key);
    if (!entry) return 'none';
    return entry.order === 'asc' ? 'ascending' : 'descending';
  };

  const checkboxRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const selectAllLabel = ariaSelectAll ?? (t ? t('aria.selectAll') : '전체 선택');
  const colSettingsLabel = t ? t('toolbar.columnSettings') : '컬럼 설정';

  return (
    <thead className="wz-grid-thead">
      <tr role="row">
        {showCheckbox && (
          <th
            className="wz-grid-th wz-grid-th--checkbox"
            style={{ width: 40, minWidth: 40, height: rowHeight }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <input
                ref={checkboxRef}
                type="checkbox"
                className="wz-checkbox"
                checked={isAllChecked}
                onChange={onToggleAll}
                aria-label={selectAllLabel}
              />
            </div>
          </th>
        )}

        {/* 행 확장 헤더 셀 */}
        {hasDetail && (
          <th
            className="wz-grid-th"
            style={{ width: 32, minWidth: 32, height: rowHeight, cursor: 'default' }}
            aria-hidden="true"
          />
        )}

        {columns.map((col) => {
          const entry = getSortEntry(col.key);
          const sortIdx = getSortIndex(col.key);
          const isSorted = !!entry;
          const multiSort = sortConfigs.length > 1;

          return (
            <th
              key={col.key}
              role="columnheader"
              scope="col"
              aria-sort={getAriaSortAttr(col.key)}
              className={[
                'wz-grid-th',
                isSorted ? 'wz-grid-th--sorted' : '',
                col.pinned ? 'wz-grid-th--pinned' : '',
              ].filter(Boolean).join(' ')}
              style={{
                width: col.width ?? 120,
                minWidth: col.width ?? 120,
                height: rowHeight,
                textAlign: (col.headerAlign ?? col.align ?? 'left') as any,
                // pinned: sticky
                ...(col.pinned ? {
                  position: 'sticky',
                  left: 0,
                  zIndex: 31,
                } : {}),
              }}
              onClick={(e) => onSort(col.key, e.shiftKey)}
            >
              {col.title}
              {isSorted && <SortIcon order={entry!.order} />}
              {isSorted && multiSort && (
                <sup style={{ fontSize: '0.6em', color: '#6b7280', marginLeft: 1 }}>
                  {sortIdx + 1}
                </sup>
              )}
            </th>
          );
        })}

        {/* 컬럼 설정 버튼 셀 */}
        {showColumnSettings && (
          <th
            className="wz-grid-th wz-grid-th--col-settings"
            style={{ width: 36, minWidth: 36, height: rowHeight, cursor: 'default', padding: 0 }}
          >
            <button
              className="wz-col-settings-btn"
              onClick={onColumnSettingsClick}
              aria-label={colSettingsLabel}
              title={colSettingsLabel}
            >
              ⚙
            </button>
          </th>
        )}
      </tr>
    </thead>
  );
}
