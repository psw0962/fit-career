'use client';

import { useGetHiring } from '@/actions/hiring';
import GlobalSpinner from '@/components/common/global-spinner';
import Image from 'next/image';
import { HiringDataResponse } from '@/types/hiring/hiring';
import Link from 'next/link';
import { formatPeriod } from '@/functions/formatPeriod';
import { useGetUserData } from '@/actions/auth';
import { useState } from 'react';

const HiringPosts = () => {
  const [page, setPage] = useState(0);

  const { data: userData } = useGetUserData();
  const { data: hiringData, isLoading: hiringDataIsLoading } = useGetHiring({
    user_id: userData?.id ?? '',
    page,
    pageSize: 12,
  });

  if (hiringDataIsLoading) {
    return <GlobalSpinner />;
  }

  return (
    <div className="mt-5">
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {hiringData !== undefined &&
          hiringData.data.map((x: HiringDataResponse) => {
            return (
              <Link key={x.id} href={`/hiring/${x.id}`} passHref>
                <div className="h-full flex flex-col gap-2 p-5 border rounded cursor-pointer">
                  <div className="relative w-10 h-10 mx-auto mb-4">
                    <Image
                      src={
                        x.images.length !== 0 ? x.images[0] : '/svg/logo.svg'
                      }
                      alt={`image ${x.id}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                    />
                  </div>

                  <div className="w-full flex flex-col gap-0">
                    <p className="text-lg font-bold break-all line-clamp-2">
                      {x.title}
                    </p>

                    <div className="flex items-center gap-1 mt-2">
                      <div className="relative w-5 h-5 flex-shrink-0">
                        <Image
                          src={x.enterprise_profile?.logo[0] ?? '/svg/logo.svg'}
                          alt={`image ${x.id}`}
                          fill
                          style={{ objectFit: 'cover' }}
                          priority
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                        />
                      </div>

                      <p className="break-words line-clamp-1 flex-1">
                        {x.enterprise_profile?.name}
                      </p>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      {x.short_address}
                    </p>

                    <p className="text-xs text-gray-500">
                      경력 {formatPeriod(x.period)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
      </div>

      {(hiringData?.count ?? 0) > 12 && (
        <div className="flex items-center justify-center gap-1.5 py-4">
          <button
            className="min-w-[32px] h-8 p-2 flex items-center justify-center rounded text-sm border hover:bg-gray-100 disabled:opacity-50"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            이전
          </button>

          <span className="mx-2">
            {page + 1} / {Math.ceil((hiringData?.count ?? 0) / 12)}
          </span>

          <button
            className="min-w-[32px] h-8 p-2 flex items-center justify-center rounded text-sm border hover:bg-gray-100 disabled:opacity-50"
            onClick={() =>
              setPage(
                Math.min(Math.ceil((hiringData?.count ?? 0) / 12) - 1, page + 1)
              )
            }
            disabled={page >= Math.ceil((hiringData?.count ?? 0) / 12) - 1}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default HiringPosts;
