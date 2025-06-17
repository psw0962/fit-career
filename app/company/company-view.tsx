'use client';

import { useCheckIsBookmarked, useGetHiring, useToggleBookmark } from '@/api/hiring';
import Image from 'next/image';
import { Map } from 'react-kakao-maps-sdk';
import CustomMapMaker from '@/components/common/kakao-map/custom-map-maker';
import { formatPeriod } from '@/functions/formatPeriod';
import useKakaoLoader from '@/hooks/use-kakao-loader';
import { calculateYearsInBusiness } from '@/functions/calculateYearsInBusiness';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import GlobalSpinner from '@/components/common/global-spinner';
import BasicCarousel from '@/components/carousel/basic-carousel';
import { HiringDataResponse } from '@/types/hiring/hiring';

export default function CompanyView({ hiringId }: { hiringId: string }) {
  useKakaoLoader();

  const [page, setPage] = useState(0);

  const { data: hiringData } = useGetHiring({ id: hiringId });
  const { data: hiringDataByUserId, isLoading: hiringDataByUserIdIsLoading } = useGetHiring({
    user_id: hiringData?.data[0]?.user_id ?? '',
    isVisibleFilter: true,
    page,
    pageSize: 12,
  });

  const { mutate: toggleBookmark, status: toggleBookmarkStatus } = useToggleBookmark();
  const hiringIds = hiringData?.data.map((x: HiringDataResponse) => x.id) || [];
  const { data: bookmarkedStatus } = useCheckIsBookmarked(hiringIds);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  if (
    !hiringData ||
    hiringData.data.length === 0 ||
    !hiringDataByUserId ||
    hiringDataByUserId.data.length === 0
  ) {
    return <></>;
  }

  if (hiringDataByUserIdIsLoading) {
    return <GlobalSpinner />;
  }

  return (
    <div className='flex flex-col'>
      {hiringData.data[0].images.length > 0 ? (
        <BasicCarousel slides={hiringData.data[0].images} />
      ) : (
        <div className='text-xl h-60 p-10 border rounded flex items-center justify-center'>
          업로드된 회사 이미지가 없습니다.
        </div>
      )}

      <div className='mt-[50px] flex flex-col flex-wrap gap-2 items-start sm:items-center sm:flex-row'>
        <div className='flex items-center gap-2'>
          <div className='relative w-8 h-8'>
            <Image
              src={
                hiringData.data[0].enterprise_profile?.logo[0]
                  ? hiringData.data[0].enterprise_profile?.logo[0]
                  : '/svg/logo.svg'
              }
              alt='enterprise logo'
              className='rounded'
              style={{ objectFit: 'contain' }}
              fill
              priority
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=='
            />
          </div>

          <p className='text-xl underline underline-offset-4 decoration-[#000]'>
            {hiringData.data[0].enterprise_profile?.name}
          </p>
        </div>

        <div className='flex flex-row flex-wrap gap-1 mt-1 sm:mt-0'>
          <p className='text-gray-500'>∙ {hiringData.data[0].enterprise_profile?.industry}</p>
          <p className='text-gray-500'>
            ∙ {hiringData.data[0].enterprise_profile?.address.split(' ').slice(1, 3).join(' ')}
          </p>
          <p className='text-gray-500'>
            ∙ {calculateYearsInBusiness(hiringData.data[0].enterprise_profile?.establishment ?? '')}
            년차 (
            {parseInt(
              hiringData.data[0].enterprise_profile?.establishment?.split('-')[0] ?? '0',
              10,
            )}
            )
          </p>
        </div>
      </div>

      <div className='mt-2 text-[#707173]'>
        <div
          dangerouslySetInnerHTML={{
            __html: hiringData.data[0].enterprise_profile?.description ?? '',
          }}
        />
      </div>

      <p className='mt-14 mb-4 text-xl font-bold'>채용중인 포지션</p>

      <div className='grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
        {hiringDataByUserId.data.map((x) => {
          const isBookmarked = bookmarkedStatus?.[x.id];

          return (
            <Link key={x.id} href={`/hiring/${x.id}`} passHref>
              <div className='relative h-full flex flex-col gap-2 p-2 sm:p-3 border rounded cursor-pointer'>
                <div className='relative w-full aspect-[4/3] mx-auto mb-4 border rounded'>
                  <Image
                    src={x.images.length !== 0 ? x.images[0] : '/svg/logo.svg'}
                    alt={`${x.title} 이미지`}
                    style={{ objectFit: 'cover' }}
                    className='rounded'
                    fill
                    priority
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                    placeholder='blur'
                    blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=='
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
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=='
                  />
                </div>

                <div className='w-full flex flex-col gap-0'>
                  <p className='text-base font-bold break-keep line-clamp-2'>{x.title}</p>

                  <div className='flex items-center gap-1 mt-2'>
                    <div className='relative w-5 h-5'>
                      <Image
                        src={
                          hiringData.data[0].enterprise_profile?.logo[0]
                            ? hiringData.data[0].enterprise_profile?.logo[0]
                            : '/svg/logo.svg'
                        }
                        alt={`${x.enterprise_profile?.name} 로고`}
                        className='rounded'
                        fill
                        priority
                        sizes='20px'
                        style={{ objectFit: 'contain' }}
                      />
                    </div>

                    <p className='text-sm break-words line-clamp-1 flex-1'>
                      {hiringData.data[0].enterprise_profile?.name}
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

      {(hiringDataByUserId?.count ?? 0) > 12 && (
        <div className='flex items-center justify-center gap-1.5 py-4'>
          <button
            className='min-w-[32px] h-8 p-2 flex items-center justify-center rounded text-sm border hover:bg-gray-100 disabled:opacity-50'
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            이전
          </button>

          <span className='mx-2'>
            {page + 1} / {Math.ceil((hiringDataByUserId?.count ?? 0) / 12)}
          </span>

          <button
            className='min-w-[32px] h-8 p-2 flex items-center justify-center rounded text-sm border hover:bg-gray-100 disabled:opacity-50'
            onClick={() =>
              setPage(Math.min(Math.ceil((hiringDataByUserId?.count ?? 0) / 12) - 1, page + 1))
            }
            disabled={page >= Math.ceil((hiringDataByUserId?.count ?? 0) / 12) - 1}
          >
            다음
          </button>
        </div>
      )}

      <div className='mt-16 border border-gray-300 rounded'>
        <Map
          className='rounded-t z-0 h-[250px] sm:h-[450px]'
          center={{
            lat: 33.450701,
            lng: 126.570667,
          }}
          style={{
            width: '100%',
          }}
          level={4}
        >
          <CustomMapMaker
            address={hiringData.data[0].enterprise_profile?.address_search_key ?? ''}
          />
        </Map>

        <div className='p-4 border-t border-gray-300'>
          {hiringData.data[0].enterprise_profile?.address.split(' ').slice(1).join(' ')}
        </div>
      </div>
    </div>
  );
}
