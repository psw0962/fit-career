'use client';

import dynamic from 'next/dynamic';
import updating from '@/public/svg/updating.json';

const LottieComponent = dynamic(() => import('lottie-react'), { ssr: false });

export default function LottieAnimation() {
  return (
    <LottieComponent
      animationData={updating}
      loop={true}
      className="w-[200px] h-[200px]"
    />
  );
}
