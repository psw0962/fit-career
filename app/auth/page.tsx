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
  const { mutate } = useSignInWithKakao();
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
          className: 'bg-[#4C71C0] text-white rounded',
        });
      }, 100);
    }

    if (message === 'enterprise_profile_required') {
      setTimeout(() => {
        toast({
          title: '기업 프로필을 먼저 등록해주세요.',
          description:
            '해당 서비스를 이용하기 위해서는 기업 프로필을 먼저 등록해주세요.',
          className: 'bg-[#4C71C0] text-white rounded',
        });
      }, 100);
    }
  }, [searchParams, toast]);

  if (isLoading) return <GlobalSpinner />;

  return (
    <div className="w-fit m-auto">
      <div className="flex flex-col gap-4 justify-center items-center mt-20">
        <p className="text-center text-3xl font-bold">
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
        <div className="relative w-10 h-10 mr-1">
          <Image
            src="/svg/kakao-logo.svg"
            alt="kakao-logo"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>

        <p>카카오 계정으로 계속하기</p>
      </button>
    </div>
  );
};

export default Auth;
