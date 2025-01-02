export const formatPeriod = (value: number[]) => {
  if (value.length === 2) {
    const [start, end] = value;

    if (start === 0 && end === 0) {
      return '신입';
    }

    if (start === 0 && end === 10) {
      return '전체';
    }

    if (start === end) {
      return `${start}년 이상`;
    }
    return `${start}년~${end === 10 ? '10년 이상' : `${end}년 이상`}`;
  } else {
    return `${value[0]}년 이상`;
  }
};
