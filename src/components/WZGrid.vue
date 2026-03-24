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

    <!-- 접근성용 텍스트 및 디버깅 -->
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">{{ ariaLiveMessage }}</div>

    <!-- ── 그리드 컨테이너 ─────────────────────────────────────────────── -->
    <div
      :class="(showAdd || showDelete || hasToolbarSlot || effShowColumnSettings) ? 'rounded-b border-t-0' : 'rounded'"
      ref="containerEl"
      class="wz-grid-container relative border border-gray-300 overflow-auto bg-white select-none focus:ring-2 focus:ring-blue-400 outline-none flex-grow"
      @scroll="onScroll"
      @copy="onCopy"
      @paste="onPaste"
      @keydown="handleKeyDown"
      tabindex="0"
    >
      <!-- aria-live: 정렬/필터 변경 시 스크린리더에 알림 -->
      <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">{{ ariaLiveMessage }}</div>

      <div :style="{ paddingTop: topPadding + 'px', paddingBottom: bottomPadding + 'px', minWidth: 'max-content' }">
        <table
          role="grid"
          :aria-rowcount="activeItems.length"
          class="table-fixed border-separate border-spacing-0"
        >

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
                    <span class="text-[11px] text-gray-400 bg-blue-100 px-1.5 py-0.5 rounded-full">{{ asGroupHeader(itemIdx).count.toLocaleString() }}{{ t('grid.rowUnit') }}</span>
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
                    <span class="text-[11px] font-bold text-amber-700">{{ t('grid.subtotal') }}</span>
                    <span class="text-[10px] text-gray-400 ml-1">({{ asSubtotal(itemIdx).count.toLocaleString() }}{{ t('grid.rowUnit') }})</span>
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
                :selection-key="selectionKey"
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


</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref, reactive, watch, provide, onMounted, onBeforeUnmount } from 'vue-demi';
import type { Column, SortConfig, GridItem, DataItem, GroupHeader, SubtotalItem, GridRow, Locale, Messages } from '../types/grid';
import type { WZGridPlugin } from '../types/plugin';
import { useI18n, I18N_KEY } from '../composables/useI18n';
import { usePlugins } from '../composables/usePlugins';
import { usePerformance } from '../composables/usePerformance';
import type { PerfEntry } from '../composables/usePerformance';
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
import { useValidation, runStructureValidation } from '../composables/useValidation';
import { useCheckbox }       from '../composables/useCheckbox';
import { useTree }           from '../composables/useTree';
import WZGridPagination      from './WZGridPagination.vue';
import WZContextMenu         from './WZContextMenu.vue';
import WZGridToolbar         from './WZGridToolbar.vue';
import WZGridHeader          from './WZGridHeader.vue';
import WZGridRow             from './WZGridRow.vue';

const CHECKBOX_WIDTH = 40;
const ROW_DRAG_WIDTH = 28;

