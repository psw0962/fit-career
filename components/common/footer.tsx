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
          <Image src="/3.svg" alt="logo" width={40} height={40} />

          <p className="text-2xl font-bold">FIT Career</p>
        </div>

        <p className="text-base text-stone-400">
          Email | psw92640962@gmail.com
        </p>

        <div className="flex gap-3 my-2">
          <p className="text-base text-stone-400">개인정보처리방침</p>
          <div className="text-stone-400">|</div>
          <p className="text-base text-stone-400">이용약관</p>
        </div>

        <p className="text-base text-stone-400">
          © 2024 FIT Career ALL RIGHTS RESERVED
        </p>
      </div>
    </div>
  );
};

export default Footer;
