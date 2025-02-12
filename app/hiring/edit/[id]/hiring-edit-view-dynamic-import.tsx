'use client';

import GlobalSpinner from '@/components/common/global-spinner';
import dynamic from 'next/dynamic';

const HiringEditView = dynamic(() => import('./hiring-edit-view'), {
  loading: () => <GlobalSpinner />,
  ssr: false,
});

export default function HiringEditWrapper({ hiringId }: { hiringId: string }) {
  return <HiringEditView hiringId={hiringId} />;
}
