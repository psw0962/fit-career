'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NavAuth from './nav-auth';

const MENU_LIST = [
  { id: 1, name: '채용정보', path: '/hiring' },
  { id: 2, name: '커뮤니티', path: '/community' },
  { id: 3, name: '대회정보', path: '/competition' },
];

const Nav = (): React.ReactElement => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
                className=""
                src="/svg/logo.svg"
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
            {MENU_LIST.map((menu) => (
              <li
                key={menu.id}
                className="text-lg font-bold cursor-pointer"
                onClick={() => router.push(`${menu.path}`)}
              >
                {menu.name}
              </li>
            ))}
          </ul>
        </div>

        {/* mobile */}
        <div className="flex md:hidden items-center">
          {!isMobileMenuOpen && (
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Image src="/svg/menu.svg" alt="menu" width={35} height={35} />
            </button>
          )}

          {isMobileMenuOpen && (
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Image src="/svg/close.svg" alt="close" width={35} height={35} />
            </button>
          )}
        </div>

        <div
          className={`fixed inset-0 px-6 top-24 bg-white z-40 transition-all duration-300 ${
            isMobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
          }`}
        >
          <ul className="md:flex gap-10">
            {MENU_LIST.map((menu) => (
              <li
                key={menu.id}
                className="p-4 text-lg font-bold cursor-pointer"
                onClick={() => {
                  router.push(`${menu.path}`);
                  setIsMobileMenuOpen(false);
                }}
              >
                {menu.name}
              </li>
            ))}
          </ul>

          <div className="border-t-2 p-4 flex justify-end">
            <NavAuth isMobile={true} />
          </div>
        </div>

        {/* auth */}
        <NavAuth isMobile={false} />
      </div>
    </nav>
  );
};

export default Nav;
