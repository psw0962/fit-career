'use client';

import { EmblaOptionsType } from 'embla-carousel';
import ThumbnailCarousel from '@/components/carousel/thumbnail-carousel';
import { useGetHiring } from '@/actions/hiring';
import Image from 'next/image';
import { Map } from 'react-kakao-maps-sdk';
import useKakaoLoader from '@/hooks/useKakaoLoader';
import CustomMapMaker from '@/components/common/kakao-map/custom-map-maker';
import { useRouter } from 'next/navigation';
import { useGetResume } from '@/actions/resume';
import ResumeSelectModal from '@/components/my-page/resume/resume-select-modal';
import { useState } from 'react';

const OPTIONS: EmblaOptionsType = {};

const HiringDetail = ({
  params,
}: {
  params: { id: string };
}): React.ReactElement => {
  useKakaoLoader();
  const router = useRouter();

  const [resumeUserIdModalIsOpen, setResumeUserIdModalIsOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');

  const { data: hiringData } = useGetHiring({ id: params.id });
  const { data: resumeData } = useGetResume();

  const handleNavigate = () => {
    if (!hiringData || hiringData.length === 0) return;

    const params = {
      user_id: hiringData[0]?.user_id,
      hiring_id: hiringData[0]?.id,
    };
    const query = new URLSearchParams(params).toString();

    router.push(`/company?${query}`);
  };

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

      <div className="flex flex-col gap-3 sm:flex-row justify-between">
        <div className="mt-10 flex gap-1 items-center">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleNavigate}
          >
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
                onError={(e) => {
                  e.currentTarget.src = '/svg/logo.svg';
                }}
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

        <div className="flex items-end">
          <ResumeSelectModal
            resumeData={resumeData}
            resumeUserIdModalIsOpen={resumeUserIdModalIsOpen}
            setResumeUserIdModalIsOpen={setResumeUserIdModalIsOpen}
            selectedResumeId={selectedResumeId}
            setSelectedResumeId={setSelectedResumeId}
          />
        </div>
      </div>

      <div className="my-4 border"></div>

      <div>
        <p
          dangerouslySetInnerHTML={{
            __html: hiringData[0].content,
          }}
        />
      </div>

      <div className="mt-10 border border-gray-300 rounded">
        <Map
          className="rounded-t z-0"
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
            address={hiringData[0].address.split(' ').slice(1).join(' ')}
          />
        </Map>

        <div className="p-4 border-t border-gray-300">
          {hiringData[0].address.split(' ').slice(1).join(' ')}
        </div>
      </div>
    </div>
  );
};

export default HiringDetail;
