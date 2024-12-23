'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

const NotFound = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center mt-10 border rounded p-10 sm:p-20">
      <div className="relative w-20 h-20">
        <Image
          src="/svg/logo.svg"
          alt="enterprise logo"
          fill
          style={{ objectFit: 'cover' }}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
        />
      </div>

      <div className="flex flex-col gap-2 justify-center items-center mt-5">
        <p className="text-center text-lg sm:text-2xl font-bold">
          피트니스의 모든 정보, FIT Career
        </p>

        <p className="flex items-center text-center text-[#8F9091] font-bold">
          취업, 이직, 커리어 콘텐츠까지
          <br />
          피트니스 커리어 성장의 모든 것
        </p>
      </div>

      <div className="w-full border my-10"></div>

      <div className="w-full flex flex-col gap-2 justify-center items-center">
        <p className="text-center text-lg sm:text-2xl font-bold break-keep">
          요청하신 페이지를 찾을 수 없습니다.
        </p>

        <p className="text-center font-bold text-sm sm:text-base text-[#8F9091] break-keep">
          요청 하신 페이지는 삭제되었거나
          <br />
          주소가 변경되었을 수 있습니다.
          <br />
          확인 후 다시 시도해주세요.
        </p>

        <div className="flex flex-col items-center justify-center gap-2 mt-5 sm:flex-row">
          <p
            className="w-[150px] text-center text-base font-bold border rounded px-6 py-2 cursor-pointer"
            onClick={() => router.back()}
          >
            이전 페이지로
          </p>

          <p
            className="w-[150px] text-center text-base font-bold rounded px-6 py-2 bg-[#4C71C0] text-white cursor-pointer"
            onClick={() => router.push('/')}
          >
            홈으로
          </p>
        </div>
      </div>

      {/* <div className="w-full flex flex-col gap-2 justify-center items-center border rounded p-10 sm:p-20 mt-10">
        <p className="text-center text-lg sm:text-2xl font-bold break-keep">
          요청하신 페이지를 찾을 수 없습니다.
        </p>

        <p className="text-center text-sm sm:text-base text-[#8F9091] break-keep">
          요청 하신 페이지가 삭제되었거나
          <br />
          주소가 변경되었을 수 있습니다.
          <br />
          확인 후 다시 시도해주세요.
        </p>

        <div className="flex flex-col items-center justify-center gap-2 mt-5 sm:flex-row">
          <p
            className="w-[150px] text-center text-base font-bold border rounded px-6 py-2 cursor-pointer"
            onClick={() => router.back()}
          >
            이전 페이지로
          </p>

          <p
            className="w-[150px] text-center text-base font-bold rounded px-6 py-2 bg-[#4C71C0] text-white cursor-pointer"
            onClick={() => router.push('/')}
          >
            홈으로
          </p>
        </div>
      </div> */}
    </div>
  );
};

export default NotFound;
