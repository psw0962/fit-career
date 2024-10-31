'use client';

import Image from 'next/image';
import { useSignInWithKakao } from '@/actions/auth';
import { useGetUserData } from '@/actions/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Auth = () => {
  const router = useRouter();
  const { mutate } = useSignInWithKakao();

  const { data, isLoading } = useGetUserData();

  useEffect(() => {
    if (data) {
      router.push('/');
    }
  }, []);

  return (
    <>
      {isLoading && <div>loading...</div>}

      {data === null && (
        <div className="w-fit m-auto">
          <div className="flex flex-col gap-4 justify-center items-center mt-20">
            <p className="text-3xl font-bold">
              피트니스의 모든 정보, FIT Career
            </p>

            <p className="flex items-center text-center text-[#8F9091] font-bold">
              취업, 이직, 커리어 콘텐츠까지
              <br />
              피트니스 커리어 성장의 모든 것
            </p>
          </div>

          <button
            onClick={() => mutate()}
            className="w-full flex items-center justify-center bg-[#FEE500] text-black font-bold py-2 px-4 mt-10 rounded"
          >
            <Image
              className="mr-1"
              src="/svg/kakao-logo.svg"
              alt="logo"
              width={40}
              height={40}
              style={{ width: 40, height: 40 }}
              priority={true}
            />
            <p>카카오 계정으로 계속하기</p>
          </button>
        </div>
      )}
    </>
  );
};

export default Auth;
