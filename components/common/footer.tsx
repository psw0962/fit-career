'use client';

import Image from 'next/image';

const Footer = (): React.ReactElement => {
  return (
    <div className="max-w-full border">
      <div className="max-w-7xl mx-auto px-3 sm:px-10 py-5">
        <div className="flex gap-2 items-center">
          <div className="relative w-32 h-6">
            <Image
              src="/svg/full-logo.svg"
              alt="full-logo"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </div>

        <p className="text-sm text-stone-400 mt-2">
          Email | psw92640962@gmail.com
        </p>

        <div className="flex gap-3 mt-3">
          <p className="text-sm text-stone-400">개인정보 처리방침</p>
          <div className="text-stone-400">|</div>
          <p className="text-sm text-stone-400">이용약관</p>
        </div>

        <p className="text-sm text-stone-400 mt-1">
          © 2024-2025 FIT Career. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
