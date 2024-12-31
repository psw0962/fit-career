'use client';

import { useGetUserData } from '@/actions/auth';
import { useGetHiringByUserSubmission } from '@/actions/hiring';
import { HiringDataResponse } from '@/types/hiring/hiring';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { useState } from 'react';
import Spinner from '@/components/common/spinner';
import { useRouter } from 'next/navigation';
import { useDeleteResumeFromHiring } from '@/actions/resume';

const ResumeSubmitted = () => {
  const decodeBase64Unicode = (str: string): string => {
    return decodeURIComponent(atob(str));
  };

  const columns: ColumnDef<HiringDataResponse>[] = [
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
        return title.length > 50 ? `${title.slice(0, 50)}...` : title;
      },
    },
    {
      accessorKey: 'resume_received[0].submitted_at',
      header: '지원일',
      cell: ({ row }) => {
        const submittedAt = (
          row.original.resume_received as {
            submitted_at: string;
            title: string;
            is_fitcareer_resume: boolean;
          }[]
        )[0];

        return (
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 text-xs">
              {submittedAt?.submitted_at || '-'}
            </span>

            <span className="mx-auto text-gray-500 text-[12px] max-w-[200px] break-words line-clamp-1">
              {submittedAt.is_fitcareer_resume
                ? submittedAt.title.length > 15
                  ? `${submittedAt.title.slice(0, 15)}...`
                  : submittedAt.title
                : submittedAt.title.length > 15
                  ? `${decodeBase64Unicode(submittedAt.title).split('.')[0].slice(0, 15)}...${decodeBase64Unicode(submittedAt.title).split('.')[1]}`
                  : `${decodeBase64Unicode(submittedAt.title).split('.')[0]}.${decodeBase64Unicode(submittedAt.title).split('.')[1]}`}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'cancel',
      header: '지원취소',
      cell: ({ row }) => {
        return (
          <button
            className="px-3 py-1 border rounded text-sm"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('지원을 취소하시겠습니까?')) {
                deleteResumeFromHiring({
                  hiringId: row.original.id,
                  userId: userData?.id ?? '',
                });
              }
            }}
          >
            지원취소
          </button>
        );
      },
    },
  ];

  const router = useRouter();

  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { data: userData } = useGetUserData();
  const { mutate: deleteResumeFromHiring } = useDeleteResumeFromHiring();
  const { data: hiringData, isLoading: hiringDataIsLoading } =
    useGetHiringByUserSubmission(
      userData?.id ?? '',
      { page, pageSize },
      {
        enabled: !!userData?.id,
      }
    );

  const table = useReactTable({
    data: hiringData?.data ?? [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: hiringData ? Math.ceil(hiringData.count / pageSize) : -1,
    state: {
      pagination: {
        pageIndex: page,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newPageIndex = updater({ pageIndex: page, pageSize }).pageIndex;
        setPage(newPageIndex);
      }
    },
    manualPagination: true,
  });

  return (
    <div className="mt-10">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[450px] border-collapse bg-white rounded-lg shadow-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-center font-bold text-sm bg-gray-50 text-[#000] uppercase tracking-wider border-b"
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
                  onClick={() => router.push(`/hiring/${row.original.id}`)}
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
        {table.getPageCount() > 10 && (
          <button
            className="min-w-[32px] h-8 flex items-center justify-center rounded text-sm border hover:bg-gray-100 disabled:opacity-50"
            onClick={() => {
              const currentPage = table.getState().pagination.pageIndex;
              const targetPage = Math.floor(currentPage / 10) * 10 - 1;
              if (targetPage >= 0) table.setPageIndex(targetPage);
            }}
            disabled={table.getState().pagination.pageIndex < 10}
          >
            이전
          </button>
        )}

        {Array.from({ length: table.getPageCount() }, (_, index) => index)
          .filter((pageIndex) => {
            const currentGroup = Math.floor(
              table.getState().pagination.pageIndex / 10
            );
            const pageGroup = Math.floor(pageIndex / 10);
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

        {table.getPageCount() > 10 && (
          <button
            className="min-w-[32px] h-8 flex items-center justify-center rounded text-sm border hover:bg-gray-100 disabled:opacity-50"
            onClick={() => {
              const currentPage = table.getState().pagination.pageIndex;
              const nextGroupFirstPage = Math.floor(currentPage / 10) * 10 + 10;
              if (nextGroupFirstPage < table.getPageCount()) {
                table.setPageIndex(nextGroupFirstPage);
              }
            }}
            disabled={
              Math.floor(table.getState().pagination.pageIndex / 10) ===
              Math.floor((table.getPageCount() - 1) / 10)
            }
          >
            다음
          </button>
        )}
      </div>

      {hiringDataIsLoading && <Spinner />}

      {hiringData?.data.length === 0 && (
        <div className="flex items-center justify-center h-48">
          <p className="text-sm text-gray-500">지원한 채용공고가 없어요.</p>
        </div>
      )}
    </div>
  );
};

export default ResumeSubmitted;
