// packages/react/playground/main.tsx — WZGrid React v0.2.0 신기능 데모
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { WZGrid } from '../src/components/WZGrid';
import { exportToExcel, exportToCsv } from '../src/utils/export';
import '../src/lib.css';
import type { Column, GridRow } from '../src/index';

// ── 기본 컬럼 ────────────────────────────────────────────────────────────────
const columns: Column[] = [
  { key: 'id',     title: 'ID',     width: 60,  type: 'number', align: 'center', pinned: true },
  { key: 'name',   title: '이름',   width: 120, type: 'text'   },
  { key: 'dept',   title: '부서',   width: 120, type: 'select',
    options: [
      { label: '개발', value: '개발' },
      { label: '기획', value: '기획' },
      { label: '디자인', value: '디자인' },
    ]
  },
  { key: 'salary', title: '급여',   width: 130, type: 'currency' },
  { key: 'active', title: '재직',   width: 80,  type: 'boolean' },
  { key: 'score',  title: '평점',   width: 120, type: 'rating', maxRating: 5 },
  { key: 'level',  title: '레벨',   width: 100, type: 'badge',
    options: [
      { label: 'Junior', value: 'junior', color: '#bbf7d0' },
      { label: 'Senior', value: 'senior', color: '#bfdbfe' },
      { label: 'Lead',   value: 'lead',   color: '#fde68a' },
    ]
  },
  { key: 'perf',   title: '성과',   width: 120, type: 'progress' },
];

const rows: GridRow[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `직원 ${i + 1}`,
  dept: ['개발', '기획', '디자인'][i % 3],
  salary: 3000000 + (i * 50000),
  active: i % 5 !== 0,
  score: (i % 5) + 1,
  level: ['junior', 'senior', 'lead'][i % 3],
  perf: Math.round((i % 100)),
}));

// ── 트리 데이터 ──────────────────────────────────────────────────────────────
const treeColumns: Column[] = [
  { key: 'name',  title: '이름',  width: 200, type: 'text' },
  { key: 'dept',  title: '부서',  width: 120, type: 'text' },
  { key: 'count', title: '인원',  width: 80,  type: 'number', align: 'center' },
];

const treeRows: GridRow[] = [
  {
    id: 1, name: '개발팀', dept: '기술본부', count: 3,
    children: [
      { id: 11, name: '프론트엔드', dept: '개발팀', count: 2,
        children: [
          { id: 111, name: '홍길동', dept: '프론트엔드', count: 0 },
          { id: 112, name: '김영희', dept: '프론트엔드', count: 0 },
        ]
      },
      { id: 12, name: '백엔드', dept: '개발팀', count: 1,
        children: [
          { id: 121, name: '이철수', dept: '백엔드', count: 0 },
        ]
      },
    ]
  },
  {
    id: 2, name: '기획팀', dept: '전략본부', count: 2,
    children: [
      { id: 21, name: '박민준', dept: '기획팀', count: 0 },
      { id: 22, name: '최수연', dept: '기획팀', count: 0 },
    ]
  },
];

// ── 앱 ───────────────────────────────────────────────────────────────────────
function App() {
  const [locale, setLocale] = useState<'ko' | 'en'>('ko');
  const [currentRows, setCurrentRows] = useState(rows);

  const handleCellUpdate = (e: any) => {
    console.log('[onCellUpdate]', e);
    setCurrentRows(prev => prev.map(r =>
      r.id === e.row.id ? { ...r, [e.colKey]: e.value } : r
    ));
  };

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 1200 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>
        WZGrid React Playground v0.2.0
      </h1>

      {/* 로케일 토글 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button
          style={{ padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: 4,
            background: locale === 'ko' ? '#3b82f6' : '#fff', color: locale === 'ko' ? '#fff' : '#374151' }}
          onClick={() => setLocale('ko')}
        >
          한국어
        </button>
        <button
          style={{ padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: 4,
            background: locale === 'en' ? '#3b82f6' : '#fff', color: locale === 'en' ? '#fff' : '#374151' }}
          onClick={() => setLocale('en')}
        >
          English
        </button>
      </div>

      {/* ── 기본 그리드 (클립보드·Undo/Redo·컬럼설정·행확장·내보내기) ── */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, color: '#374151' }}>
          기본 그리드 — Undo/Redo, 클립보드, 컬럼 설정, 행 확장, 내보내기
        </h2>
        <WZGrid
          rows={currentRows}
          columns={columns}
          height={480}
          rowHeight={36}
          showCheckbox
          usePaging
          pageSize={20}
          useVirtualScroll
          useFilter
          useUndoRedo
          useClipboard
          useColumnSettings
          locale={locale}
          onCellUpdate={handleCellUpdate}
          onCheckedChange={(checked) => console.log('[checked]', checked.length, '건')}
          onRowClick={(row, idx) => console.log('[rowClick]', idx, row.name)}
          onUndo={(e) => console.log('[undo]', e)}
          onRedo={(e) => console.log('[redo]', e)}
          renderDetail={(row) => (
            <div style={{ padding: '8px 0' }}>
              <strong>{row.name}</strong>의 상세 정보 |
              부서: {row.dept} | 급여: {Number(row.salary).toLocaleString()}원
            </div>
          )}
          onExportExcel={() => exportToExcel(columns, currentRows, { filename: 'employees.xlsx' })}
          onExportCsv={() => exportToCsv(columns, currentRows, { filename: 'employees.csv' })}
        />
      </section>

      {/* ── 트리 그리드 ── */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, color: '#374151' }}>
          트리 그리드 — useTreeMode
        </h2>
        <WZGrid
          rows={treeRows}
          columns={treeColumns}
          height={320}
          rowHeight={36}
          useTreeMode
          treeKey="children"
          locale={locale}
        />
      </section>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
