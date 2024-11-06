'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useGetUserData, useSignOut } from '@/actions/auth';

const Nav = () => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  const { data, isLoading } = useGetUserData();
  const { mutate: logout } = useSignOut();

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
            <div className="relative w-10 h-10">
              <Image src="/logo.svg" alt="logo" fill priority />
            </div>

            <p className="text-2xl font-bold">FIT Career</p>
          </div>

          <ul className="flex gap-10 items-center">
            <li
              className="text-xl font-bold cursor-pointer"
              onClick={() => router.push('/hiring')}
            >
              채용정보
            </li>

            {/* <li
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
            </li> */}
          </ul>
        </div>

        <div className="flex gap-4">
          {isLoading ? (
            <div className="text-xl font-bold">로딩 중...</div>
          ) : (
            <>
              {data ? (
                <>
                  <div
                    className="flex gap-10 items-center cursor-pointer"
                    onClick={() => router.push('/auth/my-page')}
                  >
                    <p className="text-xl font-bold">마이페이지</p>
                  </div>
                  <div
                    className="flex gap-10 items-center cursor-pointer"
                    onClick={() => logout()}
                  >
                    <p className="text-xl font-bold">로그아웃</p>
                  </div>
                </>
              ) : (
                <div
                  className="flex gap-10 items-center cursor-pointer"
                  onClick={() => router.push('/auth')}
                >
                  <p className="text-xl font-bold">로그인/회원가입</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
