'use client';

import { useGetHiring } from '@/api/hiring';
import Image from 'next/image';
import { HiringFilterProps } from '@/types/hiring/filter-type';
import { useEffect } from 'react';
import { formatPeriod } from '@/functions/formatPeriod';
import Link from 'next/link';
import { HiringDataResponse } from '@/types/hiring/hiring';
import GlobalSpinner from '@/components/common/global-spinner';
import { useScrollRestoration } from '@/hooks/use-scroll-restoration';
import { useCheckIsBookmarked, useToggleBookmark } from '@/api/hiring';

export default function HiringFilter({
  regionFilter,
  positionFilter,
  periodValueFilter,
  currentPage,
  setCurrentPage,
}: HiringFilterProps) {
  const itemsPerPage = 12;

  useScrollRestoration('hiring-list');

  const { data: hiringData, isLoading: hiringDataIsLoading } = useGetHiring({
    page: currentPage - 1,
    pageSize: itemsPerPage,
    isVisibleFilter: true,
    filters: {
      regions: regionFilter.selectedCounties,
      positions: positionFilter,
      periodRange: periodValueFilter as [number, number],
    },
  });
  const { mutate: toggleBookmark, status: toggleBookmarkStatus } = useToggleBookmark();
  const hiringIds = hiringData?.data.map((x: HiringDataResponse) => x.id) || [];
  const { data: bookmarkedStatus } = useCheckIsBookmarked(hiringIds);

  const totalPages = Math.ceil((hiringData?.count || 0) / itemsPerPage);
  const pageGroupSize = 12;
  const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
  const startPage = currentGroup * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  };

  useEffect(() => {
    const savedPage = sessionStorage.getItem('hiring-current-page');
    if (savedPage) {
      setCurrentPage(Number(savedPage));
    }
  }, [setCurrentPage]);

  if (hiringDataIsLoading) {
    return <GlobalSpinner />;
  }

  return (
    <>
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {hiringData !== undefined &&
          hiringData.data.map((x: HiringDataResponse) => {
            const isBookmarked = bookmarkedStatus?.[x.id];

            return (
              <Link
                key={x.id}
                href={`/hiring/${x.id}`}
                passHref
                onClick={(e) => {
                  if (toggleBookmarkStatus === 'pending') {
                    e.preventDefault();
                  }
                }}
              >
                <div className="relative h-full flex flex-col gap-2 p-2 sm:p-3 border rounded cursor-pointer">
                  <div className="relative w-full aspect-[4/3] mx-auto mb-4 border rounded">
                    <Image
                      src={x.images.length !== 0 ? x.images[0] : '/svg/logo.svg'}
                      alt={`${x.title} 이미지`}
                      style={{ objectFit: 'cover' }}
                      className="rounded"
                      fill
                      priority={currentPage === 1}
                      loading={currentPage === 1 ? 'eager' : 'lazy'}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                    />
                  </div>

                  <div
                    className={`absolute top-1 right-1 sm:top-2 sm:right-2 w-8 h-8 bg-[#4c71c0] rounded-full ${
                      toggleBookmarkStatus === 'pending' ? 'cursor-not-allowed' : ''
                    }`}
                    onClick={(e) => {
                      if (toggleBookmarkStatus === 'pending') return;
                      e.preventDefault();
                      toggleBookmark(x.id);
                    }}
                  >
                    <Image
                      src={isBookmarked ? '/svg/bookmarked.svg' : '/svg/bookmark.svg'}
                      alt="bookmark"
                      className="p-2"
                      style={{ objectFit: 'contain' }}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                    />
                  </div>

                  <div className="w-full flex flex-col gap-0">
                    <p className="text-base font-bold break-keep line-clamp-2">{x.title}</p>

                    <div className="flex items-center gap-1 mt-2">
                      <div className="relative w-5 h-5 flex-shrink-0">
                        <Image
                          src={x.enterprise_profile?.logo[0] ?? '/svg/logo.svg'}
                          alt={`${x.enterprise_profile?.name} 로고`}
                          className="rounded"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          style={{ objectFit: 'contain' }}
                        />
                      </div>

                      <p className="text-sm break-words line-clamp-1 flex-1">
                        {x.enterprise_profile?.name}
                      </p>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">{x.short_address}</p>

                    <p className="text-xs text-gray-500">경력 {formatPeriod(x.period)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
      </div>

      {hiringData?.count === 0 && (
        <div className="flex justify-center items-center mt-32">
          <p className="text-lg">검색 결과가 없습니다.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            className="min-w-[32px] h-8 p-2 flex items-center justify-center rounded text-sm border hover:bg-gray-100 disabled:opacity-50"
            onClick={() => handlePageChange(startPage - 1)}
            disabled={startPage === 1}
          >
            이전
          </button>

          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
            <button
              key={page}
              className={`min-w-[32px] h-8 p-2 flex items-center justify-center rounded text-sm border ${
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
}
