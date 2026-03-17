<!-- src/components/WZGrid.vue -->
<template>
  <div class="wz-grid-wrapper flex flex-col" :style="{ height: height + 'px' }">

    <!-- ── 툴바 ──────────────────────────────────────────────────────────── -->
    <WZGridToolbar
      v-if="showAdd || showDelete || hasToolbarSlot || effShowColumnSettings || effShowExcelExport || useTree"
      :columns="columns"
      :hidden-col-keys="hiddenColKeys"
      :col-settings-open="colSettingsOpen"
      :eff-show-column-settings="effShowColumnSettings"
      :use-tree="useTree"
      :use-filter="useFilter"
      :active-filter-count="activeFilterCount"
      :show-add="showAdd"
      :show-delete="showDelete"
      :eff-show-excel-export="effShowExcelExport"
      :is-pro-license="isProLicense"
      :checked-count="checkedCount"
      :has-toolbar-slot="hasToolbarSlot"
      @toggle-col-settings="colSettingsOpen = !colSettingsOpen"
      @show-all-cols="hiddenColKeys = []"
      @toggle-col-visibility="toggleColVisibility"
      @expand-all="expandAll"
      @collapse-all="collapseAll"
      @clear-all-filters="clearAllFilters"
      @delete="handleDelete"
      @add="$emit('click:add')"
      @excel-export="handleExcelExport"
    >
      <template #toolbar>
        <slot name="toolbar" />
      </template>
    </WZGridToolbar>

    <!-- ── 그리드 컨테이너 ─────────────────────────────────────────────── -->
    <div
      :class="(showAdd || showDelete || hasToolbarSlot || effShowColumnSettings) ? 'rounded-b border-t-0' : 'rounded'"
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

          <!-- ── 헤더 ───────────────────────────────────────────────────── -->
          <WZGridHeader
            :visible-columns="visibleColumns"
            :use-checkbox="useCheckbox"
            :eff-use-row-drag="effUseRowDrag"
            :eff-use-detail="effUseDetail"
            :eff-use-advanced-filter="effUseAdvancedFilter"
            :use-filter="useFilter"
            :is-all-checked="isAllChecked"
            :is-indeterminate="isIndeterminate"
            :sort-configs="sortConfigs"
            :get-sort-entry="getSortEntry"
            :get-sort-index="getSortIndex"
            :is-filter-active="isFilterActive"
            :filters="filters"
            :multi-select-filter-open="multiSelectFilterOpen"
            :drag-source-col-idx="dragSourceColIdx"
            :drag-over-col-idx="dragOverColIdx"
            :get-column-style="getColumnStyle"
            :get-align-class="getAlignClass"
            :checkbox-width="CHECKBOX_WIDTH"
            :row-drag-width="ROW_DRAG_WIDTH"
            :detail-expand-width="DETAIL_EXPAND_WIDTH"
            @toggle-all="toggleAll"
            @col-drag-start="(idx, evt) => onDragStart(idx, evt)"
            @col-drag-over="onDragOver"
            @col-drag-leave="onDragLeave"
            @col-drop="onDrop"
            @col-drag-end="onDragEnd"
            @header-click="onHeaderClick"
            @start-resize="(evt, idx) => startResize(evt, idx)"
            @auto-fit-column="autoFitColumn"
            @clear-filter="clearFilter"
            @toggle-multi-select-filter-open="toggleMultiSelectFilterOpen"
            @select-all-filter-options="selectAllFilterOptions"
            @deselect-all-filter-options="deselectAllFilterOptions"
            @toggle-multi-select-filter="toggleMultiSelectFilter"
          />

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
                <td v-if="effUseRowDrag" :style="{ width: ROW_DRAG_WIDTH + 'px', minWidth: ROW_DRAG_WIDTH + 'px' }" class="border-b border-r border-gray-200 p-0 sticky left-0 z-10 bg-blue-50"></td>
                <td v-if="effUseDetail" :style="{ width: DETAIL_EXPAND_WIDTH + 'px', minWidth: DETAIL_EXPAND_WIDTH + 'px', left: (effUseRowDrag ? ROW_DRAG_WIDTH : 0) + 'px' }" class="border-b border-r border-gray-200 p-0 sticky z-10 bg-blue-50"></td>
                <td v-if="useCheckbox" :style="{ width: CHECKBOX_WIDTH + 'px', minWidth: CHECKBOX_WIDTH + 'px', left: (effUseRowDrag ? ROW_DRAG_WIDTH : 0) + (effUseDetail ? DETAIL_EXPAND_WIDTH : 0) + 'px' }" class="border-b border-r border-gray-200 p-0 sticky z-10 bg-blue-50"></td>
                <td :colspan="visibleColumns.length" class="border-b border-gray-300 px-3 py-0">
                  <div class="flex items-center gap-2">
                    <span class="text-blue-500 w-3 text-center flex-shrink-0">{{ asGroupHeader(itemIdx).collapsed ? '&#9654;' : '&#9660;' }}</span>
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
                <td v-if="effUseRowDrag" :style="{ width: ROW_DRAG_WIDTH + 'px', minWidth: ROW_DRAG_WIDTH + 'px' }" class="border-b border-r border-gray-200 p-0 sticky left-0 z-10 bg-amber-50"></td>
                <td v-if="effUseDetail" :style="{ width: DETAIL_EXPAND_WIDTH + 'px', minWidth: DETAIL_EXPAND_WIDTH + 'px', left: (effUseRowDrag ? ROW_DRAG_WIDTH : 0) + 'px' }" class="border-b border-r border-gray-200 p-0 sticky z-10 bg-amber-50"></td>
                <td v-if="useCheckbox" :style="{ width: CHECKBOX_WIDTH + 'px', minWidth: CHECKBOX_WIDTH + 'px', left: (effUseRowDrag ? ROW_DRAG_WIDTH : 0) + (effUseDetail ? DETAIL_EXPAND_WIDTH : 0) + 'px' }" class="border-b border-r border-gray-200 p-0 sticky z-10 bg-amber-50"></td>
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
              <WZGridRow
                v-else
                :item-idx="itemIdx"
                :row="getRow(itemIdx)"
                :row-height="rowHeight"
                :visible-columns="visibleColumns"
                :use-checkbox="useCheckbox"
                :eff-use-row-drag="effUseRowDrag"
                :eff-use-detail="effUseDetail"
                :eff-use-context-menu="effUseContextMenu"
                :use-tree="useTree"
                :effective-tree-key="effectiveTreeKey"
                :checkbox-width="CHECKBOX_WIDTH"
                :row-drag-width="ROW_DRAG_WIDTH"
                :detail-expand-width="DETAIL_EXPAND_WIDTH"
                :row-drag-src-idx="rowDragSrcIdx"
                :row-drag-over-idx="rowDragOverIdx"
                :row-drag-over-pos="rowDragOverPos"
                :row-class="rowClass"
                :cell-class="cellClass"
                :get-merge="getMerge"
                :is-selected="isSelected"
                :is-editing="isEditing"
                :is-row-checked="isRowChecked"
                :is-detail-expanded="isDetailExpanded"
                :is-expanded="isExpanded"
                :get-tree-level="getTreeLevel"
                :get-tree-has-children="getTreeHasChildren"
                :get-column-style="getColumnStyle"
                :get-align-class="getAlignClass"
                :get-option-label="getOptionLabel"
                :get-badge-color="getBadgeColor"
                :get-tooltip-value="getTooltipValue"
                :has-error="hasError"
                :get-error="getError"
                v-model:edit-value="editValue"
                :editing-row-id="editing.rowId"
                :editing-col-idx="editing.colIdx"
                :parent-slots="$slots"
                @row-click="onRowClick"
                @row-drag-over="onRowDragOver"
                @row-drop="onRowDrop"
                @row-drag-end="onRowDragEnd"
                @row-drag-start="onRowDragStart"
                @toggle-detail="toggleDetailExpand"
                @toggle-row="toggleRow"
                @start-selection="startSelection"
                @update-selection="updateSelection"
                @end-selection="endSelection"
                @start-editing="startEditing"
                @stop-editing="stopEditing"
                @handle-input="handleInput"
                @open-context-menu="openContextMenu"
                @toggle-boolean="toggleBoolean"
                @toggle-node="toggleNode"
                @button-click="onButtonClick"
                @update-cell-from-item="updateCellFromItem"
              />

              <!-- ── 디테일 확장 행 ─────────────────────────────────────── -->
              <tr
                v-if="effUseDetail && getItem(itemIdx)?.type === 'data' && isDetailExpanded(getRow(itemIdx)?.id)"
                class="bg-gray-50"
              >
                <td
                  :colspan="visibleColumns.length + (effUseRowDrag ? 1 : 0) + (effUseDetail ? 1 : 0) + (useCheckbox ? 1 : 0)"
                  class="border-b border-gray-200 p-0"
                >
                  <div class="px-4 py-3">
                    <slot
                      name="detail"
                      :row="getRow(itemIdx)"
                      :rowIndex="itemIdx"
                    />
                  </div>
                </td>
              </tr>

            </template>
          </tbody>
        </table>
      </div>

    </div>

    <!-- ── 푸터 집계 행 ───────────────────────────────────────────────── -->
    <div
      v-if="showFooter"
      ref="footerEl"
      class="wz-grid-footer overflow-hidden bg-blue-50 border-t-2 border-blue-300 shadow-[0_-1px_3px_rgba(0,0,0,0.08)] flex-shrink-0"
    >
      <div style="min-width: max-content">
        <table class="table-fixed border-separate border-spacing-0">
          <tbody>
            <tr>
              <td v-if="effUseRowDrag" :style="{ width: ROW_DRAG_WIDTH + 'px', minWidth: ROW_DRAG_WIDTH + 'px' }" class="border-r border-blue-200"></td>
              <td v-if="effUseDetail" :style="{ width: DETAIL_EXPAND_WIDTH + 'px', minWidth: DETAIL_EXPAND_WIDTH + 'px' }" class="border-r border-blue-200"></td>
              <td
                v-if="useCheckbox"
                :style="{ width: CHECKBOX_WIDTH + 'px', minWidth: CHECKBOX_WIDTH + 'px', position: 'sticky', left: (effUseRowDrag ? ROW_DRAG_WIDTH : 0) + (effUseDetail ? DETAIL_EXPAND_WIDTH : 0) + 'px' }"
                class="border-r border-blue-200 bg-blue-50 z-10"
              ></td>
              <td
                v-for="(col, colIdx) in visibleColumns"
                :key="'footer-' + col.key"
                :style="{ ...getColumnStyle(col, colIdx), ...(col.pinned ? { position: 'sticky', zIndex: 10 } : {}) }"
                class="px-2 py-1.5 border-r border-blue-200 text-xs font-semibold text-blue-800"
                :class="[getAlignClass(col.align), { 'bg-blue-50': col.pinned }]"
              >
                <template v-if="footerValues[col.key] !== undefined">
                  <span v-if="col.footerLabel" class="text-blue-500 font-normal mr-1">{{ col.footerLabel }}</span>
                  <span>{{ col.footer === 'count' || col.footer === 'sum' || col.footer === 'min' || col.footer === 'max' ? Number(footerValues[col.key]).toLocaleString() : footerValues[col.key] }}</span>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── 페이징 ──────────────────────────────────────────────────────── -->
    <WZGridPagination
      v-if="usePaging"
      :total-filtered-rows="effServerSide && totalRows > 0 ? totalRows : filteredRows.length"
      :total-rows="effServerSide && totalRows > 0 ? totalRows : rows.length"
      :show-filter-note="!effServerSide && useFilter && filteredRows.length !== rows.length"
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
    v-if="effUseContextMenu"
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
          <div class="text-3xl mb-1">&#11088;</div>
          <h2 class="text-lg font-bold">Pro 기능</h2>
          <p class="text-sm opacity-90 mt-1">이 기능은 Pro 라이선스가 필요합니다</p>
        </div>
        <!-- 본문 -->
        <div class="px-6 py-5">
          <ul class="space-y-2 mb-5">
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <span class="text-green-500 font-bold">&#10003;</span> Excel(.xlsx) 내보내기
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <span class="text-green-500 font-bold">&#10003;</span> 고급 그룹핑 &amp; 소계
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <span class="text-green-500 font-bold">&#10003;</span> 셀 병합
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <span class="text-green-500 font-bold">&#10003;</span> 우선순위 기술 지원
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
              라이선스 구매 &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  </teleport>

