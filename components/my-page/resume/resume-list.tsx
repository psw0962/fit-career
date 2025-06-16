'use client';

import Image from 'next/image';
import { useGetUserData } from '@/api/auth';
import GlobalSpinner from '@/components/common/global-spinner';
import Spinner from '@/components/common/spinner';
import { useGetResume, usePostNewResume, useUploadResume } from '@/api/resume';
import ResumeCard from '@/components/my-page/resume/resume-card';

export default function Resume() {
  const { data: userData, isLoading: userDataLoading } = useGetUserData();
  const { data: resumeListData } = useGetResume();
  const { mutate: postNewResumeMutate, status: postNewResumeStatus } = usePostNewResume();
  const { mutate: uploadResumeMutate, status: uploadResumeStatus } = useUploadResume();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || uploadResumeStatus === 'pending') return;

    uploadResumeMutate(file);
    event.target.value = '';
  };

  if (userDataLoading || !userData) {
    return <GlobalSpinner />;
  }

  return (
    <div className="mt-5">
      <div className="flex gap-2 mb-4">
        <button
          className="flex gap-2 items-center justify-center w-fit rounded px-4 py-2 border-none bg-[#4C71C0] text-white cursor-pointer"
          onClick={() => {
            if (postNewResumeStatus === 'pending') return;
            postNewResumeMutate();
          }}
          disabled={postNewResumeStatus === 'pending'}
        >
          <Image
            src="/svg/add.svg"
            alt="add"
            className="brightness-0 invert"
            width={20}
            height={20}
          />
          <span className="text-sm whitespace-nowrap">
            {postNewResumeStatus === 'pending' ? <Spinner /> : '새 이력서'}
          </span>
        </button>

        <label
          htmlFor="file-upload"
          className={`flex gap-2 items-center justify-center w-fit border rounded px-4 py-2 
            ${uploadResumeStatus === 'pending' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Image src="/svg/upload.svg" alt="upload" width={20} height={20} />

          <span className="text-sm whitespace-nowrap">
            {uploadResumeStatus === 'pending' ? <Spinner /> : '이력서 업로드'}
          </span>

          <input
            type="file"
            name="file-upload"
            accept=".pdf,.hwp,.xlsx,.xls,.docx,.pptx"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            disabled={uploadResumeStatus === 'pending'}
          />
        </label>
      </div>

      <div className="flex flex-col gap-2 text-xs mb-4 p-2 bg-[#EAEAEC] rounded break-keep">
        <p className="font-bold text-sm">{`[이력서 업로드 가이드]`}</p>

        <p>• 이력서는 최대 4개까지 업로드 가능해요.</p>

        <div>
          <p>• 왜 FIT Career 이력서 사용을 권장하나요?</p>
          <p>
            {`1) 명확한 이력서를 작성할 수 있어서 기업에서 쉽고 명확하게 지원자의 정보를 파악할 수 있어요.`}
            <br />
            {`2) FIT Career 이력서는 지원자가 삭제해도 기업에서 내가 지원한 이력서를 계속해서 확인할 수 있어요.`}
            <br />
            {`3) 업로드된 이력서는 지원자가 삭제 시 기업에서 열람이 불가능 합니다.`}
          </p>
        </div>

        <div>
          <p>• 왜 pdf 파일을 권장하나요?</p>
          <p>
            {`1) pdf 파일은 웹 브라우저에서 바로 확인이 가능하기 때문에 모바일, PC
          모두 확인이 가능해요.`}
            <br />
            {`2) 파일 크기가 작아 업로드 속도가 빠르고 범용성이 좋아 대부분의 기업에서 pdf 파일을 선호해요.`}
          </p>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {resumeListData
          ?.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .map((data) => {
            return <ResumeCard key={data.id} data={data} />;
          })}
      </div>

      {resumeListData?.length === 0 && (
        <div className="flex items-center justify-center border rounded p-10 h-48">
          <p className="text-sm text-gray-500">저장된 이력서가 없어요.</p>
        </div>
      )}
    </div>
  );
}
