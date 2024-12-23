'use client';

import { useDeleteResume } from '@/actions/resume';
import { ResumeData } from '@/types/resume/resume';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ResumeCard = ({ data }: { data: ResumeData }) => {
  const router = useRouter();

  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const { mutate: deleteResume } = useDeleteResume();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('dropdown');
      const button = document.getElementById('more-button');
      if (
        dropdown &&
        !dropdown.contains(event.target as Node) &&
        button &&
        !button.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.body.addEventListener('click', handleClickOutside);
    return () => {
      document.body.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* fit career resume */}
      {data && data.is_fitcareer_resume && (
        <div className="">
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

            <p>{data.title}</p>

            <p className="text-center text-xs text-[#c3c4c5] break-keep">
              FIT Career 이력서로
              <br />
              서류 합격률 UP!
            </p>

            <div
              id="more-button"
              className="absolute top-[5px] right-[10px] w-[25px] h-[25px] cursor-pointer"
              onClick={(e) => {
                setDropdownOpen((prev) => !prev);
                e.stopPropagation();
              }}
            >
              <Image src="/svg/more.svg" alt="more" fill />
            </div>

            {isDropdownOpen && (
              <div
                id="dropdown"
                className="absolute top-[35px] right-[10px] w-[100px] h-fit px-2 bg-[#fff] border rounded"
              >
                <div
                  className="flex items-center justify-center gap-2 border-b py-2 cursor-pointer"
                  onClick={() =>
                    router.push(`/auth/my-page/resume-edit/${data.id}`)
                  }
                >
                  <p className="text-sm">수정하기</p>

                  <Image
                    src="/svg/edit.svg"
                    alt="edit"
                    width={15}
                    height={15}
                  />
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
        </div>
      )}

      {/* upload resume */}
      {data && !data.is_fitcareer_resume && (
        <div className="">
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

            <p>{data.title}</p>

            <div
              id="more-button"
              className="absolute top-[5px] right-[10px] w-[25px] h-[25px] cursor-pointer"
              onClick={(e) => {
                setDropdownOpen((prev) => !prev);
                e.stopPropagation();
              }}
            >
              <Image src="/svg/more.svg" alt="more" fill />
            </div>

            {isDropdownOpen && (
              <div
                id="dropdown"
                className="absolute top-[35px] right-[10px] w-[100px] h-fit px-2 bg-[#fff] border rounded"
              >
                <div className="flex items-center justify-center gap-2 py-2">
                  <p className="text-sm">다운로드</p>
                  <Image
                    src="/svg/download.svg"
                    alt="download"
                    width={15}
                    height={15}
                  />
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
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ResumeCard;
