'use client';

import { useGetUserData } from '@/actions/auth';
import Image from 'next/image';
import GlobalSpinner from '@/components/common/global-spinner';

const Resume = (): React.ReactElement => {
  const { data, isLoading } = useGetUserData();

  if (isLoading || !data) {
    return <GlobalSpinner />;
  }

  return <div className="mt-10">이력서 선택화면</div>;
};

export default Resume;
