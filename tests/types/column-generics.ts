/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 타입 레벨 테스트: `Column<T>` 제네릭 전파 검증.
 *
 * 이 파일은 런타임 실행이 아니라 `tsc --noEmit`으로만 통과 여부를 검증합니다.
 * 제네릭이 올바르게 전파되지 않으면 컴파일 에러가 발생하고 CI가 실패합니다.
 *
 * 포함 범위:
 * 1. `Column<T>`의 `key`가 T의 키 union으로 좁혀지는지
 * 2. `validator`·`onInput`의 인자 타입이 T로부터 유도되는지
 * 3. `footer` 함수 타입이 `GridRow<T>[]`로 고정되는지
 * 4. `CellUpdateEvent<T>`·`CellSlotProps<T>`의 value가 T의 셀 값 union인지
 * 5. 제네릭을 생략해도 기존 any 기반 코드가 그대로 동작하는지
 */
import type {
  Column,
  CellSlotProps,
  CellUpdateEvent,
  ColumnCellValue,
  DataItem,
  GridItem,
  GridRow,
  FooterAggr,
} from '../../src/types/grid';

// --- 테스트 시나리오 1: 구체 스키마 ---
interface Employee {
  name: string;
  dept: string;
  salary: number;
  joinedAt: Date;
}

// (1) key 좁혀짐
const c1: Column<Employee> = {
  key: 'name', // 'name' | 'dept' | 'salary' | 'joinedAt' 중 하나여야 함
  title: '이름',
};

// (1-오류 예시) 아래 주석을 풀면 tsc가 실패해야 함 → 런타임 통과 시 제네릭이 안 먹은 것.
// const cBad: Column<Employee> = { key: 'unknown', title: 'X' };

// (2) validator: value는 Employee 셀 값 union, row는 GridRow<Employee>
const c2: Column<Employee> = {
  key: 'salary',
  title: '급여',
  validator: (value, row) => {
    // value는 string | number | Date union — 숫자만 허용하는 로직은 Number(value)로 좁혀서 사용
    const dept: string = row.dept; // row는 GridRow<Employee> → dept 접근 가능
    const numeric = typeof value === 'number' ? value : Number(value);
    return numeric < 0 ? '음수 불가' : null;
  },
};

// (3) footer: 커스텀 함수는 GridRow<Employee>[]를 받음
const c3: Column<Employee> = {
  key: 'salary',
  title: '평균 급여',
  footer: (rows) => {
    // rows: GridRow<Employee>[]
    const total = rows.reduce((sum, r) => sum + r.salary, 0);
    return rows.length ? total / rows.length : 0;
  },
};

// (4) CellUpdateEvent<T>
function onCellUpdate(event: CellUpdateEvent<Employee>) {
  const _k: 'name' | 'dept' | 'salary' | 'joinedAt' = event.key;
  const _v: ColumnCellValue<Employee> = event.value;
  const _row: GridRow<Employee> = event.row;
}

// (5) CellSlotProps<T>
function renderCell(props: CellSlotProps<Employee>) {
  const _val: ColumnCellValue<Employee> = props.value;
  const _col: Column<Employee> = props.column;
  const _row: GridRow<Employee> = props.row;
}

// (6) DataItem/GridItem<T>
const di: DataItem<Employee> = {
  type: 'data',
  row: { id: 1, name: 'a', dept: 'x', salary: 100, joinedAt: new Date() },
};
const items: GridItem<Employee>[] = [di];

// (7) FooterAggr<T> 문자열 + 함수 모두 OK
const fa1: FooterAggr<Employee> = 'sum';
const fa2: FooterAggr<Employee> = (rows) => rows.length;

// --- 테스트 시나리오 2: 제네릭 생략 시 하위 호환 ---
// 기존 코드처럼 제네릭 없이 써도 전부 동작
const legacyCol: Column = {
  key: 'anything',
  title: 'X',
  validator: (value, row) => (value == null ? '필수' : null),
  onInput: (v) => String(v).trim(),
  footer: (rows) => rows.reduce((s, r) => s + Number(r.any ?? 0), 0),
};

const legacyItems: GridItem[] = [
  { type: 'data', row: { id: 1, foo: 'bar' } },
  { type: 'group-header', key: 'g', label: 'G', count: 3, collapsed: false },
];

const legacyEvent: CellUpdateEvent = {
  row: { id: 1, foo: 'bar' },
  key: 'foo',
  value: 'baz',
  oldValue: 'bar',
};

// 모든 선언이 tsc를 통과하면 제네릭 전파 + 하위 호환이 모두 성립함.
export {}; // isolatedModules 대응
