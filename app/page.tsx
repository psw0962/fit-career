'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const HiringMain = dynamic(() => import('@/app/hiring-main'), { ssr: false });

export default function HiringWrapper() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <HiringMain />;
}
