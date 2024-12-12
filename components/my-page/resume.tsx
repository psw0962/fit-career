'use client';

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
    setter((prev) => [...prev, defaultItem]);
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
      <div className="flex flex-col">
        <p>이력서 사진</p>

        <input type="text" />
      </div>

      <div className="flex flex-col">
        <p>이름</p>

        <input type="text" />
      </div>

      <div className="flex flex-col">
        <p>전화번호</p>

        <input type="text" />
      </div>

      <div className="flex flex-col">
        <p>이메일</p>

        <input type="text" />
      </div>

      <div className="flex flex-col">
        <p>간단 소개</p>
        <p>
          • 본인의 업무 경험을 기반으로 핵심 역량과 업무 스킬을 간단히 작성해
          주세요.
        </p>
        <p>• 3~5줄로 요약하여 작성하는 것을 추천합니다.</p>
        <p>
          • 자신을 어필할 수 있는 포트폴리오가 있다면 링크도 첨부해 주세요.
          ex)인스타그램, 블로그, 비포애프터 자료 등
        </p>

        <input type="text" />
      </div>

      <div className="flex flex-col">
        <p>링크</p>
        <p>• 자신을 어필할 수 있는 포트폴리오가 있다면 링크도 첨부해 주세요.</p>
        {links.map((link, index) => (
          <div key={index} className="flex items-center mb-2">
            <div className="flex space-x-2 flex-grow">
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
                className="w-[20%] p-2 border rounded"
              />
              <input
                type="text"
                placeholder="URL"
                value={link.url}
                onChange={(e) =>
                  updateField<LinkData>(index, 'url', e.target.value, setLinks)
                }
                className="w-[80%] p-2 border rounded"
              />
            </div>

            {links.length > 1 && (
              <button
                onClick={() => removeField(index, setLinks)}
                className="bg-red-500 text-white px-3 py-2 rounded ml-2"
              >
                삭제
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => addField(setLinks, { title: '', url: '' })}
          className="bg-blue-500 text-white px-4 py-2 rounded w-fit mt-2"
        >
          + 링크 추가
        </button>
      </div>

      <div className="flex flex-col">
        <p>학력</p>
        <p>• 최신순으로 작성해 주세요.</p>

        <input type="text" />
      </div>

      <div className="flex flex-col">
        <p>경력</p>
        <p>
          • 담당하신 업무 중 우선순위가 높은 업무를 선별하여 최신순으로 작성해
          주세요. <br />• 신입의 경우, 직무와 관련된 대외활동, 인턴, 계약직 경력
          등이 있다면 작성해주세요. <br />• 업무 또는 활동 시 담당했던 역할과
          과정, 성과에 대해 자세히 작성해 주세요. <br />• 업무 성과는 되도록
          구체적인 숫자 혹은 %로 표현해 주세요. <br />• 커리어 조회 후 기업명이
          실제와 다른 경우, 부서명/직책 란에 원하시는 기업명을 작성해 주세요.
        </p>

        <input type="text" />
      </div>

      <div className="flex flex-col">
        <p>자격증</p>
        <p>• 최신순으로 작성해 주세요.</p>

        <input type="text" />
      </div>

      <div className="flex flex-col">
        <p>수상 경력 및 활동</p>
        <p>• 최신순으로 작성해 주세요.</p>

        <input type="text" />
      </div>
    </div>
  );
};

export default Resume;
