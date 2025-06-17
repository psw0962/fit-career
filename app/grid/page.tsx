'use client';

import { ColDef, GridOptions, RowClassParams, RowClassRules } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { lazy, useMemo, useRef, useState } from 'react';
import { columnDefs, defaultRow, gridData } from './dummy';
import GridHeader from '@/components/common/grid/grid-header';
import { Grip } from 'lucide-react';
import message from '@/components/common/message';

const AgGrid = lazy(() =>
  import('@/components/common/grid').then((module) => ({ default: module.AgGrid })),
);
const CsvImporterDialog = lazy(() =>
  import('@/components/common/csv-importer-dialog').then((module) => ({
    default: module.CsvImporterDialog,
  })),
);

function GripCell() {
  return (
    <div className='w-full flex items-center justify-center'>
      <Grip size={16} />
    </div>
  );
}

const stringConversionFields = ['id'];

export default function GridPage() {
  const defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    wrapText: false,
    autoHeight: false,
    cellStyle: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  };

  const rowClassRules = useMemo<RowClassRules>(() => {
    return {
      'ag-row-selected': (params: RowClassParams) => {
        return params.data.add;
      },
    };
  }, []);

  const gridOptions: GridOptions = {
    onGridReady: (params) => {
      params.api.forEachNode((node) => {
        if (node.data?.add === true) {
          node.setSelected(true);
        }
      });
    },
    rowDragManaged: true,
    animateRows: true,
    rowDragEntireRow: true,
    components: {
      gripHeader: GripCell,
      gripCell: GripCell,
    },
  };

  const gridRef = useRef<AgGridReact>(null);
  const [addedRows, setAddedRows] = useState<Record<string, unknown>[]>([]);
  const [isOpenCsvImportModal, setIsOpenCsvImportModal] = useState(false);

  const combinedRowData = useMemo(() => {
    return [...(gridData || []), ...addedRows];
  }, [gridData, addedRows]);

  const handleAdd = () => {
    const newRow = { ...defaultRow, add: true };
    gridRef.current?.api.applyTransaction({
      add: [newRow],
      addIndex: 0,
    });

    gridRef.current?.api.forEachNode((node) => {
      if (node.data && node.data.id === newRow.id) {
        node.setSelected(true);
      }
    });
  };

  const handleDelete = () => {
    const selectedNodes = gridRef.current?.api.getSelectedNodes();

    if (selectedNodes && selectedNodes.length > 0) {
      const selectedData = selectedNodes.map((node) => node.data);

      gridRef.current?.api.applyTransaction({
        remove: selectedData,
      });

      gridRef.current?.api.deselectAll();
    }
  };

  const handleReset = () => {
    message
      .confirm({
        title: '초기화',
        message: '모든 변경사항이 초기화됩니다.\n계속하시겠습니까?',
        icon: 'warning',
      })
      .then((isConfirm) => {
        if (isConfirm) {
          console.log('confirmed');

          message.alert({
            title: '완료',
            message: '초기화가 완료되었습니다.',
            icon: 'success',
          });
        } else {
          console.log('canceled');
        }
      });
  };

  const handleSave = () => {
    const selectedNodes = gridRef.current?.api.getSelectedNodes();

    if (selectedNodes && selectedNodes.length === 0) {
      message.alert({
        title: '오류',
        message: '저장할 Row를 선택하세요.',
        icon: 'error',
      });

      return;
    } else {
      message
        .confirm({
          title: '저장',
          message: '저장하시겠습니까?',
          icon: 'question',
        })
        .then((isConfirm) => {
          if (isConfirm) {
            console.log('confirmed');

            message.alert({
              title: '완료',
              message: '저장이 완료되었습니다.',
              icon: 'success',
            });
          } else {
            console.log('canceled');
          }
        });
    }
  };

  const handleUpload = () => {
    setIsOpenCsvImportModal(true);
  };

  const handleDownload = () => {
    message
      .confirm({
        title: '다운로드',
        message: '다운로드하시겠습니까?',
        icon: 'question',
      })
      .then((isConfirm) => {
        if (isConfirm) {
          gridRef.current?.api.exportDataAsCsv({
            fileName: `file-export-${new Date().toISOString().replace(/:/g, '-')}.csv`,
            processCellCallback: (params) => {
              const fieldName = params.column.getColId();

              if (stringConversionFields.includes(fieldName)) {
                const value = params.node?.data[fieldName];
                if (value && !isNaN(Number(value))) {
                  return `'${value}`;
                }
              }
              return params.value;
            },
            allColumns: true,
          });
        }
      });
  };

  const handleFullScreen = () => {
    console.log('fullScreen');
  };

  const handleExcelDataImport = (data: Record<string, unknown>[]) => {
    setIsOpenCsvImportModal(false);

    const dataWithAddFlag = data.map((item) => ({
      ...item,
      add: true,
    }));

    setAddedRows((prev) => [...prev, ...dataWithAddFlag]);

    message.alert({
      message: '데이터가 성공적으로 업로드되었습니다.',
      icon: 'success',
    });
  };

  return (
    <>
      <GridHeader
        title='Grid'
        add={handleAdd}
        delete={handleDelete}
        reset={handleReset}
        save={handleSave}
        upload={handleUpload}
        download={handleDownload}
        fullScreen={handleFullScreen}
      >
        <AgGrid
          height={400}
          ref={gridRef}
          rowData={combinedRowData}
          columnDefs={columnDefs}
          gridOptions={gridOptions}
          rowClassRules={rowClassRules}
          defaultColDef={defaultColDef}
          rowDragManaged={true}
          rowDragMultiRow={true}
          autoSizeStrategy={true}
          rowSelection={{ mode: 'multiRow' }}
        />

        {isOpenCsvImportModal && (
          <CsvImporterDialog
            isOpen={isOpenCsvImportModal}
            setIsOpen={setIsOpenCsvImportModal}
            setRowData={handleExcelDataImport}
            columnDefs={columnDefs}
            headerRowCount={1}
            checkboxFields={['active']}
            stringConversionFields={stringConversionFields}
          />
        )}
      </GridHeader>
    </>
  );
}
