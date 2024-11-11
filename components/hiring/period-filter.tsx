'use client';

import * as Dialog from '@radix-ui/react-dialog';
import * as Slider from '@radix-ui/react-slider';
import Image from 'next/image';
import { PeriodFilterProps } from '@/types/hiring/filter-type';
import { useState } from 'react';

const PeriodFilter: React.FC<PeriodFilterProps> = ({
  periodValueFilter,
  setPeriodValueFilter,
}) => {
  const [period, setPeriod] = useState<string>('전체');

  //   const periodValueHandleChange = (
  //     event: React.ChangeEvent<HTMLSelectElement>
  //   ) => {
  //     const value = event.target.value;
  //     let result: string;

  //     if (Array.isArray(periodValueFilter) && periodValueFilter.length === 2) {
  //       const [start, end] = periodValueFilter;
  //       result = `${start}년 ~ ${end}년 이상`;
  //     } else {
  //       result = value;
  //     }

  //     setPeriod(result);
  //   };

  const periodValueHandleChange = (value: number[]) => {
    let result: string;

    if (value.length === 2) {
      const [start, end] = value;
      result = `${start}년 ~ ${end}년 이상`;
    } else {
      result = `${value[0]}년`;
    }

    setPeriod(result);
    setPeriodValueFilter(value);
  };

  //   const periodValueHandleChange = (newValue: number[]) => {
  //     const [start, end] = newValue;

  //     let result = '';

  //     if (start === 0 && end === 10) {
  //       result = '전체';
  //       setPeriodValue(newValue);
  //       setPeriodFilter(result);

  //       return;
  //     }

  //     if (start === 0 && end === 0) {
  //       result = `신입/연습생`;
  //       setPeriodValue(newValue);
  //       setPeriodFilter(result);

  //       return;
  //     }

  //     if (start === end) {
  //       result = `${start}년 이상`;
  //       setPeriodValue(newValue);
  //       setPeriodFilter(result);

  //       return;
  //     }

  //     if (start === 0 || end === 0) {
  //       result = `신입 ~ ${end}년 이상`;
  //       setPeriodValue(newValue);
  //       setPeriodFilter(result);

  //       return;
  //     }

  //     result = `${start}년 ~ ${end === 10 ? '10년 이상' : `${end}년 이상`}`;
  //     setPeriodValue(newValue);
  //     setPeriodFilter(result);

  //     return;
  //   };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-0.5 py-2 px-2 border rounded">
          <p>경력필터</p>
          <p className="bg-[#4C71C0] rounded px-1 text-white text-xs">
            {period}
          </p>
        </button>
      </Dialog.Trigger>

      <Dialog.Description></Dialog.Description>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />

        <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[50vh] w-[90vw] max-w-[450px] -translate-x-1/2 -translate-y-1/2 rounded bg-white p-[25px] shadow focus:outline-none overflow-y-auto">
          <Dialog.Title className="mb-2 font-bold">경력필터</Dialog.Title>

          <button
            className="flex gap-1 items-center justify-center rounded bg-white border px-2 py-1 cursor-pointer"
            onClick={() => {
              setPeriod('전체');
              setPeriodValueFilter([0, 10]);
            }}
          >
            <div className="relative w-4 h-4">
              <Image src="/svg/reset.svg" alt="reset" fill priority />
            </div>
            <p>초기화</p>
          </button>

          <div className="mt-4">{period}</div>

          <div className="flex flex-wrap gap-2 mt-4 border rounded p-4">
            <Slider.Root
              className="relative flex h-5 w-[300px] mt-2 touch-none select-none items-center"
              value={periodValueFilter}
              onValueChange={periodValueHandleChange}
              max={10}
              step={1}
            >
              <Slider.Track className="relative h-[3px] grow rounded-full bg-blackA7">
                <Slider.Range className="absolute h-full rounded-full bg-slate-200" />
              </Slider.Track>
            </Slider.Root>

            {/* <Slider.Root
              className="relative flex h-5 w-[300px] mt-2 touch-none select-none items-center"
              value={periodValueFilter}
              onValueChange={periodValueHandleChange}
              max={10}
              step={1}
            >
              <Slider.Track className="relative h-[3px] grow rounded-full bg-blackA7">
                <Slider.Range className="absolute h-full rounded-full bg-slate-200" />
              </Slider.Track>

              <Slider.Thumb
                className="block size-5 rounded-[10px] bg-[#4C71C0] hover:bg-violet3 focus:shadow-blackA5 focus:outline-none"
                aria-label="Volume"
              />

              <Slider.Thumb
                className="block size-5 rounded-[10px] bg-[#4C71C0] hover:bg-violet3 focus:shadow-blackA5 focus:outline-none"
                aria-label="Volume"
              />
            </Slider.Root> */}
          </div>

          <Dialog.Close asChild>
            <Image
              src="/svg/close.svg"
              alt="close"
              className="absolute right-4 top-4 cursor-pointer"
              aria-label="Close"
              width={25}
              height={25}
              priority={true}
            />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PeriodFilter;