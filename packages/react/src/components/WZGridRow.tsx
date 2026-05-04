// packages/react/src/components/WZGridRow.tsx
import React from 'react';
import type { Column } from '@wezon/wz-grid-core';
import { WZGridCell } from './WZGridCell';

export interface WZGridRowProps {
  row: Record<string, any>;
  columns: Column[];
  rowIdx: number;
  isChecked?: boolean;
  showCheckbox?: boolean;
  isSelected: (colIdx: number) => boolean;
  onRowClick?: (rowIdx: number) => void;
  onCheckboxChange?: () => void;
  onCellUpdate?: (rowIdx: number, colKey: string, value: any, oldValue: any) => void;
  rowHeight?: number;
  rowClass?: (row: Record<string, any>, idx: number) => string | undefined;
}

export function WZGridRow({
  row,
  columns,
  rowIdx,
  isChecked = false,
  showCheckbox = false,
  isSelected,
  onRowClick,
  onCheckboxChange,
  onCellUpdate,
  rowHeight = 36,
  rowClass,
}: WZGridRowProps) {
  const extraClass = rowClass?.(row, rowIdx) ?? '';
  const trClass = [
    'wz-grid-tr',
    isChecked ? 'wz-grid-tr--checked' : '',
    extraClass,
  ].filter(Boolean).join(' ');

  return (
    <tr
      role="row"
      aria-rowindex={rowIdx + 1}
      aria-selected={showCheckbox ? isChecked : undefined}
      className={trClass}
      style={{ height: rowHeight }}
      onClick={() => onRowClick?.(rowIdx)}
    >
      {showCheckbox && (
        <td
          className="wz-grid-td wz-grid-td--checkbox"
          style={{ width: 40, minWidth: 40, background: isChecked ? '#eff6ff' : undefined }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <input
              type="checkbox"
              className="wz-checkbox"
              checked={isChecked}
              onChange={onCheckboxChange}
              aria-label="행 선택"
            />
          </div>
        </td>
      )}
      {columns.map((col, colIdx) => (
        <WZGridCell
          key={col.key}
          col={col}
          row={row}
          rowIdx={rowIdx}
          colIdx={colIdx}
          isSelected={isSelected(colIdx)}
          onCellUpdate={onCellUpdate}
          style={{ width: col.width ?? 120, minWidth: col.width ?? 120 }}
        />
      ))}
    </tr>
  );
}
