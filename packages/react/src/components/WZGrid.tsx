// packages/react/src/components/WZGrid.tsx
// React 그리드: 정렬·필터·체크박스·페이징·가상스크롤·텍스트편집·트리·Undo/Redo·클립보드·컬럼설정·행확장·i18n
import React, { useRef, useCallback, useEffect, useState } from 'react';
import type { Column, GridRow, SortConfig, CellUpdateEvent, Locale, Messages } from '@wezon/wz-grid-core';
import { useSort } from '../hooks/useSort';
import { useFilter } from '../hooks/useFilter';
import { usePaging } from '../hooks/usePaging';
import { useVirtualScroll } from '../hooks/useVirtualScroll';
import { useSelection } from '../hooks/useSelection';
import { useCheckbox } from '../hooks/useCheckbox';
import { useTree } from '../hooks/useTree';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { useClipboard } from '../hooks/useClipboard';
import { useColumnSettings } from '../hooks/useColumnSettings';
import { useI18n } from '../hooks/useI18n';
import { WZGridHeader } from './WZGridHeader';
import { WZGridRow } from './WZGridRow';
import { WZGridDetailRow } from './WZGridDetailRow';
import { WZGridColumnSettings } from './WZGridColumnSettings';

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
  /** 빈 상태 메시지 (deprecated: messages.state.empty 사용 권장) */
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

  // ── 트리 ─────────────────────────────────────────────────────────────────────
  /** 트리 모드 활성화. rows에 children 필드가 있어야 합니다. */
  useTreeMode?: boolean;
  /** 트리 자식 노드 키 (기본: 'children') */
  treeKey?: string;

  // ── Undo/Redo ─────────────────────────────────────────────────────────────────
  /** Undo/Redo 활성화. Ctrl+Z / Ctrl+Y(Ctrl+Shift+Z) 단축키 등록 */
  useUndoRedo?: boolean;
  /** Undo/Redo 최대 히스토리 깊이 (기본: 50) */
  undoRedoMaxDepth?: number;
  /** Undo 실행 콜백 */
  onUndo?: (event: CellUpdateEvent) => void;
  /** Redo 실행 콜백 */
  onRedo?: (event: CellUpdateEvent) => void;

  // ── 클립보드 ──────────────────────────────────────────────────────────────────
  /** 클립보드 복사/붙여넣기 활성화 (Ctrl+C, Ctrl+V) */
  useClipboard?: boolean;

  // ── 컬럼 표시/숨김 ───────────────────────────────────────────────────────────
  /** 컬럼 표시/숨김 설정 버튼 활성화 */
  useColumnSettings?: boolean;

  // ── 행 확장 ───────────────────────────────────────────────────────────────────
  /** 행 확장 내용 렌더 함수. 지정 시 각 행에 토글 버튼이 표시됩니다. */
  renderDetail?: (row: GridRow) => React.ReactNode;

  // ── i18n ─────────────────────────────────────────────────────────────────────
  /** 로케일 ('ko' | 'en', 기본: 'ko') */
  locale?: Locale;
  /** 메시지 오버라이드 */
  messages?: Partial<Messages>;

  // ── 내보내기 버튼 (선택 표시) ─────────────────────────────────────────────────
  /** 엑셀 내보내기 버튼 클릭 시 호출. 지정 시 툴바에 버튼 표시 */
  onExportExcel?: () => void;
  /** CSV 내보내기 버튼 클릭 시 호출. 지정 시 툴바에 버튼 표시 */
  onExportCsv?: () => void;
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
  emptyText,
  onRowClick,
  onSort,
  onCellUpdate,
  onCheckedChange,
  rowClass,
  // 트리
  useTreeMode = false,
  treeKey = 'children',
  // Undo/Redo
  useUndoRedo: enableUndoRedo = false,
  undoRedoMaxDepth = 50,
  onUndo,
  onRedo,
  // 클립보드
  useClipboard: enableClipboard = false,
  // 컬럼 설정
  useColumnSettings: enableColumnSettings = false,
  // 행 확장
  renderDetail,
  // i18n
  locale = 'ko',
  messages,
  // 내보내기
  onExportExcel,
  onExportCsv,
}: WZGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // ── i18n ───────────────────────────────────────────────────────────────────
  const { t } = useI18n({ locale, messages });

  // ── 컬럼 설정 (표시/숨김) ──────────────────────────────────────────────────
  const {
    isOpen: isColSettingsOpen,
    toggleOpen: toggleColSettings,
    closePanel: closeColSettings,
    isColVisible,
    toggleColVisibility,
    showAllColumns,
    getVisibleColumns,
  } = useColumnSettings();

  const visibleColumns = enableColumnSettings ? getVisibleColumns(columns) : columns;

  // ── 정렬 ───────────────────────────────────────────────────────────────────
  const { sortConfigs, sortedRows, toggleSort } = useSort(rows, {
    isServerSide: serverSide,
    columns,
    onSort,
  });

  // ── 트리 ───────────────────────────────────────────────────────────────────
  const {
    flatItems: treeItems,
    toggleNode,
    isExpanded: isTreeExpanded,
  } = useTree(sortedRows, {
    childrenKey: treeKey,
  });

  // ── 필터 ───────────────────────────────────────────────────────────────────
  // 트리 모드에서는 DataItem의 row를 꺼내 필터를 적용하고, 결과를 다시 DataItem 형태로 유지
  const treeRowsForFilter = useTreeMode
    ? treeItems.map((item) => item.row as GridRow)
    : null;

  const { filteredRows: filteredPlainRows } = useFilter(
    useTreeMode ? (treeRowsForFilter as GridRow[]) : (sortedRows as GridRow[]),
    visibleColumns,
    enableFilter
  );

  // 트리 모드: filteredPlainRows 기준으로 DataItem 메타 복원
  const filteredRows: GridRow[] = useTreeMode
    ? filteredPlainRows.map((row) => {
        const item = treeItems.find((ti) => ti.row.id === (row as GridRow).id);
        // DataItem 메타를 row에 __level, __hasChildren으로 주입
        return { ...row, __level: item?.level ?? 0, __hasChildren: item?.hasChildren ?? false } as GridRow;
      })
    : (filteredPlainRows as GridRow[]);

  // ── 페이징 ─────────────────────────────────────────────────────────────────
  const { page, pageSize, totalPages, pagedRows, setPage, setPageSize, prevPage, nextPage } =
    usePaging(filteredRows, initialPageSize);

  const displayRows = enablePaging ? pagedRows : filteredRows;

  // ── 가상 스크롤 ─────────────────────────────────────────────────────────────
  const containerHeight = height ? height - rowHeight - (enablePaging ? 44 : 0) : 400;
  const { visibleRange, padding, onScroll } = useVirtualScroll(displayRows.length, {
    rowHeight,
    viewportHeight: containerHeight,
    enabled: enableVirtualScroll && !loading,
  });

  const visibleRows = enableVirtualScroll
    ? displayRows.slice(visibleRange.startIdx, visibleRange.endIdx)
    : displayRows;

  // ── 선택 ───────────────────────────────────────────────────────────────────
  const { selection, isSelected } = useSelection();

  // ── 체크박스 ────────────────────────────────────────────────────────────────
  const { isAllChecked, isIndeterminate, isRowChecked, toggleAll, toggleRow } =
    useCheckbox(onCheckedChange as ((rows: any[]) => void) | undefined);

  const handleToggleAll = useCallback(() => {
    toggleAll(filteredRows, rows);
  }, [toggleAll, filteredRows, rows]);

  const handleToggleRow = useCallback(
    (id: any) => toggleRow(id, rows),
    [toggleRow, rows]
  );

  // ── Undo/Redo ──────────────────────────────────────────────────────────────
  const {
    push: pushHistory,
    undo,
    redo,
  } = useUndoRedo(undoRedoMaxDepth);

  // ── 행 확장 ─────────────────────────────────────────────────────────────────
  const [expandedDetailIds, setExpandedDetailIds] = useState<Set<any>>(new Set());

  const toggleDetail = useCallback((id: any) => {
    setExpandedDetailIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // ── 셀 편집 ─────────────────────────────────────────────────────────────────
  const handleCellUpdate = useCallback(
    (rowIdx: number, colKey: string, value: any, oldValue: any) => {
      const absRow = displayRows[rowIdx];
      if (!absRow) return;
      const absRowIdx = rows.findIndex(r => r.id === absRow.id);
      const event: CellUpdateEvent = {
        rowIdx: absRowIdx,
        row: absRow as GridRow,
        colKey,
        key: colKey as any,
        value,
        oldValue,
      };
      // Undo/Redo history push
      if (enableUndoRedo) {
        pushHistory({ rowId: absRow.id, colKey, oldValue, newValue: value });
      }
      onCellUpdate?.(event);
    },
    [displayRows, rows, onCellUpdate, enableUndoRedo, pushHistory]
  );

  // ── 클립보드 ────────────────────────────────────────────────────────────────
  const { handleCopy, handlePaste } = useClipboard({
    enabled: enableClipboard,
    selection,
    columns: visibleColumns,
    rows: displayRows as GridRow[],
    onCellUpdate,
  });

  // ── 키보드 단축키 (Undo/Redo + 클립보드) ────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl+Z → Undo
      if (enableUndoRedo && ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const entry = undo();
        if (entry && onUndo) {
          const row = rows.find(r => r.id === entry.rowId);
          if (row) {
            onUndo({
              rowIdx: rows.indexOf(row),
              row,
              colKey: entry.colKey,
              key: entry.colKey as any,
              value: entry.oldValue,
              oldValue: entry.newValue,
            });
          }
        }
        return;
      }

      // Ctrl+Y or Ctrl+Shift+Z → Redo
      if (enableUndoRedo && ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        const entry = redo();
        if (entry && onRedo) {
          const row = rows.find(r => r.id === entry.rowId);
          if (row) {
            onRedo({
              rowIdx: rows.indexOf(row),
              row,
              colKey: entry.colKey,
              key: entry.colKey as any,
              value: entry.newValue,
              oldValue: entry.oldValue,
            });
          }
        }
        return;
      }

      // 클립보드
      if (enableClipboard) {
        handleCopy(e);
        handlePaste(e);
      }
    };

    const el = containerRef.current;
    el?.addEventListener('keydown', handler);
    return () => el?.removeEventListener('keydown', handler);
  }, [
    enableUndoRedo, enableClipboard,
    undo, redo, rows, onUndo, onRedo,
    handleCopy, handlePaste,
  ]);

  // ── 렌더 ────────────────────────────────────────────────────────────────────
  const wrapperStyle: React.CSSProperties = height
    ? { height, display: 'flex', flexDirection: 'column' }
    : { display: 'flex', flexDirection: 'column' };

  const emptyMessage = emptyText ?? t('state.empty');

  // 컬럼 수 (체크박스 + 행확장 + 데이터 + 컬럼설정 버튼)
  const totalColSpan =
    visibleColumns.length +
    (showCheckbox ? 1 : 0) +
    (renderDetail ? 1 : 0) +
    (enableColumnSettings ? 1 : 0);

  return (
    <div className="wz-grid-wrapper" style={wrapperStyle}>
      {/* 내보내기 툴바 (onExportExcel/onExportCsv 지정 시) */}
      {(onExportExcel || onExportCsv) && (
        <div className="wz-grid-toolbar">
          {onExportExcel && (
            <button className="wz-toolbar-btn" onClick={onExportExcel}>
              Excel
            </button>
          )}
          {onExportCsv && (
            <button className="wz-toolbar-btn" onClick={onExportCsv}>
              {t('toolbar.csvExport')}
            </button>
          )}
        </div>
      )}

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
        {/* 컬럼 설정 패널 */}
        {enableColumnSettings && isColSettingsOpen && (
          <WZGridColumnSettings
            columns={columns}
            isColVisible={isColVisible}
            onToggle={toggleColVisibility}
            onShowAll={showAllColumns}
            onClose={closeColSettings}
            t={t}
          />
        )}

        {/* 로딩 스켈레톤 */}
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
            columns={visibleColumns}
            sortConfigs={sortConfigs}
            showCheckbox={showCheckbox}
            isAllChecked={isAllChecked(filteredRows)}
            isIndeterminate={isIndeterminate(filteredRows)}
            onSort={toggleSort}
            onToggleAll={handleToggleAll}
            rowHeight={40}
            showColumnSettings={enableColumnSettings}
            onColumnSettingsClick={toggleColSettings}
            hasDetail={!!renderDetail}
            t={t}
          />

          <tbody>
            {/* 가상 스크롤 상단 패딩 */}
            {enableVirtualScroll && padding.top > 0 && (
              <tr aria-hidden="true" style={{ height: padding.top }}>
                <td colSpan={totalColSpan} style={{ padding: 0, border: 'none' }} />
              </tr>
            )}

            {/* 데이터 행 */}
            {visibleRows.map((row, i) => {
              const absIdx = visibleRange.startIdx + i;
              const typedRow = row as GridRow;
              const rowId = typedRow.id;

              // 트리 정보 — filteredRows에 __level, __hasChildren이 주입되어 있음
              const treeDepth = useTreeMode ? ((row as any).__level ?? 0) : undefined;
              const treeHasChildren = useTreeMode ? !!((row as any).__hasChildren) : false;

              return (
                <React.Fragment key={rowId}>
                  <WZGridRow
                    row={row as Record<string, any>}
                    columns={visibleColumns}
                    rowIdx={absIdx}
                    isChecked={showCheckbox ? isRowChecked(rowId) : false}
                    showCheckbox={showCheckbox}
                    isSelected={(colIdx) => isSelected(absIdx, colIdx)}
                    onRowClick={(idx) => onRowClick?.(displayRows[idx] as GridRow, idx)}
                    onCheckboxChange={() => handleToggleRow(rowId)}
                    onCellUpdate={handleCellUpdate}
                    rowHeight={rowHeight}
                    rowClass={rowClass as any}
                    // 트리
                    treeDepth={treeDepth}
                    treeExpanded={useTreeMode ? isTreeExpanded(rowId) : undefined}
                    hasChildren={treeHasChildren}
                    onTreeToggle={useTreeMode ? () => toggleNode(rowId) : undefined}
                    // 행 확장
                    hasDetail={!!renderDetail}
                    isDetailExpanded={renderDetail ? expandedDetailIds.has(rowId) : undefined}
                    onDetailToggle={renderDetail ? () => toggleDetail(rowId) : undefined}
                    // i18n
                    ariaSelectRow={t('aria.selectRow')}
                    ariaToggleExpand={t('aria.toggleExpand')}
                    ariaToggleDetail={t('aria.toggleDetail')}
                  />
                  {/* 행 확장 상세 */}
                  {renderDetail && expandedDetailIds.has(rowId) && (
                    <WZGridDetailRow
                      row={typedRow}
                      colSpan={totalColSpan}
                      renderDetail={renderDetail}
                    />
                  )}
                </React.Fragment>
              );
            })}

            {/* 가상 스크롤 하단 패딩 */}
            {enableVirtualScroll && padding.bottom > 0 && (
              <tr aria-hidden="true" style={{ height: padding.bottom }}>
                <td colSpan={totalColSpan} style={{ padding: 0, border: 'none' }} />
              </tr>
            )}
          </tbody>
        </table>

        {/* 빈 상태 */}
        {!loading && displayRows.length === 0 && (
          <div className="wz-grid-empty" role="status">
            {emptyMessage}
          </div>
        )}
      </div>

      {/* 페이저 */}
      {enablePaging && (
        <div className="wz-grid-pager">
          <span>
            {t('pagination.filteredCount', { count: filteredRows.length })}
          </span>
          <select
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            aria-label={t('pagination.pageSize')}
          >
            {[10, 20, 50, 100].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <button onClick={prevPage} disabled={page <= 1}>
            {locale === 'en' ? 'Prev' : '이전'}
          </button>
          <span>{page} / {totalPages}</span>
          <button onClick={nextPage} disabled={page >= totalPages}>
            {locale === 'en' ? 'Next' : '다음'}
          </button>
        </div>
      )}
    </div>
  );
}
