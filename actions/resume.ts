import { createBrowserSupabaseClient } from '../utils/supabase/client';
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { ResumeData } from '@/types/resume/resume';

// =========================================
// ============== get resume
// =========================================
const getResume = async (id?: string) => {
  const supabase = createBrowserSupabaseClient();

  try {
    // resume id로 가져오는 경우
    if (id) {
      const { data: resumeData } = await supabase
        .from('resume')
        .select('*')
        .eq('id', id);

      return resumeData;
    }

    // user id로 가져오는 경우
    const { data: userData } = await supabase.auth.getUser();
    if (userData) {
      const { data: resumeData } = await supabase
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

export const useGetResume = (id?: string) => {
  return useQuery({
    queryKey: ['resume', id],
    queryFn: () => getResume(id),
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
const patchResume = async (data: {
  resumeData: ResumeData;
  resumeId: string;
}) => {
  const supabase = createBrowserSupabaseClient();

  const { data: resumeData, error: resumeError } = await supabase
    .from('resume')
    .select('*')
    .eq('id', data.resumeId)
    .single();

  if (resumeError) {
    throw new Error(resumeError.message);
  }

  const currentImages: string[] = resumeData?.resume_image || [];
  const newImages: string[] = [];

  for (const image of data?.resumeData?.resumeImage || []) {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resume')
      .upload(`resume/resume-image/${Date.now()}-${image.name}`, image);

    if (uploadError) {
      throw new Error(`${uploadError.message}`);
    }

    const url = supabase.storage.from('resume').getPublicUrl(uploadData.path);
    newImages.push(url.data.publicUrl);
  }

  const imagesChanged =
    (newImages.length > 0 && !data.resumeData.currentResumeImage) ||
    !data.resumeData.currentResumeImage;

  if (imagesChanged) {
    const imagesToDelete = currentImages.filter(
      (currentImage) => !newImages.includes(currentImage)
    );

    for (const imageUrl of imagesToDelete) {
      const path = imageUrl.split('/').slice(-1)[0];
      const { error: deleteError } = await supabase.storage
        .from('resume')
        .remove([`resume/resume-image/${path}`]);

      if (deleteError) {
        console.error(`${deleteError.message}`);
      }
    }
  }

  const { error } = await supabase
    .from('resume')
    .update({
      title: data.resumeData.title,
      resume_image: imagesChanged ? newImages : currentImages,
      name: data.resumeData.name,
      email: data.resumeData.email,
      phone: data.resumeData.phone,
      introduction: data.resumeData.introduction,
      education: data.resumeData.education,
      experience: data.resumeData.experience,
      certificates: data.resumeData.certificates,
      awards: data.resumeData.awards,
      links: data.resumeData.links,
    })
    .eq('id', data.resumeId);

  if (error) {
    throw new Error(error.message);
  }
};

export const usePatchResume = (
  options?: UseMutationOptions<
    void,
    Error,
    { resumeData: ResumeData; resumeId: string },
    void
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { resumeData: ResumeData; resumeId: string },
    void
  >({
    mutationFn: ({ resumeData, resumeId }) =>
      patchResume({ resumeData, resumeId }),
    onSuccess: () => {
      alert('이력서가 수정 되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['resume'] });
      window.location.replace('/auth/my-page');
    },
    onError: (error: Error) => {
      console.error(error.message);
      alert('이력서 수정에 실패했습니다. 다시 시도해주세요.');
    },
    ...options,
  });
};

// =========================================
// ============== post new resume
// =========================================
const postNewResume = async () => {
  const supabase = createBrowserSupabaseClient();

  const { data: userData, error: userDataError } =
    await supabase.auth.getUser();

  if (userDataError) {
    throw new Error('User data not found');
  }

  const { data: resumeCountData, error: countError } = await supabase
    .from('resume')
    .select('*', { count: 'exact' })
    .eq('user_id', userData.user.id);

  if (countError) {
    throw new Error(countError.message);
  }

  if (resumeCountData.length >= 4) {
    alert('이력서는 최대 4개까지 등록할 수 있습니다.');
    return;
  }

  const { error: insertError } = await supabase.from('resume').insert([
    {
      title: '',
      resume_image: [],
      name: '',
      email: '',
      phone: '',
      introduction: `<div><div><div><div><div><div><div><div><div><p>- 진심으로 고객이 변하길 바라는 마음으로 목표를 향해 나아갈 수 있도록 긍정적인 피드백과 격려를 아끼지 않습니다.</p><p>- 운동의 효과를 극대화하기 위해 각 개인의 신체적 특성과 목표에 맞는 맞춤형 프로그램을 설계합니다.</p><p>- 운동뿐만 아니라 영양 상담과 라이프스타일 코칭을 통해 고객의 전반적인 삶의 질 향상을 목표로 합니다.</p><p>- 최신 트렌드와 연구를 반영하여 항상 발전하는 트레이너가 되기 위해 노력합니다.</p></div></div></div></div></div></div></div></div></div>`,
      education: [],
      experience: [],
      certificates: [],
      awards: [],
      links: [],
      is_fitcareer_resume: true,
    },
  ]);

  if (insertError) {
    throw new Error(insertError.message);
  }
};

export const usePostNewResume = (
  options?: UseMutationOptions<void, Error, void, void>
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void, void>({
    mutationFn: postNewResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume'] });
    },
    onError: (error: Error) => {
      console.error(error.message);
      alert('네트워크 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.');
    },
    ...options,
  });
};

// =========================================
// ============== delete resume
// =========================================
const deleteResume = async (resumeId: string) => {
  const supabase = createBrowserSupabaseClient();

  const { data: resumeData, error: resumeError } = await supabase
    .from('resume')
    .select('*')
    .eq('id', resumeId)
    .single();

  if (resumeError) {
    throw new Error(resumeError.message);
  }

  const currentImages: string[] = resumeData?.resume_image || [];

  const { error: deleteError } = await supabase
    .from('resume')
    .delete()
    .eq('id', resumeId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  for (const imageUrl of currentImages) {
    const path = imageUrl.split('/').slice(-1)[0];
    const { error: storageDeleteError } = await supabase.storage
      .from('resume')
      .remove([`resume/resume-image/${path}`]);

    if (storageDeleteError) {
      console.error(`Failed to delete image: ${storageDeleteError.message}`);
    }
  }
};

export const useDeleteResume = (
  options?: UseMutationOptions<void, Error, string, void>
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, void>({
    mutationFn: deleteResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume'] });
      alert('이력서가 삭제되었습니다.');
    },
    onError: (error: Error) => {
      console.error(error.message);
      alert('이력서 삭제에 실패했습니다. 다시 시도해주세요.');
    },
    ...options,
  });
};

// =========================================
// ============== upload resume
// =========================================
const uploadResume = async (file: File): Promise<string | null> => {
  // const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9]/g, '_');

  const encodeBase64Unicode = (str: string): string => {
    return btoa(encodeURIComponent(str));
  };

  const decodeBase64Unicode = (str: string): string => {
    return decodeURIComponent(atob(str));
  };

  console.log(encodeBase64Unicode(file.name));
  console.log(decodeBase64Unicode(encodeBase64Unicode(file.name)));

  const supabase = createBrowserSupabaseClient();

  // 파일 처리
  const allowedExtensions = ['pdf', 'hwp', 'xlsx', 'xls', 'docx', 'pptx'];
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (!allowedExtensions.includes(fileExtension || '')) {
    alert('PDF, 한글, 엑셀, 워드, 파워포인트 파일만 업로드 가능합니다.');
    return null;
  }

  // const { error: uploadError } = await supabase.storage
  //   .from('resume')
  //   .upload(`resume/resume-file/${Date.now()}-${encodedFilename}`, file);

  // if (uploadError) {
  //   throw new Error(uploadError.message);
  // }

  // const url = supabase.storage
  //   .from('resume')
  //   .getPublicUrl(`resume/resume-file/${Date.now()}-${encodedFilename}`)
  //   .data.publicUrl;

  // // resume 생성
  // const { data: userData, error: userDataError } =
  //   await supabase.auth.getUser();

  // if (userDataError) {
  //   throw new Error(userDataError.message);
  // }

  // const { data: resumeCountData, error: countError } = await supabase
  //   .from('resume')
  //   .select('*', { count: 'exact' })
  //   .eq('user_id', userData.user.id);

  // if (countError) {
  //   throw new Error(countError.message);
  // }

  // if (resumeCountData.length >= 4) {
  //   alert('이력서는 최대 4개까지 등록할 수 있습니다.');
  //   return null;
  // }

  // const { error: insertError } = await supabase.from('resume').insert([
  //   {
  //     title: encodedFilename,
  //     resume_image: [],
  //     name: '',
  //     email: '',
  //     phone: '',
  //     introduction: '',
  //     education: [],
  //     experience: [],
  //     certificates: [],
  //     awards: [],
  //     links: [],
  //     upload_resume: url,
  //     is_fitcareer_resume: false,
  //   },
  // ]);

  // if (insertError) {
  //   throw new Error(insertError.message);
  // }

  // return url;

  return '';
};

export const useUploadResume = (
  options?: UseMutationOptions<string | null, Error, File, void>
) => {
  const queryClient = useQueryClient();

  return useMutation<string | null, Error, File, void>({
    mutationFn: uploadResume,
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['resume'] });
      }
    },
    onError: (error: Error) => {
      console.error(error.message);
      alert('이력서 업로드에 실패했습니다. 다시 시도해주세요.');
    },
    ...options,
  });
};
