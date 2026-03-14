<!-- src/components/WZGrid.vue -->
<template>
  <div class="wz-grid-wrapper flex flex-col" :style="{ height: height + 'px' }">

    <!-- ── 툴바 ──────────────────────────────────────────────────────────── -->
    <div
      v-if="showAdd || showDelete || hasToolbarSlot || showColumnSettings || showExcelExport"
      class="wz-grid-toolbar flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 border border-gray-300 border-b-0 rounded-t"
    >
      <!-- 왼쪽: 컬럼 설정 + 필터 초기화 -->
      <div class="flex items-center gap-2">

        <!-- 컬럼 표시/숨기기 -->
        <div v-if="showColumnSettings" class="relative" @click.stop>
          <button
            @click="colSettingsOpen = !colSettingsOpen"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-all bg-white border-gray-300 text-gray-600 hover:bg-gray-600 hover:text-white hover:border-gray-600"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            컬럼 설정
            <span v-if="hiddenColKeys.length > 0" class="bg-blue-500 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center">{{ hiddenColKeys.length }}</span>
          </button>

          <!-- 드롭다운 패널 -->
          <div
            v-if="colSettingsOpen"
            class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-52 max-h-72 flex flex-col"
            @click.stop
          >
            <div class="px-3 py-2 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">컬럼 표시</span>
              <button @click="hiddenColKeys = []" class="text-[10px] text-blue-500 hover:underline">전체 표시</button>
            </div>
            <div class="overflow-y-auto flex-grow">
              <label
                v-for="col in columns"
                :key="col.key"
                class="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  :checked="!hiddenColKeys.includes(col.key)"
                  @change="toggleColVisibility(col.key)"
                  class="w-3.5 h-3.5 accent-blue-500 flex-shrink-0"
                />
                <span class="text-xs text-gray-700 truncate">{{ col.title }}</span>
                <span v-if="col.pinned" class="ml-auto text-[9px] text-orange-500 bg-orange-50 px-1 rounded flex-shrink-0">고정</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 필터 초기화 -->
        <button
          v-if="useFilter && activeFilterCount > 0"
          @click="clearAllFilters"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-all bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          필터 초기화 ({{ activeFilterCount }})
        </button>
      </div>

      <!-- 오른쪽: 커스텀 슬롯 + 삭제 + 추가 -->
      <div class="flex items-center gap-2">
        <slot name="toolbar" />
        <div v-if="hasToolbarSlot && (showAdd || showDelete)" class="w-px h-5 bg-gray-300 mx-1" />
        <button
          v-if="showDelete"
          @click="handleDelete"
          :disabled="checkedCount === 0"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-all bg-white border-red-300 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-red-600 disabled:hover:border-red-300"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          삭제<span v-if="checkedCount > 0" class="opacity-80">({{ checkedCount }})</span>
        </button>
        <button
          v-if="showAdd"
          @click="$emit('click:add')"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-all bg-white border-blue-300 text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          추가
        </button>

        <!-- Excel 내보내기 (Pro) -->
        <button
          v-if="showExcelExport"
          @click="handleExcelExport"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-all bg-white border-green-300 text-green-700 hover:bg-green-600 hover:text-white hover:border-green-600"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Excel
          <span v-if="!isProLicense" class="text-[9px] bg-amber-400 text-white px-1 rounded">PRO</span>
        </button>
      </div>
    </div>

    <!-- ── 그리드 컨테이너 ─────────────────────────────────────────────── -->
    <div
      :class="(showAdd || showDelete || hasToolbarSlot || showColumnSettings) ? 'rounded-b border-t-0' : 'rounded'"
      ref="containerEl"
      class="wz-grid-container relative border border-gray-300 overflow-auto bg-white select-none focus:ring-2 focus:ring-blue-400 outline-none flex-grow"
      @scroll="onScroll"
      @copy.self="onCopy"
      @paste.self="onPaste"
      @keydown="handleKeyDown"
      tabindex="0"
    >
      <div :style="{ paddingTop: topPadding + 'px', paddingBottom: bottomPadding + 'px', minWidth: 'max-content' }">
        <table class="table-fixed border-separate border-spacing-0">
          <thead class="sticky top-0 z-30 bg-gray-100 shadow-sm">

            <!-- 헤더 행 -->
            <tr>
              <!-- 행 드래그 핸들 헤더 -->
              <th
                v-if="useRowDrag"
                class="sticky left-0 z-40 border-b border-r border-gray-300 bg-gray-100 h-[40px]"
                :style="{ width: ROW_DRAG_WIDTH + 'px', minWidth: ROW_DRAG_WIDTH + 'px' }"
              ></th>

              <th
                v-if="useCheckbox"
                class="sticky z-40 border-b border-r border-gray-300 bg-gray-100 h-[40px]"
                :style="{ width: CHECKBOX_WIDTH + 'px', minWidth: CHECKBOX_WIDTH + 'px', left: (useRowDrag ? ROW_DRAG_WIDTH : 0) + 'px' }"
              >
                <div class="flex items-center justify-center w-full h-full">
                  <input
                    ref="headerCheckboxEl"
                    type="checkbox"
                    :checked="isAllChecked"
                    @change="toggleAll"
                    class="w-4 h-4 rounded border-gray-400 cursor-pointer accent-blue-500"
                  />
                </div>
              </th>

              <th
                v-for="(col, colIdx) in visibleColumns"
                :key="col.key"
                :style="getColumnStyle(col, colIdx)"
                class="border-b border-r border-gray-300 px-2 py-2 text-xs font-bold text-gray-600 uppercase tracking-wider h-[40px] relative group transition-colors"
                :class="{
                  'sticky left-0 z-40 bg-gray-100': col.pinned,
                  'bg-blue-100 border-l-2 border-l-blue-500': dragOverColIdx === colIdx && !col.pinned,
                  'opacity-40': dragSourceColIdx === colIdx,
                  'cursor-pointer hover:bg-gray-200': !col.pinned,
                  'cursor-default': col.pinned,
                }"
                :draggable="!col.pinned"
                @dragstart="!col.pinned && onDragStart(colIdx, $event)"
                @dragover.prevent="!col.pinned && onDragOver(colIdx)"
                @dragleave="onDragLeave"
                @drop.prevent="!col.pinned && onDrop(colIdx)"
                @dragend="onDragEnd"
                @click="onHeaderClick(col.key, $event)"
              >
                <div class="flex items-center w-full" :class="getAlignClass(col.headerAlign || 'center')">
                  <!-- 드래그 핸들 (pinned 아닌 컬럼) -->
                  <svg v-if="!col.pinned" class="w-3 h-3 mr-1 text-gray-400 flex-shrink-0 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm8-16a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z"/>
                  </svg>
                  <span class="truncate">{{ col.title }}</span>
                  <span v-if="col.required" class="ml-1 text-red-500">*</span>
                  <!-- 다중 정렬 표시 -->
                  <span v-if="getSortEntry(col.key)" class="ml-1 text-[10px] text-blue-600 flex items-center gap-0.5 flex-shrink-0">
                    {{ getSortEntry(col.key)?.order === 'asc' ? '▲' : '▼' }}<sup v-if="sortConfigs.length > 1" class="text-[8px] leading-none">{{ getSortIndex(col.key) + 1 }}</sup>
                  </span>
                  <!-- 활성 필터 표시 -->
                  <span v-if="useFilter && isFilterActive(col.key)" class="ml-1 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 inline-block" title="필터 적용 중"></span>
                </div>
                <div class="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 z-10" @mousedown.stop="startResize($event, colIdx)"></div>
              </th>
            </tr>

            <!-- 필터 행 -->
            <tr v-if="useFilter">
              <th v-if="useRowDrag" class="sticky left-0 z-40 border-b border-r border-gray-200 bg-gray-50 p-0" :style="{ width: ROW_DRAG_WIDTH + 'px', minWidth: ROW_DRAG_WIDTH + 'px' }"></th>
              <th
                v-if="useCheckbox"
                class="sticky z-40 border-b border-r border-gray-200 bg-gray-50 p-0"
                :style="{ width: CHECKBOX_WIDTH + 'px', minWidth: CHECKBOX_WIDTH + 'px', left: (useRowDrag ? ROW_DRAG_WIDTH : 0) + 'px' }"
              ></th>
              <th
                v-for="(col, colIdx) in visibleColumns"
                :key="'f-' + col.key"
                :style="getColumnStyle(col, colIdx)"
                class="border-b border-r border-gray-200 bg-gray-50 p-1 relative"
                :class="{ 'sticky left-0 z-40': col.pinned }"
                @mousedown.stop
                @click.stop
              >
                <!-- text / link / 기타 -->
                <input
                  v-if="!col.type || col.type === 'text' || col.type === 'link' || col.type === 'radio'"
                  v-model="filters[col.key].value"
                  type="text"
                  placeholder="검색..."
                  class="filter-input"
                />

                <!-- number: min ~ max -->
                <div v-else-if="col.type === 'number'" class="flex items-center gap-0.5">
                  <input v-model="filters[col.key].min" type="number" placeholder="최소" class="filter-input" />
                  <span class="text-[9px] text-gray-400 flex-shrink-0">~</span>
                  <input v-model="filters[col.key].max" type="number" placeholder="최대" class="filter-input" />
                </div>

                <!-- date: from / to -->
                <div v-else-if="col.type === 'date'" class="flex flex-col gap-0.5">
                  <input v-model="filters[col.key].from" type="date" class="filter-input" style="font-size:10px;" />
                  <input v-model="filters[col.key].to"   type="date" class="filter-input" style="font-size:10px;" />
                </div>

                <!-- select / badge -->
                <select
                  v-else-if="col.type === 'select' || col.type === 'badge'"
                  v-model="filters[col.key].value"
                  class="filter-input"
                >
                  <option value="">전체</option>
                  <option v-for="opt in col.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>

                <!-- boolean -->
                <select v-else-if="col.type === 'boolean'" v-model="filters[col.key].value" class="filter-input">
                  <option value="">전체</option>
                  <option value="true">예</option>
                  <option value="false">아니요</option>
                </select>

                <!-- 나머지 타입(image, button, progress): 빈 칸 -->
                <template v-else></template>

                <!-- 개별 필터 초기화 -->
                <button
                  v-if="isFilterActive(col.key)"
                  @click.stop="clearFilter(col.key)"
                  class="absolute right-0.5 top-0.5 w-3.5 h-3.5 flex items-center justify-center text-[9px] text-gray-400 hover:text-red-500 bg-white rounded-full border border-gray-200 hover:border-red-300 transition-colors z-10"
                  title="필터 초기화"
                >✕</button>
              </th>
            </tr>

          </thead>

          <tbody>
            <template v-for="itemIdx in visibleRowsRange" :key="itemIdx">

              <!-- ── 그룹 헤더 행 ────────────────────────────────────────── -->
              <tr
                v-if="getItem(itemIdx)?.type === 'group-header'"
                :style="{ height: rowHeight + 'px' }"
                class="bg-blue-50 hover:bg-blue-100 cursor-pointer select-none"
                @click="toggleGroup(asGroupHeader(itemIdx).key)"
                @mousedown.prevent
              >
                <td v-if="useRowDrag" :style="{ width: ROW_DRAG_WIDTH + 'px', minWidth: ROW_DRAG_WIDTH + 'px' }" class="border-b border-r border-gray-200 p-0 sticky left-0 z-10 bg-blue-50"></td>
                <td v-if="useCheckbox" :style="{ width: CHECKBOX_WIDTH + 'px', minWidth: CHECKBOX_WIDTH + 'px', left: (useRowDrag ? ROW_DRAG_WIDTH : 0) + 'px' }" class="border-b border-r border-gray-200 p-0 sticky z-10 bg-blue-50"></td>
                <td :colspan="visibleColumns.length" class="border-b border-gray-300 px-3 py-0">
                  <div class="flex items-center gap-2">
                    <span class="text-blue-500 w-3 text-center flex-shrink-0">{{ asGroupHeader(itemIdx).collapsed ? '▶' : '▼' }}</span>
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ groupColTitle }}</span>
                    <span class="text-sm font-semibold text-blue-700">{{ asGroupHeader(itemIdx).label }}</span>
                    <span class="text-[11px] text-gray-400 bg-blue-100 px-1.5 py-0.5 rounded-full">{{ asGroupHeader(itemIdx).count.toLocaleString() }}건</span>
                  </div>
                </td>
              </tr>

              <!-- ── 소계 행 ─────────────────────────────────────────────── -->
              <tr
                v-else-if="getItem(itemIdx)?.type === 'subtotal'"
                :style="{ height: rowHeight + 'px' }"
                class="bg-amber-50"
              >
                <td v-if="useRowDrag" :style="{ width: ROW_DRAG_WIDTH + 'px', minWidth: ROW_DRAG_WIDTH + 'px' }" class="border-b border-r border-gray-200 p-0 sticky left-0 z-10 bg-amber-50"></td>
                <td v-if="useCheckbox" :style="{ width: CHECKBOX_WIDTH + 'px', minWidth: CHECKBOX_WIDTH + 'px', left: (useRowDrag ? ROW_DRAG_WIDTH : 0) + 'px' }" class="border-b border-r border-gray-200 p-0 sticky z-10 bg-amber-50"></td>
                <td
                  v-for="(col, colIdx) in visibleColumns"
                  :key="'sub-' + col.key"
                  :style="getColumnStyle(col, colIdx)"
                  :class="{ 'sticky left-0 z-10 bg-amber-50': col.pinned }"
                  class="border-b border-r border-gray-200 px-2 py-1"
                >
                  <template v-if="colIdx === 0">
                    <span class="text-[11px] font-bold text-amber-700">소계</span>
                    <span class="text-[10px] text-gray-400 ml-1">({{ asSubtotal(itemIdx).count.toLocaleString() }}건)</span>
                  </template>
                  <template v-else-if="col.type === 'number'">
                    <div class="text-xs font-semibold text-gray-700 text-right w-full">{{ asSubtotal(itemIdx).sums[col.key]?.toLocaleString() }}</div>
                  </template>
                </td>
              </tr>

              <!-- ── 데이터 행 ───────────────────────────────────────────── -->
              <tr
                v-else
                :style="{ height: rowHeight + 'px' }"
                :class="{
                  'opacity-40': useRowDrag && rowDragSrcIdx === itemIdx,
                  'row-drag-over-top':    useRowDrag && rowDragOverIdx === itemIdx && rowDragOverPos === 'above',
                  'row-drag-over-bottom': useRowDrag && rowDragOverIdx === itemIdx && rowDragOverPos === 'below',
                }"
                @dragover="useRowDrag && onRowDragOver($event, itemIdx)"
                @drop="useRowDrag && onRowDrop($event, itemIdx)"
                @dragend="useRowDrag && onRowDragEnd()"
              >
                <!-- 행 드래그 핸들 셀 -->
                <td
                  v-if="useRowDrag"
                  class="sticky left-0 z-10 border-b border-r border-gray-200 p-0 bg-white cursor-grab active:cursor-grabbing"
                  :style="{ width: ROW_DRAG_WIDTH + 'px', minWidth: ROW_DRAG_WIDTH + 'px' }"
                  draggable="true"
                  @dragstart="onRowDragStart(itemIdx)"
                  @mousedown.stop
                >
                  <div class="flex items-center justify-center w-full h-full text-gray-300 hover:text-gray-500 transition-colors">
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm8-16a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z"/>
                    </svg>
                  </div>
                </td>

                <!-- 체크박스 셀 -->
                <td
                  v-if="useCheckbox"
                  class="sticky z-10 border-b border-r border-gray-200 p-0 transition-colors"
                  :style="{ left: (useRowDrag ? ROW_DRAG_WIDTH : 0) + 'px', width: CHECKBOX_WIDTH + 'px', minWidth: CHECKBOX_WIDTH + 'px' }"
                  :class="isRowChecked(getRow(itemIdx)?.id) ? 'bg-blue-50' : 'bg-white'"
                  @mousedown.stop
                >
                  <div class="flex items-center justify-center w-full h-full">
                    <input
                      type="checkbox"
                      :checked="isRowChecked(getRow(itemIdx)?.id)"
                      @change="toggleRow(getRow(itemIdx)?.id)"
                      class="w-4 h-4 rounded border-gray-400 cursor-pointer accent-blue-500"
                    />
                  </div>
                </td>

                <template v-for="(col, colIdx) in visibleColumns" :key="col.key">
                <td
                  v-if="!getMerge(itemIdx, col.key)?.hidden"
                  :rowspan="getMerge(itemIdx, col.key)?.rowspan ?? 1"
                  :colspan="getMerge(itemIdx, col.key)?.colspan ?? 1"
                  :style="getColumnStyle(col, colIdx)"
                  class="border-b border-r border-gray-200 p-0 relative group"
                  :class="{
                    'bg-blue-50/50': isSelected(itemIdx, colIdx),
                    'sticky left-0 z-10 bg-white group-hover:bg-gray-50': col.pinned,
                    'bg-blue-50/80': col.pinned && isSelected(itemIdx, colIdx),
                    'ring-1 ring-inset ring-red-500 bg-red-50': hasError(itemIdx, col.key)
                  }"
                  @mousedown="startSelection(itemIdx, colIdx)"
                  @mouseenter="updateSelection(itemIdx, colIdx)"
                  @mouseup="endSelection"
                  @dblclick="startEditing(itemIdx, colIdx)"
                  @contextmenu="useContextMenu && openContextMenu($event, itemIdx, colIdx)"
                >
                  <!-- 에러 툴팁 -->
                  <div v-if="hasError(itemIdx, col.key)" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-red-600 text-white text-[10px] rounded shadow-lg z-50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {{ getError(itemIdx, col.key) }}
                    <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-red-600"></div>
                  </div>

                  <!-- 데이터 툴팁 -->
                  <div
                    v-else-if="col.tooltip && getTooltipValue(itemIdx, col)"
                    class="absolute bottom-full left-0 mb-2 px-2.5 py-1.5 bg-gray-800 text-white text-xs leading-snug rounded shadow-xl z-50 max-w-[280px] break-words whitespace-normal opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
                  >
                    {{ getTooltipValue(itemIdx, col) }}
                    <div class="absolute top-full left-4 border-4 border-transparent border-t-gray-800"></div>
                  </div>

                  <!-- 편집 모드 -->
                  <div v-if="isEditing(itemIdx, colIdx)" class="absolute inset-0 z-30 bg-white">
                    <input
                      v-if="col.type === 'date'"
                      ref="editInput" v-model="editValue" type="date"
                      class="w-full h-full px-2 text-sm border-2 border-blue-500 outline-none shadow-inner"
                      @blur="stopEditing(true)" @keydown.enter="stopEditing(true)" @keydown.esc="stopEditing(false)" @mousedown.stop
                      @change="stopEditing(true)"
                    />
                    <input
                      v-else-if="col.type !== 'select' && col.type !== 'boolean'"
                      ref="editInput" v-model="editValue" :type="col.type === 'number' ? 'number' : 'text'"
                      class="w-full h-full px-2 text-sm border-2 border-blue-500 outline-none shadow-inner"
                      @blur="stopEditing(true)" @keydown.enter="stopEditing(true)" @keydown.esc="stopEditing(false)" @mousedown.stop
                      @input="handleInput(col)"
                    />
                    <select v-else-if="col.type === 'select'" ref="editInput" v-model="editValue" class="w-full h-full px-1 text-sm border-2 border-blue-500 outline-none" @blur="stopEditing(true)" @change="stopEditing(true)" @mousedown.stop>
                      <option v-for="opt in col.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                    </select>
                  </div>

                  <!-- 읽기 모드 -->
                  <div v-else class="px-2 py-1 text-sm w-full h-full flex items-center overflow-hidden min-w-0" :class="getAlignClass(col.align)">
                    <template v-if="!col.type || col.type === 'text' || col.type === 'number' || col.type === 'date'">
                      <span :class="col.truncate !== false ? 'truncate min-w-0 block w-full' : 'whitespace-normal break-words'">
                        {{ col.type === 'number' ? Number(getRow(itemIdx)?.[col.key] || 0).toLocaleString() : (getRow(itemIdx)?.[col.key] || '') }}
                      </span>
                    </template>
                    <template v-else-if="col.type === 'select'">
                      <span :class="col.truncate !== false ? 'truncate min-w-0 block w-full' : 'whitespace-normal break-words'">{{ getOptionLabel(itemIdx, col) }}</span>
                    </template>
                    <template v-else-if="col.type === 'boolean'">
                      <div class="flex items-center justify-center w-full h-full" @mousedown.stop>
                        <input type="checkbox" :checked="!!getRow(itemIdx)?.[col.key]" @change="toggleBoolean(itemIdx, col.key)" class="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer" />
                      </div>
                    </template>
                    <template v-else-if="col.type === 'badge'">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm" :class="getBadgeColor(itemIdx, col)">{{ getOptionLabel(itemIdx, col) }}</span>
                    </template>
                    <template v-else-if="col.type === 'progress'">
                      <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200 mx-1">
                        <div class="bg-blue-500 h-full transition-all duration-500" :style="{ width: (getRow(itemIdx)?.[col.key] || 0) + '%' }"></div>
                      </div>
                    </template>
                    <template v-else-if="col.type === 'image'">
                      <div class="flex items-center justify-center w-full"><img :src="getRow(itemIdx)?.[col.key]" class="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm" /></div>
                    </template>
                    <template v-else-if="col.type === 'button'">
                      <div class="flex items-center justify-center w-full" @mousedown.stop>
                        <button @click="onButtonClick(itemIdx, col.key)" class="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded border border-blue-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95">{{ col.options?.[0]?.label || '액션' }}</button>
                      </div>
                    </template>
                    <template v-else-if="col.type === 'link'">
                      <div class="flex items-center w-full overflow-hidden" @mousedown.stop>
                        <a :href="getRow(itemIdx)?.[col.key]" target="_blank" class="text-blue-600 hover:underline truncate text-sm flex items-center gap-1">
                          <span class="truncate">{{ getRow(itemIdx)?.[col.key] }}</span>
                          <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      </div>
                    </template>
                    <template v-else-if="col.type === 'radio'">
                      <div class="flex items-center gap-3 overflow-hidden px-1" @mousedown.stop>
                        <label v-for="opt in col.options" :key="opt.value" class="flex items-center gap-1 cursor-pointer whitespace-nowrap text-xs text-gray-600 hover:text-blue-600 transition-colors">
                          <input type="radio" :name="`radio-${getRow(itemIdx)?.id}-${col.key}`" :value="opt.value" :checked="getRow(itemIdx)?.[col.key] === opt.value" @change="updateCellFromItem(itemIdx, col.key, opt.value)" class="w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500" />
                          {{ opt.label }}
                        </label>
                      </div>
                    </template>
                  </div>
                  <div v-if="isSelected(itemIdx, colIdx)" class="absolute inset-0 pointer-events-none border-2 border-blue-500 z-10"></div>
                </td>
                </template>
              </tr>

            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── 페이징 ──────────────────────────────────────────────────────── -->
    <WZGridPagination
      v-if="usePaging"
      :total-filtered-rows="filteredRows.length"
      :total-rows="rows.length"
      :show-filter-note="useFilter && filteredRows.length !== rows.length"
      :checked-count="checkedCount"
      :page-size="pageSize"
      :current-page="currentPage"
      :total-pages="totalPages"
      @update:page-size="$emit('update:pageSize', $event)"
      @go-to="setPage"
    />

  </div>

  <!-- ── 컨텍스트 메뉴 ──────────────────────────────────────────────── -->
  <WZContextMenu
    v-if="useContextMenu"
    :visible="ctxMenu.visible"
    :x="ctxMenu.x"
    :y="ctxMenu.y"
    @clear-cell="ctxClearCell"
    @insert="ctxInsert"
    @delete-row="ctxDeleteRow"
  />

  <!-- ── Pro 업그레이드 모달 ────────────────────────────────────────── -->
  <teleport to="body">
    <div
      v-if="showProModal"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      @click.self="showProModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <!-- 헤더 -->
        <div class="bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-5 text-white text-center">
          <div class="text-3xl mb-1">⭐</div>
          <h2 class="text-lg font-bold">Pro 기능</h2>
          <p class="text-sm opacity-90 mt-1">이 기능은 Pro 라이선스가 필요합니다</p>
        </div>
        <!-- 본문 -->
        <div class="px-6 py-5">
          <ul class="space-y-2 mb-5">
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <span class="text-green-500 font-bold">✓</span> Excel(.xlsx) 내보내기
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <span class="text-green-500 font-bold">✓</span> 고급 그룹핑 & 소계
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <span class="text-green-500 font-bold">✓</span> 셀 병합
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <span class="text-green-500 font-bold">✓</span> 우선순위 기술 지원
            </li>
          </ul>
          <p class="text-xs text-gray-500 mb-4">
            라이선스 키를 <code class="bg-gray-100 px-1 rounded">licenseKey</code> prop으로 전달하세요.
          </p>
          <div class="flex gap-2">
            <button
              @click="showProModal = false"
              class="flex-1 px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              닫기
            </button>
            <a
              href="https://cheerjo.github.io/wz-grid/pricing"
              target="_blank"
              rel="noopener"
              class="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white text-center hover:opacity-90 transition-opacity"
              @click="showProModal = false"
            >
              라이선스 구매 →
            </a>
          </div>
        </div>
      </div>
    </div>
  </teleport>

