<template>
  <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;">
    <WZGrid
      :columns="columns"
      :rows="rows"
      :height="400"
    >
      <template #detail="{ row }">
        <div style="padding: 12px 16px; background: #f8fafc;">
          <p style="font-size: 13px; font-weight: 600; color: #374151; margin: 0 0 8px;">
            {{ row.name }}의 주문 내역
          </p>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: #e5e7eb;">
                <th style="padding: 6px 10px; text-align: left; font-weight: 600; color: #374151; border: 1px solid #d1d5db;">상품명</th>
                <th style="padding: 6px 10px; text-align: center; font-weight: 600; color: #374151; border: 1px solid #d1d5db;">수량</th>
                <th style="padding: 6px 10px; text-align: right; font-weight: 600; color: #374151; border: 1px solid #d1d5db;">금액</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in row.orderItems"
                :key="item.id"
                style="background: #fff;"
              >
                <td style="padding: 5px 10px; border: 1px solid #e5e7eb; color: #1f2937;">{{ item.name }}</td>
                <td style="padding: 5px 10px; border: 1px solid #e5e7eb; text-align: center; color: #1f2937;">{{ item.qty }}</td>
                <td style="padding: 5px 10px; border: 1px solid #e5e7eb; text-align: right; color: #1f2937;">₩{{ item.price.toLocaleString() }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr style="background: #f3f4f6;">
                <td colspan="2" style="padding: 6px 10px; border: 1px solid #d1d5db; text-align: right; font-weight: 600; color: #374151;">합계</td>
                <td style="padding: 6px 10px; border: 1px solid #d1d5db; text-align: right; font-weight: 600; color: #1d4ed8;">
                  ₩{{ getOrderTotal(row.orderItems) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </template>
    </WZGrid>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const getOrderTotal = (items: any[]) =>
  items.reduce((sum, item) => sum + item.price * item.qty, 0).toLocaleString();

const columns = ref([
  { key: 'id',       title: 'ID',    width: 60,  align: 'center' },
  { key: 'name',     title: '이름',  width: 120 },
  { key: 'dept',     title: '부서',  width: 110, type: 'select', options: [
    { value: 'dev',    label: '개발팀' },
    { value: 'design', label: '디자인팀' },
    { value: 'biz',    label: '사업팀' },
    { value: 'hr',     label: '인사팀' },
  ]},
  { key: 'joinDate', title: '입사일', width: 120, type: 'date',   align: 'center' },
  { key: 'salary',   title: '연봉',   width: 120, type: 'number', align: 'right'  },
]);

const rows = ref([
  {
    id: 1, name: '홍길동', dept: 'dev', joinDate: '2020-03-01', salary: 72000000,
    orderItems: [
      { id: 1, name: '노트북 거치대',   qty: 1, price: 35000 },
      { id: 2, name: '무선 키보드',     qty: 2, price: 55000 },
      { id: 3, name: 'USB 허브',        qty: 1, price: 22000 },
    ],
  },
  {
    id: 2, name: '김철수', dept: 'design', joinDate: '2021-07-15', salary: 68000000,
    orderItems: [
      { id: 4, name: '모니터 암',       qty: 1, price: 89000 },
      { id: 5, name: '액정 보호필름',   qty: 3, price: 12000 },
    ],
  },
  {
    id: 3, name: '이영희', dept: 'biz', joinDate: '2019-11-20', salary: 61000000,
    orderItems: [
      { id: 6, name: '명함 케이스',     qty: 2, price: 8500  },
      { id: 7, name: '파우치',          qty: 1, price: 19000 },
      { id: 8, name: '멀티탭',          qty: 1, price: 32000 },
    ],
  },
  {
    id: 4, name: '박민준', dept: 'hr', joinDate: '2022-01-10', salary: 59000000,
    orderItems: [
      { id: 9,  name: '마우스패드',     qty: 1, price: 15000 },
      { id: 10, name: '웹캠',           qty: 1, price: 78000 },
    ],
  },
  {
    id: 5, name: '최수진', dept: 'dev', joinDate: '2020-09-05', salary: 75000000,
    orderItems: [
      { id: 11, name: '기계식 키보드',  qty: 1, price: 130000 },
      { id: 12, name: '마우스',         qty: 1, price: 65000  },
      { id: 13, name: '모니터 클리너',  qty: 2, price: 7000   },
    ],
  },
  {
    id: 6, name: '정태양', dept: 'design', joinDate: '2023-05-22', salary: 55000000,
    orderItems: [
      { id: 14, name: '태블릿 펜',      qty: 1, price: 48000 },
      { id: 15, name: '스케치북',       qty: 3, price: 6500  },
    ],
  },
]);
</script>