// 세션당 1회만 경고 출력
const _deprecatedWarnedOnce = new Set<string>();
function warnDeprecatedOnce(oldProp: string, newProp: string) {
  if (_deprecatedWarnedOnce.has(oldProp)) return;
  _deprecatedWarnedOnce.add(oldProp);
  console.warn(`[WZGrid] "${oldProp}" prop은 deprecated입니다. "${newProp}"을 사용하세요.`);
}

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
    'perf',
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
    /** 개발 시 데이터 유효성 경고를 활성화합니다. 프로덕션에서는 false로 설정하세요. */
    debug:              { type: Boolean, default: false },
    /** debug보다 강력한 검증 모드. console.error로 중복 id·타입 불일치 등을 검사합니다. strict=true이면 debug도 자동 활성화됩니다. */
    strict:             { type: Boolean, default: false },
    /** 표시 언어. 'ko'(기본) 또는 'en', 커스텀 locale도 messages와 함께 사용 가능합니다. */
    locale:             { type: String as PropType<Locale>, default: 'ko' },
    /** 메시지 오버라이드. 특정 키만 부분 오버라이드할 수 있습니다. */
    messages:           { type: Object as PropType<Messages>, default: null },
    /** WZGridPlugin 배열. install(context)로 라이프사이클 훅을 등록합니다. */
    plugins:            { type: Array as PropType<WZGridPlugin[]>, default: () => [] },
    /** 성능 모니터링 활성화. @perf 이벤트로 측정값을 전달합니다. */
    performance:        { type: Boolean, default: false },
  },

  setup(props, { emit, slots }) {
    const hasToolbarSlot = computed(() => !!slots.toolbar);
    const containerEl = ref<HTMLElement | null>(null);
    const footerEl    = ref<HTMLElement | null>(null);

    // ── i18n ────────────────────────────────────────────────────────
    const { t } = useI18n(() => props.locale, () => props.messages);
    provide(I18N_KEY, t);

    // ── 플러그인 ─────────────────────────────────────────────────────
    const { callHook, initPlugins } = usePlugins();
    watch(() => props.plugins, (plugins) => initPlugins(plugins), { immediate: true });

    // ── 성능 모니터링 ────────────────────────────────────────────────
    // effDebug는 아래에서 정의되므로 getter 함수로 지연 참조
    const { markStart, markEnd } = usePerformance(
      () => props.performance,
      (entry: PerfEntry) => emit('perf', entry),
      () => props.debug || props.strict
    );

    // ── deprecated prop 경고 (세션당 1회) ────────────────────────────
    watch(() => props.showColumnSettings, (val) => { if (val) warnDeprecatedOnce('showColumnSettings', 'useColumnSettings'); }, { immediate: true });
    watch(() => props.showExcelExport,    (val) => { if (val) warnDeprecatedOnce('showExcelExport', 'useExcelExport'); },      { immediate: true });
    watch(() => (props as any).serverSide, (val) => { if (val) warnDeprecatedOnce('serverSide', 'useServerSide'); },           { immediate: true });

    // ── eff computed: alias prop 병합 ────────────────────────────────
    // alias prop(useColumnSettings, useExcelExport, useServerSide)은 기존 prop과 || 로 병합됩니다.
    const effShowColumnSettings = computed(() => props.showColumnSettings || props.useColumnSettings);
    const effUseContextMenu     = computed(() => props.useContextMenu);
    const effUseRowDrag         = computed(() => props.useRowDrag);
    const effGroupBy            = computed(() => props.groupBy);
    const effAutoMergeCols      = computed((): string[] => props.autoMergeCols || []);
    const effMergeCells         = computed(() => props.mergeCells || null);
    const effUseAdvancedFilter  = computed(() => props.useFilter);
    const effServerSide         = computed(() => props.serverSide || props.useServerSide);
    const effShowExcelExport    = computed(() => props.showExcelExport || props.useExcelExport);
    const hasDetailSlot         = computed(() => !!slots.detail);
    const effUseDetail          = computed(() => hasDetailSlot.value);

    // ── debug / strict 모드 구조 검증 (useValidation.runStructureValidation 사용) ──
    // strict=true이면 debug도 자동 활성화
    const effDebug = computed(() => props.debug || props.strict);

    watch(() => [props.rows, props.columns, effDebug.value] as const, () => {
      runStructureValidation(props.rows, props.columns, { debug: effDebug.value, strict: props.strict });
    }, { immediate: true, deep: false });

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

    // selection이 변경될 때마다 새 값이 생성되는 computed.
    // WZGridRow에 prop으로 전달하여 shouldUpdateComponent가 true를 반환하게 함으로써
    // 방향키 이동 후 이전 셀 하이라이트가 남는 버그를 수정한다.
    const selectionKey = computed(() =>
      `${selection.startRow}:${selection.startCol}:${selection.endRow}:${selection.endCol}`
    );

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

    const getActualRowHeight = () => props.rowHeight + 1; // 1px for border-b

    const _vs = useVirtualScroll(
      computed(() => pagedItems.value.length),
      getActualRowHeight,
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

    const handleExcelExport = async () => {
      await exportExcel(props.columns as Column[], props.rows, {
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
    const { errors, validateCell } = useValidation(() => props.rows, () => props.columns, t);
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
      'justify-start text-left':  !align || align === 'left',
      'justify-center text-center': align === 'center',
      'justify-end text-right':    align === 'right',
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
      if (!row || !col || ['boolean', 'progress', 'badge', 'image', 'button', 'link', 'radio', 'rating', 'color', 'tag', 'sparkline'].includes(col.type || '')) return;
      editing.rowId = row.id; editing.colIdx = cIdx;
      const type = col.type as any;
      const useInitial = initialValue !== undefined && type !== 'date' && type !== 'datetime' && type !== 'textarea';
      editValue.value = useInitial ? initialValue : row[col.key];
      clearSelection();
      // 포커스는 WZGridRow가 editingColIdx prop 변화를 watch하여 자동으로 처리
      if (initialValue !== undefined) handleInput(col);
    };

    const stopEditing = (save: boolean, moveNext = false) => {
      if (save && editing.rowId !== null) {
        const fullRowIdx = props.rows.findIndex(r => r.id === editing.rowId);
        if (fullRowIdx !== -1) {
          const col = visibleColumns.value[editing.colIdx];
          if (col) { validateCell(props.rows[fullRowIdx], col, editValue.value); updateCell(fullRowIdx, col.key, editValue.value); }
        }
      }
      if (moveNext && editing.rowId !== null) {
        const currentRowId = editing.rowId;
        const currentColIdx = editing.colIdx;
        // pagedItems에서 현재 행의 인덱스를 찾아 다음 data 행으로 이동
        const currentPagedIdx = pagedItems.value.findIndex(
          item => item.type === 'data' && (item as DataItem).row.id === currentRowId
        );
        if (currentPagedIdx !== -1) {
          // 현재 인덱스 이후의 다음 data 타입 항목 찾기
          let nextPagedIdx = -1;
          for (let i = currentPagedIdx + 1; i < pagedItems.value.length; i++) {
            if (pagedItems.value[i].type === 'data') { nextPagedIdx = i; break; }
          }
          // 다음 데이터 행이 없으면 현재 행 유지
          if (nextPagedIdx === -1) {
            nextPagedIdx = currentPagedIdx;
          }
          
          editing.rowId = null; editing.colIdx = -1;
          scrollToCell(nextPagedIdx, currentColIdx);
          startSelection(nextPagedIdx, currentColIdx);
          endSelection();
          containerEl.value?.focus({ preventScroll: true });
          return;
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

    const scrollToCell = (itemIdx: number, colIdx: number) => {
      const el = containerEl.value;
      if (!el) return;

      const headerHeight = el.querySelector('thead')?.clientHeight ?? 0;
      const footerHeight = el.querySelector<HTMLElement>('.sticky.bottom-0')?.clientHeight ?? 0;
      
      const tr = el.querySelector(`tbody tr[aria-rowindex="${itemIdx + 1}"]`) as HTMLElement;
      if (tr) {
        // 실제 DOM 엘리먼트가 렌더링된 경우 getBoundingClientRect()로 정확하게 스크롤 조정
        const elRect = el.getBoundingClientRect();
        const trRect = tr.getBoundingClientRect();

        // 위쪽으로 가려진 경우 (헤더 고려)
        if (trRect.top < elRect.top + headerHeight) {
          el.scrollTop -= (elRect.top + headerHeight) - trRect.top;
          _vs.onScroll({ target: el } as unknown as Event);
        }
        // 아래쪽으로 가려진 경우 (하단 여백/푸터 고려 및 수평 스크롤바 높이 회피)
        else if (trRect.bottom > elRect.top + el.clientHeight - footerHeight) {
          // 가려진 만큼 스크롤을 내린다
          el.scrollTop += trRect.bottom - (elRect.top + el.clientHeight - footerHeight);
          _vs.onScroll({ target: el } as unknown as Event);
        }
      } else {
        // 가상 스크롤로 인해 DOM에 렌더링되지 않은 항목이라면 기존 수학적 비용(최소 높이 기준) 적용
        const visibleHeight = el.clientHeight - footerHeight;
        const actualRH  = getActualRowHeight();
        const rowTop    = Math.max(0, itemIdx) * actualRH;
        const rowBottom = rowTop + actualRH;
        
        if (rowTop < el.scrollTop) {
          el.scrollTop = rowTop;
          _vs.onScroll({ target: el } as unknown as Event);
        } else if (headerHeight + rowBottom > el.scrollTop + visibleHeight) {
          el.scrollTop = headerHeight + rowBottom - visibleHeight;
          _vs.onScroll({ target: el } as unknown as Event);
        }
      }

      // 수평 스크롤 — 실제 DOM TH 위치 기반으로 정확하게 계산
      const cols = visibleColumns.value;
      const col  = cols[colIdx];
      if (!col || col.pinned) return;

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

        // [중요 버그 수정]
        // 사용자가 특정 td(셀)를 클릭해 포커스가 td에 머물러 있을 때 가상 스크롤이 발생하면,
        // Vue DOM 패칭 과정에서 해당 td가 날아가며 포커스를 잃고 document.body로 빠지게 됩니다.
        // 이러면 화살표 이벤트가 끊어져 네이티브 스크롤로 대체되므로, 컨테이너로 포커스를 안정적으로 잡아줍니다.
        if (containerEl.value && document.activeElement !== containerEl.value) {
          containerEl.value.focus({ preventScroll: true });
        }

        const dir = dirs[e.key];
        const shift = e.shiftKey;
        const oldStartRow = selection.startRow;
        const oldEndRow = selection.endRow;

        moveSelection(dir, shift, pagedItems.value.length, visibleColumns.value.length);
        
        // 새로 이동한 항목이 data row가 아니면, data row를 찾을 때까지 계속 이동
        const targetRow = shift ? selection.endRow : selection.startRow;
        let iterRow = targetRow;
        
        if (dir === 'up' || dir === 'down') {
           const step = dir === 'up' ? -1 : 1;
           while (iterRow >= 0 && iterRow < pagedItems.value.length && pagedItems.value[iterRow].type !== 'data') {
               iterRow += step;
           }
           if (iterRow < 0 || iterRow >= pagedItems.value.length) {
               iterRow = shift ? oldEndRow : oldStartRow; // 이동할 곳이 없으면 원상복구
           }
           
           if (shift) selection.endRow = iterRow;
           else selection.startRow = selection.endRow = iterRow;
        }

        const focusRow = e.shiftKey ? selection.endRow : selection.startRow;
        const focusCol = e.shiftKey ? selection.endCol : selection.startCol;
        scrollToCell(focusRow, focusCol);
      } else if (e.key === 'Enter') {
        e.preventDefault(); startEditing(selection.startRow, selection.startCol);
      } else if (e.key === 'Escape') {
        clearSelection();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        const col = visibleColumns.value[selection.startCol];
        if (col && !['boolean', 'progress', 'badge', 'image', 'button', 'link', 'radio', 'rating', 'color', 'tag', 'sparkline'].includes(col.type || '')) {
          updateCellFromItem(selection.startRow, col.key, '');
        }
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

    // ── 플러그인 훅 호출 포인트 ──────────────────────────────────────
    watch(sortedRows,   (rows) => callHook('afterSort',    { rows, sortConfigs: sortConfigs.value }));
    watch(filteredRows, (rows) => callHook('afterFilter',  { rows }));
    watch(activeItems,  (items) => callHook('beforeRender', { items }));

    // ── 성능 측정 watch ──────────────────────────────────────────────
    watch(() => sortConfigs.value,    () => markStart('sort'),   { flush: 'sync' });
    watch(sortedRows,                 rows => markEnd('sort', rows.length));
    watch(activeFilterCount,          () => markStart('filter'), { flush: 'sync' });
    watch(filteredRows,               rows => markEnd('filter', rows.length));
    watch(activeItems,                () => markStart('render'), { flush: 'sync' });
    watch(pagedItems,                 items => markEnd('render', items.length));

    // ── 접근성(a11y): aria-live 알림 영역 ────────────────────────────
    const ariaLiveMessage = ref('');
    watch(sortConfigs, (configs) => {
      if (configs.length === 0) {
        ariaLiveMessage.value = t('aria.sortCleared');
      } else {
        const desc = configs.map(c => `${c.key} ${t(c.order === 'asc' ? 'aria.asc' : 'aria.desc')}`).join(', ');
        ariaLiveMessage.value = t('aria.sortChanged', { desc });
      }
    });
    watch(activeFilterCount, (count) => {
      ariaLiveMessage.value = count > 0
        ? t('aria.filterActive', { count })
        : t('aria.filterCleared');
    });

    return {
      containerEl,
      CHECKBOX_WIDTH, ROW_DRAG_WIDTH,
      handleExcelExport,
      // eff computed (template에서 사용)
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
      isSelected, selectionKey, startSelection, updateSelection, endSelection,
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
      // a11y
      ariaLiveMessage, activeItems, effDebug,
      // i18n
      t,
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

/* 스크린리더 전용 텍스트 (시각적 숨김) */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 고대비 모드 (Windows 고대비 / forced-colors) 지원 */
@media (forced-colors: active) {
  .wz-grid-container {
    border: 1px solid ButtonText;
  }
  table[role="grid"] td,
  table[role="grid"] th {
    border-color: ButtonText;
  }
  table[role="grid"] tr[aria-selected="true"] {
    outline: 2px solid Highlight;
    background-color: Highlight;
    color: HighlightText;
  }
  table[role="grid"] td:focus,
  table[role="grid"] [tabindex="0"] {
    outline: 2px solid Highlight;
  }
}
</style>