</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref, reactive, nextTick, watch, onMounted, onBeforeUnmount } from 'vue-demi';
import type { Column, SortConfig, GridItem, DataItem, GroupHeader, SubtotalItem } from '../types/grid';
import { validateLicense, isPro } from '../license';
import { exportExcel } from '../utils/excel';
import { useSelection }      from '../composables/useSelection';
import { useClipboard }      from '../composables/useClipboard';
import { useVirtualScroll }  from '../composables/useVirtualScroll';
import { useColumnSettings } from '../composables/useColumnSettings';
import { useFilter }         from '../composables/useFilter';
import { useGrouping }       from '../composables/useGrouping';
import { useMerge }          from '../composables/useMerge';
import { useSort }           from '../composables/useSort';
import { useColumnDrag }     from '../composables/useColumnDrag';
import { useRowDragDrop }    from '../composables/useRowDragDrop';
import { useValidation }     from '../composables/useValidation';
import { useCheckbox }       from '../composables/useCheckbox';
import WZGridPagination      from './WZGridPagination.vue';
import WZContextMenu         from './WZContextMenu.vue';

const CHECKBOX_WIDTH = 40;
const ROW_DRAG_WIDTH = 28;

export default defineComponent({
  name: 'WZGrid',
  components: { WZGridPagination, WZContextMenu },
  emits: [
    'update:cell',
    'update:currentPage',
    'update:pageSize',
    'update:checked',
    'click:add',
    'click:delete',
    'click:insert',
    'click:button',
    'resize:column',
    'reorder:columns',
    'reorder:rows',
    'sort',
  ],
  props: {
    columns:            { type: Array as PropType<Column[]>, required: true },
    rows:               { type: Array as PropType<any[]>, required: true },
    height:             { type: Number, default: 500 },
    rowHeight:          { type: Number, default: 40 },
    usePaging:          { type: Boolean, default: false },
    pageSize:           { type: Number, default: 20 },
    currentPage:        { type: Number, default: 1 },
    useCheckbox:        { type: Boolean, default: false },
    showAdd:            { type: Boolean, default: false },
    showDelete:         { type: Boolean, default: false },
    useFilter:          { type: Boolean, default: false },
    showColumnSettings: { type: Boolean, default: false },
    groupBy:            { type: String,  default: '' },
    useContextMenu:     { type: Boolean, default: false },
    useRowDrag:         { type: Boolean, default: false },
    autoMergeCols:      { type: Array as PropType<string[]>, default: () => [] },
    mergeCells:         { type: Function as PropType<(row: any, colKey: string) => { rowspan?: number; colspan?: number } | null | void>, default: null },
    licenseKey:         { type: String,  default: '' },
    showExcelExport:    { type: Boolean, default: false },
    excelFilename:      { type: String,  default: 'export.xlsx' },
  },

  setup(props, { emit, slots }) {
    const hasToolbarSlot = computed(() => !!slots.toolbar);
    const containerEl = ref<HTMLElement | null>(null);

    // ── 라이선스 ───────────────────────────────────────────────────────
    const licenseTier  = computed(() => validateLicense(props.licenseKey));
    const isProLicense = computed(() => isPro(licenseTier.value));
    const showProModal = ref(false);
    const { selection, startSelection, updateSelection, endSelection, isSelected, clearSelection, moveSelection } = useSelection();

    // ── 1. 컬럼 표시/숨기기 ────────────────────────────────────────────
    const { hiddenColKeys, visibleColumns, toggleColVisibility, colSettingsOpen } = useColumnSettings(
      () => props.columns
    );

    // ── 2. 필터링 ──────────────────────────────────────────────────────
    const { filters, isFilterActive, activeFilterCount, clearFilter, clearAllFilters, filteredRows } = useFilter(
      () => props.rows,
      () => props.columns,
      () => props.useFilter
    );

    // ── 3. 그룹핑 ──────────────────────────────────────────────────────
    const { collapsedGroups, toggleGroup, flatGroupedItems, groupColTitle } = useGrouping(
      () => filteredRows.value,
      () => props.groupBy,
      () => visibleColumns.value,
      () => props.columns
    );

    // ── 4. 페이징 ──────────────────────────────────────────────────────
    const totalPages = computed(() => Math.ceil(flatGroupedItems.value.length / props.pageSize) || 1);

    const setPage = (page: number) => {
      emit('update:currentPage', Math.max(1, Math.min(page, totalPages.value)));
    };

    watch(() => flatGroupedItems.value.length, () => {
      if (props.currentPage > totalPages.value) setPage(totalPages.value);
    });

    // 필터 변경 시 1페이지로 리셋
    watch(filters, () => { if (props.usePaging) setPage(1); }, { deep: true });

    const pagedItems = computed((): GridItem[] => {
      if (!props.usePaging) return flatGroupedItems.value;
      const start = (props.currentPage - 1) * props.pageSize;
      return flatGroupedItems.value.slice(start, start + props.pageSize);
    });

    // ── 5. 가상 스크롤 ─────────────────────────────────────────────────
    const hasActiveMerge = computed(() => (props.autoMergeCols?.length ?? 0) > 0 || !!props.mergeCells);

    const _vs = useVirtualScroll(computed(() => pagedItems.value.length), props.rowHeight, props.height);

    const topPadding    = computed(() => hasActiveMerge.value ? 0 : _vs.topPadding.value);
    const bottomPadding = computed(() => hasActiveMerge.value ? 0 : _vs.bottomPadding.value);
    const onScroll      = _vs.onScroll;

    const visibleRowsRange = computed(() => {
      if (hasActiveMerge.value) return Array.from({ length: pagedItems.value.length }, (_, i) => i);
      const range = [];
      for (let i = _vs.visibleRange.value.startIdx; i < _vs.visibleRange.value.endIdx; i++) {
        if (i < pagedItems.value.length) range.push(i);
      }
      return range;
    });

    const getItem = (idx: number): GridItem | undefined => pagedItems.value[idx];
    const getRow  = (idx: number): any | undefined => {
      const item = pagedItems.value[idx];
      return item?.type === 'data' ? item.row : undefined;
    };

    // 템플릿에서 as any 없이 사용하기 위한 타입 안전 헬퍼
    const asGroupHeader = (idx: number) => getItem(idx) as GroupHeader;
    const asSubtotal    = (idx: number) => getItem(idx) as SubtotalItem;

    // ── 6. 체크박스 ────────────────────────────────────────────────────
    const { checkedIds, isAllChecked, checkedCount, isRowChecked, toggleAll, toggleRow, headerCheckboxEl } = useCheckbox(
      () => filteredRows.value,
      () => props.rows,
      (checked) => emit('update:checked', checked)
    );

    const handleDelete = () => {
      const checked = props.rows.filter(r => checkedIds.value.has(r.id));
      emit('click:delete', checked);
    };

    const handleExcelExport = () => {
      if (!isProLicense.value) { showProModal.value = true; return; }
      exportExcel(props.columns as Column[], props.rows, {
        filename: props.excelFilename,
        checkedOnly: props.useCheckbox,
        checkedRows: props.rows.filter(r => checkedIds.value.has(r.id)),
      });
    };

    // ── 7. 셀 병합 ─────────────────────────────────────────────────────
    const { getMerge } = useMerge(
      () => pagedItems.value,
      () => visibleColumns.value,
      () => props.autoMergeCols || [],
      () => props.mergeCells || null
    );

    // ── 8. 컨텍스트 메뉴 ──────────────────────────────────────────────
    const ctxMenu = reactive({ visible: false, x: 0, y: 0, itemIdx: -1, colIdx: -1 });

    const openContextMenu = (e: MouseEvent, itemIdx: number, colIdx: number) => {
      e.preventDefault();
      e.stopPropagation();
      const menuW = 170, menuH = 180;
      ctxMenu.x = e.clientX + menuW > window.innerWidth  ? e.clientX - menuW : e.clientX;
      ctxMenu.y = e.clientY + menuH > window.innerHeight ? e.clientY - menuH : e.clientY;
      ctxMenu.itemIdx = itemIdx; ctxMenu.colIdx = colIdx; ctxMenu.visible = true;
    };

    const closeCtxMenu = () => { ctxMenu.visible = false; };
    onMounted(()       => document.addEventListener('click', closeCtxMenu));
    onBeforeUnmount(() => document.removeEventListener('click', closeCtxMenu));

    const ctxClearCell = () => {
      const row = getRow(ctxMenu.itemIdx);
      const col = visibleColumns.value[ctxMenu.colIdx];
      if (row && col) { const fullIdx = props.rows.findIndex(r => r.id === row.id); updateCell(fullIdx, col.key, ''); }
      closeCtxMenu();
    };
    const ctxInsert = (position: 'above' | 'below') => {
      emit('click:insert', { position, row: getRow(ctxMenu.itemIdx) }); closeCtxMenu();
    };
    const ctxDeleteRow = () => {
      const row = getRow(ctxMenu.itemIdx);
      if (row) emit('click:delete', [row]); closeCtxMenu();
    };

    // ── 9. 행 드래그 순서 변경 ─────────────────────────────────────────
    const { rowDragSrcIdx, rowDragOverIdx, rowDragOverPos, onRowDragStart, onRowDragOver, onRowDrop, onRowDragEnd } = useRowDragDrop(
      getRow,
      (from, to, position) => emit('reorder:rows', { from, to, position })
    );

    // ── 10. 유효성 검사 ────────────────────────────────────────────────
    const { errors, validateCell } = useValidation(() => props.rows, () => props.columns);
    const hasError = (rowIdx: number, colKey: string) => { const row = getRow(rowIdx); return row ? !!errors[`${row.id}:${colKey}`] : false; };
    const getError = (rowIdx: number, colKey: string) => { const row = getRow(rowIdx); return row ? errors[`${row.id}:${colKey}`] : ''; };

    // ── 11. 스타일 & 리사이즈 ──────────────────────────────────────────
    const getColumnStyle = (col: Column, colIdx: number) => {
      const px = (col.width || 150) + 'px';
      const style: Record<string, any> = { width: px, minWidth: px, maxWidth: px };
      if (col.pinned) {
        let left = 0;
        if (props.useRowDrag)  left += ROW_DRAG_WIDTH;
        if (props.useCheckbox) left += CHECKBOX_WIDTH;
        for (let i = 0; i < colIdx; i++) {
          if (visibleColumns.value[i]?.pinned) left += (visibleColumns.value[i].width || 150);
        }
        style.left = left + 'px';
      }
      return style;
    };

    const getAlignClass = (align?: string) => ({
      'justify-start':  !align || align === 'left',
      'justify-center': align === 'center',
      'justify-end':    align === 'right',
    });

    const isResizing = ref(false);
    let resizedRecently = false;
    const startResize = (e: MouseEvent, colIdx: number) => {
      isResizing.value = true;
      resizedRecently = false;
      const startX = e.pageX;
      const startWidth = visibleColumns.value[colIdx]?.width || 150;
      const colKey = visibleColumns.value[colIdx]?.key;
      const onMouseMove = (ev: MouseEvent) => {
        resizedRecently = true;
        emit('resize:column', { colIdx, colKey, width: Math.max(50, startWidth + (ev.pageX - startX)) });
      };
      const onMouseUp = () => {
        isResizing.value = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };
    const onHeaderClick = (key: string, e: MouseEvent) => {
      if (resizedRecently) { resizedRecently = false; return; }
      toggleSort(key, e);
    };

    // ── 12. 컬럼 드래그 앤 드롭 순서 변경 ─────────────────────────────
    const { dragSourceColIdx, dragOverColIdx, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd } = useColumnDrag(
      () => visibleColumns.value,
      (srcKey, targetKey) => emit('reorder:columns', { srcKey, targetKey }),
      () => isResizing.value
    );

    // ── 13. 다중 정렬 ──────────────────────────────────────────────────
    const { sortConfigs, getSortEntry, getSortIndex, toggleSort } = useSort(
      (configs) => emit('sort', configs)
    );

    // ── 14. 편집 ───────────────────────────────────────────────────────
    const editing   = reactive({ rowId: null as any, colIdx: -1 });
    const editValue = ref<any>('');
    const editInput = ref<any>(null);

    const handleInput = (col: Column) => { if (col.onInput) editValue.value = col.onInput(editValue.value); };

    const isEditing = (rIdx: number, cIdx: number) => {
      const row = getRow(rIdx);
      return row && editing.rowId === row.id && editing.colIdx === cIdx;
    };

    const updateCell = (fullIdx: number, key: string, val: any) => {
      const row = props.rows[fullIdx];
      if (row) emit('update:cell', { rowIdx: fullIdx, row, colKey: key, value: val });
    };

    const updateCellFromItem = (itemIdx: number, key: string, val: any) => {
      const row = getRow(itemIdx);
      if (!row) return;
      const fullIdx = props.rows.findIndex(r => r.id === row.id);
      updateCell(fullIdx, key, val);
    };

    const startEditing = async (rIdx: number, cIdx: number, initialValue?: string) => {
      const row = getRow(rIdx);
      const col = visibleColumns.value[cIdx];
      if (!row || !col || ['boolean', 'progress', 'badge', 'image', 'button', 'link', 'radio'].includes(col.type || '')) return;
      editing.rowId = row.id; editing.colIdx = cIdx;
      const useInitial = initialValue !== undefined && col.type !== 'date';
      editValue.value = useInitial ? initialValue : row[col.key];
      clearSelection(); await nextTick();
      const el = Array.isArray(editInput.value) ? editInput.value[0] : editInput.value; el?.focus();
      if (initialValue !== undefined) handleInput(col);
    };

    const stopEditing = (save: boolean) => {
      if (save && editing.rowId !== null) {
        const fullRowIdx = props.rows.findIndex(r => r.id === editing.rowId);
        if (fullRowIdx !== -1) {
          const col = visibleColumns.value[editing.colIdx];
          if (col) { validateCell(props.rows[fullRowIdx], col, editValue.value); updateCell(fullRowIdx, col.key, editValue.value); }
        }
      }
      editing.rowId = null; editing.colIdx = -1;
    };

    const toggleBoolean = (pagedIdx: number, key: string) => {
      const row = getRow(pagedIdx);
      if (row) { const fullIdx = props.rows.findIndex(r => r.id === row.id); updateCell(fullIdx, key, !row[key]); }
    };

    // ── 15. 키보드 ─────────────────────────────────────────────────────
    const pagedDataRows = computed(() => pagedItems.value.filter((i): i is DataItem => i.type === 'data').map(i => i.row));

    const scrollToCell = (rowIdx: number, colIdx: number) => {
      const el = containerEl.value;
      if (!el) return;

      // 수직 스크롤 — sticky 헤더 높이 고려
      const headerHeight = el.querySelector('thead')?.clientHeight ?? 0;
      const rowTop    = rowIdx * props.rowHeight;
      const rowBottom = rowTop + props.rowHeight;
      if (rowTop < el.scrollTop) {
        el.scrollTop = rowTop;
      } else if (headerHeight + rowBottom > el.scrollTop + el.clientHeight) {
        el.scrollTop = headerHeight + rowBottom - el.clientHeight;
      }

      // 수평 스크롤 — 실제 DOM TH 위치 기반으로 정확하게 계산
      const cols = visibleColumns.value;
      const col  = cols[colIdx];
      if (!col || col.pinned) return;

      const extraCols  = (props.useRowDrag ? 1 : 0) + (props.useCheckbox ? 1 : 0);
      const ths        = el.querySelectorAll<HTMLElement>('thead tr:first-child th');
      const th         = ths[extraCols + colIdx];
      if (!th) return;

      const thRect  = th.getBoundingClientRect();
      const elRect  = el.getBoundingClientRect();
      const pinnedWidth = (props.useCheckbox ? CHECKBOX_WIDTH : 0)
                        + (props.useRowDrag  ? ROW_DRAG_WIDTH  : 0)
                        + cols.filter(c => c.pinned).reduce((s, c) => s + (c.width || 150), 0);

      const leftBound  = elRect.left + pinnedWidth;
      const rightBound = elRect.right - 2; // 컨테이너 우측 border 1px + 여유 1px

      if (thRect.right > rightBound) {
        el.scrollLeft += thRect.right - rightBound;
      } else if (thRect.left < leftBound) {
        el.scrollLeft -= leftBound - thRect.left;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (editing.rowId !== null) return;
      const dirs: any = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
      if (dirs[e.key]) {
        e.preventDefault();
        moveSelection(dirs[e.key], e.shiftKey, pagedDataRows.value.length, visibleColumns.value.length);
        const focusRow = e.shiftKey ? selection.endRow : selection.startRow;
        const focusCol = e.shiftKey ? selection.endCol : selection.startCol;
        scrollToCell(focusRow, focusCol);
      } else if (e.key === 'Enter') {
        e.preventDefault(); startEditing(selection.startRow, selection.startCol);
      } else if (e.key === 'Escape') {
        clearSelection();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        const colKey = visibleColumns.value[selection.startCol]?.key;
        if (colKey) updateCellFromItem(selection.startRow, colKey, '');
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (selection.startRow !== -1) { e.preventDefault(); startEditing(selection.startRow, selection.startCol, e.key); }
      }
    };

    // ── 16. 표시 헬퍼 ──────────────────────────────────────────────────
    const onButtonClick = (pagedIdx: number, key: string) => {
      const row = getRow(pagedIdx);
      if (row) { const fullIdx = props.rows.findIndex(r => r.id === row.id); emit('click:button', { rowIdx: fullIdx, row, colKey: key }); }
    };

    const getOptionLabel = (idx: number, col: Column) => {
      const r = getRow(idx); const v = r?.[col.key];
      return col.options?.find(o => o.value === v)?.label || v || '';
    };
    const getBadgeColor = (idx: number, col: Column) => {
      const r = getRow(idx); const v = r?.[col.key];
      return col.options?.find(o => o.value === v)?.color || 'bg-blue-100 text-blue-600';
    };
    const getTooltipValue = (rowIdx: number, col: Column): string => {
      const row = getRow(rowIdx); if (!row) return '';
      const val = row[col.key];
      if (col.type === 'select' || col.type === 'badge') return col.options?.find(o => o.value === val)?.label || String(val ?? '');
      if (col.type === 'number') return Number(val || 0).toLocaleString();
      return String(val ?? '');
    };

    // ── 17. 클립보드 ───────────────────────────────────────────────────
    const updateCellByDataIdx = (dataIdx: number, key: string, val: any) => {
      const row = pagedDataRows.value[dataIdx];
      if (!row) return;
      const fullIdx = props.rows.findIndex(r => r.id === row.id);
      updateCell(fullIdx, key, val);
    };

    const { onCopy, onPaste } = useClipboard(
      selection,
      () => visibleColumns.value as Column[],
      () => pagedDataRows.value as any[],
      updateCellByDataIdx
    );

    return {
      containerEl,
      CHECKBOX_WIDTH, ROW_DRAG_WIDTH,
      // license
      isProLicense, showProModal, handleExcelExport,
      // toolbar
      hasToolbarSlot, hiddenColKeys, visibleColumns, toggleColVisibility,
      colSettingsOpen, activeFilterCount, clearAllFilters, handleDelete,
      // filter
      filters, isFilterActive, clearFilter,
      // sort
      sortConfigs, toggleSort, getSortEntry, getSortIndex, onHeaderClick,
      // column drag
      dragSourceColIdx, dragOverColIdx, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd,
      // grouping
      collapsedGroups, toggleGroup, groupColTitle, getItem, asGroupHeader, asSubtotal,
      // merge
      getMerge,
      // context menu
      ctxMenu, openContextMenu, ctxClearCell, ctxInsert, ctxDeleteRow,
      // row drag
      rowDragSrcIdx, rowDragOverIdx, rowDragOverPos,
      onRowDragStart, onRowDragOver, onRowDrop, onRowDragEnd,
      // grid
      topPadding, bottomPadding, onScroll, visibleRowsRange, filteredRows,
      isSelected, startSelection, updateSelection, endSelection,
      onCopy, onPaste,
      // editing
      isEditing, startEditing, stopEditing, editValue, editInput,
      toggleBoolean, handleInput, updateCell, updateCellFromItem,
      // display
      onButtonClick, getOptionLabel, getBadgeColor, getTooltipValue, getRow,
      startResize, handleKeyDown, getColumnStyle, getAlignClass,
      hasError, getError,
      // paging
      totalPages, setPage,
      // checkbox
      headerCheckboxEl, isAllChecked, checkedCount, isRowChecked, toggleAll, toggleRow,
    };
  }
});
</script>

<style scoped>
.wz-grid-wrapper { overflow: hidden; }
.wz-grid-container:focus { outline: none; }
.sticky { position: sticky !important; }
.z-40 { z-index: 40; }
.z-30 { z-index: 30; }
.z-10 { z-index: 10; }

.filter-input {
  width: 100%;
  font-size: 11px;
  padding: 2px 16px 2px 4px;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  outline: none;
  background: white;
  color: #374151;
  min-width: 0;
}
.filter-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6; }
.filter-input::placeholder { color: #9ca3af; }

.row-drag-over-top    td { box-shadow: 0 -2px 0 0 #3b82f6 inset; }
.row-drag-over-bottom td { box-shadow: 0 2px 0 0 #3b82f6; }
</style>
