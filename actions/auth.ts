import { createBrowserSupabaseClient } from '../utils/supabase/client';
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { User } from '@supabase/supabase-js';
import { EnterpriseProfile, SignInResponse } from '@/types/auth/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// =========================================
// ============== post sign in
// =========================================
const signInWithKakao = async (): Promise<SignInResponse> => {
  const supabase = createBrowserSupabaseClient();

  const redirectUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://fit-career.vercel.app/auth/callback'
      : 'http://localhost:3000/auth/callback';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: redirectUrl,
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
    onSuccess: (data) => {},
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
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation<void, Error, void, void>({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userData'] });
      toast({
        title: '정상적으로 로그아웃 되었습니다.',
        variant: 'default',
      });
      router.push('/');
    },
    onError: (error: Error) => {
      console.error(error.message);
      toast({
        title: '로그아웃 중 문제가 발생했습니다.',
        description: '네트워크 에러가 발생했습니다. 잠시 후 다시 시도해주세요.',
        variant: 'warning',
      });
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
      console.error('Error fetching user:', error.message);
      return null;
    }

    if (!data.user) {
      const refreshResponse = await supabase.auth.refreshSession();

      if (refreshResponse.error) {
        console.error(
          'Error refreshing session:',
          refreshResponse.error.message
        );
        return null;
      }

      if (!refreshResponse.data.session?.user) {
        console.error('No user found after session refresh');
        return null;
      }

      return refreshResponse.data.session.user;
    }

    return data.user;
  } catch (error) {
    console.error('Unexpected error:', error);
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
const postEnterpriseProfile = async (data: EnterpriseProfile) => {
  const supabase = createBrowserSupabaseClient();

  await new Promise((resolve) => setTimeout(resolve, 3000));

  const imageUrls: string[] = [];

  for (const image of data?.settingLogo || []) {
    const { data: uploadData, error } = await supabase.storage
      .from('profile')
      .upload(`profile/enterprise_profile/${Date.now()}-${image.name}`, image);

    if (error) {
      throw new Error(`${error.message}`);
    }

    const url = supabase.storage.from('profile').getPublicUrl(uploadData.path);
    imageUrls.push(url.data.publicUrl);
  }

  const { error } = await supabase.from('enterprise_profile').insert([
    {
      name: data.name,
      industry:
        data.industry.job === '기타' ? data.industry.etc : data.industry.job,
      industry_etc: data.industry.job === '기타' ? true : false,
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
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation<void, Error, EnterpriseProfile, void>({
    mutationFn: postEnterpriseProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['enterpriseProfile'],
      });
      queryClient.invalidateQueries({
        queryKey: ['enterpriseProfile', 'hiringList'],
      });
      toast({
        title: '기업 프로필이 저장 되었습니다.',
        description: '이제부터 채용 공고를 등록할 수 있어요.',
        variant: 'default',
      });
      router.push('/auth/my-page');
    },
    onError: (error: Error) => {
      console.error(error.message);
      toast({
        title: '기업 프로필 저장에 실패했습니다.',
        description: '네트워크 에러가 발생했습니다. 잠시 후 다시 시도해주세요.',
        variant: 'warning',
      });
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

  if (userDataError) {
    throw new Error('User data not found');
  }

  const { data: enterpriseData, error: enterpriseError } = await supabase
    .from('enterprise_profile')
    .select('logo')
    .eq('user_id', userData?.user?.id)
    .single();

  if (enterpriseError) {
    throw new Error(enterpriseError.message);
  }

  await new Promise((resolve) => setTimeout(resolve, 3000));

  const currentLogos: string[] = enterpriseData?.logo || [];
  const newLogos: string[] = [];

  for (const image of data?.settingLogo || []) {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile')
      .upload(`profile/enterprise_profile/${Date.now()}-${image.name}`, image);

    if (uploadError) {
      throw new Error(`${uploadError.message}`);
    }

    const url = supabase.storage.from('profile').getPublicUrl(uploadData.path);
    newLogos.push(url.data.publicUrl);
  }

  const logosChanged =
    (newLogos.length > 0 && !data.currentLogo) || !data.currentLogo;

  if (logosChanged) {
    const logosToDelete = currentLogos.filter(
      (currentLogo) => !newLogos.includes(currentLogo)
    );

    for (const logoUrl of logosToDelete) {
      const path = logoUrl.split('/').slice(-1)[0];
      const { error: deleteError } = await supabase.storage
        .from('profile')
        .remove([`profile/enterprise_profile/${path}`]);

      if (deleteError) {
        console.error(`Failed to delete image: ${deleteError.message}`);
      }
    }
  }

  const { error } = await supabase
    .from('enterprise_profile')
    .update({
      name: data.name,
      industry:
        data.industry.job === '기타' ? data.industry.etc : data.industry.job,
      industry_etc: data.industry.job === '기타' ? true : false,
      establishment: data.establishment,
      address: `${data.address.zoneCode} ${data.address.zoneAddress} ${data.address.detailAddress}`,
      description: data.description,
      logo: logosChanged ? newLogos : currentLogos,
    })
    .eq('user_id', userData?.user?.id);

  if (error) {
    throw new Error(error.message);
  }
};

export const usePatchEnterpriseProfile = (
  options?: UseMutationOptions<void, Error, EnterpriseProfile, void>
) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation<void, Error, EnterpriseProfile, void>({
    mutationFn: patchEnterpriseProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['enterpriseProfile'],
      });
      queryClient.invalidateQueries({
        queryKey: ['enterpriseProfile', 'hiringList'],
      });
      toast({
        title: '기업 프로필이 수정 되었습니다.',
        description: '성공적으로 기업 프로필을 수정했어요.',
        variant: 'default',
      });
      router.push('/auth/my-page');
    },
    onError: (error: Error) => {
      console.error(error.message);
      toast({
        title: '기업 프로필 수정에 실패했습니다.',
        description: '네트워크 에러가 발생했습니다. 잠시 후 다시 시도해주세요.',
        variant: 'warning',
      });
    },
    ...options,
  });
};

// =========================================
// ============== get enterprise profile
// =========================================
const getEnterpriseProfile = async (userId: string) => {
  const supabase = createBrowserSupabaseClient();

  try {
    if (userId) {
      const { data: enterpriseData, error: enterpriseError } = await supabase
        .from('enterprise_profile')
        .select('*')
        .eq('user_id', userId);

      if (enterpriseError) {
        throw new Error(enterpriseError.message);
      }

      return enterpriseData;
    }

    const { data: enterpriseData, error: enterpriseError } = await supabase
      .from('enterprise_profile')
      .select('*')
      .eq('user_id', userId);

    if (enterpriseError) {
      throw new Error(enterpriseError.message);
    }

    return enterpriseData;
  } catch (error) {
    console.error(error);
  }
};

export const useGetEnterpriseProfile = (userId: string) => {
  return useQuery({
    queryKey: ['enterpriseProfile', userId],
    queryFn: (context) => getEnterpriseProfile(context.queryKey[1]),
    enabled: !!userId,
    throwOnError: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // staleTime: 1000 * 60 * 5,
  });
};
