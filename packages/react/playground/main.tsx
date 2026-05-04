// packages/react/playground/main.tsx — WZGrid React 동작 검증용 데모
import React from 'react';
import { createRoot } from 'react-dom/client';
import { WZGrid } from '../src/components/WZGrid';
import '../src/lib.css';
import type { Column, GridRow } from '../src/index';

const columns: Column[] = [
  { key: 'id',     title: 'ID',     width: 60,  type: 'number', align: 'center' },
  { key: 'name',   title: '이름',   width: 120, type: 'text'   },
  { key: 'dept',   title: '부서',   width: 120, type: 'select',
    options: [
      { label: '개발', value: '개발' },
      { label: '기획', value: '기획' },
      { label: '디자인', value: '디자인' },
    ]
  },
  { key: 'salary', title: '급여',   width: 120, type: 'currency' },
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

const rows: GridRow[] = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  name: `직원 ${i + 1}`,
  dept: ['개발', '기획', '디자인'][i % 3],
  salary: 3000000 + (i * 50000),
  active: i % 5 !== 0,
  score: (i % 5) + 1,
  level: ['junior', 'senior', 'lead'][i % 3],
  perf: Math.round((i % 100)),
}));

function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginBottom: 16, fontSize: '1.25rem', fontWeight: 700 }}>
        WZGrid React Playground
      </h2>
      <WZGrid
        rows={rows}
        columns={columns}
        height={500}
        rowHeight={36}
        showCheckbox
        usePaging
        pageSize={20}
        useVirtualScroll
        onCellUpdate={(e) => {
          console.log('[onCellUpdate]', e);
        }}
        onCheckedChange={(checked) => {
          console.log('[onCheckedChange]', checked.length, '건');
        }}
        onRowClick={(row, idx) => {
          console.log('[onRowClick]', idx, row.name);
        }}
      />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
