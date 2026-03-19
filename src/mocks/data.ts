// src/mocks/data.ts — MSW가 사용하는 인메모리 DB

const CITIES = ['서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시'];
const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const SKILLS_POOL = ['Vue', 'React', 'TypeScript', 'Node.js', 'Python', 'Docker', 'AWS', 'GraphQL', 'Kotlin', 'Swift'];
const DISTRICTS = [
  '강남구 테헤란로', '마포구 월드컵북로', '송파구 올림픽로', '종로구 세종대로',
  '해운대구 해운대해변로', '수성구 달구벌대로', '남구 문현금융로', '서구 둔산대로',
  '동구 중앙대로', '북구 연암로',
];

function generate(count: number) {
  const statuses = ['Active', 'Pending', 'Inactive'];
  const genders  = ['M', 'F'];
  const depts    = ['dev', 'design', 'biz', 'hr', 'finance'];
  const baseYear = 2015;

  return Array.from({ length: count }).map((_, i) => {
    const year    = baseYear + (i % 10);
    const month   = String((i % 12) + 1).padStart(2, '0');
    const day     = String((i % 28) + 1).padStart(2, '0');
    const p4a     = String(Math.floor(1000 + Math.random() * 9000));
    const p4b     = String(Math.floor(1000 + Math.random() * 9000));
    const city    = CITIES[i % CITIES.length];
    const dist    = DISTRICTS[i % DISTRICTS.length];
    const bldg    = Math.floor(1 + Math.random() * 999);
    const apt     = i % 3 === 0 ? ` ${Math.floor(100 + Math.random() * 900)}동 ${Math.floor(100 + Math.random() * 900)}호` : '';
    return {
      id:         i + 1,
      avatar:     `https://i.pravatar.cc/150?u=${i + 1}`,
      name:       `User ${i + 1}`,
      gender:     genders[i % 2],
      phone:      `010-${p4a}-${p4b}`,
      address:    `${city} ${dist} ${bldg}${apt}`,
      status:     statuses[i % 3],
      dept:       depts[i % 5],
      salary:     Math.floor(Math.random() * 100000) + 30000,
      joinDate:   `${year}-${month}-${day}`,
      active:     i % 3 !== 2,
      completion: Math.floor(Math.random() * 100),
      profile:    `https://github.com/user-${i + 1}`,
      // 신규 타입 필드
      wage:       Math.floor(Math.random() * 5000000) + 2000000,
      rating:     (i % 5) + 1,
      lastLogin:  `${year}-${month}-${day}T${String(i % 24).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`,
      themeColor: COLORS[i % COLORS.length],
      email:      `user${i + 1}@example.com`,
      memo:       `메모 ${i + 1}: ${i % 3 === 0 ? '특이사항 없음' : i % 3 === 1 ? '업무 협조 필요' : '성과 우수'}`,
      skills:     SKILLS_POOL.slice(i % SKILLS_POOL.length, (i % SKILLS_POOL.length) + 2 + (i % 3)),
      trend:      Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)),
    };
  });
}

// 인메모리 DB (앱 실행 중 유지)
export const db = {
  employees: generate(100) as any[],
  nextId: 10001,
};
