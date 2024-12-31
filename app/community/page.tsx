'use client';

import Lottie from 'lottie-react';
import updating from '@/public/svg/updating.json';

const Community = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Lottie
        animationData={updating}
        loop={true}
        className="w-[200px] h-[200px]"
      />

      <p className="text-xl font-bold">업데이트 중입니다.</p>
    </div>
  );
};

export default Community;
