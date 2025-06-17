'use client';

import { useGetHiring } from '@/api/hiring';
import Image from 'next/image';
import { HiringFilterProps } from '@/types/hiring/filter-type';
import { useEffect, useState } from 'react';
import { formatPeriod } from '@/functions/formatPeriod';
import Link from 'next/link';
import { HiringDataResponse } from '@/types/hiring/hiring';
import { useScrollRestoration } from '@/hooks/use-scroll-restoration';
import { useCheckIsBookmarked, useToggleBookmark } from '@/api/hiring';

const HiringCardSkeleton = () => (
  <div className='relative h-full flex flex-col gap-2 p-2 sm:p-3 border rounded animate-pulse'>
    <div className='relative w-full aspect-[4/3] mx-auto mb-4 bg-gray-200 rounded'></div>
    <div className='w-full flex flex-col gap-2'>
      <div className='h-5 bg-gray-200 rounded w-3/4'></div>
      <div className='flex items-center gap-1 mt-2'>
        <div className='w-5 h-5 bg-gray-200 rounded-full'></div>
        <div className='h-4 bg-gray-200 rounded w-1/2'></div>
      </div>
      <div className='h-3 bg-gray-200 rounded w-1/3 mt-2'></div>
      <div className='h-3 bg-gray-200 rounded w-1/4'></div>
    </div>
  </div>
);

export default function HiringFilter({
  regionFilter,
  positionFilter,
  periodValueFilter,
  currentPage,
  setCurrentPage,
}: HiringFilterProps) {
  const itemsPerPage = 12;

  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

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

  const handleImageLoad = (id: string) => {
    setImagesLoaded((prev) => ({ ...prev, [id]: true }));
  };

  useEffect(() => {
    const savedPage = sessionStorage.getItem('hiring-current-page');
    if (savedPage) {
      setCurrentPage(Number(savedPage));
    }
  }, [setCurrentPage]);

  if (hiringDataIsLoading) {
    return (
      <div className='grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
        {Array.from({ length: itemsPerPage }).map((_, index) => (
          <HiringCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className='grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
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
                <div className='relative h-full flex flex-col gap-2 p-2 sm:p-3 border rounded cursor-pointer'>
                  <div className='relative w-full aspect-[4/3] mx-auto mb-4 border rounded'>
                    {!imagesLoaded[x.id] && (
                      <div className='absolute inset-0 bg-gray-100 rounded' />
                    )}

                    <Image
                      src={x.images.length !== 0 ? x.images[0] : '/svg/logo.svg'}
                      alt={`${x.title} 이미지`}
                      style={{ objectFit: 'cover' }}
                      className='rounded'
                      fill
                      priority={currentPage === 1 && hiringData.data.indexOf(x) < 2}
                      onLoad={() => handleImageLoad(x.id)}
                      quality={70}
                      sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
                      placeholder='blur'
                      blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII='
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
                      alt='bookmark'
                      className='p-2'
                      style={{ objectFit: 'contain' }}
                      fill
                      sizes='32px'
                      priority
                      blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=='
                    />
                  </div>

                  <div className='w-full flex flex-col gap-0'>
                    <p className='text-base font-bold break-keep line-clamp-2'>{x.title}</p>

                    <div className='flex items-center gap-1 mt-2'>
                      <div className='relative w-5 h-5 flex-shrink-0'>
                        <Image
                          src={x.enterprise_profile?.logo[0] ?? '/svg/logo.svg'}
                          alt={`${x.enterprise_profile?.name} 로고`}
                          className='rounded'
                          fill
                          priority={currentPage === 1 && hiringData.data.indexOf(x) < 2}
                          sizes='20px'
                          style={{ objectFit: 'contain' }}
                        />
                      </div>

                      <p className='text-sm break-words line-clamp-1 flex-1'>
                        {x.enterprise_profile?.name}
                      </p>
                    </div>

                    <p className='text-xs text-gray-500 mt-2'>{x.short_address}</p>

                    <p className='text-xs text-gray-500'>경력 {formatPeriod(x.period)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
      </div>

      {hiringData?.count === 0 && (
        <div className='flex justify-center items-center mt-32'>
          <p className='text-lg'>검색 결과가 없습니다.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className='flex justify-center items-center gap-2 mt-4'>
          <button
            className='min-w-[32px] h-8 p-2 flex items-center justify-center rounded text-sm border hover:bg-gray-100 disabled:opacity-50'
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
            className='min-w-[32px] h-8 p-2 flex items-center justify-center rounded text-sm border hover:bg-gray-100 disabled:opacity-50'
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
