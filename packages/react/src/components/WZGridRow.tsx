// packages/react/src/components/WZGridRow.tsx
import React from 'react';
import type { Column, GridRow } from '@wezon/wz-grid-core';
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
  // ── 트리 ──────────────────────────────────────────────────
  /** 트리 모드에서 노드 깊이 (0-based). undefined이면 트리 비활성 */
  treeDepth?: number;
  /** 트리 노드가 펼쳐져 있는지 */
  treeExpanded?: boolean;
  /** 자식 노드 존재 여부 */
  hasChildren?: boolean;
  /** 트리 토글 핸들러 */
  onTreeToggle?: () => void;
  // ── 행 확장 ───────────────────────────────────────────────
  /** renderDetail prop이 있을 때 상세행이 펼쳐져 있는지 */
  isDetailExpanded?: boolean;
  /** 상세 행 토글 핸들러 */
  onDetailToggle?: () => void;
  /** 상세 행 렌더 여부 (renderDetail prop이 전달됐을 때 true) */
  hasDetail?: boolean;
  // ── 번역 ──────────────────────────────────────────────────
  /** 행 선택 aria-label */
  ariaSelectRow?: string;
  /** 펼치기/접기 aria-label */
  ariaToggleExpand?: string;
  /** 상세 보기 토글 aria-label */
  ariaToggleDetail?: string;
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
  treeDepth,
  treeExpanded,
  hasChildren,
  onTreeToggle,
  isDetailExpanded,
  onDetailToggle,
  hasDetail,
  ariaSelectRow = '행 선택',
  ariaToggleExpand = '펼치기/접기',
  ariaToggleDetail = '상세 보기 토글',
}: WZGridRowProps) {
  const extraClass = rowClass?.(row, rowIdx) ?? '';
  const trClass = [
    'wz-grid-tr',
    isChecked ? 'wz-grid-tr--checked' : '',
    extraClass,
  ].filter(Boolean).join(' ');

  const isTreeMode = treeDepth !== undefined;

  return (
    <tr
      role="row"
      aria-rowindex={rowIdx + 1}
      aria-selected={showCheckbox ? isChecked : undefined}
      aria-expanded={isDetailExpanded !== undefined ? isDetailExpanded : undefined}
      className={trClass}
      style={{ height: rowHeight }}
      onClick={() => onRowClick?.(rowIdx)}
    >
      {/* 체크박스 셀 */}
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
              aria-label={ariaSelectRow}
            />
          </div>
        </td>
      )}

      {/* 행 확장 토글 버튼 셀 */}
      {hasDetail && (
        <td
          className="wz-grid-td wz-grid-td--detail-toggle"
          style={{ width: 32, minWidth: 32, textAlign: 'center', cursor: 'pointer' }}
          onClick={e => { e.stopPropagation(); onDetailToggle?.(); }}
        >
          <button
            className="wz-tree-toggle"
            aria-label={ariaToggleDetail}
            aria-expanded={isDetailExpanded}
            onClick={e => { e.stopPropagation(); onDetailToggle?.(); }}
          >
            {isDetailExpanded ? '▾' : '▸'}
          </button>
        </td>
      )}

      {/* 데이터 셀 */}
      {columns.map((col, colIdx) => {
        const isFirstCol = colIdx === 0;
        return (
          <WZGridCell
            key={col.key}
            col={col}
            row={row}
            rowIdx={rowIdx}
            colIdx={colIdx}
            isSelected={isSelected(colIdx)}
            onCellUpdate={onCellUpdate}
            style={{
              width: col.width ?? 120,
              minWidth: col.width ?? 120,
              // pinned: left sticky
              ...(col.pinned ? {
                position: 'sticky',
                left: 0,
                zIndex: 10,
                background: isChecked ? '#eff6ff' : '#fff',
              } : {}),
            }}
            // 트리 들여쓰기: 첫 번째 컬럼에만 적용
            treeIndent={isTreeMode && isFirstCol ? (treeDepth ?? 0) * 20 : 0}
            treeToggle={isTreeMode && isFirstCol ? {
              hasChildren: hasChildren ?? false,
              expanded: treeExpanded ?? true,
              onToggle: onTreeToggle,
              ariaLabel: ariaToggleExpand,
            } : undefined}
          />
        );
      })}
    </tr>
  );
}
