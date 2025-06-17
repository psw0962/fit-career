import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  AllCommunityModule,
  SelectEditorModule,
  RowSelectionModule,
  RowDragModule,
  ValidationModule,
  ColumnAutoSizeModule,
} from 'ag-grid-community';
import type {
  AbstractColDef,
  ColDef,
  GridOptions,
  RowSelectionOptions,
  RowSelectedEvent,
  GridReadyEvent,
  RowDragEnterEvent,
  RowDragEndEvent,
  RowClassRules,
  GetRowIdParams,
  RowDataUpdatedEvent,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  AllCommunityModule,
  SelectEditorModule,
  RowSelectionModule,
  RowDragModule,
  ValidationModule,
  ColumnAutoSizeModule,
]);

interface AgGridProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rowData: object[] | undefined;
  columnDefs: AbstractColDef[];
  loading?: boolean;
  ref?: React.RefObject<AgGridReact>;
  defaultColDef?: ColDef;
  gridOptions?: GridOptions;
  rowSelection?: RowSelectionOptions;
  rowDragManaged?: boolean;
  rowDragMultiRow?: boolean;
  rowClassRules?: RowClassRules;
  onGridReady?: (el: GridReadyEvent) => void;
  onRowSelected?: (el: RowSelectedEvent) => void;
  onRowDataUpdated?: (el: RowDataUpdatedEvent) => void;
  onRowDragEnter?: (el: RowDragEnterEvent) => void;
  onRowDragEnd?: (el: RowDragEndEvent) => void;
  getRowId?: (params: GetRowIdParams) => string;
  tooltipShowDelay?: number;
  autoSizeStrategy?: boolean;
}

export const AgGrid = (props: AgGridProps) => {
  const colors = {
    neutral: {
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        500: '#6b7280',
        600: '#4b5563',
        800: '#1f2937',
      },
      white: '#ffffff',
    },
    primary: {
      200: '#bfdbfe',
      500: '#3b82f6',
    },
  };

  const gridStyles = `
    .ag-theme-alpine {
      --ag-wrapper-border: none;
      --ag-wrapper-border-radius: 0;
      --ag-header-background-color: ${colors.neutral.gray[50]};
      --ag-header-row-border: 1px solid ${colors.neutral.gray[200]};
      --ag-selected-row-background-color: ${colors.primary[200]};
      --ag-range-selection-border-color: ${colors.primary[500]};
      --ag-row-border-color: ${colors.primary[500]};
      --ag-row-hover-color: ${colors.neutral.gray[100]};
      --ag-row-border: 1px solid ${colors.neutral.gray[200]};
      --ag-header-column-border: 1px solid ${colors.neutral.gray[100]};
      --ag-column-border: 1px solid ${colors.neutral.gray[100]};
      
      --ag-checkbox-checked-background-color: ${colors.primary[500]};
      --ag-checkbox-checked-shape-image: url("data:image/svg+xml,%3csvg%20width='20'%20height='20'%20viewBox='0%200%2020%2020'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M6%2010L9.63158%2013.5L14.5%206'%20stroke='white'%20stroke-width='1.6'%20stroke-linecap='round'/%3e%3c/svg%3e");
      --ag-checkbox-checked-shape-color: ${colors.neutral.white};
      --ag-checkbox-indeterminate-background-color: ${colors.primary[500]};
      --ag-checkbox-indeterminate-shape-image: url("data:image/svg+xml,%3csvg%20width='20'%20height='20'%20viewBox='0%200%2020%2020'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M6%2010H14'%20stroke='white'%20stroke-width='1.6'%20stroke-linecap='round'/%3e%3c/svg%3e");
      --ag-checkbox-indeterminate-shape-color: ${colors.neutral.white};
      --ag-checkbox-checked-background-color: ${colors.primary[500]};
      --ag-checkbox-checked-border-color: ${colors.primary[500]};
      --ag-checkbox-unchecked-border-color: ${colors.neutral.gray[500]};
      --ag-focus-shadow: none;
      --ag-cell-horizontal-padding: 15px;
      --ag-row-height: 40px;
      --ag-icon-size: 20px;
      --ag-header-column-separator-display: none;
      
      --ag-header-font-family: var(--font-pretendard);
      --ag-header-font-size: 14px;
      --ag-header-font-weight: 600;
      
      --ag-cell-font-family: var(--font-pretendard);
      
      --ag-header-text-color: ${colors.neutral.gray[800]};
      --ag-cell-text-color: ${colors.neutral.gray[600]};
      --ag-data-font-size: 0.875rem;
    }
    
    .ag-theme-alpine .ag-header {
      border-top: 1px solid ${colors.neutral.gray[100]};
    }
    
    .ag-theme-alpine .ag-selection-checkbox {
      margin: 0;
    }
    
    .ag-theme-alpine .ag-row-selected:before {
      background-image: none;
    }
    
    .ag-theme-alpine .ag-header-cell.ag-column-last:after {
      content: none;
    }
    
    .ag-theme-alpine .ag-row {
      border-bottom-color: ${colors.neutral.gray[200]} !important;
    }
    
    .ag-theme-alpine .ag-header-cell-label {
      justify-content: center;
    }
    
    .ag-theme-alpine .ag-cell {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .ag-theme-alpine .header-left-align .ag-header-cell-label {
      justify-content: flex-start !important;
    }
    
    .ag-theme-alpine .ag-header-cell[col-id='ag-Grid-SelectionColumn'] .ag-header-select-all {
      display: flex;
      justify-content: center;
      width: 100%;
    }
    
    .ag-theme-alpine .ag-header-cell[col-id='ag-Grid-SelectionColumn'] .ag-header-select-all + .ag-header-cell-comp-wrapper {
      display: none;
    }
  `;

  return (
    <>
      <style jsx global>
        {gridStyles}
      </style>
      <div
        className={`ag-theme-alpine ${props.className || ''}`}
        style={{
          width: props.width || '100%',
          height: props.height || '100%',
        }}
      >
        <AgGridReact
          ref={props.ref}
          loading={props.loading}
          onGridReady={props.onGridReady}
          defaultColDef={props.defaultColDef}
          columnDefs={props.columnDefs}
          gridOptions={props.gridOptions}
          rowData={props.rowData}
          rowClassRules={props.rowClassRules}
          rowSelection={props.rowSelection}
          rowDragManaged={props.rowDragManaged}
          rowDragMultiRow={props.rowDragMultiRow}
          onRowSelected={props.onRowSelected}
          onRowDataUpdated={props.onRowDataUpdated}
          onRowDragEnter={props.onRowDragEnter}
          onRowDragEnd={props.onRowDragEnd}
          getRowId={props.getRowId}
          headerHeight={32}
          rowHeight={32}
          tooltipShowDelay={props.tooltipShowDelay}
          autoSizeStrategy={props.autoSizeStrategy ? { type: 'fitCellContents' } : undefined}
        />
      </div>
    </>
  );
};
