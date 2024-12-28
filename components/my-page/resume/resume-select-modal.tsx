'use client';

import { ResumeDataResponse } from '@/types/resume/resume';
import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import { format, addHours } from 'date-fns';

const ResumeSelectIdModal = ({
  resumeData,
  resumeUserIdModalIsOpen,
  setResumeUserIdModalIsOpen,
  selectedResumeId,
  setSelectedResumeId,
}: {
  resumeData: ResumeDataResponse[] | null | undefined;
  resumeUserIdModalIsOpen: boolean;
  setResumeUserIdModalIsOpen: (isOpen: boolean) => void;
  selectedResumeId: string;
  setSelectedResumeId: (id: string) => void;
}) => {
  const decodeBase64Unicode = (str: string): string => {
    return decodeURIComponent(atob(str));
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className="w-fit h-fit bg-[#4C71C0] rounded px-8 py-2 text-white cursor-pointer"
          onClick={() => setResumeUserIdModalIsOpen(true)}
        >
          지원하기
        </button>
      </Dialog.Trigger>

      <Dialog.Description></Dialog.Description>

      <Dialog.Portal>
        {/* <Dialog.Overlay className="fixed inset-0 bg-black opacity-50 z-40" /> */}

        <div className="fixed inset-0 flex items-center justify-center">
          <div
            id="modal-overlay"
            className="absolute inset-0 bg-black/50 z-40"
          />

          <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[30vh] w-[350px] max-w-[450px] -translate-x-1/2 -translate-y-1/2 rounded bg-white p-[25px] shadow focus:outline-none overflow-y-auto z-50">
            <Dialog.Title className="mb-4 font-bold">이력서 선택</Dialog.Title>

            {resumeData && resumeData.length === 0 && (
              <div className="flex justify-center items-center border rounded p-6 mt-4">
                <p className="text-[#000]">등록된 이력서가 없습니다.</p>
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
                            style={{ objectFit: 'cover' }}
                            priority={true}
                          />
                        </div>

                        <p>
                          {resume.title.length > 15
                            ? `${resume.title.slice(0, 15)}...`
                            : resume.title}
                        </p>
                      </div>

                      <p className="text-xs text-gray-500">
                        최근 수정일 :{' '}
                        {format(
                          addHours(new Date(resume.updated_at), 15),
                          'yyyy-MM-dd HH:mm:ss'
                        )}
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
                            style={{ objectFit: 'cover' }}
                            priority={true}
                          />
                        </div>

                        <p>
                          {decodeBase64Unicode(resume.title).split('.')[0]
                            .length > 22
                            ? `${decodeBase64Unicode(resume.title).slice(0, 22)}...${decodeBase64Unicode(resume.title).split('.')[1]}`
                            : `${decodeBase64Unicode(resume.title).split('.')[0]}.${decodeBase64Unicode(resume.title).split('.')[1]}`}
                        </p>
                      </div>

                      <p className="text-xs text-gray-500">
                        최근 수정일 :{' '}
                        {format(
                          addHours(new Date(resume.updated_at), 15),
                          'yyyy-MM-dd HH:mm:ss'
                        )}
                      </p>
                    </div>
                  )}
                </label>
              ))}
            </div>

            <button
              className="w-full mt-4 bg-[#4C71C0] rounded px-8 py-2 text-white cursor-pointer"
              onClick={() => {}}
            >
              제출하기
            </button>

            <Dialog.Close asChild>
              <Image
                src="/svg/close.svg"
                alt="close"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="absolute right-4 top-4 cursor-pointer"
                aria-label="Close"
                width={25}
                height={25}
                priority={true}
              />
            </Dialog.Close>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ResumeSelectIdModal;
