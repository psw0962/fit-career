'use client';

import { useGetUserData, useSignOut } from '@/actions/auth';
import Spinner from './spinner';
import Image from 'next/image';
import Link from 'next/link';

const NavAuth = ({
  isMobile,
  setIsMobileMenuOpen = () => {},
}: {
  isMobile: boolean;
  setIsMobileMenuOpen: (isMobileMenuOpen: boolean) => void;
}): React.ReactElement => {
  const { data: userData, isLoading } = useGetUserData();
  const { mutate: logout } = useSignOut();

  return (
    <div className={`${isMobile ? 'flex md:hidden' : 'hidden md:flex'} gap-4`}>
      {isLoading ? (
        <Spinner />
      ) : userData !== undefined && userData ? (
        <div className="flex gap-3 items-center">
          <Link href="/auth/my-page" passHref>
            <div
              className="relative w-8 h-8 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Image
                className="rounded-full"
                src={
                  userData.user_metadata?.avatar_url
                    ? userData.user_metadata?.avatar_url
                    : '/svg/logo.svg'
                }
                alt="user-avatar"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                fill
                style={{ objectFit: 'cover' }}
                priority
                blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
              />
            </div>
          </Link>

          <div
            className="flex gap-10 items-center cursor-pointer border rounded py-2 px-2"
            onClick={() => {
              logout();
              setIsMobileMenuOpen(false);
            }}
          >
            <p className="text-xs font-bold">로그아웃</p>
          </div>
        </div>
      ) : (
        <Link href="/auth" passHref>
          <div
            className="flex gap-10 items-center cursor-pointer border rounded py-2 px-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <p className="text-xs font-bold">로그인/회원가입</p>
          </div>
        </Link>
      )}
    </div>
  );
};

export default NavAuth;
