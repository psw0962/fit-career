'use client';

import { useGetHiring } from '@/actions/hiring';
import Image from 'next/image';
import { HiringFilterProps } from '@/types/hiring/filter-type';
import { useState, useEffect } from 'react';
import { formatPeriod } from '@/functions/formatPeriod';
import Link from 'next/link';
import { HiringDataResponse } from '@/types/hiring/hiring';
import GlobalSpinner from '@/components/common/global-spinner';

const HiringFilter: React.FC<HiringFilterProps> = ({
  regionFilter,
  positionFilter,
  periodValueFilter,
}) => {
  const [filteredData, setFilteredData] = useState<HiringDataResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: hiringData, isLoading: hiringDataIsLoading } = useGetHiring({
    page: 0,
    pageSize: 12,
  });

  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const pageGroupSize = 10;
  const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
  const startPage = currentGroup * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filterData = () => {
    if (!hiringData) {
      setFilteredData([]);
      return;
    }

    // regionFilter 적용
    let data =
      regionFilter.selectedCounties.length === 0
        ? hiringData.data
        : hiringData.data.filter((data) => {
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
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
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
    currentPage,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [regionFilter, positionFilter, periodValueFilter]);

  if (hiringDataIsLoading) {
    return <GlobalSpinner />;
  }

  return (
    <>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {paginatedData !== undefined &&
          paginatedData.map((x: HiringDataResponse) => {
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
                      <div className="relative w-5 h-5 flex-shrink-0">
                        <Image
                          src={x.enterprise_profile?.logo[0] ?? '/svg/logo.svg'}
                          alt={`image ${x.id}`}
                          fill
                          style={{ objectFit: 'cover' }}
                          priority
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                        />
                      </div>

                      <p className="break-words line-clamp-1 flex-1">
                        {x.enterprise_profile?.name}
                      </p>
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            className="min-w-[32px] h-8 p-2 flex items-center justify-center rounded text-sm border hover:bg-gray-100 disabled:opacity-50"
            onClick={() => handlePageChange(startPage - 1)}
            disabled={startPage === 1}
          >
            이전
          </button>

          {Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
          ).map((page) => (
            <button
              key={page}
              className={`min-w-[32px] h-8 p-2 flex items-center justify-center rounded text-sm border hover:bg-gray-100 ${
                currentPage === page ? 'bg-[#4C71C0] text-white' : ''
              }`}
              onClick={() => handlePageChange(page)}
              disabled={currentPage === page}
            >
              {page}
            </button>
          ))}

          <button
            className="min-w-[32px] h-8 p-2 flex items-center justify-center rounded text-sm border hover:bg-gray-100 disabled:opacity-50"
            onClick={() => handlePageChange(endPage + 1)}
            disabled={endPage === totalPages}
          >
            다음
          </button>
        </div>
      )}
    </>
  );
};

export default HiringFilter;
