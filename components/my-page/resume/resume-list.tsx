'use client';

import Image from 'next/image';
import { useGetUserData } from '@/actions/auth';
import GlobalSpinner from '@/components/common/global-spinner';
import Spinner from '@/components/common/spinner';
import {
  useGetResume,
  usePostNewResume,
  useUploadResume,
} from '@/actions/resume';
import ResumeCard from '@/components/my-page/resume/resume-card';

const Resume = (): React.ReactElement => {
  const { data: userData, isLoading: userDataLoading } = useGetUserData();
  const { data: resumeListData } = useGetResume();
  const { mutate: postNewResumeMutate, status: postNewResumeStatus } =
    usePostNewResume();
  const { mutate: uploadResumeMutate, status: uploadResumeStatus } =
    useUploadResume();

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
            accept=".pdf,.hwp,.xlsx,.xls,.docx,.pptx"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            disabled={uploadResumeStatus === 'pending'}
          />
        </label>
      </div>

      <div className="text-xs mb-4 p-2 bg-[#EAEAEC] rounded break-keep">
        <p>• 이력서는 최대 4개까지 업로드 가능해요.</p>
        <p>• 이력서 파일의 확장자는 pdf 파일을 권장해요.</p>
        <p>
          • 왜 pdf 파일을 권장하나요?
          <br />
          1) pdf 파일은 웹 브라우저에서 바로 확인이 가능하기 때문에 모바일, PC
          모두 확인이 가능해요.
          <br />
          2) 파일 크기가 작아 업로드 속도가 빨라요.
          <br />
          3) 범용성이 좋아 대부분의 기업에서도 pdf 파일을 선호해요.
          <br />
        </p>
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {resumeListData
          ?.sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime()
          )
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
};

export default Resume;
