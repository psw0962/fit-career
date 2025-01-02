'use client';

import { useGetHiring, useUpdateHiringVisibility } from '@/actions/hiring';
import GlobalSpinner from '@/components/common/global-spinner';
import Image from 'next/image';
import { HiringDataResponse } from '@/types/hiring/hiring';
import Link from 'next/link';
import { formatPeriod } from '@/functions/formatPeriod';
import { useGetUserData } from '@/actions/auth';
import { useEffect, useRef, useState } from 'react';
import * as Switch from '@radix-ui/react-switch';
import Spinner from '@/components/common/spinner';

const HiringPosts = () => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [page, setPage] = useState(0);

  const { data: userData } = useGetUserData();
  const { data: hiringData, isLoading: hiringDataIsLoading } = useGetHiring({
    user_id: userData?.id ?? '',
    page,
    pageSize: 12,
  });
  const {
    mutate: updateHiringVisibility,
    status: updateHiringVisibilityStatus,
  } = useUpdateHiringVisibility();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  if (hiringDataIsLoading) {
    return <GlobalSpinner />;
  }

  return (
    <div className="mt-5">
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {hiringData !== undefined &&
          hiringData.data.map((x: HiringDataResponse) => {
            return (
              <div
                key={x.id}
                className="relative h-full flex flex-col justify-between gap-2 px-5 pt-14 pb-5 border rounded cursor-pointer"
              >
                <Link href={`/hiring/${x.id}`} passHref>
                  <div className="flex flex-col gap-0">
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
                            src={
                              x.enterprise_profile?.logo[0] ?? '/svg/logo.svg'
                            }
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

                  <div>
                    <p className="text-xs text-gray-500">
                      등록일 {x.created_at}
                    </p>

                    <p className="text-xs text-gray-500">
                      최근 수정일{' '}
                      {x.updated_at === 'NULL' ? x.created_at : x.updated_at}
                    </p>
                  </div>
                </Link>

                <div className=" w-full flex flex-col items-center gap-1">
                  <div
                    className="w-full flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('edit');
                    }}
                  >
                    <div className="w-full flex items-center justify-center gap-1 border rounded px-2 py-1">
                      <Image
                        src="/svg/edit.svg"
                        alt="edit"
                        width={15}
                        height={15}
                      />

                      <button className="text-sm">수정하기</button>
                    </div>

                    <div
                      className="w-full flex items-center justify-center gap-1 border rounded px-2 py-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('delete');
                      }}
                    >
                      <Image
                        src="/svg/delete.svg"
                        alt="delete"
                        width={15}
                        height={15}
                      />

                      <button className="text-sm">삭제하기</button>
                    </div>
                  </div>

                  <button
                    className="w-full mt-[2px] text-sm bg-[#4C71C0] px-2 py-2 rounded text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('resume');
                    }}
                  >
                    {`접수된 이력서 (${x.resume_received.length})`}
                  </button>
                </div>

                <div className="absolute top-4 right-4 cursor-pointer">
                  <div className="flex items-center gap-1">
                    {x.is_visible ? (
                      <Image
                        src="/svg/view.svg"
                        alt="view"
                        width={20}
                        height={20}
                      />
                    ) : (
                      <Image
                        src="/svg/view-off.svg"
                        alt="view-off"
                        width={20}
                        height={20}
                      />
                    )}

                    <Switch.Root
                      className="w-[42px] h-[25px] bg-gray-300 rounded-full relative shadow-black/70 data-[state=checked]:bg-[#4C71C0]"
                      checked={x.is_visible}
                      onCheckedChange={(checked) => {
                        if (updatingId === x.id) return;

                        if (timeoutRef.current) {
                          clearTimeout(timeoutRef.current);
                        }

                        setUpdatingId(x.id);

                        timeoutRef.current = setTimeout(() => {
                          updateHiringVisibility({
                            hiringId: x.id,
                            isVisible: checked,
                            setUpdatingId,
                          });
                        }, 1000);
                      }}
                    >
                      {updatingId === x.id ? (
                        <Spinner width="5px" height="5px" />
                      ) : (
                        <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-black/70 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
                      )}
                    </Switch.Root>
                  </div>
                </div>
              </div>
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
