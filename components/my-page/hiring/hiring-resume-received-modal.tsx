'use client';

import React from 'react';
import Image from 'next/image';
import { HiringDataResponse, ResumeReceived } from '@/types/hiring/hiring';
import { useEffect, useState } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import ResumeDocument from '@/components/my-page/resume/resume-document';
import { useToast } from '@/hooks/use-toast';
import ResumePreview from '@/components/my-page/resume/resume-preview';
import { useMarkResumeAsRead, useUpdateResumeStatus } from '@/api/resume';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function HiringResumeReceivedModal({ data }: { data: HiringDataResponse }) {
  const statusOptions = ['서류접수', '서류합격', '면접합격', '최종합격', '불합격'];

  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedResume, setSelectedResume] = useState<ResumeReceived | null>(null);
  const [localResumes, setLocalResumes] = useState<ResumeReceived[]>(data.resume_received);

  const { toast } = useToast();
  const { mutate: markResumeAsRead } = useMarkResumeAsRead();
  const { mutate: updateResumeStatus } = useUpdateResumeStatus();

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>, resumeId: string) {
    const newStatus = e.target.value;
    setLocalResumes((prevResumes) =>
      prevResumes.map((resume) =>
        resume.id === resumeId
          ? { ...resume, status: newStatus as ResumeReceived['status'] }
          : resume,
      ),
    );
    updateResumeStatus({ hiringId: data.id, resumeId, status: newStatus });
  }

  useEffect(() => {
    setLocalResumes(data.resume_received);
  }, [data.resume_received]);

  useEffect(() => {
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
    setIsMobile(/Mobi/i.test(userAgent));
  }, []);

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <button
          className='w-full text-sm bg-[#4C71C0] px-2 py-2 rounded text-white'
          onClick={() => setIsModalOpen(true)}
        >
          {`접수된 이력서 (${data.resume_received.length})`}
        </button>
      </DialogTrigger>

      <DialogContent
        className={`w-[90vw] max-w-[900px] min-w-[300px] ${showPreview ? 'h-full' : 'h-fit'}`}
        onInteractOutside={() => {
          setShowPreview(false);
          setSelectedResume(null);
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{`[${data.title}] 채용공고의 접수된 이력서`}</DialogTitle>
          <DialogDescription className='hidden'></DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-0 mb-4'>
          <p className='text-sm text-gray-500'>- 채용공고 등록일 : {data.created_at}</p>
          <p className='text-sm text-gray-500'>- 채용공고 마감일 : {data.dead_line}</p>
          <p className='text-sm text-gray-500'>- 채용 포지션 : {data.position}</p>
        </div>

        <div className='flex flex-col gap-3 whitespace-nowrap overflow-auto max-h-[400px]'>
          {!showPreview && !selectedResume && (
            <table className='border-collapse'>
              <thead>
                <tr className='border-b border-t'>
                  <th className='p-3 text-center'>이력서</th>
                  <th className='p-3 text-center'>지원자명</th>
                  <th className='p-3 text-center'>전화번호</th>
                  <th className='p-3 text-center'>이메일</th>
                  <th className='p-3 text-center'>제출일</th>
                  <th className='p-3 text-center'>읽음/안읽음</th>
                  <th className='p-3 text-center'>진행 상태</th>
                </tr>
              </thead>

              <tbody>
                {data?.resume_received?.length > 0 ? (
                  (data?.resume_received as ResumeReceived[])?.map((resume) => (
                    <tr key={resume.id} className='border-b hover:bg-gray-50'>
                      <td className='p-3 text-center'>
                        {resume.is_fitcareer_resume && (
                          <button
                            className='text-sm text-blue-500'
                            onClick={() => {
                              markResumeAsRead({
                                hiringId: data.id,
                                resumeId: resume.id,
                              });
                              setSelectedResume(resume);
                              setShowPreview(true);
                            }}
                          >
                            이력서 보기
                          </button>
                        )}

                        {!resume.is_fitcareer_resume && (
                          <button
                            className='text-sm text-blue-500'
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
                                const response = await fetch(resume.upload_resume, {
                                  method: 'HEAD',
                                });

                                if (!response.ok) {
                                  toast({
                                    title:
                                      '이력서 파일을 찾을 수 없습니다. 지원자가 이력서를 삭제했어요.',
                                    variant: 'warning',
                                  });
                                  return;
                                }

                                markResumeAsRead({
                                  hiringId: data.id,
                                  resumeId: resume.id,
                                });

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

                      <td className='p-3 text-center'>
                        {resume.is_fitcareer_resume ? resume.name || '미작성' : '파일로 제출됨'}
                      </td>
                      <td className='p-3 text-center'>
                        {resume.is_fitcareer_resume ? resume.phone || '미작성' : '파일로 제출됨'}
                      </td>
                      <td className='p-3 text-center'>
                        {resume.is_fitcareer_resume ? resume.email || '미작성' : '파일로 제출됨'}
                      </td>
                      <td className='p-3 text-center'>{resume.submitted_at}</td>
                      <td className='p-3 text-center'>{resume.is_read ? '읽음' : '안읽음'}</td>
                      <td className='p-3 text-center'>
                        <select
                          value={resume.status}
                          onChange={(e) => handleStatusChange(e, resume.id)}
                          className='border rounded p-1'
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className='p-3 text-center text-gray-500'>
                      접수된 이력서가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {!isMobile && showPreview && selectedResume && (
          <div className='fixed inset-0 bg-black bg-opacity-50 z-[50] flex items-center justify-center'>
            <div
              className={`relative w-full max-w-[900px] min-w-[300px] p-12 bg-white ${
                showPreview ? 'h-full' : 'h-fit'
              }`}
            >
              <PDFViewer width='100%' height='100%'>
                <ResumeDocument data={selectedResume} />
              </PDFViewer>

              <button
                onClick={() => {
                  setShowPreview(false);
                  setSelectedResume(null);
                }}
                className='absolute top-4 right-4 text-[#000]'
              >
                닫기
              </button>
            </div>
          </div>
        )}

        {isMobile && showPreview && selectedResume && (
          <div className='fixed inset-0 bg-black bg-opacity-50 z-[50] flex items-center justify-center'>
            <div
              className={`relative w-full max-w-[900px] min-w-[300px] h-full p-5 bg-white overflow-y-scroll`}
            >
              <ResumePreview data={selectedResume} />

              <PDFDownloadLink
                className='absolute top-4 right-14'
                document={<ResumeDocument data={selectedResume} />}
                fileName={selectedResume.name}
              >
                <div className='flex items-center'>
                  <p className=''>다운로드</p>
                  <div className='relative w-[15px] h-[15px]'>
                    <Image src='/svg/download.svg' alt='download' fill />
                  </div>
                </div>
              </PDFDownloadLink>

              <button
                onClick={() => {
                  setShowPreview(false);
                  setSelectedResume(null);
                }}
                className='absolute top-4 right-4 text-[#000]'
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
