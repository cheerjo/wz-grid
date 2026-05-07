import { describe, it, expect } from 'vitest';
import { useUndoRedo } from '@wezon/wz-grid-vue';
import type { HistoryEntry } from '@wezon/wz-grid-core';

const mk = (rowId: number, colKey: string, oldV: unknown, newV: unknown): HistoryEntry =>
  ({ rowId, colKey, oldValue: oldV, newValue: newV });

describe('useUndoRedo', () => {
  it('초기 상태에서는 undo/redo 불가', () => {
    const h = useUndoRedo({ getMaxDepth: () => 10 });
    expect(h.canUndo.value).toBe(false);
    expect(h.canRedo.value).toBe(false);
    expect(h.undo()).toBeNull();
    expect(h.redo()).toBeNull();
  });

  it('push 후 undo 가능, undo/redo로 왕복', () => {
    const h = useUndoRedo({ getMaxDepth: () => 10 });
    h.push(mk(1, 'name', 'a', 'b'));
    expect(h.canUndo.value).toBe(true);
    expect(h.canRedo.value).toBe(false);

    const undone = h.undo();
    expect(undone).toEqual({ rowId: 1, colKey: 'name', oldValue: 'a', newValue: 'b' });
    expect(h.canUndo.value).toBe(false);
    expect(h.canRedo.value).toBe(true);

    const redone = h.redo();
    expect(redone).toEqual(undone);
    expect(h.canUndo.value).toBe(true);
    expect(h.canRedo.value).toBe(false);
  });

  it('여러 건 push 후 LIFO 순으로 undo', () => {
    const h = useUndoRedo({ getMaxDepth: () => 10 });
    h.push(mk(1, 'a', 1, 2));
    h.push(mk(1, 'b', 'x', 'y'));
    h.push(mk(2, 'c', null, 3));

    expect(h.undoSize.value).toBe(3);
    expect(h.undo()?.colKey).toBe('c');
    expect(h.undo()?.colKey).toBe('b');
    expect(h.undo()?.colKey).toBe('a');
    expect(h.undoSize.value).toBe(0);
    expect(h.redoSize.value).toBe(3);
  });

  it('push 시 redo 스택은 비워짐 (분기 변경)', () => {
    const h = useUndoRedo({ getMaxDepth: () => 10 });
    h.push(mk(1, 'a', 1, 2));
    h.push(mk(1, 'b', 3, 4));
    h.undo(); // redo 스택: [b]
    expect(h.redoSize.value).toBe(1);

    h.push(mk(1, 'c', 5, 6));
    expect(h.redoSize.value).toBe(0);
    expect(h.canRedo.value).toBe(false);
  });

  it('maxDepth 초과 시 FIFO drain', () => {
    const h = useUndoRedo({ getMaxDepth: () => 3 });
    h.push(mk(1, 'a', 1, 2));
    h.push(mk(2, 'b', 3, 4));
    h.push(mk(3, 'c', 5, 6));
    h.push(mk(4, 'd', 7, 8)); // overflow → [a] 제거
    expect(h.undoSize.value).toBe(3);

    // 가장 오래된 항목(a)은 사라지고 b가 바닥
    const all: HistoryEntry[] = [];
    while (h.canUndo.value) {
      const e = h.undo();
      if (e) all.push(e);
    }
    // pop 순서: d, c, b
    expect(all.map(e => e.colKey)).toEqual(['d', 'c', 'b']);
  });

  it('maxDepth 동적 변경: 이후 push에만 반영', () => {
    let max = 5;
    const h = useUndoRedo({ getMaxDepth: () => max });
    for (let i = 0; i < 5; i++) h.push(mk(i, 'k', i, i + 1));
    expect(h.undoSize.value).toBe(5);

    max = 2;
    h.push(mk(99, 'k', 99, 100)); // push 시점에 재계산 → drain
    expect(h.undoSize.value).toBe(2);
  });

  it('maxDepth 0이면 push가 즉시 무효', () => {
    const h = useUndoRedo({ getMaxDepth: () => 0 });
    h.push(mk(1, 'a', 1, 2));
    expect(h.canUndo.value).toBe(false);
    expect(h.undoSize.value).toBe(0);
  });

  it('clear()로 양쪽 스택 리셋', () => {
    const h = useUndoRedo({ getMaxDepth: () => 10 });
    h.push(mk(1, 'a', 1, 2));
    h.push(mk(1, 'b', 3, 4));
    h.undo();
    expect(h.canUndo.value).toBe(true);
    expect(h.canRedo.value).toBe(true);

    h.clear();
    expect(h.canUndo.value).toBe(false);
    expect(h.canRedo.value).toBe(false);
    expect(h.undoSize.value).toBe(0);
    expect(h.redoSize.value).toBe(0);
  });
});
