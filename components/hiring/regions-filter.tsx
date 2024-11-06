'use client';

import { regions } from '@/constant/regions';
import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import { City, RegionsFilterProps } from '@/types/hiring/region-filter-type';

const RegionsFilter: React.FC<RegionsFilterProps> = ({
  regionFilter,
  setRegionFilter,
}) => {
  const handleCitySelect = (city: City) => {
    setRegionFilter((prev) => ({
      ...prev,
      selectedCity: city,
    }));
  };

  const toggleCounty = (county: string) => {
    if (!regionFilter.selectedCity) return;

    const cityName = regionFilter.selectedCity.city;
    const countyLabel = `${cityName}-${county}`;
    const isCountySelected =
      regionFilter.selectedCounties.includes(countyLabel);

    let updatedCounties;

    if (county === `${cityName} 전체`) {
      if (regionFilter.allSelectedCities.includes(cityName)) {
        updatedCounties = regionFilter.selectedCounties.filter(
          (item) => !item.startsWith(`${cityName}-`)
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
            (item) => !item.startsWith(`${cityName}-`)
          ),
          ...regionFilter.selectedCity.county
            .filter((c) => c !== `${cityName} 전체`)
            .map((c) => `${cityName}-${c}`),
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
        .every((c) => updatedCounties.includes(`${cityName}-${c}`));

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
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-0.5 py-2 px-2 border rounded">
          <p>지역필터</p>
          <p className="bg-[#4C71C0] rounded px-1 text-white text-xs">
            {regionFilter.selectedCounties.length}
          </p>
        </button>
      </Dialog.Trigger>

      <Dialog.Description></Dialog.Description>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />

        <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[50vh] w-[90vw] max-w-[450px] -translate-x-1/2 -translate-y-1/2 rounded bg-white p-[25px] shadow focus:outline-none overflow-y-auto">
          <Dialog.Title className="mb-2 font-bold">지역필터</Dialog.Title>

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
              <Image src="/svg/reset.svg" alt="reset" fill priority />
            </div>
            <p>초기화</p>
          </button>

          {/* City selection */}
          <div className="flex w-full mt-3">
            <div className="border p-4 w-full max-h-72 overflow-auto">
              <ul>
                {regions.map((region) => (
                  <li key={region.id} className="flex items-center">
                    <input
                      type="radio"
                      id={`city-${region.id}`}
                      name="city"
                      checked={regionFilter.selectedCity?.id === region.id}
                      onChange={() => handleCitySelect(region)}
                    />
                    <label htmlFor={`city-${region.id}`} className="ml-2">
                      {region.city}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* County selection */}
            {regionFilter.selectedCity ? (
              <div className="border p-4 w-full max-h-72 overflow-auto">
                <ul>
                  {regionFilter.selectedCity.county.map((county) => {
                    const countyLabel =
                      county ===
                      `${regionFilter.selectedCity && regionFilter.selectedCity.city} 전체`
                        ? county
                        : `${regionFilter.selectedCity && regionFilter.selectedCity.city}-${county}`;

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
                            `${regionFilter.selectedCity && regionFilter.selectedCity.city}-${c}`
                          )
                        );

                    return (
                      <li key={county} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`county-${countyLabel}`}
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
                          htmlFor={`county-${countyLabel}`}
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
              <div className="flex items-center justify-center border p-4 w-full max-h-72 overflow-auto">
                시/도를 선택해 주세요.
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {regionFilter.allSelectedCities.map((city) => (
              <div
                key={`${city}-전체`}
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
                <div
                  key={county}
                  className="w-fit px-2 py-2 bg-[#4C71C0] rounded text-white"
                >
                  {county}
                </div>
              ))}
          </div>

          <Dialog.Close asChild>
            <Image
              src="/svg/close.svg"
              alt="close"
              className="absolute right-4 top-4 cursor-pointer"
              aria-label="Close"
              width={25}
              height={25}
              priority={true}
            />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default RegionsFilter;
