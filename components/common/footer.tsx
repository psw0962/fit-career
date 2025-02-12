'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Footer(): React.ReactElement {
  const router = useRouter();

  return (
    <div className="max-w-full border">
      <div className="max-w-7xl mx-auto px-3 sm:px-10 py-5">
        <div className="relative w-28 h-6">
          <Image
            src="/svg/full-logo.svg"
            alt="full-logo"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>

        <p className="text-sm text-[#000] font-bold mt-2">
          문의 | psw0962@naver.com
        </p>

        <div className="flex gap-1 items-center mt-4">
          <p
            className="text-sm text-[#000] font-bold cursor-pointer"
            onClick={() => router.push('/policy/privacy')}
          >
            개인정보 처리방침
          </p>
          <div className="text-[#000]">|</div>
          <p
            className="text-sm text-[#000] font-bold cursor-pointer"
            onClick={() => router.push('/policy/terms')}
          >
            이용약관
          </p>
        </div>

        <p className="text-sm text-[#000]">
          © 2024-2025 FIT Career. All rights reserved.
        </p>
      </div>
    </div>
  );
}
