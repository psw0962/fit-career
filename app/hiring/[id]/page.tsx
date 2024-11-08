'use client';

import { EmblaOptionsType } from 'embla-carousel';
import ThumbnailCarousel from '@/components/carousel/thumbnail-carousel';

const OPTIONS: EmblaOptionsType = {};
const SLIDE_COUNT = 10;
const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

const HiringDetail = ({ params }) => {
  console.log(params);

  return (
    <div>
      <ThumbnailCarousel slides={SLIDES} options={OPTIONS} />

      <div className="mt-10 flex gap-5">
        <p>회사이름</p>
        <div>∙</div>
        <p>지역</p>
        <div>∙</div>
        <p>경력 1년 ~ 3년</p>
      </div>

      <div className="my-10 border"></div>

      <div>
        <p>채용 내용</p>
      </div>

      <div className="mt-10">카카오맵</div>
    </div>
  );
};

export default HiringDetail;
