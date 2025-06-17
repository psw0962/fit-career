'use client';

import { REGIONS } from '@/constant/regions';
import Image from 'next/image';
import { City, RegionFilter, RegionsFilterProps } from '@/types/hiring/filter-type';
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

export default function RegionsFilter({ regionFilter, setRegionFilter }: RegionsFilterProps) {
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempFilter, setTempFilter] = useState<RegionFilter>({
    selectedCity: null,
    selectedCounties: [],
    allSelectedCities: [],
  });

  const handleModalOpen = (open: boolean) => {
    setIsModalOpen(open);
    if (open) {
      setTempFilter(regionFilter);
    }
  };

  const handleCitySelect = (city: City) => {
    setTempFilter((prev) => ({
      ...prev,
      selectedCity: city,
    }));
  };

  const toggleCounty = (county: string) => {
    setTempFilter((prev) => {
      if (!prev.selectedCity) return prev;

      const cityName = prev.selectedCity.city;
      const countyLabel = `${cityName} ${county}`;

      if (county === `${cityName} 전체`) {
        if (prev.allSelectedCities.includes(cityName)) {
          // 전체 해제: 해당 도시의 모든 county 제거
          return {
            ...prev,
            selectedCounties: prev.selectedCounties.filter(
              (item) => !item.startsWith(`${cityName}`),
            ),
            allSelectedCities: prev.allSelectedCities.filter((city) => city !== cityName),
          };
        } else {
          // 전체 선택: 해당 도시의 모든 county 추가
          const newCounties = [
            ...prev.selectedCounties.filter((item) => !item.startsWith(`${cityName}`)),
            ...prev.selectedCity.county
              .filter((c) => c !== `${cityName} 전체`)
              .map((c) => `${cityName} ${c}`),
          ];
          return {
            ...prev,
            selectedCounties: newCounties,
            allSelectedCities: [...prev.allSelectedCities, cityName],
          };
        }
      } else {
        // 개별 county 토글
        const isCountySelected = prev.selectedCounties.includes(countyLabel);
        const updatedCounties = isCountySelected
          ? prev.selectedCounties.filter((item) => item !== countyLabel)
          : [...prev.selectedCounties, countyLabel];

        const allCountiesSelected = prev.selectedCity.county
          .filter((c) => c !== `${cityName} 전체`)
          .every((c) => updatedCounties.includes(`${cityName} ${c}`));

        return {
          ...prev,
          selectedCounties: updatedCounties,
          allSelectedCities: allCountiesSelected
            ? [...prev.allSelectedCities, cityName]
            : prev.allSelectedCities.filter((city) => city !== cityName),
        };
      }
    });
  };

  useEffect(() => {
    setMounted(true);
    setTempFilter(regionFilter);
  }, [regionFilter]);

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
          <p className='text-sm'>지역필터</p>
          <p className='bg-[#4C71C0] rounded px-1 text-white text-xs'>
            {regionFilter.selectedCounties.length}
          </p>
        </button>
      </DialogTrigger>

      <DialogContent className='w-[90vw] max-w-[500px] min-w-[300px]'>
        <DialogHeader>
          <DialogTitle>지역필터</DialogTitle>
          <DialogDescription className='hidden'></DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-3 mt-3'>
          <button
            className='flex gap-1 items-center justify-center rounded bg-white border px-2 py-1 cursor-pointer'
            onClick={() => {
              setTempFilter({
                selectedCity: null,
                selectedCounties: [],
                allSelectedCities: [],
              });
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

          {/* City selection */}
          <div className='flex gap-1'>
            <div className='border p-4 w-full max-h-72 overflow-y-auto rounded'>
              <ul>
                {REGIONS.map((region) => (
                  <li key={region.id} className='flex items-center'>
                    <input
                      id={`city ${region.id}`}
                      name={`city ${region.id}`}
                      type='radio'
                      checked={tempFilter.selectedCity?.id === region.id}
                      onChange={() => handleCitySelect(region)}
                    />
                    <label htmlFor={`city ${region.id}`} className='ml-2'>
                      {region.city}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* County selection */}
            {tempFilter.selectedCity ? (
              <div className='border p-4 w-full max-h-72 overflow-y-auto rounded'>
                <ul>
                  {tempFilter.selectedCity.county.map((county) => {
                    const uniqueId = `${tempFilter.selectedCity!.id}-${county.replace(/\s/g, '-')}`;

                    const countyLabel =
                      county === `${tempFilter.selectedCity && tempFilter.selectedCity.city} 전체`
                        ? county
                        : `${tempFilter.selectedCity && tempFilter.selectedCity.city} ${county}`;

                    const isAllSelected =
                      county ===
                        `${tempFilter.selectedCity && tempFilter.selectedCity.city} 전체` &&
                      tempFilter.selectedCity &&
                      tempFilter.selectedCity.county
                        .filter(
                          (c) =>
                            c !== `${tempFilter.selectedCity && tempFilter.selectedCity.city} 전체`,
                        )
                        .every((c) =>
                          tempFilter.selectedCounties.includes(
                            `${tempFilter.selectedCity && tempFilter.selectedCity.city} ${c}`,
                          ),
                        );

                    return (
                      <li key={county} className='flex items-center'>
                        <input
                          id={uniqueId}
                          name={uniqueId}
                          type='checkbox'
                          checked={
                            county === `${tempFilter.selectedCity?.city} 전체`
                              ? (isAllSelected ?? false)
                              : tempFilter.selectedCounties.includes(countyLabel)
                          }
                          onChange={() => {
                            tempFilter && toggleCounty(county);
                          }}
                        />
                        <label htmlFor={uniqueId} className='ml-2'>
                          {county}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <p className='flex items-center justify-center border p-4 w-full max-h-72 overflow-auto rounded break-keep'>
                시/도를 선택해 주세요.
              </p>
            )}
          </div>

          <div className='flex flex-wrap gap-1 max-h-24 overflow-y-auto'>
            {tempFilter.allSelectedCities.map((city) => (
              <div
                key={`${city} 전체`}
                className='flex items-center w-fit px-2 py-1 bg-[#4C71C0] rounded text-white text-sm font-bold'
              >
                {`${city} 전체`}
              </div>
            ))}

            {tempFilter.selectedCounties
              .filter((county) => {
                const cityName = county.split('-')[0];
                return !tempFilter.allSelectedCities.includes(cityName);
              })
              .map((county) => (
                <div
                  key={county}
                  className='flex items-center w-fit px-2 py-1 border rounded text-sm'
                >
                  {county}
                </div>
              ))}
          </div>

          <button
            className='w-fit mx-auto px-4 py-2 bg-[#4C71C0] text-white text-sm rounded'
            onClick={() => {
              setRegionFilter(tempFilter);
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
