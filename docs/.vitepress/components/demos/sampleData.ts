// 여러 데모에서 공통으로 사용하는 샘플 데이터

export const deptOptions = [
  { value: 'dev',    label: '개발팀' },
  { value: 'design', label: '디자인팀' },
  { value: 'biz',    label: '사업팀' },
  { value: 'hr',     label: '인사팀' },
];

export const basicColumns = [
  { key: 'id',       title: 'ID',    width: 60,  pinned: true },
  { key: 'name',     title: '이름',  width: 120, editable: true, required: true },
  { key: 'dept',     title: '부서',  width: 110, editable: true, type: 'select', options: deptOptions },
  {
    key: 'score', title: '점수', width: 80, editable: true, type: 'number', align: 'right',
    validator: (v: any) => (v < 0 || v > 100) ? '0~100 사이여야 합니다' : null,
  },
  {
    key: 'status', title: '상태', width: 90, type: 'badge', align: 'center',
    options: [
      { value: 'active',   label: '재직', color: 'bg-green-100 text-green-700' },
      { value: 'leave',    label: '휴직', color: 'bg-yellow-100 text-yellow-700' },
      { value: 'resigned', label: '퇴직', color: 'bg-red-100 text-red-700' },
    ],
  },
  { key: 'joinDate', title: '입사일', width: 120, type: 'date',    align: 'center' },
  { key: 'active',   title: '활성',   width: 60,  type: 'boolean', align: 'center' },
];

export const basicRows = [
  { id: 1, name: '홍길동', dept: 'dev',    score: 92, status: 'active',   joinDate: '2020-03-01', active: true  },
  { id: 2, name: '김철수', dept: 'design', score: 88, status: 'active',   joinDate: '2021-07-15', active: true  },
  { id: 3, name: '이영희', dept: 'biz',    score: 75, status: 'leave',    joinDate: '2019-11-20', active: false },
  { id: 4, name: '박민준', dept: 'hr',     score: 95, status: 'active',   joinDate: '2022-01-10', active: true  },
  { id: 5, name: '최수진', dept: 'dev',    score: 83, status: 'active',   joinDate: '2020-09-05', active: true  },
  { id: 6, name: '정태양', dept: 'design', score: 67, status: 'resigned', joinDate: '2018-04-22', active: false },
  { id: 7, name: '윤하나', dept: 'dev',    score: 91, status: 'active',   joinDate: '2023-02-14', active: true  },
  { id: 8, name: '강지훈', dept: 'biz',    score: 79, status: 'active',   joinDate: '2021-12-01', active: true  },
];

// 트리 구조 — 조직도 형태 (대표이사 > 팀장 > 팀원)
export const treeRows = [
  {
    name: '홍길동', role: '대표이사', dept: '경영진', salary: 120000000,
    children: [
      {
        name: '김개발', role: '개발팀장', dept: '개발팀', salary: 80000000,
        children: [
          { name: '이주니어', role: '개발자',         dept: '개발팀', salary: 45000000 },
          { name: '박시니어', role: '시니어 개발자',  dept: '개발팀', salary: 65000000 },
        ],
      },
      {
        name: '최디자인', role: '디자인팀장', dept: '디자인팀', salary: 75000000,
        children: [
          { name: '정UX', role: 'UX 디자이너', dept: '디자인팀', salary: 50000000 },
        ],
      },
      {
        name: '강마케팅', role: '마케팅팀장', dept: '마케팅팀', salary: 72000000,
        children: [
          { name: '오기획', role: '기획자',     dept: '마케팅팀', salary: 48000000 },
          { name: '한홍보', role: '홍보 담당',  dept: '마케팅팀', salary: 44000000 },
        ],
      },
    ],
  },
];
