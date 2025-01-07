'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import { PositionFilterProps } from '@/types/hiring/filter-type';
import { POSITIONS } from '@/constant/position';

const PositionFilter: React.FC<PositionFilterProps> = ({
  positionFilter,
  setPositionFilter,
}) => {
  const handleCheckboxChange = (position: string) => {
    if (positionFilter.includes(position)) {
      setPositionFilter(positionFilter.filter((item) => item !== position));
    } else {
      setPositionFilter([...positionFilter, position]);
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-0.5 py-2 px-2 border rounded">
          <p>직무필터</p>
          <p className="bg-[#4C71C0] rounded px-1 text-white text-xs">
            {positionFilter.length}
          </p>
        </button>
      </Dialog.Trigger>

      <Dialog.Description></Dialog.Description>

      <Dialog.Portal>
        {/* <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" /> */}

        <div className="fixed inset-0 flex items-center justify-center">
          <div
            id="modal-overlay"
            className="absolute inset-0 bg-black/50 z-40"
          />

          <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[30vh] w-full min-w-[350px] max-w-[550px] -translate-x-1/2 -translate-y-1/2 rounded bg-white p-[25px] shadow focus:outline-none overflow-y-auto z-50">
            <Dialog.Title className="mb-2 font-bold">직무필터</Dialog.Title>

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

            <div className="flex flex-wrap gap-2 mt-4 border rounded p-4">
              {POSITIONS.map((position) => (
                <label key={position.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={positionFilter.includes(position.position)}
                    onChange={() => handleCheckboxChange(position.position)}
                  />
                  {position.position}
                </label>
              ))}
            </div>

            <Dialog.Close asChild>
              <Image
                src="/svg/close.svg"
                alt="close"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="absolute right-4 top-4 cursor-pointer"
                aria-label="Close"
                width={25}
                height={25}
                priority={true}
              />
            </Dialog.Close>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PositionFilter;
