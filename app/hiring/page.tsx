'use client';

import { useState } from 'react';
import RegionsFilter from '@/components/hiring/regions-filter';
import { RegionFilter } from '@/types/hiring/filter-type';
import PositionFilter from '@/components/hiring/position-filter';
import PeriodFilter from '@/components/hiring/period-filter';
import HiringFilter from '@/components/hiring/hiring-filter';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const Hiring = () => {
  const router = useRouter();

  const [regionFilter, setRegionFilter] = useState<RegionFilter>({
    selectedCity: null,
    allSelectedCities: [],
    selectedCounties: [],
  });
  const [positionFilter, setPositionFilter] = useState<string[]>([]);
  const [periodValueFilter, setPeriodValueFilter] = useState<number[]>([0, 10]);

  const resetFilters = () => {
    setRegionFilter({
      selectedCity: null,
      allSelectedCities: [],
      selectedCounties: [],
    });
    setPositionFilter([]);
    setPeriodValueFilter([0, 10]);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <p className="text-3xl font-bold underline underline-offset-4 decoration-[#4C71C0]">
          채용정보
        </p>

        <Link href="/hiring/write" passHref>
          <p className="w-fit bg-[#4C71C0] rounded px-4 py-2 text-white cursor-pointer">
            채용공고 등록
          </p>
        </Link>
      </div>

      <div className="flex gap-1 mt-4 overflow-x-auto scrollbar-hide whitespace-nowrap">
        <button
          className="flex gap-1 items-center justify-center rounded bg-white border px-2 py-1 cursor-pointer"
          onClick={() => resetFilters()}
        >
          <div className="relative w-4 h-4">
            <Image
              src="/svg/reset.svg"
              alt="reset"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          <p>전체 초기화</p>
        </button>

        <RegionsFilter
          regionFilter={regionFilter}
          setRegionFilter={setRegionFilter}
        />

        <PositionFilter
          positionFilter={positionFilter}
          setPositionFilter={setPositionFilter}
        />

        <PeriodFilter
          periodValueFilter={periodValueFilter}
          setPeriodValueFilter={setPeriodValueFilter}
        />
      </div>

      <div className="my-4 border"></div>

      <HiringFilter
        regionFilter={regionFilter}
        positionFilter={positionFilter}
        periodValueFilter={periodValueFilter}
      />
    </div>
  );
};

export default Hiring;
