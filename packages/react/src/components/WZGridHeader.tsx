// packages/react/src/components/WZGridHeader.tsx
import React from 'react';
import type { Column, SortConfig } from '@wezon/wz-grid-core';

export interface WZGridHeaderProps {
  columns: Column[];
  sortConfigs: SortConfig[];
  showCheckbox?: boolean;
  isAllChecked: boolean;
  isIndeterminate: boolean;
  onSort: (key: string, shiftKey: boolean) => void;
  onToggleAll: () => void;
  rowHeight?: number;
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
}: WZGridHeaderProps) {
  const getSortEntry = (key: string) => sortConfigs.find(s => s.key === key);
  const getSortIndex = (key: string) => sortConfigs.findIndex(s => s.key === key);

  const getAriaSortAttr = (key: string): 'ascending' | 'descending' | 'none' => {
    const entry = getSortEntry(key);
    if (!entry) return 'none';
    return entry.order === 'asc' ? 'ascending' : 'descending';
  };

  const checkboxRef = React.useRef<HTMLInputElement>(null);

  // indeterminate는 prop으로 설정 불가능하므로 ref로 처리
  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

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
                aria-label="전체 선택"
              />
            </div>
          </th>
        )}
        {columns.map((col, idx) => {
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
              className={`wz-grid-th${isSorted ? ' wz-grid-th--sorted' : ''}`}
              style={{
                width: col.width ?? 120,
                minWidth: col.width ?? 120,
                height: rowHeight,
                textAlign: (col.headerAlign ?? col.align ?? 'left') as any,
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
      </tr>
    </thead>
  );
}
