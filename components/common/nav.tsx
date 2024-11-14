'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useGetUserData, useSignOut } from '@/actions/auth';
import GlobalSpinner from './global-spinner';
import MobileNav from './mobile-nav';

const Nav = () => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    if (!isLoading && data === null) {
      router.push('/auth');
    }
  }, [data, isLoading, router]);

  console.log(data);

  if (isLoading) return <GlobalSpinner />;

  return (
    <nav className="fixed top-0 w-full shadow bg-white z-10 transition-all duration-300">
      {/* desktop */}
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
            <div className="relative w-10 h-10 ">
              <Image
                className="rounded-full"
                src="/logo.svg"
                alt="logo"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                fill
                priority
                blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
              />
            </div>

            <p className="text-2xl font-bold">FIT Career</p>
          </div>

          <ul className="hidden md:flex gap-10 items-center">
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

        <div className="hidden md:flex gap-4">
          {data ? (
            <div className="flex gap-3 items-center">
              <div
                className="relative w-10 h-10 cursor-pointer"
                onClick={() => router.push('/auth/my-page')}
              >
                <Image
                  className="rounded-full"
                  src={data.user_metadata?.avatar_url}
                  alt="user-avatar"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
        </div>

        {/* mobile */}
        <div className="flex md:hidden items-center">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Image src="/menu.svg" alt="menu" width={35} height={35} />
          </button>
        </div>

        {isMobileMenuOpen && <MobileNav />}
      </div>
    </nav>
  );
};

export default Nav;
