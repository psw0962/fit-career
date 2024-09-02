'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Nav = () => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return (
    <nav className="fixed top-0 w-full shadow bg-white z-10 transition-all duration-300">
      <div
        className={`flex justify-between max-w-7xl mx-auto px-10 ${
          isScrolled ? 'py-3' : 'py-7'
        } transition-all duration-300`}
      >
        <div className="flex gap-24">
          <div
            className="flex gap-2 items-center cursor-pointer"
            onClick={() => router.push('/')}
          >
            <Image src="/3.svg" alt="logo" width={40} height={40} />

            <p className="text-2xl font-bold">FIT Career</p>
          </div>

          <ul className="flex gap-10 items-center">
            <li
              className="text-xl font-bold cursor-pointer"
              onClick={() => router.push('/hiring')}
            >
              채용
            </li>
            <li
              className="text-xl font-bold cursor-pointer"
              onClick={() => router.push('/community')}
            >
              커뮤니티
            </li>
            <li
              className="text-xl font-bold cursor-pointer"
              onClick={() => router.push('/competition')}
            >
              대회정보
            </li>
          </ul>
        </div>

        <div>
          <div
            className="flex gap-10 items-center cursor-pointer"
            onClick={() => router.push('auth')}
          >
            <p className="text-xl font-bold">로그인/회원가입</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
