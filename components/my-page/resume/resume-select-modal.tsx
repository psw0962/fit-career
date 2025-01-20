'use client';

import { ResumeDataResponse } from '@/types/resume/resume';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { usePostResumeToHiring } from '@/actions/resume';
import { HiringDataResponse, ResumeReceived } from '@/types/hiring/hiring';
import { useRouter } from 'next/navigation';
import { convertBase64Unicode } from '@/functions/convertBase64Unicode';
import { useSessionStorage } from 'usehooks-ts';
import { useGetUserData } from '@/actions/auth';
import { useToast } from '@/hooks/use-toast';

const ResumeSelectIdModal = ({
  hiringData,
  resumeData,
  resumeUserIdModalIsOpen,
  setResumeUserIdModalIsOpen,
  selectedResumeId,
  setSelectedResumeId,
}: {
  hiringData: HiringDataResponse[] | null | undefined;
  resumeData: ResumeDataResponse[] | null | undefined;
  resumeUserIdModalIsOpen: boolean;
  setResumeUserIdModalIsOpen: (isOpen: boolean) => void;
  selectedResumeId: string;
  setSelectedResumeId: (id: string) => void;
}) => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useSessionStorage('activeTab', '');

  const { toast } = useToast();

  const { data: userData } = useGetUserData();
  const { mutate: postResumeToHiring } = usePostResumeToHiring();

  const confirmSubmitted = () => {
    if (hiringData?.[0].is_visible === false) {
      return true;
    }

    const resumeReceived = hiringData?.[0].resume_received as ResumeReceived[];
    const selectedResume = resumeData?.find(
      (resume) => resume.id === selectedResumeId
    );
    const userIdToCheck = selectedResume?.user_id ?? userData?.id;

    return (
      resumeReceived?.some((resume) => resume.user_id === userIdToCheck) ??
      false
    );
  };

  const isDeadlinePassed = () => {
    if (!hiringData?.[0].dead_line) return false;
    const deadline = new Date(hiringData[0].dead_line);
    const now = new Date();
    return now > deadline;
  };

  const handlePostResumeToHiring = () => {
    if (!selectedResumeId) {
      toast({
        title: '이력서를 선택해주세요.',
        variant: 'warning',
      });
      return;
    }

    if (hiringData && hiringData.length > 0) {
      postResumeToHiring({
        hiringId: hiringData[0].id,
        resumeId: selectedResumeId,
      });
    }
  };

  return (
    <Dialog
      open={resumeUserIdModalIsOpen}
      onOpenChange={setResumeUserIdModalIsOpen}
    >
      <DialogTrigger asChild>
        <button
          className={`w-fit h-fit bg-[#4C71C0] ${
            isDeadlinePassed() ? 'bg-gray-400 cursor-not-allowed' : ''
          } rounded px-8 py-2 text-white cursor-pointer`}
          onClick={() => {
            if (isDeadlinePassed()) return;

            if (!userData) {
              router.push('/auth?message=login_required');
              return;
            }

            setResumeUserIdModalIsOpen(true);
          }}
          disabled={isDeadlinePassed()}
        >
          {isDeadlinePassed() ? '채용 마감' : '지원하기'}
        </button>
      </DialogTrigger>

      {userData && (
        <DialogContent className="w-[90vw] max-w-[500px] min-w-[300px]">
          <div className="flex flex-col gap-3">
            <DialogHeader>
              <DialogTitle className="font-bold">이력서 선택</DialogTitle>
              <DialogDescription className="hidden"></DialogDescription>
            </DialogHeader>

            {resumeData && resumeData.length === 0 && (
              <div className="flex flex-col gap-2 justify-center items-center border rounded p-6 mt-4">
                <p className="text-[#000]">등록된 이력서가 없습니다.</p>

                <button
                  className="w-fit h-fit text-xs rounded px-4 py-2 border cursor-pointer"
                  onClick={() => {
                    router.push('/auth/my-page');
                    setActiveTab('resume');
                  }}
                >
                  이력서 작성하기
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {resumeData?.map((resume) => (
                <label
                  key={resume.id}
                  className="flex items-center space-x-3 cursor-pointer p-3 border rounded hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="resume"
                    value={resume.id}
                    checked={selectedResumeId === resume.id}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                  />

                  {resume.is_fitcareer_resume && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <div className="relative w-5 h-5">
                          <Image
                            src="/svg/logo.svg"
                            alt="logo"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            fill
                            style={{ objectFit: 'contain' }}
                            priority={true}
                            loading="lazy"
                            quality={75}
                          />
                        </div>

                        <p className="max-w-[200px] break-all line-clamp-1">
                          {resume.title}
                        </p>
                      </div>

                      <p className="text-xs text-gray-500">
                        최근 수정일 : {resume.updated_at}
                      </p>
                    </div>
                  )}

                  {!resume.is_fitcareer_resume && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <div className="relative w-5 h-5">
                          <Image
                            src="/svg/document.svg"
                            alt="document"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            fill
                            style={{ objectFit: 'contain' }}
                            priority={true}
                            loading="lazy"
                            quality={75}
                          />
                        </div>

                        <p className="max-w-[200px] break-all line-clamp-1">
                          {`${convertBase64Unicode(resume.title, 'decode').split('.')[0]}.${convertBase64Unicode(resume.title, 'decode').split('.')[1]}`}
                        </p>
                      </div>

                      <p className="text-xs text-gray-500">
                        최근 수정일 : {resume.updated_at}
                      </p>
                    </div>
                  )}
                </label>
              ))}
            </div>

            {resumeData && resumeData.length > 0 && (
              <button
                className={`w-fit mx-auto px-8 py-2 text-white cursor-pointer rounded ${
                  confirmSubmitted()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#4C71C0]'
                }`}
                onClick={() => handlePostResumeToHiring()}
                disabled={confirmSubmitted()}
              >
                {resumeData && resumeData.length < 0 && '이미지 업로드'}

                {confirmSubmitted() &&
                  hiringData?.[0].is_visible &&
                  '이미 지원한 채용공고입니다.'}

                {confirmSubmitted() === false &&
                  hiringData?.[0].is_visible &&
                  '제출하기'}

                {hiringData?.[0].is_visible === false && (
                  <>
                    <span>숨김 처리된 채용공고입니다.</span>
                    <br />
                    <span>지금은 지원할 수 없어요.</span>
                  </>
                )}
              </button>
            )}

            {confirmSubmitted() && (
              <p className="text-xs text-[red] mt-2">
                *지원 취소는 마이페이지에서 할 수 있어요.
              </p>
            )}
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default ResumeSelectIdModal;
