'use client';

import Image from 'next/image';
import { useState } from 'react';

interface LinkData {
  title: string;
  url: string;
}

const Resume = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [introduction, setIntroduction] = useState('');

  const [links, setLinks] = useState<LinkData[]>([
    {
      title: '',
      url: '',
    },
  ]);
  const [education, setEducation] = useState(['']);
  const [experience, setExperience] = useState(['']);
  const [certificates, setCertificates] = useState(['']);
  const [awards, setAwards] = useState(['']);

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
        <p className="text-2xl font-bold">이력서 사진</p>

        <input type="text" />
      </div>

      <div className="flex flex-col mb-20">
        <p className="text-2xl font-bold">이름</p>

        <input type="text" />
      </div>

      <div className="flex flex-col mb-20">
        <p className="text-2xl font-bold">전화번호</p>

        <input type="text" />
      </div>

      <div className="flex flex-col mb-20">
        <p className="text-2xl font-bold">이메일</p>

        <input type="text" />
      </div>

      <div className="flex flex-col mb-20">
        <p className="text-2xl font-bold mb-2">간단 소개</p>

        <div className="text-xs mb-7 sm:mb-2 p-2 bg-[#EAEAEC] rounded break-keep">
          <p>
            • 본인의 업무 경험을 기반으로 핵심 역량과 업무 스킬을 간단히 작성해
            주세요.
          </p>
          <p>• 3~5줄로 요약하여 작성하는 것을 해요.</p>
        </div>

        <input type="text" />
      </div>

      <div className="flex flex-col mb-20">
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
          <p>
            • 담당하신 업무 중 우선순위가 높은 업무를 선별하여 최신순으로 작성해
            주세요. <br />• 신입의 경우, 직무와 관련된 대외활동, 인턴, 계약직
            경력 등이 있다면 작성해주세요. <br />• 업무 또는 활동 시 담당했던
            역할과 과정, 성과에 대해 자세히 작성해 주세요. <br />• 업무 성과는
            되도록 구체적인 숫자 혹은 %로 표현해 주세요.
            <br />• 최대 10개까지 등록할 수 있어요.
          </p>
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

      <div className="flex flex-col">
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
    </div>
  );
};

export default Resume;
