'use client';

import { useGetUserData, useSignOut } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import Spinner from './spinner';
import Image from 'next/image';

const NavAuth = ({
  isMobile,
  setIsMobileMenuOpen = () => {},
}: {
  isMobile: boolean;
  setIsMobileMenuOpen: (isMobileMenuOpen: boolean) => void;
}): React.ReactElement => {
  const router = useRouter();

  const { data: userData, isLoading } = useGetUserData();
  const { mutate: logout } = useSignOut();

  return (
    <div className={`${isMobile ? 'flex md:hidden' : 'hidden md:flex'} gap-4`}>
      {isLoading ? (
        <Spinner />
      ) : userData !== undefined && userData ? (
        <div className="flex gap-3 items-center">
          <div
            className="relative w-10 h-10 cursor-pointer"
            onClick={() => {
              router.push('/auth/my-page');
              setIsMobileMenuOpen(false);
            }}
          >
            <Image
              className="rounded-full"
              src={userData.user_metadata?.avatar_url}
              alt="user-avatar"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              fill
              style={{ objectFit: 'cover' }}
              priority
              blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
            />
          </div>

          <div
            className="flex gap-10 items-center cursor-pointer border rounded py-2 px-2"
            onClick={() => {
              logout();
              setIsMobileMenuOpen(false);
            }}
          >
            <p className="text-base font-bold">로그아웃</p>
          </div>
        </div>
      ) : (
        <div
          className="flex gap-10 items-center cursor-pointer border rounded py-2 px-2"
          onClick={() => {
            router.push('/auth');
            setIsMobileMenuOpen(false);
          }}
        >
          <p className="text-base font-bold">로그인/회원가입</p>
        </div>
      )}
    </div>
  );
};

export default NavAuth;
