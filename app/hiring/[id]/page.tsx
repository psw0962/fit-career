'use client';

import { EmblaOptionsType } from 'embla-carousel';
import ThumbnailCarousel from '@/components/carousel/thumbnail-carousel';
import { useGetHiring } from '@/actions/hiring';

const OPTIONS: EmblaOptionsType = {};

const HiringDetail = ({
  params,
}: {
  params: { id: string };
}): React.ReactElement => {
  const { data: hiringData } = useGetHiring(params.id);

  console.log(hiringData);

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

      <div className="mt-10 flex gap-5">
        <p>{hiringData[0].enterprise_name}</p>
        <div>∙</div>
        <p>{hiringData[0].short_address}</p>
        <div>∙</div>
        <p>경력 1년 ~ 3년</p>
      </div>

      <div className="my-5 border"></div>

      <div>
        <p>채용 내용</p>
      </div>

      <div className="mt-10">카카오맵</div>
    </div>
  );
};

export default HiringDetail;
