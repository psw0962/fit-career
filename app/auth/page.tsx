'use client';

import Image from 'next/image';
import { useSignInWithKakao } from '@/actions/auth';
import { useGetUserData } from '@/actions/auth';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GlobalSpinner from '@/components/common/global-spinner';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { toast } = useToast();
  const { mutate, isPending } = useSignInWithKakao();
  const { data, isLoading } = useGetUserData();

  useEffect(() => {
    if (data) {
      router.push('/');
    }
  }, [data]);

  useEffect(() => {
    const message = searchParams.get('message');

    if (message === 'login_required') {
      setTimeout(() => {
        toast({
          title: '로그인이 필요합니다.',
          description: '해당 서비스를 이용하기 위해서는 로그인이 필요합니다.',
          variant: 'default',
        });
      }, 100);
    }

    if (message === 'enterprise_profile_required') {
      setTimeout(() => {
        toast({
          title: '기업 프로필을 먼저 등록해주세요.',
          description:
            '해당 서비스를 이용하기 위해서는 기업 프로필을 먼저 등록해주세요.',
          variant: 'default',
        });
      }, 100);
    }
  }, [searchParams, toast]);

  if (isPending || isLoading) return <GlobalSpinner />;

  return (
    <div className="w-full mx-auto min-h-[50vh] flex flex-col justify-center">
      <div className="flex flex-col gap-2 justify-center items-center">
        <p className="text-center text-2xl font-bold break-keep">
          피트니스의 모든 정보, FIT Career
        </p>

        <p className="flex items-center text-base text-center text-[#8F9091] font-bold break-keep">
          취업, 이직, 커리어 콘텐츠까지
          <br />
          피트니스 커리어 성장의 모든 것
        </p>
      </div>

      <div className="w-full flex justify-center ">
        <div
          className="w-[250px] flex items-center justify-center bg-[#FEE500] text-black font-bold py-2 px-4 mt-5 rounded cursor-pointer"
          onClick={() => {
            mutate();
          }}
        >
          <div className="relative w-8 h-8 mr-1">
            <Image
              src="/svg/kakao-logo.svg"
              alt="kakao-logo"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>

          <p className="text-sm sm:text-base">카카오 로그인</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
