'use client';

import { useGetUserData } from '@/actions/auth';
import Image from 'next/image';
import GlobalSpinner from '@/components/common/global-spinner';

const Profile = (): React.ReactElement => {
  const { data, isLoading } = useGetUserData();

  if (isLoading || !data) {
    return <GlobalSpinner />;
  }

  return (
    <div className="mt-10">
      <div className="flex gap-3 items-center">
        <div className="relative w-20 h-20">
          <Image
            className="rounded-full"
            src={data.user_metadata?.avatar_url}
            alt="logo"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            fill
            priority
            blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
          />
        </div>

        <div className="flex-col">
          <p className="text-xl">{data.user_metadata?.name}</p>
          <p className="text-xl">{data.user_metadata?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
