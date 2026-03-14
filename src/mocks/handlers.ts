// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { db } from './data';

export const handlers = [

  // ── GET /api/employees ──────────────────────────────────────────────
  http.get('/api/employees', () => {
    return HttpResponse.json(db.employees);
  }),

  // ── POST /api/employees ─────────────────────────────────────────────
  http.post('/api/employees', async ({ request }) => {
    const body = await request.json() as any;
    const newRow = { id: db.nextId++, ...body };
    db.employees.unshift(newRow);
    return HttpResponse.json(newRow, { status: 201 });
  }),

  // ── PATCH /api/employees/:id ────────────────────────────────────────
  http.patch('/api/employees/:id', async ({ params, request }) => {
    const id  = Number(params.id);
    const body = await request.json() as any;
    const idx  = db.employees.findIndex(e => e.id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    db.employees[idx] = { ...db.employees[idx], ...body };
    return HttpResponse.json(db.employees[idx]);
  }),

  // ── DELETE /api/employees ───────────────────────────────────────────
  // body: { ids: number[] }
  http.delete('/api/employees', async ({ request }) => {
    const { ids } = await request.json() as { ids: number[] };
    const set = new Set(ids);
    db.employees = db.employees.filter(e => !set.has(e.id));
    return HttpResponse.json({ deleted: ids.length });
  }),

];
