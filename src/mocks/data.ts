// src/mocks/data.ts — MSW가 사용하는 인메모리 DB

const CITIES = ['서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시'];
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
    };
  });
}

// 인메모리 DB (앱 실행 중 유지)
export const db = {
  employees: generate(10000) as any[],
  nextId: 10001,
};
