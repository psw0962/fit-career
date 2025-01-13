'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { validateInput } from '@/functions/validateInput';
import dynamic from 'next/dynamic';
import Spinner from '@/components/common/spinner';
import GlobalSpinner from '@/components/common/global-spinner';

import { v4 as uuidv4 } from 'uuid';
import React from 'react';
import { useGetResume, usePatchResume } from '@/actions/resume';
import {
  Education,
  Experience,
  Certificate,
  Award,
  LinkData,
} from '@/types/resume/resume';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/css/froala_style.min.css';
import withAuth from '@/hoc/withAuth';
import { useToast } from '@/hooks/use-toast';

const FroalaEditor = dynamic(
  async () => {
    const values = await Promise.all([
      import('react-froala-wysiwyg'),
      import('froala-editor/js/plugins.pkgd.min.js'),
    ]);
    return values[0];
  },
  {
    loading: () => <Spinner />,
    ssr: false,
  }
);

const FroalaEditorView = dynamic(
  import('react-froala-wysiwyg/FroalaEditorView'),
  {
    loading: () => <></>,
    ssr: false,
  }
);

const ResumeEditView = ({ resumeId }: { resumeId: string }) => {
  const titleRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState<string>('');
  const [resumeImage, setResumeImage] = useState<File[]>([]);
  const [currentResumeImage, setCurrentResumeImage] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<{
    part1: string;
    part2: string;
    part3: string;
  }>({
    part1: '',
    part2: '',
    part3: '',
  });
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [introduction, setIntroduction] = useState<string>('');

  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [links, setLinks] = useState<LinkData[]>([]);

  const { toast } = useToast();

  const { data: resumeData } = useGetResume(resumeId);
  const { mutate: patchResumeMutate, status: patchStatus } = usePatchResume();

  const handleResumeImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      setResumeImage([...resumeImage, ...Array.from(files)]);
    }
  };

  const removeResumeImage = (index: number) => {
    setResumeImage(resumeImage.filter((_, i) => i !== index));
  };

  const addField = <T,>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    defaultItem: T
  ) => {
    setter((prev) => {
      if (prev.length < 10) {
        return [...prev, defaultItem];
      }
      return prev;
    });
  };

  const updateField = <T,>(
    index: number,
    field: keyof T,
    value: string | boolean,
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    setter((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeField = <T,>(
    index: number,
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    setter((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const onSubmit = () => {
    if (!title.trim()) {
      toast({
        title: '이력서 제목은 필수 입력항목입니다.',
        variant: 'warning',
      });
      titleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!name.trim()) {
      toast({
        title: '이름은 필수 입력항목입니다.',
        variant: 'warning',
      });
      nameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!phone.part1 || !phone.part2 || !phone.part3) {
      toast({
        title: '연락처는 필수 입력항목입니다.',
        variant: 'warning',
      });
      phoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!email.trim()) {
      toast({
        title: '이메일은 필수 입력항목입니다.',
        variant: 'warning',
      });
      emailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    patchResumeMutate({
      resumeData: {
        title,
        resumeImage,
        currentResumeImage,
        name,
        phone: `${phone.part1}-${phone.part2}-${phone.part3}`,
        email,
        introduction,
        education,
        experience,
        certificates,
        awards,
        links,
      },
      resumeId: resumeId,
    });
  };

  useEffect(() => {
    if (
      resumeData?.length !== 0 &&
      resumeData !== undefined &&
      resumeData !== null
    ) {
      setTitle(resumeData?.[0]?.title || '');
      setCurrentResumeImage(resumeData?.[0]?.resume_image[0] || '');
      setName(resumeData?.[0]?.name || '');
      setPhone({
        part1: resumeData?.[0]?.phone?.split('-')[0] || '',
        part2: resumeData?.[0]?.phone?.split('-')[1] || '',
        part3: resumeData?.[0]?.phone?.split('-')[2] || '',
      });
      setEmail(resumeData?.[0]?.email || '');
      setIntroduction(resumeData?.[0]?.introduction || '');

      setEducation(
        resumeData?.[0]?.education?.length > 0
          ? resumeData[0].education
          : [
              {
                id: uuidv4(),
                startDate: '',
                endDate: '',
                isCurrentlyEnrolled: '',
                schoolName: '',
                majorAndDegree: '',
              },
            ]
      );

      setExperience(
        resumeData?.[0]?.experience?.length > 0
          ? resumeData[0].experience
          : [
              {
                id: uuidv4(),
                startDate: '',
                endDate: '',
                isCurrentlyEmployed: false,
                companyName: '',
                jobTitle: '',
                description: '',
              },
            ]
      );

      setCertificates(
        resumeData?.[0]?.certificates?.length > 0
          ? resumeData[0].certificates
          : [
              {
                id: uuidv4(),
                date: '',
                certificateName: '',
              },
            ]
      );

      setAwards(
        resumeData?.[0]?.awards?.length > 0
          ? resumeData[0].awards
          : [
              {
                id: uuidv4(),
                date: '',
                awardName: '',
              },
            ]
      );

      setLinks(
        resumeData?.[0]?.links?.length > 0
          ? resumeData[0].links
          : [
              {
                id: uuidv4(),
                title: '',
                url: '',
              },
            ]
      );
    }
  }, [resumeData]);

  if (patchStatus === 'pending') {
    return <GlobalSpinner />;
  }

  if (
    education.length === 0 ||
    experience.length === 0 ||
    certificates.length === 0 ||
    awards.length === 0 ||
    links.length === 0
  ) {
    return <GlobalSpinner />;
  }

  return (
    <div className="flex flex-col mb-20">
      <div className="flex flex-col mb-20">
        <p className="text-2xl font-bold mb-2">이력서 작성 TIP</p>

        <div className="text-xs p-2 bg-[#EAEAEC] rounded break-keep">
          <p className="font-bold text-sm">
            • 모든 항목을 작성할 필요는 없어요.
          </p>

          <p className="font-bold text-sm">
            • 글자수를 채우는 이력서 보다는 내가 어떤 사람인지 보여줄 수 있는
            간결한 이력서가 좋아요.
          </p>

          <p className="font-bold text-sm">
            • 내가 지원하는 직무에서 어떤 경험, 역량을 가지고 있는지에 대한
            부분을 위주로 작성하는게 좋아요.
          </p>
        </div>
      </div>

      <div className="flex flex-col mb-20" ref={titleRef}>
        <p className="text-2xl font-bold mb-2">
          이력서 제목 <span className="text-sm text-red-500 align-top">*</span>
        </p>

        <input
          type="text"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          placeholder="홍길동_이력서_퍼스널트레이너"
          className="border p-2 rounded"
        />
      </div>

      <div className="flex flex-col mb-20">
        <p className="text-2xl font-bold mb-2">이력서 사진</p>

        <div className="text-xs mb-7 p-2 bg-[#EAEAEC] rounded break-keep">
          <p>• 가장 많이 쓰는 이력서 사진 파일의 해상도는 300x400입니다.</p>
          <p>
            • 이력서 파일에서 지원하는 이미지 파일 확장자는 .jpg, .jpeg, .png
            입니다.
          </p>
          <p>
            • 증명사진의 형태가 전문성 있는 이미지와 신뢰도를 높일 수 있어요.
          </p>
        </div>

        <div>
          {/*  이미지가 업로드 되기 전 */}
          {!currentResumeImage && resumeImage.length === 0 && (
            <div className="relative flex items-center justify-center w-36 h-36 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-blue-500 transition-all">
              <input
                type="file"
                id="file-upload"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
                onChange={handleResumeImageUpload}
              />
              <div className="flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V12M7 8h.01M16 12V8m0 8h.01M16 12h.01m0 0L12 16l-4-4"
                  />
                </svg>
                <span className="text-gray-600">이미지 업로드</span>
              </div>
            </div>
          )}

          {/* 현재 상태 이미지가 업로드 된 경우 */}
          {resumeImage.length > 0 && (
            <div className="relative w-28 h-20 border-gray-300">
              <div className="relative w-20 h-20">
                <Image
                  src={URL.createObjectURL(resumeImage[0])}
                  alt="resume image"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                  className="rounded"
                />
              </div>

              <button
                onClick={() => removeResumeImage(0)}
                className="absolute top-0 right-0 bg-[#000] text-white rounded p-1"
              >
                <Image
                  src="/svg/close.svg"
                  alt="close"
                  width={12}
                  height={12}
                  className="invert brightness-0"
                  draggable={false}
                />
              </button>
            </div>
          )}

          {/* 이미 업로드된 로고를 가져오는 경우 */}
          {resumeData &&
            resumeData?.[0]?.resume_image[0]?.length > 0 &&
            currentResumeImage !== '' && (
              <div className="relative w-28 h-20 border-gray-300">
                <div className="relative w-20 h-20">
                  <Image
                    src={currentResumeImage}
                    alt="resume image"
                    fill
                    style={{ objectFit: 'contain' }}
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                    className="rounded"
                  />
                </div>

                <button
                  onClick={() => setCurrentResumeImage('')}
                  className="absolute top-0 right-0 bg-[#000] text-white rounded p-1"
                >
                  <Image
                    src="/svg/close.svg"
                    alt="close"
                    width={12}
                    height={12}
                    className="invert brightness-0"
                    draggable={false}
                  />
                </button>
              </div>
            )}
        </div>
      </div>

      <div className="flex flex-col mb-20" ref={nameRef}>
        <p className="text-2xl font-bold mb-2">
          이름 <span className="text-sm text-red-500 align-top">*</span>
        </p>

        <input
          type="text"
          onChange={(e) => setName(e.target.value)}
          value={name}
          placeholder="이름을 입력해 주세요"
          className="border p-2 rounded"
        />
      </div>

      <div className="flex flex-col mb-20" ref={phoneRef}>
        <p className="text-2xl font-bold mb-2">
          연락처 <span className="text-sm text-red-500 align-top">*</span>
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={phone.part1}
            onChange={(e) => {
              const value = e.target.value;
              if (validateInput(value, 'phonePart')) {
                setPhone((prev) => ({ ...prev, part1: value }));
              }
            }}
            placeholder="010"
            className="border p-2 rounded w-20"
          />

          <input
            type="text"
            value={phone.part2}
            onChange={(e) => {
              const value = e.target.value;
              if (validateInput(value, 'phonePart')) {
                setPhone((prev) => ({ ...prev, part2: value }));
              }
            }}
            placeholder="0000"
            className="border p-2 rounded w-20"
          />

          <input
            type="text"
            value={phone.part3}
            onChange={(e) => {
              const value = e.target.value;
              if (validateInput(value, 'phonePart')) {
                setPhone((prev) => ({ ...prev, part3: value }));
              }
            }}
            placeholder="0000"
            className="border p-2 rounded w-20"
          />
        </div>
      </div>

      <div className="flex flex-col mb-20" ref={emailRef}>
        <p className="text-2xl font-bold mb-2">
          이메일 <span className="text-sm text-red-500 align-top">*</span>
        </p>

        <input
          type="text"
          onChange={(e) => {
            const value = e.target.value;
            setEmail(value);
            if (!validateInput(value, 'email')) {
              setEmailError('이메일 형식이 올바르지 않습니다.');
            } else {
              setEmailError('');
            }
          }}
          value={email}
          placeholder="이메일을 입력해 주세요"
          className="border p-2 rounded"
        />

        {emailError && <p className="text-red-500 mt-2">{emailError}</p>}
      </div>

      <div className="flex flex-col mb-20">
        <p className="text-2xl font-bold mb-2">간단 소개</p>

        <div className="text-xs mb-7 p-2 bg-[#EAEAEC] rounded break-keep">
          <p>
            • 본인의 업무 경험을 기반으로 핵심 역량과 업무 스킬을 간단히 작성해
            주세요.
          </p>
          <p>• 3~5줄로 요약하여 작성하는 것을 추천해요.</p>
        </div>

        <FroalaEditor
          tag="textarea"
          model={introduction}
          onModelChange={(event) => setIntroduction(event)}
          config={{
            // charCounterCount: true,
            // charCounterMax: 1000,
            // placeholderText: ``,
            fontSize: ['1', '1.2', '1.4', '1.6', '1.8', '2'],
            fontSizeDefaultSelection: '20px',
            fontSizeUnit: 'rem',
          }}
        />

        <FroalaEditorView model={introduction} />
      </div>

      <div className="flex flex-col mb-20">
        <div className="flex gap-3 items-center mb-2">
          <p className="text-2xl font-bold">학력</p>

          <button
            onClick={() =>
              addField(setEducation, {
                id: uuidv4(),
                startDate: '',
                endDate: '',
                isCurrentlyEnrolled: '',
                schoolName: '',
                majorAndDegree: '',
              })
            }
            className="bg-[#4C71C0] text-white text-sm px-2 py-1 rounded w-fit"
          >
            + 학력 추가
          </button>
        </div>

        <div className="text-xs p-2 mb-7 bg-[#EAEAEC] rounded break-keep">
          <p>
            • 최신순으로 작성해 주세요.
            <br />• 최대 10개까지 등록할 수 있어요.
          </p>
        </div>

        {education.map((edu, index) => (
          <React.Fragment key={edu.id}>
            <div className={`flex items-center`}>
              <div className="relative w-full flex flex-col gap-2 [@media(min-width:1150px)]:flex-row">
                <div className="w-full [@media(min-width:1150px)]:w-[20%] flex flex-col gap-2">
                  <div className="w-full flex gap-1 items-center">
                    <input
                      type="text"
                      placeholder="YYYY.MM"
                      value={edu.startDate}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');

                        if (value.length > 6) {
                          return;
                        }

                        let formattedValue = value;
                        if (value.length > 4) {
                          formattedValue =
                            value.slice(0, 4) + '.' + value.slice(4, 6);
                        }

                        updateField<Education>(
                          index,
                          'startDate',
                          formattedValue,
                          setEducation
                        );
                      }}
                      className="w-full h-10 p-2 border rounded"
                    />

                    <p>~</p>

                    <input
                      type="text"
                      placeholder="YYYY.MM"
                      value={edu.endDate}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');

                        if (value.length > 6) {
                          return;
                        }

                        let formattedValue = value;
                        if (value.length > 4) {
                          formattedValue =
                            value.slice(0, 4) + '.' + value.slice(4, 6);
                        }

                        updateField<Education>(
                          index,
                          'endDate',
                          formattedValue,
                          setEducation
                        );
                      }}
                      className="w-full h-10 p-2 border rounded"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-1">
                      <input
                        id={`currentlyEnrolled-${edu.id}`}
                        name={`currentlyEnrolled-${edu.id}`}
                        type="radio"
                        checked={
                          edu.isCurrentlyEnrolled === 'currentlyEnrolled'
                        }
                        onChange={() => {
                          updateField<Education>(
                            index,
                            'isCurrentlyEnrolled',
                            'currentlyEnrolled',
                            setEducation
                          );
                        }}
                      />
                      <label
                        htmlFor={`currentlyEnrolled-${edu.id}`}
                        className="mr-2 text-sm text-gray-500"
                      >
                        현재 재학중
                      </label>
                    </div>

                    <div className="flex items-center gap-1">
                      <input
                        id={`graduated-${edu.id}`}
                        name={`graduated-${edu.id}`}
                        type="radio"
                        checked={edu.isCurrentlyEnrolled === 'graduated'}
                        onChange={() => {
                          updateField<Education>(
                            index,
                            'isCurrentlyEnrolled',
                            'graduated',
                            setEducation
                          );
                        }}
                      />
                      <label
                        htmlFor={`graduated-${edu.id}`}
                        className="mr-2 text-sm text-gray-500"
                      >
                        졸업
                      </label>
                    </div>

                    <div className="flex items-center gap-1">
                      <input
                        id={`etc-${edu.id}`}
                        name={`etc-${edu.id}`}
                        type="radio"
                        checked={edu.isCurrentlyEnrolled === 'etc'}
                        onChange={() => {
                          updateField<Education>(
                            index,
                            'isCurrentlyEnrolled',
                            'etc',
                            setEducation
                          );
                        }}
                      />
                      <label
                        htmlFor={`etc-${edu.id}`}
                        className="mr-2 text-sm text-gray-500"
                      >
                        그 외(졸업예정, 휴학, 자퇴 등)
                      </label>
                    </div>
                  </div>
                </div>

                <div
                  className={`flex flex-col gap-2 ${education.length > 1 ? 'w-[75%]' : 'w-[80%]'} [@media(max-width:1150px)]:w-full`}
                >
                  <input
                    id={`schoolName-${edu.id}`}
                    name={`schoolName-${edu.id}`}
                    type="text"
                    placeholder="학교명"
                    value={edu.schoolName}
                    onChange={(e) =>
                      updateField<Education>(
                        index,
                        'schoolName',
                        e.target.value,
                        setEducation
                      )
                    }
                    className="w-full h-10 p-2 border rounded"
                  />

                  <input
                    id={`majorAndDegree-${edu.id}`}
                    name={`majorAndDegree-${edu.id}`}
                    type="text"
                    placeholder="전공 및 학위 ex) 체육학 학사"
                    value={edu.majorAndDegree}
                    onChange={(e) =>
                      updateField<Education>(
                        index,
                        'majorAndDegree',
                        e.target.value,
                        setEducation
                      )
                    }
                    className="w-full h-10 p-2 border rounded"
                  />
                </div>

                {education.length > 1 && (
                  <Image
                    src="/svg/close.svg"
                    alt="close"
                    width={15}
                    height={15}
                    className="w-auto h-4 cursor-pointer absolute right-0 top-[-20px] [@media(min-width:1150px)]:right-[10px] [@media(min-width:1150px)]:top-[35px]"
                    onClick={() => removeField(index, setEducation)}
                  />
                )}
              </div>
            </div>

            {education.length > 1 && (
              <div className="border border-gray-300 my-11 [@media(min-width:1150px)]:my-10"></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="flex flex-col mb-20">
        <div className="flex gap-3 items-center mb-2">
          <p className="text-2xl font-bold">경력</p>

          <button
            onClick={() =>
              addField(setExperience, {
                id: uuidv4(),
                startDate: '',
                endDate: '',
                isCurrentlyEmployed: false,
                companyName: '',
                jobTitle: '',
                description: '',
              })
            }
            className="bg-[#4C71C0] text-white text-sm px-2 py-1 rounded w-fit"
          >
            + 경력 추가
          </button>
        </div>

        <div className="text-xs mb-7 p-2 bg-[#EAEAEC] rounded break-keep">
          <p>• 최신순으로 작성해 주세요.</p>
          <p>
            • 신입의 경우 지원하는 직무를 준비하는 과정에서 어떤 노력을 했고
            어떤 경험을 얻었는지 작성하거나 직무와 관련된 대외활동/인턴/계약직
            경험 등이 있다면 작성해 주세요.
          </p>
          <p>
            • 업무 또는 활동 시 담당했던 역할과 과정, 성과에 대해 구체적인 숫자
            혹은 %로 자세히 작성하면 좋아요.
          </p>
          <p>• 최대 10개까지 등록할 수 있어요.</p>
        </div>

        {experience.map((exp, index) => (
          <React.Fragment key={index}>
            <div className={`flex items-center`}>
              <div className="relative w-full flex flex-col gap-2 [@media(min-width:1150px)]:flex-row">
                <div className="w-full [@media(min-width:1150px)]:w-[20%] flex flex-col gap-2">
                  <div className="w-full flex gap-1 items-center">
                    <input
                      type="text"
                      placeholder="YYYY.MM"
                      value={exp.startDate}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value.length > 6) return;
                        let formattedValue = value;
                        if (value.length > 4) {
                          formattedValue =
                            value.slice(0, 4) + '.' + value.slice(4, 6);
                        }
                        updateField<Experience>(
                          index,
                          'startDate',
                          formattedValue,
                          setExperience
                        );
                      }}
                      className="w-full h-10 p-2 border rounded"
                    />

                    <p>~</p>

                    <input
                      type="text"
                      placeholder="YYYY.MM"
                      value={exp.endDate}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value.length > 6) return;
                        let formattedValue = value;
                        if (value.length > 4) {
                          formattedValue =
                            value.slice(0, 4) + '.' + value.slice(4, 6);
                        }
                        updateField<Experience>(
                          index,
                          'endDate',
                          formattedValue,
                          setExperience
                        );
                      }}
                      className="w-full h-10 p-2 border rounded"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <input
                      id={`currentlyEmployed-${exp.id}`}
                      name={`currentlyEmployed-${exp.id}`}
                      type="checkbox"
                      checked={exp.isCurrentlyEmployed}
                      onChange={() => {
                        updateField<Experience>(
                          index,
                          'isCurrentlyEmployed',
                          !exp.isCurrentlyEmployed,
                          setExperience
                        );
                      }}
                    />
                    <label
                      htmlFor={`currentlyEmployed-${exp.id}`}
                      className="mr-2 text-sm text-gray-500"
                    >
                      현재 재직중
                    </label>
                  </div>
                </div>

                <div
                  className={`flex flex-col gap-2 ${experience.length > 1 ? 'w-[75%]' : 'w-[80%]'} [@media(max-width:1150px)]:w-full`}
                >
                  <input
                    type="text"
                    placeholder="회사명"
                    value={exp.companyName}
                    onChange={(e) =>
                      updateField<Experience>(
                        index,
                        'companyName',
                        e.target.value,
                        setExperience
                      )
                    }
                    className="w-full h-10 p-2 border rounded"
                  />

                  <input
                    type="text"
                    placeholder="직무"
                    value={exp.jobTitle}
                    onChange={(e) =>
                      updateField<Experience>(
                        index,
                        'jobTitle',
                        e.target.value,
                        setExperience
                      )
                    }
                    className="w-full h-10 p-2 border rounded"
                  />

                  <textarea
                    placeholder="주요 성과"
                    value={exp.description}
                    className="w-full h-32 p-2 border rounded"
                    onChange={(e) =>
                      updateField<Experience>(
                        index,
                        'description',
                        e.target.value,
                        setExperience
                      )
                    }
                  />
                </div>

                {experience.length > 1 && (
                  <Image
                    src="/svg/close.svg"
                    alt="close"
                    width={15}
                    height={15}
                    className="w-auto h-4 cursor-pointer absolute right-0 top-[-20px] [@media(min-width:1150px)]:right-[15px] [@media(min-width:1150px)]:top-[0px]"
                    onClick={() => removeField(index, setExperience)}
                  />
                )}
              </div>
            </div>

            {experience.length > 1 && (
              <div className="border border-gray-300 my-11 [@media(min-width:1150px)]:my-10"></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="flex flex-col mb-20">
        <div className="flex gap-3 items-center mb-2">
          <p className="text-2xl font-bold">자격사항</p>

          <button
            onClick={() =>
              addField(setCertificates, {
                id: uuidv4(),
                date: '',
                certificateName: '',
              })
            }
            className="bg-[#4C71C0] text-white text-sm px-2 py-1 rounded w-fit"
          >
            + 자격사항 추가
          </button>
        </div>

        <div className="text-xs mb-7 p-2 bg-[#EAEAEC] rounded break-keep">
          <p>
            • 최신순으로 작성해 주세요.
            <br />• 최대 10개까지 등록할 수 있어요.
          </p>
        </div>

        {certificates.map((cert, index) => (
          <div
            key={cert.id}
            className="flex items-center mb-10 relative sm:mb-2"
          >
            <div className="w-full flex flex-col items-center gap-2 sm:flex-row">
              <input
                type="text"
                placeholder="YYYY.MM"
                value={cert.date}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');

                  if (value.length > 6) {
                    return;
                  }

                  let formattedValue = value;
                  if (value.length > 4) {
                    formattedValue =
                      value.slice(0, 4) + '.' + value.slice(4, 6);
                  }

                  updateField<Certificate>(
                    index,
                    'date',
                    formattedValue,
                    setCertificates
                  );
                }}
                className="w-full h-10 sm:w-[20%] p-2 border rounded"
              />

              <input
                type="text"
                placeholder="자격명"
                value={cert.certificateName}
                onChange={(e) =>
                  updateField<Certificate>(
                    index,
                    'certificateName',
                    e.target.value,
                    setCertificates
                  )
                }
                className="w-full h-10 sm:w-[80%] p-2 border rounded"
              />

              {certificates.length > 1 && (
                <Image
                  src="/svg/close.svg"
                  alt="close"
                  width={15}
                  height={15}
                  className="w-auto h-4 cursor-pointer absolute right-0 top-[-20px] sm:static"
                  onClick={() => removeField(index, setCertificates)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col mb-20">
        <div className="flex gap-3 items-center mb-2">
          <p className="text-2xl font-bold">수상 경력 및 활동</p>

          <button
            onClick={() =>
              addField(setAwards, {
                id: uuidv4(),
                date: '',
                awardName: '',
              })
            }
            className="bg-[#4C71C0] text-white text-sm px-2 py-1 rounded w-fit"
          >
            + 추가
          </button>
        </div>

        <div className="text-xs mb-7 p-2 bg-[#EAEAEC] rounded break-keep">
          <p>
            • 최신순으로 작성해 주세요.
            <br />• 최대 10개까지 등록할 수 있어요.
          </p>
        </div>

        {awards.map((award, index) => (
          <div
            key={award.id}
            className="flex items-center mb-10 relative sm:mb-2"
          >
            <div className="w-full flex flex-col items-center gap-2 sm:flex-row">
              <input
                type="text"
                placeholder="YYYY.MM"
                value={award.date}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');

                  if (value.length > 6) {
                    return;
                  }

                  let formattedValue = value;
                  if (value.length > 4) {
                    formattedValue =
                      value.slice(0, 4) + '.' + value.slice(4, 6);
                  }

                  updateField<Award>(index, 'date', formattedValue, setAwards);
                }}
                className="w-full h-10 sm:w-[20%] p-2 border rounded"
              />

              <input
                type="text"
                placeholder="수상 경력 및 활동 내용"
                value={award.awardName}
                onChange={(e) =>
                  updateField<Award>(
                    index,
                    'awardName',
                    e.target.value,
                    setAwards
                  )
                }
                className="w-full h-10 sm:w-[80%] p-2 border rounded"
              />

              {awards.length > 1 && (
                <Image
                  src="/svg/close.svg"
                  alt="close"
                  width={15}
                  height={15}
                  className="w-auto h-4 cursor-pointer absolute right-0 top-[-20px] sm:static"
                  onClick={() => removeField(index, setAwards)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col">
        <div className="flex gap-3 items-center mb-2">
          <p className="text-2xl font-bold">링크</p>

          <button
            onClick={() =>
              addField(setLinks, {
                id: uuidv4(),
                title: '',
                url: '',
              })
            }
            className="bg-[#4C71C0] text-white text-sm px-2 py-1 rounded w-fit"
          >
            + 링크 추가
          </button>
        </div>

        <div className="text-xs mb-7 p-2 bg-[#EAEAEC] rounded break-keep">
          <p>
            • 자신을 어필할 수 있는 포트폴리오가 있다면 링크도 첨부해 주세요.
            ex)인스타그램, 블로그, 비포애프터 자료 등
            <br />• 최대 10개까지 등록할 수 있어요.
          </p>
        </div>

        {links.map((link, index) => (
          <div
            key={link.id}
            className="flex items-center mb-10 relative sm:mb-2"
          >
            <div className="w-full flex flex-col items-center gap-2 sm:flex-row">
              <input
                type="text"
                placeholder="링크 제목"
                value={link.title}
                onChange={(e) =>
                  updateField<LinkData>(
                    index,
                    'title',
                    e.target.value,
                    setLinks
                  )
                }
                className="w-full h-10 sm:w-[20%] p-2 border rounded"
              />

              <input
                type="text"
                placeholder="URL"
                value={link.url}
                onChange={(e) =>
                  updateField<LinkData>(index, 'url', e.target.value, setLinks)
                }
                className="w-full h-10 sm:w-[80%] p-2 border rounded"
              />

              {links.length > 1 && (
                <Image
                  src="/svg/close.svg"
                  alt="close"
                  width={15}
                  height={15}
                  className="w-auto h-4 cursor-pointer absolute right-0 top-[-20px] sm:static"
                  onClick={() => removeField(index, setLinks)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        className="bg-[#4C71C0] text-white text-base px-6 py-2 rounded w-fit mx-auto mt-16"
        onClick={() => onSubmit()}
      >
        저장하기
      </button>
    </div>
  );
};

export default withAuth(ResumeEditView);
