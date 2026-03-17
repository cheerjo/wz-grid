# 마스터-디테일 Row Expand

`#detail` 스코프드 슬롯을 제공하면 각 행에 확장/축소 토글 버튼이 나타납니다. 행을 확장하면 해당 행 아래에 디테일 영역이 표시됩니다.

## 기본 사용법

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
>
  <template #detail="{ row, rowIndex }">
    <div class="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span class="font-bold">상세 정보</span>
        <p>이름: {{ row.name }}</p>
        <p>부서: {{ row.dept }}</p>
      </div>
      <div>
        <span class="font-bold">이력</span>
        <p>입사일: {{ row.joinDate }}</p>
        <p>급여: {{ row.salary?.toLocaleString() }}원</p>
      </div>
    </div>
  </template>
</WZGrid>
```

## 슬롯 스코프 데이터

| 속성 | 타입 | 설명 |
|:-----|:-----|:-----|
| `row` | `any` | 현재 행 객체 |
| `rowIndex` | `number` | 현재 행의 인덱스 |

## 동작 방식

- `#detail` 슬롯이 제공되면, 각 데이터 행 왼쪽에 화살표 토글 버튼이 자동으로 표시됩니다.
- 버튼 클릭 시 행이 확장되어 디테일 영역이 나타나고, 다시 클릭하면 축소됩니다.
- 확장된 행의 화살표는 90도 회전하여 확장 상태를 표시합니다.
- 디테일 영역은 전체 컬럼 너비를 차지합니다.
- 여러 행을 동시에 확장할 수 있습니다.

## 활용 예시: 주문 상세

```vue
<template #detail="{ row }">
  <div class="p-4">
    <h4 class="font-bold mb-2">주문 상세 내역</h4>
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b">
          <th class="text-left py-1">상품명</th>
          <th class="text-right py-1">수량</th>
          <th class="text-right py-1">금액</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in row.orderItems" :key="item.id" class="border-b">
          <td class="py-1">{{ item.name }}</td>
          <td class="text-right py-1">{{ item.qty }}</td>
          <td class="text-right py-1">{{ item.price.toLocaleString() }}원</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

## 활용 예시: 비동기 데이터 로딩

```vue
<script setup>
const detailData = ref<Record<number, any>>({});

const loadDetail = async (rowId: number) => {
  if (detailData.value[rowId]) return;
  const res = await fetch(`/api/employees/${rowId}/detail`);
  detailData.value[rowId] = await res.json();
};
</script>

<template>
  <WZGrid :columns="columns" :rows="rows">
    <template #detail="{ row }">
      <div v-if="detailData[row.id]" class="p-4">
        <!-- 로딩된 상세 데이터 표시 -->
        <p>{{ detailData[row.id].bio }}</p>
      </div>
      <div v-else class="p-4 text-gray-400">
        <button @click="loadDetail(row.id)">상세 정보 로드</button>
      </div>
    </template>
  </WZGrid>
</template>
```

## 주의사항

- `#detail` 슬롯을 제공하지 않으면 확장 버튼이 표시되지 않습니다.
- 가상 스크롤, 페이징, 체크박스 등 기존 기능과 함께 사용 가능합니다.
