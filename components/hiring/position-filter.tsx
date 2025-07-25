'use client';

import Image from 'next/image';
import { PositionFilterProps } from '@/types/hiring/filter-type';
import { POSITIONS } from '@/constant/position';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import Spinner from '@/components/common/spinner';

export default function PositionFilter({ positionFilter, setPositionFilter }: PositionFilterProps) {
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempFilter, setTempFilter] = useState<string[]>([]);

  const handleModalOpen = (open: boolean) => {
    setIsModalOpen(open);
    if (open) {
      setTempFilter(positionFilter);
    }
  };

  const handleCheckboxChange = (position: string) => {
    if (tempFilter.includes(position)) {
      setTempFilter(tempFilter.filter((item) => item !== position));
    } else {
      setTempFilter([...tempFilter, position]);
    }
  };

  useEffect(() => {
    setMounted(true);
    setTempFilter(positionFilter);
  }, [positionFilter]);

  if (!mounted) {
    return (
      <button className='flex items-center justify-center gap-0.5 py-2 px-2 border rounded'>
        <Spinner width='10px' height='10px' />
      </button>
    );
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleModalOpen}>
      <DialogTrigger asChild>
        <button
          className='flex items-center justify-center gap-0.5 py-2 px-2 border rounded'
          aria-haspopup='dialog'
          aria-expanded={isModalOpen}
        >
          <p className='text-sm'>직무필터</p>
          <p className='bg-[#4C71C0] rounded px-1 text-white text-xs'>{positionFilter.length}</p>
        </button>
      </DialogTrigger>

      <DialogContent className='w-[90vw] max-w-[500px] min-w-[300px]'>
        <DialogHeader>
          <DialogTitle>직무필터</DialogTitle>
          <DialogDescription className='hidden'></DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-3 mt-3'>
          <button
            className='flex gap-1 items-center justify-center rounded bg-white border px-2 py-1 cursor-pointer'
            onClick={() => {
              setTempFilter([]);
            }}
          >
            <div className='relative w-4 h-4'>
              <Image
                src='/svg/reset.svg'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                alt='reset'
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <p>초기화</p>
          </button>

          <div className='flex flex-wrap gap-2 border rounded p-4'>
            {POSITIONS.map((position) => (
              <label key={position.id} className='flex items-center gap-2 break-keep'>
                <input
                  type='checkbox'
                  checked={tempFilter.includes(position.position)}
                  onChange={() => handleCheckboxChange(position.position)}
                />
                {position.position}
              </label>
            ))}
          </div>

          <button
            className='w-fit mx-auto px-4 py-2 bg-[#4C71C0] text-white text-sm rounded'
            onClick={() => {
              setPositionFilter(tempFilter);
              setIsModalOpen(false);
            }}
          >
            확인
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