</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref, reactive, watch, onMounted, onBeforeUnmount } from 'vue-demi';
import type { Column, SortConfig, GridItem, DataItem, GroupHeader, SubtotalItem, GridRow } from '../types/grid';
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
import { useTree }           from '../composables/useTree';
import WZGridPagination      from './WZGridPagination.vue';
import WZContextMenu         from './WZContextMenu.vue';
import WZGridToolbar         from './WZGridToolbar.vue';
import WZGridHeader          from './WZGridHeader.vue';
import WZGridRow             from './WZGridRow.vue';

const CHECKBOX_WIDTH = 40;
const ROW_DRAG_WIDTH = 28;

export default defineComponent({
  name: 'WZGrid',
  components: { WZGridPagination, WZContextMenu, WZGridToolbar, WZGridHeader, WZGridRow },
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
    'click:row',
    'update:filters',
  ],
  props: {
    columns:            { type: Array as PropType<Column[]>, required: true },
    rows:               { type: Array as PropType<GridRow[]>, required: true },
    height:             { type: Number, default: 500 },
    rowHeight:          { type: Number, default: 40 },
    usePaging:          { type: Boolean, default: false },
    pageSize:           { type: Number, default: 20 },
    currentPage:        { type: Number, default: 1 },
    useCheckbox:        { type: Boolean, default: false },
    showAdd:            { type: Boolean, default: false },
    showDelete:         { type: Boolean, default: false },
    useFilter:          { type: Boolean, default: false },
    /** @deprecated `useColumnSettings`를 사용하세요. 하위 호환을 위해 유지됩니다. */
    showColumnSettings: { type: Boolean, default: false },
    /** showColumnSettings의 통일된 네이밍 alias (권장). 두 prop 중 하나라도 true이면 활성화됩니다. */
    useColumnSettings:  { type: Boolean, default: false },
    groupBy:            { type: String,  default: '' },
    useContextMenu:     { type: Boolean, default: false },
    useRowDrag:         { type: Boolean, default: false },
    autoMergeCols:      { type: Array as PropType<string[]>, default: () => [] },
    mergeCells:         { type: Function as PropType<(row: any, colKey: string) => { rowspan?: number; colspan?: number } | null | void>, default: null },
    licenseKey:         { type: String,  default: '' },
    /** @deprecated `useExcelExport`를 사용하세요. 하위 호환을 위해 유지됩니다. */
    showExcelExport:    { type: Boolean, default: false },
    /** showExcelExport의 통일된 네이밍 alias (권장). 두 prop 중 하나라도 true이면 활성화됩니다. */
    useExcelExport:     { type: Boolean, default: false },
    excelFilename:      { type: String,  default: 'export.xlsx' },
    showFooter:         { type: Boolean, default: false },
    useTree:            { type: Boolean, default: false },
    treeKey:            { type: String,  default: '' },
    childrenKey:        { type: String,  default: 'children' },
    rowClass:           { type: Function as PropType<(row: any, rowIndex: number) => any>, default: null },
    cellClass:          { type: Function as PropType<(row: any, column: Column, rowIndex: number) => any>, default: null },
    /** @deprecated `useServerSide`를 사용하세요. 하위 호환을 위해 유지됩니다. */
    serverSide:         { type: Boolean, default: false },
    /** serverSide의 통일된 네이밍 alias (권장). 두 prop 중 하나라도 true이면 활성화됩니다. */
    useServerSide:      { type: Boolean, default: false },
    totalRows:          { type: Number, default: 0 },
  },

  setup(props, { emit, slots }) {
    const hasToolbarSlot = computed(() => !!slots.toolbar);
    const containerEl = ref<HTMLElement | null>(null);
    const footerEl    = ref<HTMLElement | null>(null);

    // ── 라이선스 ───────────────────────────────────────────────────────
    const licenseTier  = computed(() => validateLicense(props.licenseKey));
    const isProLicense = computed(() => isPro(licenseTier.value));
    const showProModal = ref(false);

    // ── Pro 기능 게이팅 ────────────────────────────────────────────────
    // warnPro: side-effect는 watch에서만 호출, computed는 순수하게 유지
    const _warnedPro = new Set<string>();
    const warnPro = (feature: string) => {
      if (_warnedPro.has(feature)) return;
      _warnedPro.add(feature);
      console.warn(`[WZ-Grid] "${feature}" is a Pro feature. A valid licenseKey is required. https://cheerjo.github.io/wz-grid/pricing`);
    };

    // ── eff computed: 순수 계산만 수행 (side-effect 없음) ────────────
    // alias prop(useColumnSettings, useExcelExport, useServerSide)은 기존 prop과 || 로 병합됩니다.
    const effShowColumnSettings = computed(() => (props.showColumnSettings || props.useColumnSettings) && isProLicense.value);
    const effUseContextMenu     = computed(() => props.useContextMenu     && isProLicense.value);
    const effUseRowDrag         = computed(() => props.useRowDrag         && isProLicense.value);
    const effGroupBy            = computed(() => isProLicense.value ? props.groupBy : '');
    const effAutoMergeCols      = computed((): string[] => isProLicense.value ? (props.autoMergeCols || []) : []);
    const effMergeCells         = computed(() => isProLicense.value ? (props.mergeCells || null) : null);
    // 버그 수정: props.useFilter가 false이면 고급 필터도 false
    const effUseAdvancedFilter  = computed(() => {
      if (!props.useFilter) return false;
      return isProLicense.value;
    });
    const effServerSide         = computed(() => (props.serverSide || props.useServerSide) && isProLicense.value);
    const effShowExcelExport    = computed(() => (props.showExcelExport || props.useExcelExport) && isProLicense.value);
    const hasDetailSlot         = computed(() => !!slots.detail);
    const effUseDetail          = computed(() => hasDetailSlot.value && isProLicense.value);

    // ── Pro 기능 사용 경고 (side-effect는 watch에서만) ────────────────
    watch(isProLicense, (isValid) => {
      if (isValid) return;
      if (props.showColumnSettings || props.useColumnSettings) warnPro('useColumnSettings');
      if (props.useContextMenu)                                warnPro('useContextMenu');
      if (props.useRowDrag)                                    warnPro('useRowDrag');
      if (props.groupBy)                                       warnPro('groupBy');
      if ((props.autoMergeCols?.length ?? 0) > 0)             warnPro('autoMergeCols');
      if (props.mergeCells !== null)                           warnPro('mergeCells');
      if (props.serverSide || props.useServerSide)             warnPro('useServerSide');
      if (hasDetailSlot.value)                                 warnPro('detail');
    }, { immediate: true });

    // ── 정렬 (데이터 흐름 최상단: props.rows → sortedRows) ──────────────
    // serverSide=true이면 정렬을 수행하지 않고 원본 rows를 그대로 반환합니다.
    const { sortConfigs, getSortEntry, getSortIndex, toggleSort, sortedRows } = useSort(
      (configs) => emit('sort', configs),
      () => props.rows,
      () => effServerSide.value,
      () => props.columns
    );

    // ── 마스터-디테일 Row Expand ─────────────────────────────────────
    const expandedRowIds = reactive(new Set<any>());
    const DETAIL_EXPAND_WIDTH = 28;
    const toggleDetailExpand = (rowId: any) => {
      if (expandedRowIds.has(rowId)) expandedRowIds.delete(rowId);
      else expandedRowIds.add(rowId);
    };
    const isDetailExpanded = (rowId: any) => expandedRowIds.has(rowId);

    // ── 다중 선택 필터 드롭다운 ─────────────────────────────────────────
    const multiSelectFilterOpen = ref<string>('');
    const toggleMultiSelectFilterOpen = (key: string) => {
      multiSelectFilterOpen.value = multiSelectFilterOpen.value === key ? '' : key;
    };
    const toggleMultiSelectFilter = (colKey: string, value: any) => {
      const f = filters[colKey];
      if (!f || !('values' in f)) return;
      const arr = f.values as any[];
      const idx = arr.indexOf(value);
      if (idx === -1) arr.push(value);
      else arr.splice(idx, 1);
    };
    const selectAllFilterOptions = (col: Column) => {
      const f = filters[col.key];
      if (!f || !('values' in f) || !col.options) return;
      f.values = col.options.map((o: any) => o.value);
    };
    const deselectAllFilterOptions = (colKey: string) => {
      const f = filters[colKey];
      if (!f || !('values' in f)) return;
      f.values = [];
    };

    const { selection, startSelection, updateSelection, endSelection, isSelected, clearSelection, moveSelection } = useSelection();

    // ── 1. 컬럼 표시/숨기기 ────────────────────────────────────────────
    const { hiddenColKeys, visibleColumns, toggleColVisibility, colSettingsOpen } = useColumnSettings(
      () => props.columns
    );

    // ── 트리: 모든 노드 플래튼 (필터 입력에 사용) ─────────────────────
    // sortedRows를 입력으로 받아 props.rows → sortedRows → treeAllFlat → filteredRows 흐름 유지
    const treeAllFlat = computed((): GridRow[] => {
      if (!props.useTree) return sortedRows.value;
      const childKey = props.childrenKey || 'children';
      const result: GridRow[] = [];
      function flatten(rows: GridRow[]) {
        for (const row of rows) {
          result.push(row);
          const ch = row[childKey];
          if (Array.isArray(ch)) flatten(ch);
        }
      }
      flatten(sortedRows.value);
      return result;
    });

    // ── 2. 필터링 ──────────────────────────────────────────────────────
    const { filters, isFilterActive, activeFilterCount, clearFilter, clearAllFilters, filteredRows } = useFilter(
      () => treeAllFlat.value,
      () => props.columns,
      () => props.useFilter && !effServerSide.value  // 서버사이드 모드에서는 클라이언트 필터링 비활성화
    );

    // 서버사이드 모드: 필터 변경 시 이벤트 emit
    watch(filters, (newFilters) => {
      if (effServerSide.value && props.useFilter) {
        const filterState: Record<string, any> = {};
        for (const col of props.columns) {
          if (isFilterActive(col.key)) {
            filterState[col.key] = { ...newFilters[col.key] };
          }
        }
        emit('update:filters', filterState);
      }
    }, { deep: true });

    // ── 2-1. 푸터 집계 ─────────────────────────────────────────────────
    const footerValues = computed((): Record<string, any> => {
      if (!props.showFooter) return {};
      const dataRows = filteredRows.value;
      const result: Record<string, any> = {};
      for (const col of visibleColumns.value as Column[]) {
        if (!col.footer) continue;
        const vals = dataRows.map((r: any) => r[col.key]).filter((v: any) => v !== null && v !== undefined && v !== '');
        const nums = vals.map(Number).filter((n: number) => !isNaN(n));
        if (typeof col.footer === 'function') {
          result[col.key] = col.footer(dataRows);
        } else {
          switch (col.footer) {
            case 'sum':   result[col.key] = nums.reduce((a: number, b: number) => a + b, 0); break;
            case 'avg':   result[col.key] = nums.length ? +(nums.reduce((a: number, b: number) => a + b, 0) / nums.length).toFixed(2) : 0; break;
            case 'count': result[col.key] = vals.length; break;
            case 'min':   result[col.key] = nums.length ? Math.min(...nums) : 0; break;
            case 'max':   result[col.key] = nums.length ? Math.max(...nums) : 0; break;
          }
        }
      }
      return result;
    });

    // ── 3. 트리 ────────────────────────────────────────────────────────
    const treeFilteredIds = computed((): Set<any> | null => {
      if (!props.useTree || activeFilterCount.value === 0) return null;
      return new Set(filteredRows.value.map((r: any) => r.id));
    });

    const { flatTreeItems, toggleNode, isExpanded, expandAll, collapseAll } = useTree(
      () => sortedRows.value,
      () => props.useTree,
      () => props.childrenKey || 'children',
      () => treeFilteredIds.value
    );

    const effectiveTreeKey = computed(() => {
      if (!props.useTree) return '';
      return props.treeKey || visibleColumns.value[0]?.key || '';
    });

    const getTreeLevel = (idx: number): number => {
      const item = pagedItems.value[idx];
      return item?.type === 'data' ? (item.level ?? 0) : 0;
    };
    const getTreeHasChildren = (idx: number): boolean => {
      const item = pagedItems.value[idx];
      return item?.type === 'data' ? (item as DataItem).hasChildren ?? false : false;
    };

    // ── 4. 그룹핑 ──────────────────────────────────────────────────────
    const { collapsedGroups, toggleGroup, flatGroupedItems, groupColTitle } = useGrouping(
      () => props.useTree ? [] : filteredRows.value,
      () => props.useTree ? '' : effGroupBy.value,
      () => visibleColumns.value,
      () => props.columns
    );

    // ── 5. 페이징 ──────────────────────────────────────────────────────
    const activeItems = computed((): GridItem[] => props.useTree ? flatTreeItems.value : flatGroupedItems.value);

    const totalPages = computed(() => {
      if (effServerSide.value && props.totalRows > 0) return Math.ceil(props.totalRows / props.pageSize) || 1;
      return Math.ceil(activeItems.value.length / props.pageSize) || 1;
    });

    const setPage = (page: number) => {
      emit('update:currentPage', Math.max(1, Math.min(page, totalPages.value)));
    };

    watch(() => activeItems.value.length, () => {
      if (props.currentPage > totalPages.value) setPage(totalPages.value);
    });

    // 필터 변경 시 1페이지로 리셋
    watch(filters, () => { if (props.usePaging) setPage(1); }, { deep: true });

    const pagedItems = computed((): GridItem[] => {
      if (effServerSide.value) return activeItems.value; // 서버사이드: rows가 이미 현재 페이지 데이터
      if (!props.usePaging) return activeItems.value;
      const start = (props.currentPage - 1) * props.pageSize;
      return activeItems.value.slice(start, start + props.pageSize);
    });

    // ── 5. 가상 스크롤 ─────────────────────────────────────────────────
    const hasActiveMerge = computed(() => effAutoMergeCols.value.length > 0 || !!effMergeCells.value);

    const _vs = useVirtualScroll(
      computed(() => pagedItems.value.length),
      () => props.rowHeight,
      () => props.height
    );

    const topPadding    = computed(() => hasActiveMerge.value ? 0 : _vs.topPadding.value);
    const bottomPadding = computed(() => hasActiveMerge.value ? 0 : _vs.bottomPadding.value);
    const onScroll      = (e: Event) => {
      _vs.onScroll(e);
      // 푸터 수평 스크롤 동기화
      if (footerEl.value && containerEl.value) {
        footerEl.value.scrollLeft = containerEl.value.scrollLeft;
      }
    };

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
    const { checkedIds, isAllChecked, isIndeterminate, checkedCount, isRowChecked, toggleAll, toggleRow } = useCheckbox(
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
      () => effAutoMergeCols.value,
      () => effMergeCells.value
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
    const closePopups = () => { closeCtxMenu(); multiSelectFilterOpen.value = ''; };
    onMounted(()       => document.addEventListener('click', closePopups));
    onBeforeUnmount(() => document.removeEventListener('click', closePopups));

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
    // pinned 컬럼의 sticky left 값을 미리 계산 — 매 렌더링마다 for 루프 대신 O(1) lookup
    const pinnedLeftMap = computed<Map<string, number>>(() => {
      const map = new Map<string, number>();
      const baseLeft =
        (effUseRowDrag.value  ? ROW_DRAG_WIDTH        : 0) +
        (effUseDetail.value   ? DETAIL_EXPAND_WIDTH   : 0) +
        (props.useCheckbox    ? CHECKBOX_WIDTH         : 0);
      let accLeft = baseLeft;
      for (const col of visibleColumns.value) {
        if (col.pinned) {
          map.set(col.key, accLeft);
          accLeft += col.width || 150;
        }
      }
      return map;
    });

    const getColumnStyle = (col: Column, _colIdx: number) => {
      const px = (col.width || 150) + 'px';
      const style: Record<string, any> = { width: px, minWidth: px, maxWidth: px };
      if (col.pinned) {
        style.left = (pinnedLeftMap.value.get(col.key) ?? 0) + 'px';
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
      resizedRecently = true; // mousedown 시점부터 세팅 — click 이벤트(정렬 트리거) 차단
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

    // 리사이즈 핸들 더블클릭 → 컬럼 내용 기준 자동 너비 계산
    const _autoFitCanvas = document.createElement('canvas');
    const autoFitColumn = (colIdx: number) => {
      const col = visibleColumns.value[colIdx];
      if (!col) return;
      const ctx = _autoFitCanvas.getContext('2d');
      if (!ctx) return;

      const CELL_PAD   = 28;  // px-3 양쪽 + 여유
      const HEADER_PAD = 36;  // 정렬 아이콘 + 필터 도트 + 여유

      const measureCell = (text: string) => {
        ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif';
        return ctx.measureText(text).width;
      };
      const measureHeader = (text: string) => {
        ctx.font = '600 13px -apple-system, BlinkMacSystemFont, sans-serif';
        return ctx.measureText(text).width;
      };

      // 헤더 텍스트 너비 (필수 * 포함)
      let maxW = measureHeader(col.title + (col.required ? ' *' : '')) + HEADER_PAD;

      // 셀 값 너비 (고정 크기 타입 제외)
      const SKIP = new Set(['boolean', 'progress', 'image', 'button', 'radio']);
      if (!SKIP.has(col.type || '')) {
        for (const row of filteredRows.value) {
          const val = row[col.key];
          let text = '';
          if (col.type === 'number') {
            text = Number(val || 0).toLocaleString();
          } else if (col.type === 'select' || col.type === 'badge') {
            text = col.options?.find(o => o.value === val)?.label ?? String(val ?? '');
          } else {
            text = String(val ?? '');
          }
          const w = measureCell(text) + CELL_PAD;
          if (w > maxW) maxW = w;
        }
      }

      const finalWidth = Math.max(50, Math.min(600, Math.ceil(maxW)));
      emit('resize:column', { colIdx, colKey: col.key, width: finalWidth });
    };

    // ── 12. 컬럼 드래그 앤 드롭 순서 변경 ─────────────────────────────
    const { dragSourceColIdx, dragOverColIdx, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd } = useColumnDrag(
      () => visibleColumns.value,
      (srcKey, targetKey) => emit('reorder:columns', { srcKey, targetKey }),
      () => isResizing.value
    );

    // ── 14. 편집 ───────────────────────────────────────────────────────
    const editing   = reactive({ rowId: null as any, colIdx: -1 });
    const editValue = ref<any>('');

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

    const startEditing = (rIdx: number, cIdx: number, initialValue?: string) => {
      const row = getRow(rIdx);
      const col = visibleColumns.value[cIdx];
      if (!row || !col || ['boolean', 'progress', 'badge', 'image', 'button', 'link', 'radio', 'rating'].includes(col.type || '')) return;
      editing.rowId = row.id; editing.colIdx = cIdx;
      const useInitial = initialValue !== undefined && col.type !== 'date' && col.type !== 'datetime';
      editValue.value = useInitial ? initialValue : row[col.key];
      clearSelection();
      // 포커스는 WZGridRow가 editingColIdx prop 변화를 watch하여 자동으로 처리
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

      // 수직 스크롤 — sticky 헤더 / sticky 푸터 높이 고려
      const headerHeight = el.querySelector('thead')?.clientHeight ?? 0;
      const footerHeight = el.querySelector<HTMLElement>('.sticky.bottom-0')?.clientHeight ?? 0;
      const visibleHeight = el.clientHeight - footerHeight;
      const rowTop    = rowIdx * props.rowHeight;
      const rowBottom = rowTop + props.rowHeight;
      if (rowTop < el.scrollTop) {
        el.scrollTop = rowTop;
      } else if (headerHeight + rowBottom > el.scrollTop + visibleHeight) {
        el.scrollTop = headerHeight + rowBottom - visibleHeight;
      }

      // 수평 스크롤 — 실제 DOM TH 위치 기반으로 정확하게 계산
      const cols = visibleColumns.value;
      const col  = cols[colIdx];
      if (!col || col.pinned) return;

      // effUseDetail 열을 extraCols에 포함
      const extraCols  = (effUseRowDrag.value ? 1 : 0) + (effUseDetail.value ? 1 : 0) + (props.useCheckbox ? 1 : 0);
      const ths        = el.querySelectorAll<HTMLElement>('thead tr:first-child th');
      const th         = ths[extraCols + colIdx];
      if (!th) return;

      const thRect  = th.getBoundingClientRect();
      const elRect  = el.getBoundingClientRect();
      const pinnedWidth = (props.useCheckbox ? CHECKBOX_WIDTH : 0)
                        + (effUseRowDrag.value  ? ROW_DRAG_WIDTH  : 0)
                        + (effUseDetail.value   ? DETAIL_EXPAND_WIDTH : 0)
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

    // ── 행 클릭 ──────────────────────────────────────────────────────
    const onRowClick = (pagedIdx: number) => {
      const row = getRow(pagedIdx);
      if (row) { const fullIdx = props.rows.findIndex(r => r.id === row.id); emit('click:row', { rowIdx: fullIdx, row }); }
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
      // pro feature gates (template에서 사용)
      effShowColumnSettings, effUseContextMenu, effUseRowDrag, effUseAdvancedFilter, effServerSide, effShowExcelExport,
      effUseDetail, expandedRowIds, DETAIL_EXPAND_WIDTH, toggleDetailExpand, isDetailExpanded,
      // toolbar
      hasToolbarSlot, hiddenColKeys, visibleColumns, toggleColVisibility,
      colSettingsOpen, activeFilterCount, clearAllFilters, handleDelete,
      // filter
      filters, isFilterActive, clearFilter,
      multiSelectFilterOpen, toggleMultiSelectFilterOpen, toggleMultiSelectFilter,
      selectAllFilterOptions, deselectAllFilterOptions,
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
      topPadding, bottomPadding, onScroll, visibleRowsRange, filteredRows, footerEl,
      isSelected, startSelection, updateSelection, endSelection,
      onCopy, onPaste,
      // editing
      editing, isEditing, startEditing, stopEditing, editValue,
      toggleBoolean, handleInput, updateCell, updateCellFromItem,
      // row click & style
      onRowClick,
      // display
      onButtonClick, getOptionLabel, getBadgeColor, getTooltipValue, getRow,
      startResize, autoFitColumn, handleKeyDown, getColumnStyle, getAlignClass,
      hasError, getError,
      // paging
      totalPages, setPage,
      // checkbox
      isAllChecked, isIndeterminate, checkedCount, isRowChecked, toggleAll, toggleRow,
      // footer
      footerValues,
      // tree
      effectiveTreeKey, getTreeLevel, getTreeHasChildren, toggleNode, isExpanded, expandAll, collapseAll,
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
.z-20 { z-index: 20; }
.z-10 { z-index: 10; }
</style>
