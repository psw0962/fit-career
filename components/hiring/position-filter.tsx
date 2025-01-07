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
import { useState } from 'react';

const PositionFilter: React.FC<PositionFilterProps> = ({
  positionFilter,
  setPositionFilter,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCheckboxChange = (position: string) => {
    if (positionFilter.includes(position)) {
      setPositionFilter(positionFilter.filter((item) => item !== position));
    } else {
      setPositionFilter([...positionFilter, position]);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-0.5 py-2 px-2 border rounded"
          onClick={() => setIsModalOpen(true)}
        >
          <p>직무필터</p>
          <p className="bg-[#4C71C0] rounded px-1 text-white text-xs">
            {positionFilter.length}
          </p>
        </button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-[500px] min-w-[300px]">
        <DialogHeader>
          <DialogTitle>직무필터</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-3">
          <button
            className="flex gap-1 items-center justify-center rounded bg-white border px-2 py-1 cursor-pointer"
            onClick={() => {
              setPositionFilter([]);
            }}
          >
            <div className="relative w-4 h-4">
              <Image
                src="/svg/reset.svg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                alt="reset"
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
            <p>초기화</p>
          </button>

          <div className="flex flex-wrap gap-2 border rounded p-4">
            {POSITIONS.map((position) => (
              <label
                key={position.id}
                className="flex items-center gap-2 break-keep"
              >
                <input
                  type="checkbox"
                  checked={positionFilter.includes(position.position)}
                  onChange={() => handleCheckboxChange(position.position)}
                />
                {position.position}
              </label>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PositionFilter;
