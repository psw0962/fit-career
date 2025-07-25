'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Footer(): React.ReactElement {
  const router = useRouter();

  return (
    <div className='max-w-full border'>
      <div className='max-w-7xl mx-auto px-3 sm:px-10 py-5'>
        <div className='relative w-28 h-6'>
          <Image
            src='/svg/full-logo.svg'
            alt='full-logo'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            fill
            priority
            style={{ objectFit: 'contain' }}
          />
        </div>

        <div className='flex flex-col gap-0.5 mt-2'>
          <p className='text-sm text-[#000] font-bold'>상호명 | 핏커리어</p>
          <p className='text-sm text-[#000] font-bold'>사업자등록번호 | 831-18-02595</p>
          <p className='text-sm text-[#000] font-bold'>
            주소 | 경기도 김포시 김포한강9로 79, 4층 401-J543호(구래동)
          </p>
          <p className='text-sm text-[#000] font-bold'>대표자 | 박상우</p>
          <p className='text-sm text-[#000] font-bold'>이메일 | psw0962@naver.com</p>
        </div>

        <div className='flex gap-1 items-center mt-4'>
          <p
            className='text-sm text-[#000] font-bold cursor-pointer'
            onClick={() => router.push('/policy/privacy')}
          >
            개인정보 처리방침
          </p>
          <div className='text-[#000]'>|</div>
          <p
            className='text-sm text-[#000] font-bold cursor-pointer'
            onClick={() => router.push('/policy/terms')}
          >
            이용약관
          </p>
        </div>

        <p className='text-sm text-[#000]'>© 2024-2026 FIT Career. All rights reserved.</p>
      </div>
    </div>
  );
}
