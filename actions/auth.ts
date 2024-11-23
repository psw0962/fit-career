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
        : 'http://localhost:3000/auth/callback',
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
      console.log(data);
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
      alert('성공적으로 로그아웃 되었습니다.');
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
export const getUserData = async (): Promise<User | null> => {
  const supabase = createBrowserSupabaseClient();

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error(error.message);
      return null;
    }

    if (!data.user) {
      const refreshResponse = await supabase.auth.refreshSession();
      if (refreshResponse.error) {
        console.error(refreshResponse.error.message);
        return null;
      }
      return refreshResponse.data.session?.user ?? null;
    }

    return data.user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const useGetUserData = () => {
  return useQuery({
    queryKey: ['userData'],
    queryFn: getUserData,
    throwOnError: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // staleTime: 1000 * 60 * 5,
  });
};

// =========================================
// ============== post enterprise profile
// =========================================
type EnterpriseProfile = {
  name: string;
  establishment: string;
  address: {
    zoneCode: string;
    zoneAddress: string;
    detailAddress: string;
  };
  description: string;
  logo: File[];
};

const enterpriseProfile = async (data: EnterpriseProfile) => {
  const supabase = createBrowserSupabaseClient();

  const imageUrls: string[] = [];

  for (const image of data.logo) {
    const { data, error } = await supabase.storage
      .from('enterprise_profile')
      .upload(`enterprise_profile/${Date.now()}-${image.name}`, image);

    if (error) {
      throw new Error(`${error.message}`);
    }

    const url = supabase.storage
      .from('enterprise_profile')
      .getPublicUrl(data.path);
    imageUrls.push(url.data.publicUrl);
  }

  const { error } = await supabase.from('enterprise_profile').insert([
    {
      name: data.name,
      establishment: data.establishment,
      address: `${data.address.zoneCode} ${data.address.zoneAddress} ${data.address.detailAddress}`,
      description: data.description,
      logo: imageUrls,
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }
};

export const usePostEnterpriseProfile = (
  options?: UseMutationOptions<void, Error, EnterpriseProfile, void>
) => {
  return useMutation<void, Error, EnterpriseProfile, void>({
    mutationFn: enterpriseProfile,
    onSuccess: () => {
      alert('기업 프로필이 저장 되었습니다.');
      window.location.replace('/auth/my-page');
    },
    onError: (error: Error) => {
      console.error(error.message);
      alert('기업 프로필 저장에 실패했습니다. 다시 시도해주세요.');
    },
    ...options,
  });
};

// =========================================
// ============== patch enterprise profile
// =========================================
const patchEnterpriseProfile = async (data: EnterpriseProfile) => {
  const supabase = createBrowserSupabaseClient();

  const { data: userData, error: userDataError } =
    await supabase.auth.getUser();

  if (!userData) {
    throw new Error('User data not found');
  }

  const imageUrls: string[] = [];

  for (const image of data.logo) {
    const { data, error } = await supabase.storage
      .from('enterprise_profile')
      .upload(`enterprise_profile/${Date.now()}-${image.name}`, image);

    if (error) {
      throw new Error(`${error.message}`);
    }

    const url = supabase.storage
      .from('enterprise_profile')
      .getPublicUrl(data.path);
    imageUrls.push(url.data.publicUrl);
  }

  const { error } = await supabase
    .from('enterprise_profile')
    .update({
      name: data.name,
      establishment: data.establishment,
      address: `${data.address.zoneCode} ${data.address.zoneAddress} ${data.address.detailAddress}`,
      description: data.description,
      logo: imageUrls,
    })
    .eq('user_id', userData?.user?.id);

  if (error) {
    throw new Error(error.message);
  }
};

export const usePatchEnterpriseProfile = (
  options?: UseMutationOptions<void, Error, EnterpriseProfile, void>
) => {
  return useMutation<void, Error, EnterpriseProfile, void>({
    mutationFn: patchEnterpriseProfile,
    onSuccess: () => {
      alert('기업 프로필이 수정 되었습니다.');
      window.location.replace('/auth/my-page');
    },
    onError: (error: Error) => {
      console.error(error.message);
      alert('기업 프로필 수정에 실패했습니다. 다시 시도해주세요.');
    },
    ...options,
  });
};

// =========================================
// ============== get enterprise profile
// =========================================
const getEnterpriseProfile = async () => {
  const supabase = createBrowserSupabaseClient();

  try {
    const { data: userData, error: userDataError } =
      await supabase.auth.getUser();

    if (!userData) {
      return null;
    }

    const { data: enterpriseData, error: enterpriseError } = await supabase
      .from('enterprise_profile')
      .select('*')
      .eq('user_id', userData?.user?.id);

    return enterpriseData;
  } catch (error) {
    console.error(error);
  }
};

export const useGetEnterpriseProfile = () => {
  return useQuery({
    queryKey: ['enterpriseProfile'],
    queryFn: getEnterpriseProfile,
    throwOnError: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // staleTime: 1000 * 60 * 5,
  });
};
