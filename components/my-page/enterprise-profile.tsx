'use client';

import Image from 'next/image';
import GlobalSpinner from '../common/global-spinner';
import { useGetEnterpriseProfile } from '@/actions/auth';
import { calculateYearsInBusiness } from '@/functions/calculateYearsInBusiness';
import { useRouter } from 'next/navigation';

const EnterpriseProfile = () => {
  const router = useRouter();
  const { data, isLoading } = useGetEnterpriseProfile();

  if (isLoading || !data) {
    return <GlobalSpinner />;
  }

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-2 items-start sm:flex-row sm:items-center">
        <div className="relative w-20 h-20">
          <Image
            src={data[0]?.logo?.[0] ? data[0]?.logo?.[0] : '/svg/logo.svg'}
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
            {data?.[0]?.name}
            <span
              className="text-sm ml-2 font-bold text-[#C3C4C5] underline underline-offset-4 decoration-[#C3C4C5] cursor-pointer"
              onClick={() =>
                router.push('/auth/my-page/enterprise-profile-edit')
              }
            >
              {`수정하기`}
            </span>
          </p>

          <div className="flex gap-1 mt-2">
            <p>{data?.[0].industry}</p>
            <div>∙</div>
            <p>{data?.[0].address.split(' ').slice(1, 3).join(' ')}</p>
            <div>∙</div>
            <p>
              {calculateYearsInBusiness(data?.[0].establishment)}년차 (
              {parseInt(data?.[0].establishment.split('-')[0], 10)})
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2 text-[#707173]">
        <div
          dangerouslySetInnerHTML={{
            __html: data[0]?.description,
          }}
        />
      </div>
    </div>
  );
};

export default EnterpriseProfile;
