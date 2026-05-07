// packages/react/src/components/WZGridDetailRow.tsx
// 행 확장(detail) 컴포넌트 — 전체 너비의 확장 패널
import React from 'react';
import type { GridRow } from '@wezon/wz-grid-core';

export interface WZGridDetailRowProps {
  /** 대응하는 데이터 행 */
  row: GridRow;
  /** 총 컬럼 수 (colspan 계산용) */
  colSpan: number;
  /** 상세 내용 렌더 함수 */
  renderDetail: (row: GridRow) => React.ReactNode;
  /** 행 높이와 맞추기 위한 최소 높이 */
  minHeight?: number;
}

export function WZGridDetailRow({
  row,
  colSpan,
  renderDetail,
  minHeight = 48,
}: WZGridDetailRowProps) {
  return (
    <tr className="wz-grid-tr--detail" role="row">
      <td
        colSpan={colSpan}
        className="wz-grid-td--detail"
        style={{ minHeight, padding: 0 }}
      >
        <div className="wz-grid-detail-content">
          {renderDetail(row)}
        </div>
      </td>
    </tr>
  );
}
