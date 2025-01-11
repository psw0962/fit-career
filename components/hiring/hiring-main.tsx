'use client';

import RegionsFilter from '@/components/hiring/regions-filter';
import { RegionFilter } from '@/types/hiring/filter-type';
import PositionFilter from '@/components/hiring/position-filter';
import PeriodFilter from '@/components/hiring/period-filter';
import HiringFilter from '@/components/hiring/hiring-filter';
import Link from 'next/link';
import Image from 'next/image';
import useDebounce from '@/hooks/use-debounce';
import { useSessionStorage } from 'usehooks-ts';

const HiringMain = () => {
  const [regionFilter, setRegionFilter] = useSessionStorage<RegionFilter>(
    'regionFilter',
    {
      selectedCity: null,
      allSelectedCities: [],
      selectedCounties: [],
    }
  );
  const [positionFilter, setPositionFilter] = useSessionStorage<string[]>(
    'positionFilter',
    []
  );

  const [periodValueFilter, setPeriodValueFilter] = useSessionStorage<number[]>(
    'periodValueFilter',
    [0, 10]
  );

  const [currentPage, setCurrentPage] = useSessionStorage(
    'hiring-current-page',
    1
  );

  const debouncedRegionFilter = useDebounce(regionFilter);
  const debouncedPositionFilter = useDebounce(positionFilter);
  const debouncedPeriodValueFilter = useDebounce(periodValueFilter);

  const handleFilterChange = {
    region: (
      newFilter: RegionFilter | ((prev: RegionFilter) => RegionFilter)
    ) => {
      setRegionFilter(newFilter);
      setCurrentPage(1);
    },
    position: (newFilter: string[] | ((prev: string[]) => string[])) => {
      setPositionFilter(newFilter);
      setCurrentPage(1);
    },
    period: (newFilter: number[] | ((prev: number[]) => number[])) => {
      setPeriodValueFilter(newFilter);
      setCurrentPage(1);
    },
  };

  const resetFilters = () => {
    setRegionFilter({
      selectedCity: null,
      allSelectedCities: [],
      selectedCounties: [],
    });
    setPositionFilter([]);
    setPeriodValueFilter([0, 10]);
    setCurrentPage(1);
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
          setRegionFilter={handleFilterChange.region}
        />
        <PositionFilter
          positionFilter={positionFilter}
          setPositionFilter={handleFilterChange.position}
        />
        <PeriodFilter
          periodValueFilter={periodValueFilter}
          setPeriodValueFilter={handleFilterChange.period}
        />
      </div>

      <div className="w-full h-[1px] my-4 bg-gray-200" />

      <HiringFilter
        regionFilter={debouncedRegionFilter}
        positionFilter={debouncedPositionFilter}
        periodValueFilter={debouncedPeriodValueFilter}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default HiringMain;
