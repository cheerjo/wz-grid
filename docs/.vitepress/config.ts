import { defineConfig } from 'vitepress';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  title: 'WZ-Grid',
  description: 'Vue 2/3 엔터프라이즈급 고성능 그리드 컴포넌트',
  lang: 'ko-KR',
  base: '/wz-grid/',

  vite: {
    css: {
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    },
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'WZ-Grid',

    nav: [
      { text: '가이드', link: '/guide/getting-started' },
      { text: 'API', link: '/api/props' },
      { text: '데모', link: '/demo' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '시작하기',
          items: [
            { text: '소개', link: '/guide/introduction' },
            { text: '빠른 시작', link: '/guide/getting-started' },
            { text: '설치', link: '/guide/installation' },
          ],
        },
        {
          text: '기능',
          items: [
            { text: '컬럼 설정', link: '/guide/columns' },
            { text: '컬럼 타입', link: '/guide/column-types' },
            { text: '정렬 & 필터', link: '/guide/sort-filter' },
            { text: '페이징 & 가상스크롤', link: '/guide/paging' },
            { text: '편집 & 검증', link: '/guide/editing' },
            { text: '선택 & 클립보드', link: '/guide/selection' },
            { text: '트리 구조', link: '/guide/tree' },
            { text: '푸터 집계 행', link: '/guide/footer' },
            { text: '그룹핑 & 소계', link: '/guide/grouping' },
            { text: '셀 병합', link: '/guide/merge' },
            { text: '셀 커스텀 렌더러', link: '/guide/cell-slot' },
            { text: '행 클릭 & 스타일', link: '/guide/row-style' },
            { text: '고급 필터', link: '/guide/advanced-filter' },
            { text: '컨텍스트 메뉴', link: '/guide/context-menu' },
            { text: '서버사이드 모드', link: '/guide/server-side' },
            { text: '마스터-디테일', link: '/guide/master-detail' },
            { text: '인쇄 & 내보내기', link: '/guide/export' },
            { text: 'Excel 내보내기', link: '/guide/export#excel-내보내기' },
            { text: '라이선스', link: '/guide/license' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 레퍼런스',
          items: [
            { text: 'Props', link: '/api/props' },
            { text: 'Events', link: '/api/events' },
            { text: 'Column 타입', link: '/api/column-types' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 WZ-Grid',
    },

    search: {
      provider: 'local',
    },
  },
});
