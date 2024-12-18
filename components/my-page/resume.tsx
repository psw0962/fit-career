'use client';

import Image from 'next/image';
import { useState } from 'react';
import { validateInput } from '@/functions/validateInput';
import dynamic from 'next/dynamic';
import Spinner from '@/components/common/spinner';

interface LinkData {
  title: string;
  url: string;
}

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

const Resume = () => {
  const [resumeImage, setResumeImage] = useState<File[]>([]);
  const [currentResumeImage, setCurrentResumeImage] = useState<string>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState({
    part1: '',
    part2: '',
    part3: '',
  });
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>('');
  const [introduction, setIntroduction] = useState(`
<p>- 진심으로 고객이 변하길 바라는 마음으로 목표를 향해 나아갈 수 있도록 긍정적인 피드백과 격려를 아끼지 않습니다.</p>
<p>- 운동의 효과를 극대화하기 위해 각 개인의 신체적 특성과 목표에 맞는 맞춤형 프로그램을 설계합니다.</p>
<p>- 운동뿐만 아니라 영양 상담과 라이프스타일 코칭을 통해 고객의 전반적인 삶의 질 향상을 목표로 합니다.</p>
<p>- 최신 트렌드와 연구를 반영하여 항상 발전하는 트레이너가 되기 위해 노력합니다.</p>
`);

  const [education, setEducation] = useState(['']);
  const [experience, setExperience] = useState(['']);
  const [certificates, setCertificates] = useState(['']);
  const [awards, setAwards] = useState(['']);
  const [links, setLinks] = useState<LinkData[]>([
    {
      title: '',
      url: '',
    },
  ]);

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
    value: string,
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

  return (
    <div className="flex flex-col mb-20 mt-10">
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

      <div className="flex flex-col mb-20">
        <p className="text-2xl font-bold mb-2">이력서 사진</p>

        <div className="text-xs mb-7 sm:mb-2 p-2 bg-[#EAEAEC] rounded break-keep">
          <p>• 가장 많이 쓰는 이력서 사진 파일의 해상도는 300x400입니다.</p>
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
                  style={{ objectFit: 'cover' }}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                />
              </div>

              <button
                onClick={() => removeResumeImage(0)}
                className="absolute top-2 right-2 bg-[#4C71C0] text-white rounded px-1"
              >
                &times;
              </button>
            </div>
          )}

          {/* 이미 업로드된 로고를 가져오는 경우 */}
          {/* {enterpriseProfile &&
            resumeImage[0]?.length > 0 &&
            currentResumeImage !== '' && (
              <div className="relative w-28 h-20 border-gray-300">
                <div className="relative w-20 h-20">
                  <Image
                    src={currentResumeImage}
                    alt="resume image"
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                  />
                </div>

                <button
                  onClick={() => setCurrentResumeImage('')}
                  className="absolute top-2 right-2 bg-[#4C71C0] text-white rounded px-1"
                >
                  &times;
                </button>
              </div>
            )} */}
        </div>
      </div>

      <div className="flex flex-col mb-20">
        <p className="text-2xl font-bold mb-2">이름</p>

        <input
          type="text"
          onChange={(e) => setName(e.target.value)}
          value={name}
          placeholder="이름을 입력해 주세요"
          className="border p-2 rounded"
        />
      </div>

      <div className="flex flex-col mb-20">
        <p className="text-2xl font-bold mb-2">전화번호</p>

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
            className="border p-2 rounded w-1/6"
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
            className="border p-2 rounded w-1/6"
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
            className="border p-2 rounded w-1/6"
          />
        </div>
      </div>

      <div className="flex flex-col mb-20">
        <p className="text-2xl font-bold mb-2">이메일</p>

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

        <div className="text-xs mb-7 sm:mb-2 p-2 bg-[#EAEAEC] rounded break-keep">
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
            onClick={() => {}}
            className="bg-[#4C71C0] text-white text-sm px-2 py-1 rounded w-fit"
          >
            + 학력 추가
          </button>
        </div>

        <div className="text-xs mb-7 sm:mb-2 p-2 bg-[#EAEAEC] rounded break-keep">
          <p>
            • 최신순으로 작성해 주세요.
            <br />• 최대 10개까지 등록할 수 있어요.
          </p>
        </div>

        <input type="text" />
      </div>

      <div className="flex flex-col mb-20">
        <div className="flex gap-3 items-center mb-2">
          <p className="text-2xl font-bold">경력</p>

          <button
            onClick={() => {}}
            className="bg-[#4C71C0] text-white text-sm px-2 py-1 rounded w-fit"
          >
            + 경력 추가
          </button>
        </div>

        <div className="text-xs mb-7 sm:mb-2 p-2 bg-[#EAEAEC] rounded break-keep">
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

        <input type="text" />
      </div>

      <div className="flex flex-col mb-20">
        <div className="flex gap-3 items-center mb-2">
          <p className="text-2xl font-bold">자격증</p>

          <button
            onClick={() => {}}
            className="bg-[#4C71C0] text-white text-sm px-2 py-1 rounded w-fit"
          >
            + 자격증 추가
          </button>
        </div>

        <div className="text-xs mb-7 sm:mb-2 p-2 bg-[#EAEAEC] rounded break-keep">
          <p>
            • 최신순으로 작성해 주세요.
            <br />• 최대 10개까지 등록할 수 있어요.
          </p>
        </div>

        <input type="text" />
      </div>

      <div className="flex flex-col mb-20">
        <div className="flex gap-3 items-center mb-2">
          <p className="text-2xl font-bold">수상 경력 및 활동</p>

          <button
            onClick={() => {}}
            className="bg-[#4C71C0] text-white text-sm px-2 py-1 rounded w-fit"
          >
            + 추가
          </button>
        </div>

        <div className="text-xs mb-7 sm:mb-2 p-2 bg-[#EAEAEC] rounded break-keep">
          <p>
            • 최신순으로 작성해 주세요.
            <br />• 최대 10개까지 등록할 수 있어요.
          </p>
        </div>

        <input type="text" />
      </div>

      <div className="flex flex-col">
        <div className="flex gap-3 items-center mb-2">
          <p className="text-2xl font-bold">링크</p>

          <button
            onClick={() => addField(setLinks, { title: '', url: '' })}
            className="bg-[#4C71C0] text-white text-sm px-2 py-1 rounded w-fit"
          >
            + 링크 추가
          </button>
        </div>

        <div className="text-xs mb-7 sm:mb-2 p-2 bg-[#EAEAEC] rounded break-keep">
          <p>
            • 자신을 어필할 수 있는 포트폴리오가 있다면 링크도 첨부해 주세요.
            ex)인스타그램, 블로그, 비포애프터 자료 등
            <br />• 최대 10개까지 등록할 수 있어요.
          </p>
        </div>

        {links.map((link, index) => (
          <div key={index} className="flex items-center mb-10 relative sm:mb-2">
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
    </div>
  );
};

export default Resume;
