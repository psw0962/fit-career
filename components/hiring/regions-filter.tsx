'use client';

import { REGIONS } from '@/constant/regions';
import Image from 'next/image';
import { City, RegionsFilterProps } from '@/types/hiring/filter-type';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';

const RegionsFilter: React.FC<RegionsFilterProps> = ({
  regionFilter,
  setRegionFilter,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempFilter, setTempFilter] = useState(regionFilter);

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
    if (!tempFilter.selectedCity) return;

    const cityName = tempFilter.selectedCity.city;
    const countyLabel = `${cityName} ${county}`;
    const isCountySelected = tempFilter.selectedCounties.includes(countyLabel);

    let updatedCounties;

    if (county === `${cityName} 전체`) {
      if (tempFilter.allSelectedCities.includes(cityName)) {
        updatedCounties = tempFilter.selectedCounties.filter(
          (item) => !item.startsWith(`${cityName}`)
        );
        setTempFilter((prev) => ({
          ...prev,
          selectedCounties: updatedCounties,
          allSelectedCities: prev.allSelectedCities.filter(
            (city) => city !== cityName
          ),
        }));
      } else {
        updatedCounties = [
          ...tempFilter.selectedCounties.filter(
            (item) => !item.startsWith(`${cityName}`)
          ),
          ...tempFilter.selectedCity.county
            .filter((c) => c !== `${cityName} 전체`)
            .map((c) => `${cityName} ${c}`),
        ];
        setTempFilter((prev) => ({
          ...prev,
          selectedCounties: updatedCounties,
          allSelectedCities: [...prev.allSelectedCities, cityName],
        }));
      }
    } else {
      updatedCounties = isCountySelected
        ? tempFilter.selectedCounties.filter((item) => item !== countyLabel)
        : [...tempFilter.selectedCounties, countyLabel];

      const allCountiesSelected = tempFilter.selectedCity.county
        .filter((c) => c !== `${cityName} 전체`)
        .every((c) => updatedCounties.includes(`${cityName} ${c}`));

      setTempFilter((prev) => ({
        ...prev,
        selectedCounties: updatedCounties,
        allSelectedCities: allCountiesSelected
          ? [...prev.allSelectedCities, cityName]
          : prev.allSelectedCities.filter((city) => city !== cityName),
      }));
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleModalOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center justify-center gap-0.5 py-2 px-2 border rounded"
          aria-haspopup="dialog"
          aria-expanded="false"
          onClick={() => setIsModalOpen(true)}
        >
          <p className="text-sm">지역필터</p>
          <p className="bg-[#4C71C0] rounded px-1 text-white text-xs">
            {regionFilter.selectedCounties.length}
          </p>
        </button>
      </DialogTrigger>

      <DialogContent className="w-[90vw] max-w-[500px] min-w-[300px]">
        <DialogHeader>
          <DialogTitle>지역필터</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-3">
          <button
            className="flex gap-1 items-center justify-center rounded bg-white border px-2 py-1 cursor-pointer"
            onClick={() => {
              setTempFilter({
                selectedCity: null,
                selectedCounties: [],
                allSelectedCities: [],
              });
            }}
          >
            <div className="relative w-4 h-4">
              <Image
                src="/svg/reset.svg"
                alt="reset"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                fill
                style={{ objectFit: 'cover' }}
                priority
                quality={75}
              />
            </div>
            <p>초기화</p>
          </button>

          {/* City selection */}
          <div className="flex gap-1">
            <div className="border p-4 w-full max-h-72 overflow-auto rounded">
              <ul>
                {REGIONS.map((region) => (
                  <li key={region.id} className="flex items-center">
                    <input
                      id={`city ${region.id}`}
                      name={`city ${region.id}`}
                      type="radio"
                      checked={tempFilter.selectedCity?.id === region.id}
                      onChange={() => handleCitySelect(region)}
                    />
                    <label htmlFor={`city ${region.id}`} className="ml-2">
                      {region.city}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* County selection */}
            {tempFilter.selectedCity ? (
              <div className="border p-4 w-full max-h-72 overflow-auto rounded">
                <ul>
                  {tempFilter.selectedCity.county.map((county) => {
                    const countyLabel =
                      county ===
                      `${tempFilter.selectedCity && tempFilter.selectedCity.city} 전체`
                        ? county
                        : `${tempFilter.selectedCity && tempFilter.selectedCity.city} ${county}`;

                    const isAllSelected =
                      county ===
                        `${tempFilter.selectedCity && tempFilter.selectedCity.city} 전체` &&
                      tempFilter.selectedCity &&
                      tempFilter.selectedCity.county
                        .filter(
                          (c) =>
                            c !==
                            `${tempFilter.selectedCity && tempFilter.selectedCity.city} 전체`
                        )
                        .every((c) =>
                          tempFilter.selectedCounties.includes(
                            `${tempFilter.selectedCity && tempFilter.selectedCity.city} ${c}`
                          )
                        );

                    return (
                      <li key={county} className="flex items-center">
                        <input
                          id={`county ${countyLabel}`}
                          name={`county ${countyLabel}`}
                          type="checkbox"
                          checked={
                            county === `${tempFilter.selectedCity?.city} 전체`
                              ? (isAllSelected ?? false)
                              : tempFilter.selectedCounties.includes(
                                  countyLabel
                                )
                          }
                          onChange={() =>
                            tempFilter.selectedCity && toggleCounty(county)
                          }
                        />
                        <label
                          htmlFor={`county ${countyLabel}`}
                          className="ml-2"
                        >
                          {county}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <p className="flex items-center justify-center border p-4 w-full max-h-72 overflow-auto rounded break-keep">
                시/도를 선택해 주세요.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {tempFilter.allSelectedCities.map((city) => (
              <div
                key={`${city} 전체`}
                className="w-fit px-2 py-2 bg-[#4C71C0] rounded text-white"
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
                <div key={county} className="w-fit px-2 py-2 border rounded">
                  {county}
                </div>
              ))}
          </div>

          <button
            className="w-fit mx-auto px-4 py-2 bg-[#4C71C0] text-white rounded"
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
};

export default RegionsFilter;
