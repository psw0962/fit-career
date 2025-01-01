'use client';

import Image from 'next/image';
import GlobalSpinner from '../common/global-spinner';
import { useGetEnterpriseProfile, useGetUserData } from '@/actions/auth';
import { calculateYearsInBusiness } from '@/functions/calculateYearsInBusiness';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const EnterpriseProfile = () => {
  const router = useRouter();
  const { data: userData } = useGetUserData();
  const { data: enterpriseProfile, isLoading: enterpriseProfileLoading } =
    useGetEnterpriseProfile(userData?.id ?? '');

  if (enterpriseProfileLoading || !enterpriseProfile) {
    return <GlobalSpinner />;
  }

  return (
    <div className="mt-5">
      {enterpriseProfile.length > 0 && (
        <>
          <div className="flex flex-col gap-2 items-start sm:flex-row sm:items-center">
            <div className="relative w-20 h-20">
              <Image
                src={
                  enterpriseProfile[0]?.logo?.[0]
                    ? enterpriseProfile[0]?.logo?.[0]
                    : '/svg/logo.svg'
                }
                alt="enterprise logo"
                fill
                style={{ objectFit: 'cover' }}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
              />
            </div>

            <div className="flex flex-col">
              <p className="text-xl">
                {enterpriseProfile[0]?.name}
                <Link href="/auth/my-page/enterprise-profile-edit" passHref>
                  <span className="text-sm ml-2 font-bold text-[#C3C4C5] underline underline-offset-4 decoration-[#C3C4C5] cursor-pointer">
                    {`수정하기`}
                  </span>
                </Link>
              </p>

              <div className="flex flex-col gap-1 mt-2 sm:flex-row">
                <p>∙ {enterpriseProfile[0]?.industry}</p>
                <p>
                  ∙{' '}
                  {enterpriseProfile[0]?.address
                    .split(' ')
                    .slice(1, 3)
                    .join(' ')}
                </p>
                <p>
                  ∙{' '}
                  {calculateYearsInBusiness(
                    enterpriseProfile[0]?.establishment
                  )}
                  년차 (
                  {parseInt(
                    enterpriseProfile[0]?.establishment.split('-')[0],
                    10
                  )}
                  )
                </p>
              </div>
            </div>
          </div>

          <div className="mt-2 text-[#707173]">
            <div
              dangerouslySetInnerHTML={{
                __html: enterpriseProfile[0]?.description,
              }}
            />
          </div>
        </>
      )}

      {enterpriseProfile.length === 0 && (
        <div className="h-60 p-10 border rounded flex items-center justify-center">
          <button
            className="w-fit h-fit bg-[#4C71C0] rounded px-8 py-2 text-white cursor-pointer"
            onClick={() => router.push('/auth/my-page/enterprise-profile-edit')}
          >
            기업 프로필 작성하기
          </button>
        </div>
      )}
    </div>
  );
};

export default EnterpriseProfile;
