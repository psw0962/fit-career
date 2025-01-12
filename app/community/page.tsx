import LottieAnimation from '@/components/common/lottie-animation';
import { Suspense } from 'react';

export default function Community() {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh]">
      <Suspense fallback={<div className="w-[200px] h-[200px]" />}>
        <LottieAnimation />
      </Suspense>
      <p className="text-xl font-bold">업데이트 중입니다.</p>
    </div>
  );
}
