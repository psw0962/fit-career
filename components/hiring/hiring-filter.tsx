'use client';

import { useGetHiring } from '@/actions/hiring';
import Image from 'next/image';
import { HiringFilterProps } from '@/types/hiring/filter-type';
import { useState, useEffect } from 'react';
import { formatPeriod } from '@/functions/formatPeriod';
import Link from 'next/link';
import { HiringDataResponse } from '@/types/hiring/hiring';
import GlobalSpinner from '@/components/common/global-spinner';
import { useGetEnterpriseProfile } from '@/actions/auth';

const HiringFilter: React.FC<HiringFilterProps> = ({
  regionFilter,
  positionFilter,
  periodValueFilter,
}) => {
  const [filteredData, setFilteredData] = useState<HiringDataResponse[]>([]);

  const { data: hiringData, isLoading: hiringDataIsLoading } = useGetHiring({});
  const { data: enterpriseProfile } = useGetEnterpriseProfile();

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
    setFilteredData(sortedData);
  };

  useEffect(() => {
    filterData();
  }, [
    regionFilter,
    positionFilter,
    periodValueFilter,
    hiringData,
    enterpriseProfile,
  ]);

  if (hiringDataIsLoading) {
    return <GlobalSpinner />;
  }

  return (
    <>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {filteredData !== undefined &&
          filteredData.map((x: HiringDataResponse) => {
            return (
              <Link key={x.id} href={`/hiring/${x.id}`} passHref>
                <div className="h-full flex flex-col gap-2 p-5 border rounded cursor-pointer">
                  <div className="relative w-10 h-10 mx-auto mb-4">
                    <Image
                      src={
                        x.images.length !== 0 ? x.images[0] : '/svg/logo.svg'
                      }
                      alt={`image ${x.id}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                    />
                  </div>

                  <div className="w-full flex flex-col gap-0">
                    <p className="text-lg font-bold break-all line-clamp-2">
                      {x.title}
                    </p>

                    <div className="flex items-center gap-1 mt-2">
                      <div className="relative w-5 h-5">
                        <Image
                          src={
                            x.enterprise_profile?.logo[0]
                              ? x.enterprise_profile?.logo[0]
                              : '/svg/logo.svg'
                          }
                          alt={`image ${x.id}`}
                          fill
                          style={{ objectFit: 'cover' }}
                          priority
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                        />
                      </div>

                      <p>{x.enterprise_profile?.name}</p>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      {x.short_address}
                    </p>
                    <p className="text-xs text-gray-500">
                      경력 {formatPeriod(x.period)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
      </div>
    </>
  );
};

export default HiringFilter;
