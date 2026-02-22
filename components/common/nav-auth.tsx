'use client';

import { useGetUserData, useSignOut } from '@/api/auth';
import Spinner from './spinner';
import Image from 'next/image';
import Link from 'next/link';

export default function NavAuth({
  isMobile,
  setIsMobileMenuOpen = () => {},
}: {
  isMobile: boolean;
  setIsMobileMenuOpen: (isMobileMenuOpen: boolean) => void;
}): React.ReactElement {
  const { data: userData, isLoading } = useGetUserData();
  const { mutate: logout } = useSignOut();

  return (
    <div className={`${isMobile ? 'flex md:hidden' : 'hidden md:flex'} gap-4`}>
      {isLoading ? (
        <Spinner width='16px' height='16px' />
      ) : userData !== undefined && userData ? (
        <div className='flex gap-2 items-center'>
          <Link href='/auth/my-page'>
            <div
              className='flex items-center gap-1 cursor-pointer bg-[#4C71C0] text-white rounded py-1.5 px-2'
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className='relative w-4 h-4'>
                <Image
                  className='rounded-full'
                  src={'/svg/person.svg'}
                  alt='my-page'
                  sizes='16px'
                  fill
                  priority
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <p className='text-xs font-bold'>마이페이지</p>
            </div>
          </Link>

          <div
            className='flex gap-1 items-center cursor-pointer border rounded py-1.5 px-2'
            onClick={() => {
              logout();
              setIsMobileMenuOpen(false);
            }}
          >
            <div className='relative w-4 h-4'>
              <Image
                className='rounded-full'
                src={'/svg/logout.svg'}
                alt='logout'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                fill
                priority
                style={{ objectFit: 'cover' }}
                blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=='
              />
            </div>

            <p className='text-xs font-bold'>로그아웃</p>
          </div>
        </div>
      ) : (
        <Link href='/auth' passHref>
          <div
            className='flex gap-10 items-center cursor-pointer border rounded py-2 px-2'
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <p className='text-xs font-bold'>로그인/회원가입</p>
          </div>
        </Link>
      )}
    </div>
  );
}
