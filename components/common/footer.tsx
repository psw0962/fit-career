'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Footer = () => {
  const router = useRouter();
  return (
    <div className="max-w-full border">
      <div className="max-w-7xl mx-auto px-10 py-10">
        <div
          className="flex gap-2 items-center my-5 cursor-pointer"
          onClick={() => router.push('/')}
        >
          <div className="relative w-10 h-10">
            <Image src="/logo.svg" alt="logo" fill priority />
          </div>

          <p className="text-2xl font-bold">FIT Career</p>
        </div>

        <p className="text-base text-stone-400">
          Email | psw92640962@gmail.com
        </p>

        <div className="flex gap-3 my-2">
          <p className="text-base text-stone-400">개인정보 처리방침</p>
          <div className="text-stone-400">|</div>
          <p className="text-base text-stone-400">이용약관</p>
        </div>

        <p className="text-base text-stone-400">
          © 2024 FIT Career. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
