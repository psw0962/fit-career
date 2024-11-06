import { useRouter } from 'next/navigation';
import { useGetUserData } from '@/actions/auth';
import { useEffect } from 'react';

const withAuth = (WrappedComponent: any) => {
  return (props: any) => {
    const router = useRouter();
    const { data, isLoading } = useGetUserData();

    useEffect(() => {
      if (!isLoading && !data) {
        alert('로그인이 필요합니다.');
        router.push('/auth');
      }
    }, [data, isLoading, router]);

    if (isLoading || !data) return null;

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
