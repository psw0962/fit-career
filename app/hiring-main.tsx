'use client';

import { useState } from 'react';
import RegionsFilter from '@/components/hiring/regions-filter';
import { RegionFilter } from '@/types/hiring/filter-type';
import PositionFilter from '@/components/hiring/position-filter';
import PeriodFilter from '@/components/hiring/period-filter';
import HiringFilter from '@/components/hiring/hiring-filter';
import Link from 'next/link';
import Image from 'next/image';
import useDebounce from '@/hooks/use-debounce';
import { useLocalStorage } from 'usehooks-ts';

// export const metadata = {
//   title: 'HOME',
//   description: 'HOME',
// };

// export async function generateMetadata({ params, searchParams }) {
//   const movie = await getMovie(params.id);

//   return {
//     title: movie.title,
//     description: movie.overview,
//     openGraph: {
//       images: [movie.image_url],
//     },
//   };
// }

const HiringMain = () => {
  const [regionFilter, setRegionFilter] = useLocalStorage<RegionFilter>(
    'regionFilter',
    {
      selectedCity: null,
      allSelectedCities: [],
      selectedCounties: [],
    }
  );
  const [positionFilter, setPositionFilter] = useLocalStorage<string[]>(
    'positionFilter',
    []
  );

  const [periodValueFilter, setPeriodValueFilter] = useLocalStorage<number[]>(
    'periodValueFilter',
    [0, 10]
  );

  const debouncedRegionFilter = useDebounce(regionFilter);
  const debouncedPositionFilter = useDebounce(positionFilter);
  const debouncedPeriodValueFilter = useDebounce(periodValueFilter);

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

      <div className="flex gap-1.5 mt-4 overflow-x-auto scrollbar-hide whitespace-nowrap">
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

      <div className="w-full h-[1px] my-4 bg-gray-200" />

      <HiringFilter
        regionFilter={debouncedRegionFilter}
        positionFilter={debouncedPositionFilter}
        periodValueFilter={debouncedPeriodValueFilter}
      />
    </div>
  );
};

export default HiringMain;
