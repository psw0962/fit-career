'use client';

import {
  useDeleteHiring,
  useGetHiring,
  useUpdateHiringVisibility,
} from '@/actions/hiring';
import GlobalSpinner from '@/components/common/global-spinner';
import Image from 'next/image';
import { HiringDataResponse } from '@/types/hiring/hiring';
import Link from 'next/link';
import { formatPeriod } from '@/functions/formatPeriod';
import { useGetUserData } from '@/actions/auth';
import { useEffect, useRef, useState } from 'react';
import * as Switch from '@radix-ui/react-switch';
import Spinner from '@/components/common/spinner';
import HiringResumeReceivedModal from '@/components/my-page/hiring/hiring-resume-received-modal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useSessionStorage } from 'usehooks-ts';
import { useScrollRestoration } from '@/hooks/use-scroll-restoration';
import { useRouter } from 'next/navigation';

const HiringPosts = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [deleteHiringId, setDeleteHiringId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useSessionStorage('hiring-posts-current-page', 0);

  const timeoutRef = useRef<NodeJS.Timeout>();

  useScrollRestoration('hiring-posts-list');

  const { data: userData } = useGetUserData();
  const { data: hiringData, isLoading: hiringDataIsLoading } = useGetHiring({
    user_id: userData?.id ?? '',
    page,
    pageSize: 12,
  });
  const { mutate: updateHiringVisibility } = useUpdateHiringVisibility();
  const { mutate: deleteHiring, status: deleteHiringStatus } =
    useDeleteHiring();

  const handleEdit = async () => {
    setIsLoading(true);
    router.push(`/hiring/write`);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  if (hiringDataIsLoading || deleteHiringStatus === 'pending') {
    return <GlobalSpinner />;
  }

  return (
    <div className="mt-5">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {hiringData !== undefined &&
          hiringData.data.map((x: HiringDataResponse) => {
            return (
              <div
                key={x.id}
                className="relative h-full flex flex-col justify-between gap-2 pt-12 px-2 pb-2 sm:px-3 sm:pb-3 border rounded cursor-pointer"
              >
                <Link href={`/hiring/${x.id}`} passHref>
                  <div className="flex flex-col gap-0">
                    <div className="relative w-full aspect-[4/3] mx-auto mb-4 border rounded">
                      <Image
                        src={
                          x.images.length !== 0 ? x.images[0] : '/svg/logo.svg'
                        }
                        alt={`image ${x.id}`}
                        style={{ objectFit: 'cover' }}
                        className="rounded"
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                        quality={75}
                      />
                    </div>

                    <div className="w-full flex flex-col gap-0">
                      <p className="text-base font-bold break-keep line-clamp-2">
                        {x.title}
                      </p>

                      <div className="flex items-center gap-1 mt-2">
                        <div className="relative w-5 h-5 flex-shrink-0">
                          <Image
                            src={
                              x.enterprise_profile?.logo[0] ?? '/svg/logo.svg'
                            }
                            alt={`image ${x.id}`}
                            className="rounded"
                            style={{ objectFit: 'contain' }}
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                            quality={75}
                          />
                        </div>

                        <p className="text-sm break-words line-clamp-1 flex-1">
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
                  <div className="w-full flex flex-col sm:flex-row items-center gap-1">
                    <Link
                      href={`/hiring/edit/${x.id}`}
                      className="w-full flex items-center justify-center gap-1 border rounded px-2 py-1"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Image
                        src="/svg/edit.svg"
                        alt="edit"
                        width={15}
                        height={15}
                      />

                      <span className="text-sm">수정하기</span>
                    </Link>

                    <div
                      className="w-full flex items-center justify-center gap-1 border rounded px-2 py-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteHiringId(x.id);
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

                  <HiringResumeReceivedModal data={x} />
                </div>

                <div className="absolute top-3 right-3 cursor-pointer">
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

        <Dialog
          open={deleteHiringId !== null}
          onOpenChange={(isOpen) => !isOpen && setDeleteHiringId(null)}
        >
          <DialogContent className="w-[90vw] max-w-[500px] min-w-[300px]">
            <DialogHeader>
              <DialogTitle>채용공고 삭제</DialogTitle>
              <DialogDescription>
                채용공고 삭제 시 접수된 지원자의 모든 정보와 함께 삭제됩니다.
                <br />
                채용공고를 삭제하시겠습니까?
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <div className="flex items-center justify-center gap-2 mt-4 sm:mt-0">
                <button
                  className="px-4 py-2 text-sm border rounded"
                  onClick={() => setDeleteHiringId(null)}
                >
                  취소
                </button>

                <button
                  className="px-4 py-2 text-sm text-white bg-[#4C71C0] rounded"
                  onClick={() => {
                    if (deleteHiringId) {
                      deleteHiring(deleteHiringId);
                      setDeleteHiringId(null);
                    }
                  }}
                >
                  삭제
                </button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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

      {hiringData?.data.length === 0 && (
        <div className="flex flex-col gap-2 items-center justify-center h-48">
          <p className="text-sm text-gray-500">
            내가 등록한 채용공고가 없어요.
          </p>

          {isLoading ? (
            <GlobalSpinner />
          ) : (
            <button
              className="w-fit h-fit bg-[#4C71C0] rounded px-6 py-3 text-sm text-white cursor-pointer"
              onClick={handleEdit}
              disabled={isLoading}
            >
              <span>채용공고 등록하기</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default HiringPosts;
