'use client';

import { useGetEnterpriseProfile } from '@/actions/auth';
import { useGetHiring } from '@/actions/hiring';
import { useSearchParams } from 'next/navigation';

const Company = (): React.ReactElement => {
  const searchParams = useSearchParams();
  const userId = searchParams.get('user_id') ?? '';
  const hiringId = searchParams.get('hiring_id') ?? '';

  const { data: enterpriseProfileData } = useGetEnterpriseProfile(userId);
  const { data: hiringData } = useGetHiring(hiringId);

  console.log(enterpriseProfileData);
  console.log(hiringData);

  return <div>ㅁㄴㅇ</div>;
};

export default Company;
