'use client';

import {
  useDeleteBookmark,
  useGetBookmarkedHiringsByUserId,
} from '@/actions/hiring';
import { HiringDataResponse } from '@/types/hiring/hiring';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSessionStorage } from 'usehooks-ts';
import { useScrollRestoration } from '@/hooks/use-scroll-restoration';
import GlobalSpinner from '../common/global-spinner';

export default function BookmarksHiring() {
  const columns: ColumnDef<HiringDataResponse>[] = [
    {
      accessorKey: 'delete',
      header: '삭제',
      cell: ({ row }) => {
        return (
          <>
            <button
              className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                setOpenDeleteDialog(row.original.id);
              }}
            >
              삭제
            </button>

            <Dialog
              open={openDeleteDialog === row.original.id}
              onOpenChange={() => setOpenDeleteDialog(null)}
            >
              <DialogContent
                className="w-[90vw] max-w-[500px] min-w-[300px]"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <DialogHeader>
                  <DialogTitle>북마크 삭제</DialogTitle>
                  <DialogDescription>
                    북마크를 삭제하시겠습니까?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <div className="flex gap-2 justify-center mt-4 sm:mt-0">
                    <button
                      className="text-sm border rounded px-4 py-2"
                      onClick={() => setOpenDeleteDialog(null)}
                    >
                      취소
                    </button>

                    <button
                      className="bg-[#4C71C0] text-[#fff] text-sm rounded px-4 py-2"
                      onClick={() => {
                        deleteBookmark(row.original.id);
                        setOpenDeleteDialog(null);
                      }}
                    >
                      확인
                    </button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        );
      },
    },
    {
      accessorKey: 'enterprise_profile.name',
      header: '기업명',
      cell: ({ row }) => {
        const name = row.original.enterprise_profile?.name ?? '-';
        return name.length > 15 ? `${name.slice(0, 15)}...` : name;
      },
    },
    {
      accessorKey: 'title',
      header: '채용공고',
      cell: ({ row }) => {
        const title = row.original.title;
        return title.length > 20 ? `${title.slice(0, 20)}...` : title;
      },
    },
  ];

  const router = useRouter();

  const [openDeleteDialog, setOpenDeleteDialog] = useState<string | null>(null);
  const [page, setPage] = useSessionStorage('bookmarks-hiring-current-page', 0);

  useScrollRestoration('bookmarks-hiring-current-page');

  const { mutate: deleteBookmark } = useDeleteBookmark();
  const { data: hiringData, isLoading: hiringDataIsLoading } =
    useGetBookmarkedHiringsByUserId(page);

  const table = useReactTable({
    data: hiringData?.data ?? [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: hiringData ? Math.ceil(hiringData.count / 12) : -1,
    state: {
      pagination: {
        pageIndex: page,
        pageSize: 12,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newPageIndex = updater({
          pageIndex: page,
          pageSize: 12,
        }).pageIndex;
        setPage(newPageIndex);
      }
    },
    manualPagination: true,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  return (
    <div className="mt-5">
      <div className="text-xs mb-7 p-2 bg-[#EAEAEC] rounded break-keep">
        <p>
          • 기업에서 채용공고를 삭제하면 내가 북마크한 채용공고도 함께 삭제돼요.
        </p>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[450px] border-collapse bg-white rounded-lg shadow-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-center font-bold text-sm bg-gray-50 text-[#000] uppercase tracking-wider border-b whitespace-nowrap"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => {
              return (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    if (!openDeleteDialog) {
                      router.push(`/hiring/${row.original.id}`);
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td
                        key={cell.id}
                        className="px-6 py-4 text-sm text-center text-gray-600 whitespace-nowrap"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-1.5 py-4">
        {table.getPageCount() > 12 && (
          <button
            className="min-w-[32px] h-8 flex items-center justify-center rounded text-sm border hover:bg-gray-100 disabled:opacity-50"
            onClick={() => {
              const currentPage = table.getState().pagination.pageIndex;
              const targetPage = Math.floor(currentPage / 12) * 12 - 1;
              if (targetPage >= 0) table.setPageIndex(targetPage);
            }}
            disabled={table.getState().pagination.pageIndex < 12}
          >
            이전
          </button>
        )}

        {Array.from({ length: table.getPageCount() }, (_, index) => index)
          .filter((pageIndex) => {
            const currentGroup = Math.floor(
              table.getState().pagination.pageIndex / 12
            );
            const pageGroup = Math.floor(pageIndex / 12);
            return currentGroup === pageGroup;
          })
          .map((pageIndex) => (
            <button
              key={pageIndex}
              className={`min-w-[32px] h-8 flex items-center justify-center rounded text-sm
                ${
                  table.getState().pagination.pageIndex === pageIndex
                    ? 'bg-[#4C71C0] text-[#fff]'
                    : 'hover:bg-gray-100 text-[#000]'
                } border transition-colors`}
              onClick={() => table.setPageIndex(pageIndex)}
            >
              {pageIndex + 1}
            </button>
          ))}

        {table.getPageCount() > 12 && (
          <button
            className="min-w-[32px] h-8 flex items-center justify-center rounded text-sm border hover:bg-gray-100 disabled:opacity-50"
            onClick={() => {
              const currentPage = table.getState().pagination.pageIndex;
              const nextGroupFirstPage = Math.floor(currentPage / 12) * 12 + 12;
              if (nextGroupFirstPage < table.getPageCount()) {
                table.setPageIndex(nextGroupFirstPage);
              }
            }}
            disabled={
              Math.floor(table.getState().pagination.pageIndex / 12) ===
              Math.floor((table.getPageCount() - 1) / 12)
            }
          >
            다음
          </button>
        )}
      </div>

      {hiringDataIsLoading && <GlobalSpinner />}

      {hiringData?.data.length === 0 && (
        <div className="flex items-center justify-center h-48">
          <p className="text-sm text-gray-500">북마크한 채용공고가 없어요.</p>
        </div>
      )}
    </div>
  );
}
