'use client';

import { useRouter } from 'next/navigation';

export default function NoAuthority() {
  const router = useRouter();

  return (
    <div className='flex min-h-[50vh] flex-col items-center justify-center gap-6 p-4'>
      <div className='h-20 w-20 rounded-full bg-red-100 p-4'>
        <svg
          className='h-full w-full text-red-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
          />
        </svg>
      </div>

      <div className='text-center'>
        <h1 className='mb-2 text-2xl font-bold text-gray-800 break-keep'>접근 권한이 없습니다</h1>
        <p className='text-gray-600 break-keep'>
          해당 페이지에 접근할 수 있는 권한이 없습니다.
          <br />
          관리자에게 문의하시거나 이전 페이지로 돌아가주세요.
        </p>
      </div>

      <div className='flex gap-3'>
        <button onClick={() => router.back()} className='rounded border bg-white px-6 py-2 text-sm'>
          이전으로
        </button>

        <button
          onClick={() => router.push('/')}
          className='rounded bg-[#4C71C0] px-6 py-2 text-sm text-white'
        >
          홈으로
        </button>
      </div>
    </div>
  );
}
