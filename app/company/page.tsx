'use client';

import { useGetHiring } from '@/actions/hiring';
import { useSearchParams } from 'next/navigation';
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

const Company = (): React.ReactElement => {
  useKakaoLoader();

  const searchParams = useSearchParams();
  const hiringId = searchParams.get('hiring_id') ?? '';

  const [page, setPage] = useState(0);

  const { data: hiringData } = useGetHiring({ id: hiringId });
  const { data: hiringDataByUserId, isLoading: hiringDataByUserIdIsLoading } =
    useGetHiring({
      user_id: hiringData?.data[0]?.user_id ?? '',
      isVisibleFilter: true,
      page,
      pageSize: 12,
    });

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
    <div className="flex flex-col">
      {hiringData.data[0].images.length > 0 ? (
        <BasicCarousel slides={hiringData.data[0].images} />
      ) : (
        <div className="text-xl h-60 p-10 border rounded flex items-center justify-center">
          업로드된 회사 이미지가 없습니다.
        </div>
      )}

      <div className="flex flex-col gap-2 mt-[50px] sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image
              src={
                hiringData.data[0].enterprise_profile?.logo[0]
                  ? hiringData.data[0].enterprise_profile?.logo[0]
                  : '/svg/logo.svg'
              }
              alt="enterprise logo"
              fill
              style={{ objectFit: 'cover' }}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
            />
          </div>

          <p className="text-xl underline underline-offset-4 decoration-[#000]">
            {hiringData.data[0].enterprise_profile?.name}
          </p>
        </div>

        <div className="flex flex-col gap-1 mt-2 sm:flex-row">
          <p>∙ {hiringData.data[0].enterprise_profile?.industry}</p>
          <p>
            ∙{' '}
            {hiringData.data[0].enterprise_profile?.address
              .split(' ')
              .slice(1, 3)
              .join(' ')}
          </p>
          <p>
            ∙{' '}
            {calculateYearsInBusiness(
              hiringData.data[0].enterprise_profile?.establishment ?? ''
            )}
            년차 (
            {parseInt(
              hiringData.data[0].enterprise_profile?.establishment?.split(
                '-'
              )[0] ?? '0',
              12
            )}
            )
          </p>
        </div>
      </div>

      <div className="mt-1 text-[#707173]">
        <div
          dangerouslySetInnerHTML={{
            __html: hiringData.data[0].enterprise_profile?.description ?? '',
          }}
        />
      </div>

      <p className="mt-14 mb-4 text-xl font-bold">채용중인 포지션</p>

      <div className="grid gap-3 grid-cols-1 min-[530px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {hiringDataByUserId.data.map((x) => (
          <Link key={x.id} href={`/hiring/${x.id}`} passHref>
            <div className="h-full flex flex-col gap-2 p-5 border rounded cursor-pointer">
              <div className="relative w-full h-48 mx-auto mb-4">
                <Image
                  src={x.images.length !== 0 ? x.images[0] : '/svg/logo.svg'}
                  alt={`image ${x.id}`}
                  style={{ objectFit: 'cover' }}
                  className="rounded"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                />
              </div>

              <div className="w-full flex flex-col gap-0">
                <p className="text-lg font-bold break-keep line-clamp-2">
                  {x.title}
                </p>

                <div className="flex items-center gap-1 mt-2">
                  <div className="relative w-5 h-5">
                    <Image
                      src={
                        hiringData.data[0].enterprise_profile?.logo[0]
                          ? hiringData.data[0].enterprise_profile?.logo[0]
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

                  <p>{hiringData.data[0].enterprise_profile?.name}</p>
                </div>

                <p className="text-xs text-gray-500 mt-2">{x.short_address}</p>
                <p className="text-xs text-gray-500">
                  경력 {formatPeriod(x.period)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {(hiringDataByUserId?.count ?? 0) > 12 && (
        <div className="flex items-center justify-center gap-1.5 py-4">
          <button
            className="min-w-[32px] h-8 p-2 flex items-center justify-center rounded text-sm border hover:bg-gray-100 disabled:opacity-50"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            이전
          </button>

          <span className="mx-2">
            {page + 1} / {Math.ceil((hiringDataByUserId?.count ?? 0) / 12)}
          </span>

          <button
            className="min-w-[32px] h-8 p-2 flex items-center justify-center rounded text-sm border hover:bg-gray-100 disabled:opacity-50"
            onClick={() =>
              setPage(
                Math.min(
                  Math.ceil((hiringDataByUserId?.count ?? 0) / 12) - 1,
                  page + 1
                )
              )
            }
            disabled={
              page >= Math.ceil((hiringDataByUserId?.count ?? 0) / 12) - 1
            }
          >
            다음
          </button>
        </div>
      )}

      <div className="mt-16 border border-gray-300 rounded">
        <Map
          className="rounded-t"
          center={{
            lat: 33.450701,
            lng: 126.570667,
          }}
          style={{
            width: '100%',
            height: '450px',
          }}
          level={4}
        >
          <CustomMapMaker
            address={
              hiringData.data[0].enterprise_profile?.address
                ?.split(' ')
                .slice(1)
                .join(' ') ?? ''
            }
          />
        </Map>

        <div className="p-4 border-t border-gray-300">
          {hiringData.data[0].enterprise_profile?.address
            .split(' ')
            .slice(1)
            .join(' ')}
        </div>
      </div>
    </div>
  );
};

export default Company;
