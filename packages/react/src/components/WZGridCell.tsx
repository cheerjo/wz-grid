// packages/react/src/components/WZGridCell.tsx
import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import type { Column } from '@wezon/wz-grid-core';
import { NON_EDITABLE_TYPES } from '@wezon/wz-grid-core';

export interface WZGridCellProps {
  col: Column;
  row: Record<string, any>;
  rowIdx: number;
  colIdx: number;
  isSelected: boolean;
  onCellUpdate?: (rowIdx: number, colKey: string, value: any, oldValue: any) => void;
  onStartEdit?: () => void;
  onEndEdit?: () => void;
  style?: React.CSSProperties;
  className?: string;
  /** 트리 들여쓰기 (px). 0이면 적용 안 함 */
  treeIndent?: number;
  /** 트리 토글 버튼 정보. undefined이면 렌더 안 함 */
  treeToggle?: {
    hasChildren: boolean;
    expanded: boolean;
    onToggle?: () => void;
    ariaLabel?: string;
  };
}

/** 컬럼 타입별 셀 읽기 전용 렌더 */
function CellDisplay({ col, value }: { col: Column; value: any }) {
  const type = col.type ?? 'text';

  if (type === 'boolean') {
    return (
      <input
        type="checkbox"
        checked={!!value}
        readOnly
        className="wz-checkbox"
        style={{ display: 'block', margin: '0 auto' }}
      />
    );
  }
  if (type === 'badge') {
    const opt = col.options?.find(o => o.value === value);
    const bg = opt?.color ?? '#e5e7eb';
    return (
      <span className="wz-badge" style={{ background: bg }}>
        {opt?.label ?? String(value ?? '')}
      </span>
    );
  }
  if (type === 'progress') {
    const pct = Math.min(100, Math.max(0, Number(value) || 0));
    return (
      <div className="wz-progress-bar">
        <div className="wz-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    );
  }
  if (type === 'currency') {
    const sym = col.currencySymbol ?? '₩';
    const decimals = col.decimals ?? 0;
    const num = Number(value ?? 0);
    return <span>{sym}{num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>;
  }
  if (type === 'rating') {
    const max = col.maxRating ?? 5;
    const val = Number(value ?? 0);
    return (
      <span>
        {Array.from({ length: max }, (_, i) => (
          <span key={i} style={{ color: i < val ? '#f59e0b' : '#d1d5db' }}>★</span>
        ))}
      </span>
    );
  }
  if (type === 'select' || type === 'radio') {
    const opt = col.options?.find(o => o.value === value);
    return <span>{opt?.label ?? String(value ?? '')}</span>;
  }
  if (type === 'tag') {
    const tags: string[] = Array.isArray(value) ? value : [];
    return (
      <span>
        {tags.map((t, i) => (
          <span
            key={i}
            className="wz-badge"
            style={{ marginRight: 2, background: '#dbeafe', color: '#1d4ed8' }}
          >
            {t}
          </span>
        ))}
      </span>
    );
  }
  if (type === 'link') {
    return <a href={String(value ?? '#')} style={{ color: '#2563eb', textDecoration: 'underline' }}>{String(value ?? '')}</a>;
  }
  if (type === 'image') {
    return value ? <img src={String(value)} alt="" style={{ maxHeight: 28, objectFit: 'contain' }} /> : null;
  }
  return <span>{String(value ?? '')}</span>;
}

export function WZGridCell({
  col,
  row,
  rowIdx,
  colIdx,
  isSelected,
  onCellUpdate,
  onStartEdit,
  onEndEdit,
  style,
  className,
  treeIndent = 0,
  treeToggle,
}: WZGridCellProps) {
  const type = col.type ?? 'text';
  const value = row[col.key];
  const isNonEditable = NON_EDITABLE_TYPES.has(type);
  const canEdit = col.editable !== false && !isNonEditable;

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEdit = () => {
    if (!canEdit) return;
    setEditValue(String(value ?? ''));
    setEditing(true);
    onStartEdit?.();
  };

  const commitEdit = () => {
    setEditing(false);
    onEndEdit?.();
    if (editValue !== String(value ?? '')) {
      onCellUpdate?.(rowIdx, col.key, editValue, value);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    onEndEdit?.();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitEdit();
    else if (e.key === 'Escape') cancelEdit();
  };

  const align = col.align ?? (
    type === 'number' || type === 'currency' || type === 'rating' || type === 'progress'
      ? 'right'
      : 'left'
  );

  const tdClass = [
    'wz-grid-td',
    isSelected ? 'wz-grid-td--selected' : '',
    editing ? 'wz-grid-td--editing' : '',
    col.pinned ? 'wz-grid-td--pinned' : '',
    className ?? '',
  ].filter(Boolean).join(' ');

  // 셀 내용: 트리 들여쓰기 + 토글 버튼 + 실제 값
  const cellContent = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingLeft: treeIndent > 0 ? treeIndent : undefined,
      }}
    >
      {/* 트리 토글 버튼 */}
      {treeToggle && (
        <button
          className="wz-tree-toggle"
          aria-label={treeToggle.ariaLabel ?? '펼치기/접기'}
          aria-expanded={treeToggle.hasChildren ? treeToggle.expanded : undefined}
          style={{
            visibility: treeToggle.hasChildren ? 'visible' : 'hidden',
          }}
          onClick={(e) => {
            e.stopPropagation();
            treeToggle.onToggle?.();
          }}
        >
          {treeToggle.hasChildren
            ? (treeToggle.expanded ? '▾' : '▸')
            : ''}
        </button>
      )}
      {editing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          style={{ flex: 1 }}
        />
      ) : (
        <CellDisplay col={col} value={value} />
      )}
    </div>
  );

  // 트리/들여쓰기가 없는 단순 셀은 기존 구조 그대로
  const usesWrapper = treeIndent > 0 || treeToggle !== undefined;

  return (
    <td
      role="gridcell"
      aria-colindex={colIdx + 1}
      className={tdClass}
      style={{ textAlign: align, height: '100%', ...style }}
      onDoubleClick={!usesWrapper ? startEdit : undefined}
    >
      {usesWrapper ? (
        <div onDoubleClick={canEdit ? startEdit : undefined}>
          {cellContent}
        </div>
      ) : (
        editing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <CellDisplay col={col} value={value} />
        )
      )}
    </td>
  );
}
