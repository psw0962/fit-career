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

  const handleCitySelect = (city: City) => {
    setRegionFilter((prev) => ({
      ...prev,
      selectedCity: city,
    }));
  };

  const toggleCounty = (county: string) => {
    if (!regionFilter.selectedCity) return;

    const cityName = regionFilter.selectedCity.city;
    const countyLabel = `${cityName} ${county}`;
    const isCountySelected =
      regionFilter.selectedCounties.includes(countyLabel);

    let updatedCounties;

    if (county === `${cityName} 전체`) {
      if (regionFilter.allSelectedCities.includes(cityName)) {
        updatedCounties = regionFilter.selectedCounties.filter(
          (item) => !item.startsWith(`${cityName}`)
        );
        setRegionFilter((prev) => ({
          ...prev,
          selectedCounties: updatedCounties,
          allSelectedCities: prev.allSelectedCities.filter(
            (city) => city !== cityName
          ),
        }));
      } else {
        updatedCounties = [
          ...regionFilter.selectedCounties.filter(
            (item) => !item.startsWith(`${cityName}`)
          ),
          ...regionFilter.selectedCity.county
            .filter((c) => c !== `${cityName} 전체`)
            .map((c) => `${cityName} ${c}`),
        ];
        setRegionFilter((prev) => ({
          ...prev,
          selectedCounties: updatedCounties,
          allSelectedCities: [...prev.allSelectedCities, cityName],
        }));
      }
    } else {
      updatedCounties = isCountySelected
        ? regionFilter.selectedCounties.filter((item) => item !== countyLabel)
        : [...regionFilter.selectedCounties, countyLabel];

      const allCountiesSelected = regionFilter.selectedCity.county
        .filter((c) => c !== `${cityName} 전체`)
        .every((c) => updatedCounties.includes(`${cityName} ${c}`));

      setRegionFilter((prev) => ({
        ...prev,
        selectedCounties: updatedCounties,
        allSelectedCities: allCountiesSelected
          ? [...prev.allSelectedCities, cityName]
          : prev.allSelectedCities.filter((city) => city !== cityName),
      }));
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-0.5 py-2 px-2 border rounded"
          onClick={() => setIsModalOpen(true)}
        >
          <p className="text-sm">지역필터</p>
          <p className="bg-[#4C71C0] rounded px-1 text-white text-xs">
            {regionFilter.selectedCounties.length}
          </p>
        </button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-[500px] min-w-[300px]">
        <DialogHeader>
          <DialogTitle>지역필터</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-3">
          <button
            className="flex gap-1 items-center justify-center rounded bg-white border px-2 py-1 cursor-pointer"
            onClick={() => {
              setRegionFilter({
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
                      checked={regionFilter.selectedCity?.id === region.id}
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
            {regionFilter.selectedCity ? (
              <div className="border p-4 w-full max-h-72 overflow-auto rounded">
                <ul>
                  {regionFilter.selectedCity.county.map((county) => {
                    const countyLabel =
                      county ===
                      `${regionFilter.selectedCity && regionFilter.selectedCity.city} 전체`
                        ? county
                        : `${regionFilter.selectedCity && regionFilter.selectedCity.city} ${county}`;

                    const isAllSelected =
                      county ===
                        `${regionFilter.selectedCity && regionFilter.selectedCity.city} 전체` &&
                      regionFilter.selectedCity &&
                      regionFilter.selectedCity.county
                        .filter(
                          (c) =>
                            c !==
                            `${regionFilter.selectedCity && regionFilter.selectedCity.city} 전체`
                        )
                        .every((c) =>
                          regionFilter.selectedCounties.includes(
                            `${regionFilter.selectedCity && regionFilter.selectedCity.city} ${c}`
                          )
                        );

                    return (
                      <li key={county} className="flex items-center">
                        <input
                          id={`county ${countyLabel}`}
                          name={`county ${countyLabel}`}
                          type="checkbox"
                          checked={
                            county === `${regionFilter.selectedCity?.city} 전체`
                              ? (isAllSelected ?? false)
                              : regionFilter.selectedCounties.includes(
                                  countyLabel
                                )
                          }
                          onChange={() =>
                            regionFilter.selectedCity && toggleCounty(county)
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
              <div className="flex items-center justify-center border p-4 w-full max-h-72 overflow-auto rounded">
                시/도를 선택해 주세요.
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {regionFilter.allSelectedCities.map((city) => (
              <div
                key={`${city} 전체`}
                className="w-fit px-2 py-2 bg-[#4C71C0] rounded text-white"
              >
                {`${city} 전체`}
              </div>
            ))}

            {regionFilter.selectedCounties
              .filter((county) => {
                const cityName = county.split('-')[0];
                return !regionFilter.allSelectedCities.includes(cityName);
              })
              .map((county) => (
                <div key={county} className="w-fit px-2 py-2 border rounded">
                  {county}
                </div>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegionsFilter;
