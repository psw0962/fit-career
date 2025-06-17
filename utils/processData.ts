export interface ProcessResult<T> {
  isValid: boolean; // 유효성 여부
  errorMessage?: string; // 오류 메시지
  invalidPaths?: string[]; // 유효하지 않은 값값 목록
  processedData: T | null; // 처리된 데이터
}

export interface ValidationOptions {
  excludedKeys?: string[]; // 제외할 key 목록
  allowedKeys?: string[]; // 허용할 key 목록
}

/**
 * 유효하지 않은 값 여부 검사 함수
 * @param value 검사할 값
 * @returns 유효하지 않은 값 여부 (undefined, null, "", NaN)
 */
function isInvalidValue(value: unknown): boolean {
  switch (true) {
    case value === undefined:
    case value === null:
    case value === '':
    case typeof value === 'number' && Number.isNaN(value):
      return true;

    default:
      return false;
  }
}

/**
 * 데이터 처리 함수
 * 유효성 검사와 전처리를 한 번에 수행
 * @param data 처리할 데이터
 * @param excludedKeys 제외할 key 목록
 * @param allowedKeys 허용할 key 목록
 * @returns 처리 결과
 */
export function processData<T>(
  data: T,
  {
    excludedKeys = [],
    allowedKeys = [],
  }: {
    excludedKeys?: string[];
    allowedKeys?: string[];
  } = {},
): ProcessResult<T> {
  try {
    const result: ProcessResult<T> = {
      isValid: true,
      processedData: null,
      invalidPaths: [],
    };

    function validateAndProcess(value: unknown, path: string = ''): unknown {
      // 1. 유효성 검사
      if (isInvalidValue(value)) {
        result.isValid = false;
        if (path) result.invalidPaths?.push(path);
        return null;
      }

      // 2. 데이터 타입별 처리
      switch (true) {
        // 배열인 경우 재귀적으로 처리
        case Array.isArray(value):
          return value.map((item, index) =>
            validateAndProcess(item, path ? `${path}[${index}]` : `[${index}]`),
          );

        // 객체인 경우 재귀적으로 처리
        case typeof value === 'object': {
          const newObj: Record<string, unknown> = {};

          for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
            // 제외 key는 건너뜀
            if (excludedKeys.includes(key)) continue;

            // 허용 key는 유효성 검사를 건너뛰고 그대로 포함
            if (allowedKeys.includes(key)) {
              newObj[key] = val;
              continue;
            }

            // 일반 key는 재귀적으로 검사 및 처리
            const newPath = path ? `${path}.${key}` : key;
            newObj[key] = validateAndProcess(val, newPath);
          }

          return newObj;
        }

        default:
          return value;
      }
    }

    // 데이터 처리 실행
    result.processedData = validateAndProcess(data) as T;

    // 유효성 검사 실패 시 에러 메시지 설정
    if (!result.isValid) {
      const invalidPathsText =
        result.invalidPaths && result.invalidPaths.length > 0
          ? `\n문제가 발생한 위치: ${result.invalidPaths.join(', ')}`
          : '';
      console.log('invalidPathsText', invalidPathsText);

      // result.errorMessage = `유효하지 않은 데이터가 포함되어 있습니다.${invalidPathsText}`;
      result.errorMessage = `유효하지 않은 데이터가 포함되어 있습니다.`;
      result.processedData = null;
    }

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : '데이터 처리 중 오류가 발생했습니다';

    return {
      isValid: false,
      errorMessage,
      processedData: null,
    };
  }
}
