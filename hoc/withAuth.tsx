'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { ComponentType, FC } from 'react';
import { useGetUserData } from '@/actions/auth';

export function withAuth<P extends {}>(
  WrappedComponent: ComponentType<P>
): FC<P> {
  const AuthenticatedComponent: FC<P> = (props) => {
    const router = useRouter();

    const { data, isLoading } = useGetUserData();

    useEffect(() => {
      if (!isLoading && !data) {
        router.push('/auth?message=login_required');
        return;
      }
    }, [data, isLoading, router]);

    if (isLoading || !data) return null;

    return <WrappedComponent {...props} />;
  };

  return AuthenticatedComponent;
}
