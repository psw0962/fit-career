'use client';

import * as Slider from '@radix-ui/react-slider';
import Image from 'next/image';
import { PeriodFilterProps } from '@/types/hiring/filter-type';
import { formatPeriod } from '@/functions/formatPeriod';
import { CommonDialog } from '@/components/common/common-dialog';
import { useEffect, useState } from 'react';
import Spinner from '@/components/common/spinner';

export default function PeriodFilter({
  periodValueFilter,
  setPeriodValueFilter,
}: PeriodFilterProps) {
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempFilter, setTempFilter] = useState([0, 10]);

  const handleModalOpen = (open: boolean) => {
    setIsModalOpen(open);
    if (open) {
      setTempFilter(periodValueFilter);
    }
  };

  useEffect(() => {
    setMounted(true);
    setTempFilter(periodValueFilter);
  }, [periodValueFilter]);

  if (!mounted) {
    return (
      <button className='flex items-center justify-center gap-0.5 py-2 px-2 border rounded'>
        <Spinner width='10px' height='10px' />
      </button>
    );
  }

  const triggerButton = (
    <button
      className='flex items-center justify-center gap-0.5 py-2 px-2 border rounded'
      aria-haspopup='dialog'
      aria-expanded={isModalOpen}
    >
      <p className='text-sm'>경력필터</p>
      <p className='bg-[#4C71C0] rounded px-1 text-white text-xs'>
        {formatPeriod(periodValueFilter)}
      </p>
    </button>
  );

  const footer = (
    <button
      className='w-fit mx-auto px-4 py-2 mt-2 bg-[#4C71C0] text-white text-sm rounded'
      onClick={() => {
        setPeriodValueFilter(tempFilter);
        setIsModalOpen(false);
      }}
    >
      확인
    </button>
  );

  return (
    <CommonDialog
      open={isModalOpen}
      onOpenChange={handleModalOpen}
      title='경력필터'
      trigger={triggerButton}
      footer={footer}
      contentClassName='w-[90vw] max-w-[500px] min-w-[300px]'
      className='p-0'
    >
      <div className='flex flex-col gap-3'>
        <button
          className='flex gap-1 items-center justify-center rounded bg-white border px-2 py-1 cursor-pointer'
          onClick={() => {
            setTempFilter([0, 10]);
          }}
        >
          <div className='relative w-4 h-4'>
            <Image
              src='/svg/reset.svg'
              alt='reset'
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <p>초기화</p>
        </button>

        <div className='flex flex-col gap-2 border rounded p-4'>
          <p className='text-base'>{formatPeriod(tempFilter)}</p>

          <div className='w-full flex flex-wrap'>
            <Slider.Root
              className='relative flex h-5 w-full mt-2 touch-none select-none items-center'
              value={tempFilter}
              onValueChange={setTempFilter}
              max={10}
              step={1}
            >
              <Slider.Track className='relative h-[3px] grow rounded-full bg-blackA7'>
                <Slider.Range className='absolute h-full rounded-full bg-slate-200' />
              </Slider.Track>

              <Slider.Thumb
                className='block size-5 rounded-[10px] bg-[#4C71C0] hover:bg-violet3 focus:shadow-blackA5 focus:outline-none'
                aria-label='Volume'
              />

              <Slider.Thumb
                className='block size-5 rounded-[10px] bg-[#4C71C0] hover:bg-violet3 focus:shadow-blackA5 focus:outline-none'
                aria-label='Volume'
              />
            </Slider.Root>
          </div>
        </div>
      </div>
    </CommonDialog>
  );
}
