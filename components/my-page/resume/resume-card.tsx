'use client';

import { useDeleteResume } from '@/actions/resume';
import { ResumeData } from '@/types/resume/resume';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ResumeCard = ({ data }: { data: ResumeData }) => {
  const router = useRouter();

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const { mutate: deleteResume } = useDeleteResume();

  const decodeBase64Unicode = (str: string): string => {
    return decodeURIComponent(atob(str));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById(`dropdown-${data.id}`);
      const button = document.getElementById(`more-button-${data.id}`);
      if (
        dropdown &&
        !dropdown.contains(event.target as Node) &&
        button &&
        !button.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
      }
    };

    document.body.addEventListener('click', handleClickOutside);
    return () => {
      document.body.removeEventListener('click', handleClickOutside);
    };
  }, [data.id]);

  console.log(decodeBase64Unicode(data.title));

  return (
    <>
      {/* fit career resume */}
      {data && data.is_fitcareer_resume && (
        <div className="relative flex flex-col justify-center items-center gap-3 w-full h-full border rounded p-10">
          <div className="relative w-10 h-10">
            <Image
              src="/svg/logo.svg"
              alt="logo"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              fill
              style={{ objectFit: 'cover' }}
              priority
              blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
            />
          </div>

          <p className="">
            {data.title.length > 15
              ? `${data.title.slice(0, 15)}...`
              : data.title}
          </p>

          <p className="text-center text-xs text-[#c3c4c5] break-keep">
            FIT Career 이력서로
            <br />
            서류 합격률 UP!
          </p>

          <div
            id={`more-button-${data.id}`}
            className="absolute top-[5px] right-[10px] w-[25px] h-[25px] cursor-pointer"
            onClick={(e) => {
              setOpenDropdownId((prev) => {
                const newId = data.id ?? null;
                return prev === newId ? null : newId;
              });
            }}
          >
            <Image src="/svg/more.svg" alt="more" fill />
          </div>

          {openDropdownId === data.id && (
            <div
              id={`dropdown-${data.id}`}
              className="absolute top-[35px] right-[10px] w-[100px] h-fit px-2 bg-[#fff] border rounded"
            >
              <div
                className="flex items-center justify-center gap-2 border-b py-2 cursor-pointer"
                onClick={() =>
                  router.push(`/auth/my-page/resume-edit/${data.id}`)
                }
              >
                <p className="text-sm">수정하기</p>

                <Image src="/svg/edit.svg" alt="edit" width={15} height={15} />
              </div>

              <div
                className="flex items-center justify-center gap-2 border-b py-2 cursor-pointer"
                onClick={() => {
                  if (window.confirm('정말로 이력서를 삭제하시겠습니까?')) {
                    data.id && deleteResume(data.id);
                  }
                }}
              >
                <p className="text-sm">삭제하기</p>

                <Image
                  src="/svg/delete.svg"
                  alt="delete"
                  width={15}
                  height={15}
                />
              </div>

              <div className="flex items-center justify-center gap-2 py-2">
                <p className="text-sm">다운로드</p>
                <Image
                  src="/svg/download.svg"
                  alt="download"
                  width={15}
                  height={15}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* upload resume */}
      {data && !data.is_fitcareer_resume && (
        <div className="relative flex flex-col justify-center items-center gap-3 w-full h-full border rounded p-10">
          <div className="relative w-10 h-10">
            <Image
              src="/svg/document.svg"
              alt="document"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              fill
              style={{ objectFit: 'cover' }}
              priority
              blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
            />
          </div>

          <p className="">
            {decodeBase64Unicode(data.title).split('.')[0].length > 15
              ? `${decodeBase64Unicode(data.title).slice(0, 15)}...${decodeBase64Unicode(data.title).split('.')[1]}`
              : `${decodeBase64Unicode(data.title).split('.')[0]}.${decodeBase64Unicode(data.title).split('.')[1]}`}
          </p>

          <div
            id={`more-button-${data.id}`}
            className="absolute top-[5px] right-[10px] w-[25px] h-[25px] cursor-pointer"
            onClick={(e) => {
              setOpenDropdownId((prev) => {
                const newId = data.id ?? null;
                return prev === newId ? null : newId;
              });
              e.stopPropagation();
            }}
          >
            <Image src="/svg/more.svg" alt="more" fill />
          </div>

          {openDropdownId === data.id && (
            <div
              id={`dropdown-${data.id}`}
              className="absolute top-[35px] right-[10px] w-[100px] h-fit px-2 bg-[#fff] border rounded"
            >
              <a
                className="flex items-center justify-center gap-2 py-2"
                href={data.upload_resume}
                download={decodeBase64Unicode(data.title)}
              >
                <p className="text-sm">다운로드</p>
                <Image
                  src="/svg/download.svg"
                  alt="download"
                  width={15}
                  height={15}
                />
              </a>

              <div
                className="flex items-center justify-center gap-2 border-b py-2 cursor-pointer"
                onClick={() => {
                  if (window.confirm('이력서를 삭제하시겠습니까?')) {
                    data.id && deleteResume(data.id);
                  }
                }}
              >
                <p className="text-sm">삭제하기</p>

                <Image
                  src="/svg/delete.svg"
                  alt="delete"
                  width={15}
                  height={15}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ResumeCard;
