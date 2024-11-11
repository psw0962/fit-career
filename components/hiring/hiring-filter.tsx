'use client';

import { useGetHiring } from '@/actions/hiring';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { HiringFilterProps } from '@/types/hiring/filter-type';
import { useState, useEffect } from 'react';

type HiringData = {
  id: string;
  created_at: string;
  address: string;
  position: string;
  period: string;
  title: string;
  content: string;
  dead_line: string;
  images: string[];
  user_id: string;
  short_address: string;
};

const HiringFIlter: React.FC<HiringFilterProps> = ({
  regionFilter,
  positionFilter,
  periodValueFilter,
}) => {
  const router = useRouter();

  const { data: hiringData, isLoading: hiringDataIsLoading } = useGetHiring();
  const [filteredData, setFilteredData] = useState<HiringData[]>([]);

  const filterData = () => {
    if (!hiringData) {
      setFilteredData([]);
      return;
    }

    // 1. regionFilter 적용
    let data =
      regionFilter.selectedCounties.length === 0
        ? hiringData
        : hiringData.filter((data) => {
            const addressParts = `${data.address.split(' ')[1]} ${data.address.split(' ')[2]}`;
            console.log(addressParts);

            return regionFilter.selectedCounties.includes(addressParts);
          });

    // 2. positionFilter 적용
    data =
      positionFilter.length === 0
        ? data
        : data.filter((data) => positionFilter.includes(data.position));

    // 3. periodFilter 적용
    data =
      periodValueFilter[0] === 0 && periodValueFilter[1] === 10
        ? data
        : data
            .filter((data) => {
              const [start, end] = periodValueFilter;

              if (start === end) {
                return data.period.some((period: number) => period >= start);
              } else {
                return data.period.some(
                  (period: number) => period >= start && period <= end
                );
              }
            })
            .filter((data) => {
              const [start, end] = periodValueFilter;

              return data.period.every(
                (period: number) => period >= start && period <= end
              );
            });

    setFilteredData(data);
  };

  useEffect(() => {
    filterData();
  }, [regionFilter, positionFilter, periodValueFilter, hiringData]);

  return (
    <>
      {hiringDataIsLoading && <p>Loading...</p>}

      <div className="grid grid-cols-5 gap-3">
        {filteredData !== undefined &&
          filteredData.map((x: any) => {
            return (
              <div
                key={x.id}
                className="flex flex-col gap-2 p-10 border rounded cursor-pointer"
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
    </>
  );
};

export default HiringFIlter;
