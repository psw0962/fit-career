'use client';

import { EmblaOptionsType } from 'embla-carousel';
import ThumbnailCarousel from '@/components/carousel/thumbnail-carousel';
import { useGetHiring } from '@/actions/hiring';
import Image from 'next/image';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import useKakaoLoader from '@/hooks/useKakaoLoader';

const OPTIONS: EmblaOptionsType = {};

const HiringDetail = ({
  params,
}: {
  params: { id: string };
}): React.ReactElement => {
  useKakaoLoader();

  const { data: hiringData } = useGetHiring(params.id);

  if (!hiringData || hiringData.length === 0) {
    return <></>;
  }

  return (
    <div>
      {hiringData[0].images.length > 0 ? (
        <ThumbnailCarousel slides={hiringData[0].images} options={OPTIONS} />
      ) : (
        <div className="text-xl h-60 p-10 border rounded flex items-center justify-center">
          업로드된 회사 이미지가 없습니다.
        </div>
      )}

      <div className="mt-10 flex gap-5 items-center">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image
              src={
                hiringData[0]?.enterprise_logo
                  ? hiringData[0]?.enterprise_logo
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
            {hiringData[0].enterprise_name}
          </p>
        </div>
        <div>∙</div>
        <p>{hiringData[0].short_address}</p>
        <div>∙</div>
        <p>
          경력 {hiringData[0].period[0]}년 ~ {hiringData[0].period[1]}년
        </p>
      </div>

      <div className="my-4 border"></div>

      <div>
        <p
          dangerouslySetInnerHTML={{
            __html: hiringData[0].content,
          }}
        />
      </div>

      <div className="mt-16">
        <Map
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
          <MapMarker
            position={{
              lat: 33.450701,
              lng: 126.570667,
            }}
          />
        </Map>
      </div>
    </div>
  );
};

export default HiringDetail;
