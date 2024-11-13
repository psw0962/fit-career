'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useGetUserData, useSignOut } from '@/actions/auth';
import GlobalSpinner from './global-spinner';

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
              <Image
                src="/logo.svg"
                alt="logo"
                fill
                priority
                blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
              />
            </div>

            <p className="text-2xl font-bold">FIT Career</p>
          </div>

          <ul className="flex gap-10 items-center">
            <li
              className="text-lg font-bold cursor-pointer"
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
            <GlobalSpinner />
          ) : (
            <>
              {data ? (
                <div className="flex gap-3 items-center">
                  <div className="relative w-10 h-10">
                    <Image
                      className="rounded-full cursor-pointer"
                      onClick={() => router.push('/auth/my-page')}
                      src="/logo.svg"
                      alt="avatar"
                      fill
                      priority
                      blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                    />
                  </div>

                  <div
                    className="flex gap-10 items-center cursor-pointer border rounded py-2 px-2"
                    onClick={() => logout()}
                  >
                    <p className="text-base font-bold">로그아웃</p>
                  </div>
                </div>
              ) : (
                <div
                  className="flex gap-10 items-center cursor-pointer border rounded py-2 px-2"
                  onClick={() => router.push('/auth')}
                >
                  <p className="text-base font-bold">로그인/회원가입</p>
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
