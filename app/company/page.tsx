'use client';

import { useGetHiring } from '@/actions/hiring';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Map } from 'react-kakao-maps-sdk';
import CustomMapMaker from '@/components/common/kakao-map/custom-map-maker';
import { formatPeriod } from '@/functions/formatPeriod';
import useKakaoLoader from '@/hooks/useKakaoLoader';
import { calculateYearsInBusiness } from '@/functions/calculateYearsInBusiness';
import Link from 'next/link';

const Company = (): React.ReactElement => {
  useKakaoLoader();
  const searchParams = useSearchParams();
  const hiringId = searchParams.get('hiring_id') ?? '';

  const { data: hiringData } = useGetHiring({ id: hiringId });
  const { data: hiringDataByUserId } = useGetHiring({
    user_id: hiringData?.[0]?.user_id,
  });

  if (
    !hiringData ||
    hiringData.length === 0 ||
    !hiringDataByUserId ||
    hiringDataByUserId.length === 0
  ) {
    return <></>;
  }

  return (
    <div className="flex flex-col">
      <div className="relative w-full h-36">
        <Image
          src={hiringData?.[0]?.images?.[0] ?? '/svg/logo.svg'}
          alt="enterprise images"
          fill
          style={{ objectFit: 'contain' }}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
        />
      </div>

      <div className="flex items-center gap-2 mt-2">
        <div className="relative w-8 h-8">
          <Image
            src={
              hiringData[0].enterprise_profile?.logo[0]
                ? hiringData[0].enterprise_profile?.logo[0]
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
          {hiringData[0].enterprise_profile?.name}
        </p>
      </div>

      <div className="flex gap-1 mt-2">
        <p>{hiringData[0].enterprise_profile?.industry}</p>
        <div>∙</div>
        <p>
          {hiringData[0].enterprise_profile?.address
            .split(' ')
            .slice(1, 3)
            .join(' ')}
        </p>
        <div>∙</div>
        <p>
          {calculateYearsInBusiness(
            hiringData[0].enterprise_profile?.establishment ?? ''
          )}
          년차 (
          {parseInt(
            hiringData[0].enterprise_profile?.establishment?.split('-')[0] ??
              '0',
            10
          )}
          )
        </p>
      </div>

      <div className="mt-1 text-[#707173]">
        <div
          dangerouslySetInnerHTML={{
            __html: hiringData[0].enterprise_profile?.description ?? '',
          }}
        />
      </div>

      <p className="mt-14 mb-4 text-xl font-bold">채용중인 포지션</p>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {hiringDataByUserId.map((x) => (
          <Link key={x.id} href={`/hiring/${x.id}`} passHref>
            <div className="h-full flex flex-col gap-2 p-5 border rounded cursor-pointer">
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
                <p className="text-lg font-bold break-all line-clamp-2">
                  {x.title}
                </p>

                <div className="flex items-center gap-1 mt-2">
                  <div className="relative w-5 h-5">
                    <Image
                      src={
                        hiringData[0].enterprise_profile?.logo[0]
                          ? hiringData[0].enterprise_profile?.logo[0]
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

                  <p>{hiringData[0].enterprise_profile?.name}</p>
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
              hiringData[0].enterprise_profile?.address
                ?.split(' ')
                .slice(1)
                .join(' ') ?? ''
            }
          />
        </Map>

        <div className="p-4 border-t border-gray-300">
          {hiringData[0].enterprise_profile?.address
            .split(' ')
            .slice(1)
            .join(' ')}
        </div>
      </div>
    </div>
  );
};

export default Company;
