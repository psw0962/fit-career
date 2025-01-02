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
import GlobalSpinner from '@/components/common/global-spinner';

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

  const { data: hiringData, isLoading: hiringDataIsLoading } = useGetHiring({
    id: params.id,
  });
  const { data: resumeData } = useGetResume();

  const handleNavigate = () => {
    if (!hiringData || hiringData.data.length === 0) return;

    const params = {
      hiring_id: hiringData.data[0]?.id,
    };
    const query = new URLSearchParams(params).toString();

    router.push(`/company?${query}`);
  };

  if (!hiringData || hiringData.data.length === 0) {
    return <></>;
  }

  if (hiringDataIsLoading) {
    return <GlobalSpinner />;
  }

  return (
    <div>
      {hiringData.data[0].images.length > 0 ? (
        <ThumbnailCarousel slides={hiringData[0].images} options={OPTIONS} />
      ) : (
        <div className="text-xl h-60 p-10 border rounded flex items-center justify-center">
          업로드된 회사 이미지가 없습니다.
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row justify-between">
        <div className="flex flex-col gap-1 items-start sm:items-center sm:flex-row mt-10">
          <div
            className="flex gap-2 items-center cursor-pointer"
            onClick={handleNavigate}
          >
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

            <p className="text-lg underline underline-offset-4 decoration-[#000]">
              {hiringData.data[0].enterprise_profile?.name}
            </p>
          </div>

          <div className="flex flex-col gap-1 mt-2 sm:flex-row">
            <p className="text-sm text-gray-500">
              ∙ {hiringData.data[0].short_address}
            </p>
            <p className="text-sm text-gray-500">
              ∙ 경력 {hiringData.data[0].period[0]}년 ~{' '}
              {hiringData.data[0].period[1]}년
            </p>
          </div>
        </div>

        <div className="flex items-end">
          <ResumeSelectModal
            hiringData={hiringData.data}
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
        <p className="text-2xl font-bold break-keep">
          {hiringData.data[0].title}
        </p>

        <div className="flex flex-col gap-0 mt-6">
          <p className="text-lg font-bold">채용 정보</p>
          <p className="text-lg break-keep">
            - 근무장소 : {hiringData.data[0].address}
          </p>
          <p className="text-lg break-keep">
            - 필요 경력 : {hiringData.data[0].period[0]}년 ~{' '}
            {hiringData.data[0].period[1]}년
          </p>
          <p className="text-lg break-keep">
            - 채용 포지션 : {hiringData.data[0].position}
          </p>
          <p className="text-lg break-keep">
            - 채용 마감일 : {hiringData.data[0].dead_line}
          </p>
        </div>

        <div className="mt-10">
          <p className="text-lg font-bold">채용 상세</p>
          <p
            dangerouslySetInnerHTML={{
              __html: hiringData.data[0].content,
            }}
            className="break-keep"
          />
        </div>
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
            address={hiringData.data[0].address.split(' ').slice(1).join(' ')}
          />
        </Map>

        <div className="p-4 border-t border-gray-300">
          {hiringData.data[0].address.split(' ').slice(1).join(' ')}
        </div>
      </div>

      <div className="flex flex-col gap-0 mt-4">
        <p className=" text-sm text-gray-500">
          * 등록일 : {hiringData.data[0].created_at}
        </p>

        <p className="text-sm text-gray-500">
          * 최근 수정일 :{' '}
          {hiringData.data[0].updated_at === 'NULL'
            ? hiringData.data[0].created_at
            : hiringData.data[0].updated_at}
        </p>
      </div>
    </div>
  );
};

export default HiringDetail;
