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
      alert('성공적으로 로그아웃 되었습니다.');
      window.location.replace('/');
    },
    onError: (error: Error) => {
      console.error(error.message);
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
type EnterpriseProfile = {
  name: string;
  industry: {
    job: string;
    etc?: string;
  };
  establishment: string;
  address: {
    zoneCode: string;
    zoneAddress: string;
    detailAddress: string;
  };
  description: string;
  settingLogo?: File[];
  currentLogo?: string;
};

const postEnterpriseProfile = async (data: EnterpriseProfile) => {
  const supabase = createBrowserSupabaseClient();

  const imageUrls: string[] = [];

  for (const image of data?.settingLogo || []) {
    const { data: uploadData, error } = await supabase.storage
      .from('enterprise_profile')
      .upload(`enterprise_profile/${Date.now()}-${image.name}`, image);

    if (error) {
      throw new Error(`${error.message}`);
    }

    const url = supabase.storage
      .from('enterprise_profile')
      .getPublicUrl(uploadData.path);
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
  return useMutation<void, Error, EnterpriseProfile, void>({
    mutationFn: postEnterpriseProfile,
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

  const currentLogos: string[] = enterpriseData?.logo || [];
  const newLogos: string[] = [];

  for (const image of data?.settingLogo || []) {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('enterprise_profile')
      .upload(`enterprise_profile/${Date.now()}-${image.name}`, image);

    if (uploadError) {
      throw new Error(`${uploadError.message}`);
    }

    const url = supabase.storage
      .from('enterprise_profile')
      .getPublicUrl(uploadData.path);
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
        .from('enterprise_profile')
        .remove([`enterprise_profile/${path}`]);

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
const getEnterpriseProfile = async (userId?: string) => {
  const supabase = createBrowserSupabaseClient();

  try {
    const { data: userData, error: userDataError } =
      await supabase.auth.getUser();

    if (!userData) {
      return null;
    }

    if (userId) {
      const { data: enterpriseData, error: enterpriseError } = await supabase
        .from('enterprise_profile')
        .select('*')
        .eq('user_id', userId);

      return enterpriseData;
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

export const useGetEnterpriseProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['enterpriseProfile', userId],
    queryFn: (context) => getEnterpriseProfile(context.queryKey[1]),
    throwOnError: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // staleTime: 1000 * 60 * 5,
  });
};

// =========================================
// ============== post resume
// =========================================
type ResumeData = {
  resumeImage: File[];
  currentResumeImage?: string;
  name: string;
  phone: string;
  email: string;
  introduction: string;
  education: {
    id: string;
    startDate: string;
    endDate: string;
    isCurrentlyEnrolled: string;
    schoolName: string;
    majorAndDegree: string;
  }[];
  experience: {
    id: string;
    startDate: string;
    endDate: string;
    isCurrentlyEmployed: boolean;
    companyName: string;
    jobTitle: string;
    description: string;
  }[];
  certificates: {
    id: string;
    date: string;
    certificateName: string;
  }[];
  awards: {
    id: string;
    date: string;
    awardName: string;
  }[];
  links: {
    id: string;
    title: string;
    url: string;
  }[];
};

const postResume = async (data: ResumeData) => {
  const supabase = createBrowserSupabaseClient();

  const imageUrls: string[] = [];

  for (const image of data.resumeImage) {
    const { data: uploadData, error } = await supabase.storage
      .from('resume')
      .upload(`resume/${Date.now()}-${image.name}`, image);

    if (error) {
      throw new Error(`${error.message}`);
    }

    const url = supabase.storage.from('resume').getPublicUrl(uploadData.path);
    imageUrls.push(url.data.publicUrl);
  }

  const { error: insertError } = await supabase.from('resume').insert([
    {
      resume_image: imageUrls,
      name: data.name,
      email: data.email,
      phone: data.phone,
      introduction: data.introduction,
      education: data.education,
      experience: data.experience,
      certificates: data.certificates,
      awards: data.awards,
      links: data.links,
    },
  ]);

  if (insertError) {
    throw new Error(insertError.message);
  }
};

export const usePostResume = (
  options?: UseMutationOptions<void, Error, ResumeData, void>
) => {
  return useMutation<void, Error, ResumeData, void>({
    mutationFn: postResume,
    onSuccess: () => {
      alert('이력서가 저장 되었습니다.');
      window.location.reload();
    },
    onError: (error: Error) => {
      console.error(error.message);
      alert('이력서 등록에 실패했습니다. 다시 시도해주세요.');
    },
    ...options,
  });
};

// =========================================
// ============== get resume
// =========================================
const getResume = async () => {
  const supabase = createBrowserSupabaseClient();

  try {
    const { data: userData, error: userDataError } =
      await supabase.auth.getUser();

    if (userData) {
      const { data: resumeData, error: resumeError } = await supabase
        .from('resume')
        .select('*')
        .eq('user_id', userData?.user?.id);

      return resumeData;
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const useGetResume = () => {
  return useQuery({
    queryKey: ['resume'],
    queryFn: () => getResume(),
    throwOnError: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // staleTime: 1000 * 60 * 5,
  });
};

// =========================================
// ============== patch resume
// =========================================
const patchResume = async (data: ResumeData) => {
  const supabase = createBrowserSupabaseClient();

  const { data: userData, error: userDataError } =
    await supabase.auth.getUser();

  if (userDataError) {
    throw new Error('User data not found');
  }

  const { data: resumeData, error: resumeError } = await supabase
    .from('resume')
    .select('*')
    .eq('user_id', userData?.user?.id)
    .single();

  if (resumeError) {
    throw new Error(resumeError.message);
  }

  const currentImages: string[] = resumeData?.resume_image || [];
  const newImages: string[] = [];

  for (const image of data?.resumeImage || []) {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resume')
      .upload(`resume/${Date.now()}-${image.name}`, image);

    if (uploadError) {
      throw new Error(`${uploadError.message}`);
    }

    const url = supabase.storage.from('resume').getPublicUrl(uploadData.path);
    newImages.push(url.data.publicUrl);
  }

  const imagesChanged =
    (newImages.length > 0 && !data.currentResumeImage) ||
    !data.currentResumeImage;

  if (imagesChanged) {
    const imagesToDelete = currentImages.filter(
      (currentImage) => !newImages.includes(currentImage)
    );

    for (const imageUrl of imagesToDelete) {
      const path = imageUrl.split('/').slice(-1)[0];
      const { error: deleteError } = await supabase.storage
        .from('resume')
        .remove([`resume/${path}`]);

      if (deleteError) {
        console.error(`Failed to delete image: ${deleteError.message}`);
      }
    }
  }

  const { error } = await supabase
    .from('resume')
    .update({
      resume_image: imagesChanged ? newImages : currentImages,
      name: data.name,
      email: data.email,
      phone: data.phone,
      introduction: data.introduction,
      education: data.education,
      experience: data.experience,
      certificates: data.certificates,
      awards: data.awards,
      links: data.links,
    })
    .eq('user_id', userData?.user?.id);

  if (error) {
    throw new Error(error.message);
  }
};

export const usePatchResume = (
  options?: UseMutationOptions<void, Error, ResumeData, void>
) => {
  return useMutation<void, Error, ResumeData, void>({
    mutationFn: patchResume,
    onSuccess: () => {
      alert('이력서가 수정 되었습니다.');
      window.location.replace('/auth/my-page');
    },
    onError: (error: Error) => {
      console.error(error.message);
      alert('이력서 수정에 실패했습니다. 다시 시도해주세요.');
    },
    ...options,
  });
};
