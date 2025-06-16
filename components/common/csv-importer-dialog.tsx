import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import message from '@/components/common/message';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// header 검증 함수
function validateHeaders(
  fileHeaders: (string | number | null)[][],
  expectedHeaders: (string | null)[][],
): boolean {
  // header row수가 기대하는 row수와 일치하는지 확인
  if (fileHeaders.length !== expectedHeaders.length) return false;

  // 각 row에서 header의 내용이 일치하는지 확인
  for (let i = 0; i < fileHeaders.length; i++) {
    const fileRow = fileHeaders[i];
    const expectedRow = expectedHeaders[i];

    // column 수가 일치하는지 확인
    if (fileRow.length !== expectedRow.length) return false;

    // 각 cell의 값이 일치하는지 확인
    for (let j = 0; j < fileRow.length; j++) {
      const fileCell =
        fileRow[j] === null || fileRow[j] === undefined ? '' : String(fileRow[j]).trim();
      const expectedCell =
        expectedRow[j] === null || expectedRow[j] === undefined ? '' : expectedRow[j]!.trim();

      if (fileCell !== expectedCell) return false;
    }
  }

  return true;
}

/**
 * ### ExcelImporterModal
 * @param isOpen - 모달이 열리고 닫히는 상태
 * @param setIsOpen - 모달이 열리고 닫히는 상태를 설정하는 함수
 * @param setRowData - 데이터를 설정하는 함수
 * @param columnDefs - 컬럼 정의
 * @param headerRowCount - 헤더 행 수
 * @param checkboxFields - "true"/"false" 문자열을 "Y"/"N"으로 변환할 필드 목록
 * @param stringConversionFields - 문자열로 변환할 필드 목록
 * @param confirmColunmHeaders - 헤더 행을 검증하는 객체 (현재는 안쓸 예정입니다.)
 */

interface CsvImporterDialogProps<T extends Record<string, unknown>> {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setRowData: (rowData: T[]) => void;
  columnDefs: (ColDef | ColGroupDef)[];
  headerRowCount: number;
  checkboxFields?: string[];
  stringConversionFields?: string[];
  confirmColunmHeaders?: (string | null)[][];
}

export function CsvImporterDialog<T extends Record<string, unknown>>({
  isOpen,
  setIsOpen,
  setRowData,
  columnDefs,
  headerRowCount,
  checkboxFields,
  stringConversionFields,
  confirmColunmHeaders,
}: CsvImporterDialogProps<T>) {
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatusMessage, setUploadStatusMessage] = useState('');

  function handleData(acceptedFiles: File[]) {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);
    setUploadStatusMessage('loading...');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // headers와 rows 분리
        const raw: (string | number)[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: null,
        });
        const headerRows = raw.slice(0, headerRowCount);
        const rows = raw.slice(headerRowCount);

        // headerRows로 현재 파일의 헤더가 올바른지 검증
        if (confirmColunmHeaders) {
          const isHeaderValid = validateHeaders(headerRows, confirmColunmHeaders);
          if (!isHeaderValid) {
            setUploadStatusMessage('올바르지 않은 파일 형식입니다.');
            message.alert({
              message:
                '엑셀 파일의 헤더가 올바르지 않습니다. 현재 테이블을 Export 하여 Import 템플릿을 확인해주세요.',
              icon: 'warning',
            });
            setIsLoading(false);
            return;
          }
        }

        // columnDefs fields 추출 후 평탄화
        const flattenFields = (cols: (ColDef | ColGroupDef)[]): string[] => {
          const result: string[] = [];

          const traverse = (list: (ColDef | ColGroupDef)[]) => {
            list.forEach((col) => {
              if ('children' in col && col.children) {
                traverse(col.children);
              } else if ('field' in col) {
                result.push(col.field as string);
              }
            });
          };

          traverse(cols);

          return result;
        };

        const fields = flattenFields(columnDefs);

        const alignedData: T[] = rows.map((rowArr) => {
          const rowObj: T = {} as T;

          fields.forEach((field, index) => {
            if (!field) return;

            const path = field.split('.');
            let current: Record<string, unknown> = rowObj as unknown as Record<string, unknown>;

            for (let i = 0; i < path.length; i++) {
              const key = path[i];

              if (i === path.length - 1) {
                let value = rowArr[index];

                // "true"/"false" 문자열을 "Y"/"N"으로 변환
                if (checkboxFields?.includes(key) && typeof value === 'string') {
                  value = value.toLowerCase() === 'true' ? 'Y' : 'N';
                }

                // 특정 필드는 문자열로 변환 및 작은 따옴표 제거
                if (
                  stringConversionFields?.includes(key) &&
                  value !== null &&
                  value !== undefined
                ) {
                  // 문자열로 변환
                  let strValue = String(value);

                  // 작은 따옴표로 시작하면 제거
                  if (strValue.startsWith("'")) {
                    strValue = strValue.substring(1);
                  }

                  value = strValue;
                }

                current[key] = value;
              } else {
                if (typeof current[key] !== 'object' || current[key] === null) {
                  current[key] = {};
                }
                current = current[key] as Record<string, unknown>;
              }
            }
          });

          return rowObj;
        });

        setRowData(alignedData);
        setUploadStatusMessage(`총 ${alignedData.length}건 업로드 완료`);
        message
          .alert({
            message: '데이터가 성공적으로 업로드되었습니다.',
            icon: 'success',
          })
          .then(() => {
            setIsOpen(false);
          });
      } catch (err) {
        console.error(err);
        setUploadStatusMessage('파일 처리 중 오류 발생');
        message.alert({
          message: '파일 처리 중 오류가 발생했습니다.',
          icon: 'warning',
        });
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleData,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>파일 업로드</DialogTitle>
        </DialogHeader>

        <DialogDescription />
        {isLoading ? (
          <div className="flex justify-center items-center p-4">loading...</div>
        ) : (
          <div className="flex flex-col items-center gap-5 p-4">
            <div
              {...getRootProps()}
              className={`w-full text-center py-5 border-2 border-dashed rounded cursor-pointer transition-colors ${
                isDragActive ? 'border-[#1677ff]' : 'border-gray-300 hover:border-[#1677ff]'
              }`}
            >
              <input {...getInputProps()} />

              {isDragActive && <p>파일을 여기에 놓으세요...</p>}

              {fileName && (
                <div>
                  <p>{fileName}</p>
                  <p>{uploadStatusMessage}</p>
                </div>
              )}

              {!isDragActive && !fileName && (
                <p>
                  Excel 또는 CSV 파일을 드래그앤드롭 하거나
                  <br />
                  클릭하여 선택하세요
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
