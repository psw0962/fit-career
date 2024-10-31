import { createServerSupabaseClient } from '../utils/supabase/server';
import { createBrowserSupabaseClient } from '../utils/supabase/client';
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { User, Provider } from '@supabase/supabase-js';

// =========================================
// ============== post sign in
// =========================================
type SignInResponse = { provider: Provider; url: string };

const signInWithKakao = async (): Promise<SignInResponse> => {
  const supabase = createBrowserSupabaseClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/auth/callback`
        : 'http://127.0.0.1:3000/auth/callback',
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as SignInResponse;
};

export const useSignInWithKakao = (
  options?: UseMutationOptions<SignInResponse, Error, void, void>
) => {
  return useMutation<SignInResponse, Error, void, void>({
    mutationFn: signInWithKakao,
    onSuccess: (data) => {
      // console.log(data);
    },
    onError: (error: Error) => {
      console.error('로그인 중 에러 발생:', error.message);
    },
    ...options,
  });
};

// =========================================
// ============== post sign out
// =========================================
const signOut = async (): Promise<void> => {
  const supabase = createBrowserSupabaseClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

export const useSignOut = (
  options?: UseMutationOptions<void, Error, void, void>
) => {
  return useMutation<void, Error, void, void>({
    mutationFn: signOut,
    onSuccess: () => {
      alert('성공적으로 로그아웃되었습니다.');
      window.location.replace('/');
    },
    onError: (error: Error) => {
      console.error('로그아웃 중 에러 발생:', error.message);
      alert('로그아웃 중 문제가 발생했습니다. 다시 시도해주세요.');
    },
    ...options,
  });
};

// =========================================
// ============== get user data
// =========================================
const getUserData = async (): Promise<User | null> => {
  const supabase = createBrowserSupabaseClient();
  const { data }: any = await supabase.auth.getUser();

  return data.user;
};

export const useGetUserData = () => {
  return useQuery<User | null, Error>({
    queryKey: ['userData'],
    queryFn: getUserData,
    staleTime: 1000 * 60 * 5, // 5분 동안 stale 상태로 간주하지 않음
    retry: 1, // 실패 시 1번만 재시도
    refetchOnMount: false, // 마운트 시 다시 fetch하지 않음
    refetchOnWindowFocus: false, // 창이 포커스를 얻을 때 다시 fetch하지 않음
    refetchOnReconnect: false, // 네트워크 재연결 시 다시 fetch하지 않음
    throwOnError: true,
  });
};
