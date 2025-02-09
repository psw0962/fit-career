'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import NavAuth from './nav-auth';
import Link from 'next/link';

const MENU_LIST = [
  { id: 1, name: '채용정보', title: '핏커리어 채용정보', path: '/' },
  { id: 2, name: '공지사항', title: '핏커리어 공지사항', path: '/notice' },
];

export default function Nav() {
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
    <nav
      className={`overflow-x-auto fixed top-0 w-full shadow bg-white transition-all duration-300 z-30`}
    >
      <div
        className={`min-w-[350px] flex justify-between max-w-7xl mx-auto px-3 sm:px-10 py-3`}
      >
        {/* desktop */}
        <div className="flex gap-24">
          <Link
            href="/"
            passHref
            className="flex items-center"
            onClick={(e: React.MouseEvent) => {
              if (e.ctrlKey || e.metaKey || e.button === 1) return;

              e.preventDefault();
              setIsMobileMenuOpen(false);
              window.location.href = '/';
            }}
          >
            <div className="relative w-28 h-6 cursor-pointer">
              <Image
                src="/svg/full-logo.svg"
                alt="full-logo"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                fill
                style={{ objectFit: 'contain' }}
                priority
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                quality={75}
              />
            </div>
          </Link>

          <ul className="hidden md:flex gap-10 items-center">
            {MENU_LIST.map((menu) => (
              <li key={menu.id} className="text-lg font-bold">
                <Link href={menu.path} title={menu.title} passHref>
                  <span className="text-base cursor-pointer">{menu.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* mobile */}
        <div className="flex md:hidden items-center">
          {!isMobileMenuOpen && (
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Image src="/svg/menu.svg" alt="menu" width={20} height={20} />
            </button>
          )}

          {isMobileMenuOpen && (
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Image src="/svg/close.svg" alt="close" width={20} height={20} />
            </button>
          )}
        </div>

        <div
          className={`overflow-x-auto fixed inset-0 px-3 bg-[#fff] top-12 z-40 transition-all duration-300 ${
            isMobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
          }`}
        >
          <div className="min-w-[350px] pt-4">
            <ul
              className={`flex flex-col md:flex-row ${isMobileMenuOpen ? 'gap-5' : 'gap-10'}`}
            >
              {MENU_LIST.map((menu) => (
                <li key={menu.id} className="text-base font-bold">
                  <Link href={menu.path} title={menu.title} passHref>
                    <span
                      className="cursor-pointer"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {menu.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="border-t-2 my-4"></div>

            <div className="flex justify-end">
              <NavAuth
                isMobile={true}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
              />
            </div>
          </div>
        </div>

        {/* auth */}
        <NavAuth isMobile={false} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      </div>
    </nav>
  );
}
