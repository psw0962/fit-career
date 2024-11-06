'use client';

import { useGetHiring } from '@/actions/hiring';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import RegionsFilter from '@/components/hiring/regions-filter';
import { RegionFilter } from '@/types/hiring/region-filter-type';

const Hiring = () => {
  const router = useRouter();

  const { data: hiringData, isLoading, error } = useGetHiring();

  const [regionFilter, setRegionFilter] = useState<RegionFilter>({
    selectedCity: null,
    selectedCounties: [],
    allSelectedCities: [],
  });

  return (
    <div>
      <p className="text-3xl font-bold mb-4 underline underline-offset-4 decoration-[#4C71C0]">
        채용정보
      </p>

      <div className="flex gap-2 mt-10">
        <RegionsFilter
          regionFilter={regionFilter}
          setRegionFilter={setRegionFilter}
        />

        <button className="flex items-center gap-0.5 py-2 px-2 border rounded">
          <p>직무필터</p>
          <p className="bg-[#4C71C0] rounded px-1 text-white text-xs">
            {regionFilter.selectedCounties.length}
          </p>
        </button>

        <button className="flex items-center gap-0.5 py-2 px-2 border rounded">
          <p>경력필터</p>
          <p className="bg-[#4C71C0] rounded px-1 text-white text-xs">
            {regionFilter.selectedCounties.length}
          </p>
        </button>
      </div>

      <div className="my-4 border"></div>

      <div className="grid grid-cols-5 gap-3">
        {hiringData !== undefined &&
          hiringData.map((x: any) => {
            return (
              <div
                key={x.id}
                className="flex flex-col gap-2 p-10 shadow-md rounded-xl cursor-pointer"
                onClick={() => {
                  router.push(`/hiring/${x.id}`);
                }}
              >
                <div className="relative w-10 h-10 mx-auto mb-4">
                  <Image
                    src={x.images.length !== 0 ? x.images[0] : '/logo.svg'}
                    alt={`image ${x.id}`}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                <p>{x.title}</p>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Hiring;
