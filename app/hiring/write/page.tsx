'use client';

import dynamic from 'next/dynamic';

const HiringForm = dynamic(() => import('@/app/hiring/write/hiring-form'), {
  ssr: false,
});

export default function HiringWrite() {
  return <HiringForm />;
}
