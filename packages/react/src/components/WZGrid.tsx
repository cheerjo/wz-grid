// packages/react/src/components/WZGrid.tsx
// React 최소 기능 그리드: 정렬·필터·체크박스·페이징·가상스크롤·텍스트편집
import React, { useRef, useCallback } from 'react';
import type { Column, GridRow, SortConfig, CellUpdateEvent } from '@wezon/wz-grid-core';
import { useSort } from '../hooks/useSort';
import { useFilter } from '../hooks/useFilter';
import { usePaging } from '../hooks/usePaging';
import { useVirtualScroll } from '../hooks/useVirtualScroll';
import { useSelection } from '../hooks/useSelection';
import { useCheckbox } from '../hooks/useCheckbox';
import { WZGridHeader } from './WZGridHeader';
import { WZGridRow } from './WZGridRow';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface WZGridProps {
  /** 행 데이터 배열. 각 행은 반드시 `id` 필드를 포함해야 합니다. */
  rows: GridRow[];
  /** 컬럼 정의 배열 */
  columns: Column[];
  /** 그리드 높이 (px). 미지정 시 컨테이너를 채웁니다. */
  height?: number;
  /** 행 높이 (px, 기본값: 36) */
  rowHeight?: number;
  /** 체크박스 컬럼 표시 여부 */
  showCheckbox?: boolean;
  /** 페이징 활성화 여부 */
  usePaging?: boolean;
  /** 초기 페이지 크기 (기본값: 50) */
  pageSize?: number;
  /** 가상 스크롤 활성화 여부 (기본값: true) */
  useVirtualScroll?: boolean;
  /** 필터 활성화 여부 */
  useFilter?: boolean;
  /** 서버사이드 모드 (정렬/필터를 서버에서 처리) */
  serverSide?: boolean;
  /** 로딩 상태 */
  loading?: boolean;
  /** 빈 상태 메시지 */
  emptyText?: string;
  /** 행 클릭 이벤트 */
  onRowClick?: (row: GridRow, rowIdx: number) => void;
  /** 정렬 변경 이벤트 (serverSide 모드에서 사용) */
  onSort?: (configs: SortConfig[]) => void;
  /** 셀 값 변경 이벤트 */
  onCellUpdate?: (event: CellUpdateEvent) => void;
  /** 체크된 행 목록 변경 이벤트 */
  onCheckedChange?: (rows: GridRow[]) => void;
  /** 행별 커스텀 CSS 클래스 함수 */
  rowClass?: (row: GridRow, idx: number) => string | undefined;
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

export function WZGrid({
  rows,
  columns,
  height,
  rowHeight = 36,
  showCheckbox = false,
  usePaging: enablePaging = false,
  pageSize: initialPageSize = 50,
  useVirtualScroll: enableVirtualScroll = true,
  useFilter: enableFilter = false,
  serverSide = false,
  loading = false,
  emptyText = '데이터가 없습니다.',
  onRowClick,
  onSort,
  onCellUpdate,
  onCheckedChange,
  rowClass,
}: WZGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // ── 정렬 ───────────────────────────────────────────────────────────────────
  const {
    sortConfigs,
    sortedRows,
    getSortEntry,
    toggleSort,
  } = useSort(rows, { isServerSide: serverSide, columns, onSort });

  // ── 필터 ───────────────────────────────────────────────────────────────────
  const {
    filteredRows,
  } = useFilter(sortedRows, columns, enableFilter);

  // ── 페이징 ─────────────────────────────────────────────────────────────────
  const {
    page,
    pageSize,
    totalPages,
    pagedRows,
    setPage,
    setPageSize,
    prevPage,
    nextPage,
  } = usePaging(filteredRows, initialPageSize);

  // 페이징 미사용 시 전체 rows 사용
  const displayRows = enablePaging ? pagedRows : filteredRows;

  // ── 가상 스크롤 ─────────────────────────────────────────────────────────────
  const containerHeight = height ? height - rowHeight - (enablePaging ? 44 : 0) : 400;

  const {
    visibleRange,
    padding,
    onScroll,
  } = useVirtualScroll(displayRows.length, {
    rowHeight,
    viewportHeight: containerHeight,
    enabled: enableVirtualScroll && !loading,
  });

  const visibleRows = enableVirtualScroll
    ? displayRows.slice(visibleRange.startIdx, visibleRange.endIdx)
    : displayRows;

  // ── 선택 ───────────────────────────────────────────────────────────────────
  const {
    isSelected,
  } = useSelection();

  // ── 체크박스 ────────────────────────────────────────────────────────────────
  const {
    isAllChecked,
    isIndeterminate,
    isRowChecked,
    toggleAll,
    toggleRow,
  } = useCheckbox(onCheckedChange as ((rows: any[]) => void) | undefined);

  const handleToggleAll = useCallback(() => {
    toggleAll(filteredRows, rows);
  }, [toggleAll, filteredRows, rows]);

  const handleToggleRow = useCallback(
    (id: any) => toggleRow(id, rows),
    [toggleRow, rows]
  );

  // ── 셀 편집 ─────────────────────────────────────────────────────────────────
  const handleCellUpdate = useCallback(
    (rowIdx: number, colKey: string, value: any, oldValue: any) => {
      const absRow = displayRows[rowIdx];
      if (!absRow) return;
      const absRowIdx = rows.findIndex(r => r.id === absRow.id);
      onCellUpdate?.({ rowIdx: absRowIdx, row: absRow as GridRow, colKey, key: colKey as any, value, oldValue });
    },
    [displayRows, rows, onCellUpdate]
  );

  // ── 렌더 ────────────────────────────────────────────────────────────────────
  const wrapperStyle: React.CSSProperties = height ? { height, display: 'flex', flexDirection: 'column' } : { display: 'flex', flexDirection: 'column' };

  return (
    <div className="wz-grid-wrapper" style={wrapperStyle}>
      {/* 그리드 컨테이너 */}
      <div
        ref={containerRef}
        className="wz-grid-container"
        style={{ flex: '1 1 0%', position: 'relative', outline: 'none' }}
        onScroll={onScroll}
        tabIndex={0}
        role="grid"
        aria-busy={loading ? 'true' : 'false'}
        aria-rowcount={filteredRows.length}
      >
        {/* 로딩 */}
        {loading && (
          <div className="wz-grid-loading">
            <div style={{ width: '100%', padding: '0 16px' }}>
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className="wz-skeleton"
                  style={{ width: `${70 + (i * 13) % 25}%` }}
                />
              ))}
            </div>
          </div>
        )}

        <table className="wz-grid-table" style={{ tableLayout: 'fixed', width: '100%' }}>
          <WZGridHeader
            columns={columns}
            sortConfigs={sortConfigs}
            showCheckbox={showCheckbox}
            isAllChecked={isAllChecked(filteredRows)}
            isIndeterminate={isIndeterminate(filteredRows)}
            onSort={toggleSort}
            onToggleAll={handleToggleAll}
            rowHeight={40}
          />

          <tbody>
            {/* 가상 스크롤 상단 패딩 */}
            {enableVirtualScroll && padding.top > 0 && (
              <tr aria-hidden="true" style={{ height: padding.top }}>
                <td colSpan={columns.length + (showCheckbox ? 1 : 0)} style={{ padding: 0, border: 'none' }} />
              </tr>
            )}

            {/* 데이터 행 */}
            {visibleRows.map((row, i) => {
              const absIdx = visibleRange.startIdx + i;
              return (
                <WZGridRow
                  key={row.id}
                  row={row}
                  columns={columns}
                  rowIdx={absIdx}
                  isChecked={showCheckbox ? isRowChecked(row.id) : false}
                  showCheckbox={showCheckbox}
                  isSelected={(colIdx) => isSelected(absIdx, colIdx)}
                  onRowClick={(idx) => onRowClick?.(displayRows[idx] as GridRow, idx)}
                  onCheckboxChange={() => handleToggleRow(row.id)}
                  onCellUpdate={handleCellUpdate}
                  rowHeight={rowHeight}
                  rowClass={rowClass as any}
                />
              );
            })}

            {/* 가상 스크롤 하단 패딩 */}
            {enableVirtualScroll && padding.bottom > 0 && (
              <tr aria-hidden="true" style={{ height: padding.bottom }}>
                <td colSpan={columns.length + (showCheckbox ? 1 : 0)} style={{ padding: 0, border: 'none' }} />
              </tr>
            )}
          </tbody>
        </table>

        {/* 빈 상태 */}
        {!loading && displayRows.length === 0 && (
          <div className="wz-grid-empty" role="status">
            {emptyText}
          </div>
        )}
      </div>

      {/* 페이저 */}
      {enablePaging && (
        <div className="wz-grid-pager">
          <span>총 {filteredRows.length}건</span>
          <select
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            aria-label="페이지 크기"
          >
            {[10, 20, 50, 100].map(n => (
              <option key={n} value={n}>{n}개</option>
            ))}
          </select>
          <button onClick={prevPage} disabled={page <= 1}>이전</button>
          <span>{page} / {totalPages}</span>
          <button onClick={nextPage} disabled={page >= totalPages}>다음</button>
        </div>
      )}
    </div>
  );
}
