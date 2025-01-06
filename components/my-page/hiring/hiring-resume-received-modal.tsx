'use client';

import { HiringDataResponse, ResumeReceived } from '@/types/hiring/hiring';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import Image from 'next/image';
import { PDFViewer } from '@react-pdf/renderer';
import ResumeDocument from '@/components/my-page/resume/resume-document';
import { useToast } from '@/hooks/use-toast';

const HiringResumeReceivedModal = ({ data }: { data: HiringDataResponse }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedResume, setSelectedResume] = useState<ResumeReceived | null>(
    null
  );

  const { toast } = useToast();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="w-full mt-[2px] text-sm bg-[#4C71C0] px-2 py-2 rounded text-white">
          {`접수된 이력서 (${data.resume_received.length})`}
        </button>
      </Dialog.Trigger>

      <Dialog.Description></Dialog.Description>

      <Dialog.Portal>
        {/* <Dialog.Overlay classNa me="fixed inset-0 bg-black/50" /> */}

        <div className="fixed inset-0 flex items-center justify-center">
          <div
            id="modal-overlay"
            className="absolute inset-0 bg-black/50 z-40"
          />
        </div>

        <Dialog.Content
          className={`fixed left-1/2 top-1/2 ${
            showPreview
              ? 'w-[95vw] h-[95vh]'
              : 'w-[80vw] sm:w-[600px] md:w-[750px] lg:w-[800px] min-w-[350px] max-h-[60vh]'
          } -translate-x-1/2 -translate-y-1/2 rounded bg-white px-10 py-14 shadow focus:outline-none overflow-y-auto z-50`}
          onInteractOutside={() => {
            setShowPreview(false);
            setSelectedResume(null);
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
        >
          <Dialog.Title className="font-bold text-lg break-keep">
            {`[${data.title}] 채용공고의 접수된 이력서`}
          </Dialog.Title>

          <div className="flex flex-col gap-0 mb-4">
            <p className="text-sm text-gray-500">
              - 채용공고 등록일 : {data.created_at}
            </p>
            <p className="text-sm text-gray-500">
              - 채용공고 마감일 : {data.dead_line}
            </p>
            <p className="text-sm text-gray-500">
              - 채용 포지션 : {data.position}
            </p>
          </div>

          <div className="w-full whitespace-nowrap overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-t">
                  <th className="p-3 text-center">이력서</th>
                  <th className="p-3 text-center">지원자명</th>
                  <th className="p-3 text-center">전화번호</th>
                  <th className="p-3 text-center">이메일</th>
                  <th className="p-3 text-center">제출일</th>
                </tr>
              </thead>

              <tbody>
                {data?.resume_received?.length > 0 ? (
                  (data?.resume_received as ResumeReceived[])?.map((resume) => (
                    <tr key={resume.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-center">
                        {resume.is_fitcareer_resume && (
                          <button
                            className="text-sm text-blue-500"
                            onClick={() => {
                              setSelectedResume(resume);
                              setShowPreview(true);
                            }}
                          >
                            이력서 보기
                          </button>
                        )}

                        {!resume.is_fitcareer_resume && (
                          <button
                            className="text-sm text-blue-500"
                            onClick={async () => {
                              if (!resume.upload_resume) {
                                toast({
                                  title:
                                    '이력서 파일 링크가 존재하지 않습니다. 지원자가 이력서를 삭제했어요.',
                                  variant: 'warning',
                                });
                                return;
                              }

                              try {
                                const response = await fetch(
                                  resume.upload_resume,
                                  { method: 'HEAD' }
                                );
                                if (!response.ok) {
                                  toast({
                                    title:
                                      '이력서 파일을 찾을 수 없습니다. 지원자가 이력서를 삭제했어요.',
                                    variant: 'warning',
                                  });
                                  return;
                                }
                                window.open(resume.upload_resume, '_blank');
                              } catch (error) {
                                toast({
                                  title:
                                    '이력서 파일에 접근할 수 없습니다. 지원자가 이력서를 삭제했어요.',
                                  variant: 'warning',
                                });
                              }
                            }}
                          >
                            이력서 보기
                          </button>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {resume.is_fitcareer_resume
                          ? resume.name
                          : '파일로 제출됨'}
                      </td>
                      <td className="p-3 text-center">
                        {resume.is_fitcareer_resume
                          ? resume.phone
                          : '파일로 제출됨'}
                      </td>
                      <td className="p-3 text-center">
                        {resume.is_fitcareer_resume
                          ? resume.email
                          : '파일로 제출됨'}
                      </td>
                      <td className="p-3 text-center">{resume.submitted_at}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-3 text-center text-gray-500">
                      접수된 이력서가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {showPreview && selectedResume && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="w-[95vw] h-[95vh] bg-white p-12 relative">
                <PDFViewer width="100%" height="100%">
                  <ResumeDocument data={selectedResume} />
                </PDFViewer>

                <button
                  onClick={() => {
                    setShowPreview(false);
                    setSelectedResume(null);
                  }}
                  className="absolute top-4 right-4 text-[#000]"
                >
                  닫기
                </button>
              </div>
            </div>
          )}

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
              onClick={() => {
                setShowPreview(false);
                setSelectedResume(null);
              }}
            />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default HiringResumeReceivedModal;
