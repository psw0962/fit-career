'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

const dummyData = [
  { id: 1, title: '채용제목', desc: '채용내용', location: '지역/경력' },
  { id: 2, title: '채용제목', desc: '채용내용', location: '지역/경력' },
  { id: 3, title: '채용제목', desc: '채용내용', location: '지역/경력' },
  { id: 4, title: '채용제목', desc: '채용내용', location: '지역/경력' },
  { id: 5, title: '채용제목', desc: '채용내용', location: '지역/경력' },
];

const Hiring = () => {
  const router = useRouter();

  return (
    <div>
      <p className="text-3xl font-bold mb-4 underline underline-offset-4 decoration-[#4C71C0]">
        채용정보
      </p>

      <div className="flex gap-2 mt-10">
        <select name="pets" id="pet-select1">
          <option value="">지역선택</option>
          <option value="dog">Dog</option>
        </select>

        <select name="pets" id="pet-select2">
          <option value="">직무선택</option>
          <option value="dog">Dog</option>
        </select>

        <select name="pets" id="pet-select3">
          <option value="">경력선택</option>
          <option value="dog">Dog</option>
        </select>
      </div>

      <div className="flex gap-2 p-5 mt-5 border-solid border-2 border-[#000] rounded-xl">
        <div className="flex items-center gap-1 px-3 bg-[#4C71C0] text-[#fff] rounded-xl">
          <p className="p-1">필터1</p>
          <div>x</div>
        </div>

        <div className="flex items-center gap-1 px-3 bg-[#4C71C0] text-[#fff] rounded-xl">
          <p className="p-1">필터2</p>
          <div>x</div>
        </div>

        <div className="flex items-center gap-1 px-3 bg-[#4C71C0] text-[#fff] rounded-xl">
          <p className="p-1">필터3</p>
          <div>x</div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 mt-20">
        {dummyData.map((x: any) => {
          return (
            <div
              key={x.id}
              className="flex flex-col gap-2 p-10 shadow-md rounded-xl cursor-pointer"
              onClick={() => {
                router.push(`/hiring/${x.id}`);
              }}
            >
              <Image
                src="/3.svg"
                alt="logo"
                width={40}
                height={40}
                className="mx-auto mb-4"
              />
              <p>{x.title}</p>
              <p>{x.desc}</p>
              <p>{x.location}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Hiring;
