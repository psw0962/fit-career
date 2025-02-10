'use client';

import dynamic from 'next/dynamic';

const HiringEditView = dynamic(() => import('./hiring-edit-view'), {
  ssr: false,
});

export default function HiringEditWrapper({ hiringId }: { hiringId: string }) {
  return <HiringEditView hiringId={hiringId} />;
}
