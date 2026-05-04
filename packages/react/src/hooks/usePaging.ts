// packages/react/src/hooks/usePaging.ts
import { useState, useMemo } from 'react';

export interface UsePagingReturn {
  /** 현재 페이지 번호 (1-based) */
  page: number;
  /** 페이지당 행 수 */
  pageSize: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 현재 페이지의 rows 슬라이스 */
  pagedRows: any[];
  /** 페이지 변경 */
  setPage: (p: number) => void;
  /** 페이지 크기 변경 (page를 1로 리셋) */
  setPageSize: (size: number) => void;
  /** 이전 페이지 (없으면 no-op) */
  prevPage: () => void;
  /** 다음 페이지 (없으면 no-op) */
  nextPage: () => void;
}

export function usePaging(
  rows: any[],
  initialPageSize = 50
): UsePagingReturn {
  const [page, setPageRaw] = useState(1);
  const [pageSize, setPageSizeRaw] = useState(initialPageSize);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(rows.length / pageSize)),
    [rows.length, pageSize]
  );

  const setPage = (p: number) => {
    setPageRaw(Math.min(Math.max(1, p), Math.max(1, Math.ceil(rows.length / pageSize))));
  };

  const setPageSize = (size: number) => {
    setPageSizeRaw(size);
    setPageRaw(1);
  };

  const prevPage = () => setPage(page - 1);
  const nextPage = () => setPage(page + 1);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  return { page, pageSize, totalPages, pagedRows, setPage, setPageSize, prevPage, nextPage };
}
