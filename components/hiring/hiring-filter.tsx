'use client';

import { useGetHiring } from '@/actions/hiring';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { HiringFilterProps } from '@/types/hiring/filter-type';
import { useState, useEffect } from 'react';
import { formatPeriod } from '@/functions/formatPeriod';

type HiringData = {
  id: string;
  address: string;
  position: string;
  position_etc: boolean;
  period: number[];
  title: string;
  content: string;
  dead_line: string;
  images: string[];
  short_address: string;
  enterprise_name: string;
  enterprise_logo: string;
  enterprise_establishment: string;
  enterprise_description: string;
};

const HiringFIlter: React.FC<HiringFilterProps> = ({
  regionFilter,
  positionFilter,
  periodValueFilter,
}) => {
  const router = useRouter();

  const { data: hiringData, isLoading: hiringDataIsLoading } = useGetHiring({});
  const [filteredData, setFilteredData] = useState<HiringData[]>([]);

  const filterData = () => {
    if (!hiringData) {
      setFilteredData([]);
      return;
    }

    // regionFilter 적용
    let data =
      regionFilter.selectedCounties.length === 0
        ? hiringData
        : hiringData.filter((data) => {
            const addressParts = `${data.address.split(' ')[1]} ${data.address.split(' ')[2]}`;

            return regionFilter.selectedCounties.includes(addressParts);
          });

    // positionFilter 적용
    data =
      positionFilter.length === 0
        ? data
        : data.filter(
            (data) =>
              positionFilter.includes(data.position) ||
              (positionFilter.includes('기타') && data.position_etc === true)
          );

    // periodFilter 적용
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

    const sortedData = [...data].sort((a, b) => {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
    setFilteredData(sortedData as HiringData[]);
  };

  useEffect(() => {
    filterData();
  }, [regionFilter, positionFilter, periodValueFilter, hiringData]);

  return (
    <>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {filteredData !== undefined &&
          filteredData.map((x: HiringData) => {
            return (
              <div
                key={x.id}
                className="flex flex-col gap-2 p-5 border rounded cursor-pointer"
                onClick={() => {
                  router.push(`/hiring/${x.id}`);
                }}
              >
                <div className="relative w-10 h-10 mx-auto mb-4">
                  <Image
                    src={x.images.length !== 0 ? x.images[0] : '/svg/logo.svg'}
                    alt={`image ${x.id}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                  />
                </div>

                <div className="w-full flex flex-col gap-0">
                  <p className="break-all line-clamp-2">{x.title}</p>
                  <p>{x.enterprise_name}</p>
                  <p className="text-sm text-gray-500">{x.short_address}</p>
                  <p className="text-sm text-gray-500">
                    경력 {formatPeriod(x.period)}
                  </p>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
};

export default HiringFIlter;
