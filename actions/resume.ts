import { createBrowserSupabaseClient } from '../utils/supabase/client';
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { ResumeData, ResumeDataResponse } from '@/types/resume/resume';
import { v4 as uuidv4 } from 'uuid';
import { formatKRTime } from '@/functions/formatKRTime';
import { convertBase64Unicode } from '@/functions/convertBase64Unicode';
import { ResumeReceived } from '@/types/hiring/hiring';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

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

      return resumeData as ResumeDataResponse[];
    }

    // user id로 가져오는 경우
    const { data: userData } = await supabase.auth.getUser();
    if (userData) {
      const { data: resumeData } = await supabase
        .from('resume')
        .select('*')
        .eq('user_id', userData?.user?.id);

      return resumeData as ResumeDataResponse[];
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

  await new Promise((resolve) => setTimeout(resolve, 3000));

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
      updated_at: formatKRTime(),
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
  const router = useRouter();
  const { toast } = useToast();

  return useMutation<
    void,
    Error,
    { resumeData: ResumeData; resumeId: string },
    void
  >({
    mutationFn: ({ resumeData, resumeId }) =>
      patchResume({ resumeData, resumeId }),
    onSuccess: () => {
      toast({
        title: '이력서가 수정 되었습니다.',
        description: '성공적으로 이력서를 수정했어요.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['resume'] });
      router.push('/auth/my-page');
    },
    onError: (error: Error) => {
      console.error(error.message);
      toast({
        title: '이력서 수정에 실패했습니다.',
        description: '네트워크 에러가 발생했습니다. 잠시 후 다시 시도해주세요.',
        variant: 'warning',
      });
    },
    ...options,
  });
};

// =========================================
// ============== post new resume
// =========================================
const postNewResume = async () => {
  const supabase = createBrowserSupabaseClient();

  await new Promise((resolve) => setTimeout(resolve, 1000));

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
    throw new Error('MAX_RESUME_COUNT');
  }

  const { error: insertError } = await supabase.from('resume').insert([
    {
      title: '새 이력서',
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
      updated_at: formatKRTime(),
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
  const { toast } = useToast();

  return useMutation<void, Error, void, void>({
    mutationFn: postNewResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume'] });
    },
    onError: (error: Error) => {
      console.error(error.message);

      if (error.message === 'MAX_RESUME_COUNT') {
        toast({
          title: '이력서는 최대 4개까지 등록할 수 있습니다.',
          variant: 'warning',
        });
        return;
      }

      toast({
        title: '이력서 등록에 실패했습니다.',
        description: '네트워크 에러가 발생했습니다. 잠시 후 다시 시도해주세요.',
        variant: 'warning',
      });
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

  if (resumeData.upload_resume) {
    const uploadPath = resumeData.upload_resume.split('/').slice(-1)[0];

    const { error: storageDeleteError } = await supabase.storage
      .from('resume')
      .remove([`resume/resume-file/${uploadPath}`]);

    if (storageDeleteError) {
      console.error(
        `Failed to delete uploaded file: ${storageDeleteError.message}`
      );
    }
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
  const { toast } = useToast();

  return useMutation<void, Error, string, void>({
    mutationFn: deleteResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume'] });
      toast({
        title: '이력서가 삭제되었습니다.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error(error.message);
      toast({
        title: '이력서 삭제에 실패했습니다.',
        description: '네트워크 에러가 발생했습니다. 잠시 후 다시 시도해주세요.',
        variant: 'warning',
      });
    },
    ...options,
  });
};

// =========================================
// ============== upload resume
// =========================================
const uploadResume = async (file: File): Promise<string | null> => {
  const supabase = createBrowserSupabaseClient();

  const fileName = `${uuidv4()}-${convertBase64Unicode(file.name, 'encode')}`;

  // 파일 처리
  const allowedExtensions = ['pdf', 'hwp', 'xlsx', 'xls', 'docx', 'pptx'];
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (!allowedExtensions.includes(fileExtension || '')) {
    throw new Error('INVALID_FILE_EXTENSION');
  }

  const { error: uploadError } = await supabase.storage
    .from('resume')
    .upload(`resume/resume-file/${fileName}`, file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const url = supabase.storage
    .from('resume')
    .getPublicUrl(`resume/resume-file/${fileName}`).data.publicUrl;

  // resume 생성
  const { data: userData, error: userDataError } =
    await supabase.auth.getUser();

  if (userDataError) {
    throw new Error(userDataError.message);
  }

  const { data: resumeCountData, error: countError } = await supabase
    .from('resume')
    .select('*', { count: 'exact' })
    .eq('user_id', userData.user.id);

  if (countError) {
    throw new Error(countError.message);
  }

  if (resumeCountData.length >= 4) {
    throw new Error('MAX_RESUME_COUNT');
  }

  const { error: insertError } = await supabase.from('resume').insert([
    {
      title: convertBase64Unicode(file.name, 'encode'),
      resume_image: [],
      name: '',
      email: '',
      phone: '',
      introduction: '',
      education: [],
      experience: [],
      certificates: [],
      awards: [],
      links: [],
      upload_resume: url,
      is_fitcareer_resume: false,
      updated_at: formatKRTime(),
    },
  ]);

  if (insertError) {
    throw new Error(insertError.message);
  }

  return url;
};

export const useUploadResume = (
  options?: UseMutationOptions<string | null, Error, File, void>
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<string | null, Error, File, void>({
    mutationFn: uploadResume,
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['resume'] });
      }
    },
    onError: (error: Error) => {
      console.error(error.message);

      if (error.message === 'INVALID_FILE_EXTENSION') {
        toast({
          title: 'PDF, 한글, 엑셀, 워드, 파워포인트 파일만 업로드 가능합니다.',
          variant: 'warning',
        });
        return;
      }

      if (error.message === 'MAX_RESUME_COUNT') {
        toast({
          title: '이력서는 최대 4개까지 등록할 수 있습니다.',
          variant: 'warning',
        });
        return;
      }

      if (error.message.includes('KeyTooLongError')) {
        toast({
          title: '업로드하는 이력서의 제목은 최대 20자까지 입력할 수 있어요.',
          variant: 'warning',
        });
        return;
      }

      toast({
        title: '이력서 업로드에 실패했습니다.',
        description: '네트워크 에러가 발생했습니다. 잠시 후 다시 시도해주세요.',
        variant: 'warning',
      });
    },
    ...options,
  });
};

// =========================================
// ============== post resume to hiring
// =========================================
const postResumeToHiring = async (data: {
  hiringId: string;
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

  const { data: hiringData, error: hiringError } = await supabase
    .from('hiring')
    .select('resume_received')
    .eq('id', data.hiringId)
    .single();

  if (hiringError) {
    throw new Error(hiringError.message);
  }

  const newResumeEntry = {
    ...resumeData,
    status: 'pending',
    submitted_at: formatKRTime(),
  };

  const currentResumes = hiringData.resume_received || [];

  const { error: updateError } = await supabase
    .from('hiring')
    .update({
      resume_received: [...currentResumes, newResumeEntry],
    })
    .eq('id', data.hiringId);

  if (updateError) {
    throw new Error(updateError.message);
  }
};

export const usePostResumeToHiring = (
  options?: UseMutationOptions<
    void,
    Error,
    { hiringId: string; resumeId: string },
    void
  >
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, { hiringId: string; resumeId: string }, void>(
    {
      mutationFn: postResumeToHiring,
      onSuccess: () => {
        toast({
          title: '이력서가 성공적으로 제출되었습니다.',
          variant: 'default',
        });

        queryClient.invalidateQueries({ queryKey: ['hiringList'] });
      },
      onError: (error: Error) => {
        console.error(error.message);

        toast({
          title: '이력서 제출에 실패했습니다.',
          description:
            '네트워크 에러가 발생했습니다. 잠시 후 다시 시도해주세요.',
          variant: 'warning',
        });
      },
      ...options,
    }
  );
};

// =========================================
// ============== delete resume from hiring
// =========================================
const deleteResumeFromHiring = async (data: {
  hiringId: string;
  userId: string;
}) => {
  const supabase = createBrowserSupabaseClient();

  const { data: hiringData, error: hiringError } = await supabase
    .from('hiring')
    .select('resume_received')
    .eq('id', data.hiringId)
    .single();

  if (hiringError) {
    throw new Error(hiringError.message);
  }

  const updatedResumes = hiringData.resume_received.filter(
    (resume: ResumeReceived) => resume.user_id !== data.userId
  );

  const { error: updateError } = await supabase
    .from('hiring')
    .update({
      resume_received: updatedResumes,
    })
    .eq('id', data.hiringId);

  if (updateError) {
    throw new Error(updateError.message);
  }
};

export const useDeleteResumeFromHiring = (
  options?: UseMutationOptions<
    void,
    Error,
    { hiringId: string; userId: string },
    void
  >
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, { hiringId: string; userId: string }, void>({
    mutationFn: deleteResumeFromHiring,
    onSuccess: () => {
      toast({
        title: '지원이 취소되었습니다.',
        variant: 'default',
      });

      queryClient.invalidateQueries({ queryKey: ['hiringList'] });
      queryClient.invalidateQueries({
        queryKey: ['hiringListByUserSubmission'],
      });
    },
    onError: (error: Error) => {
      console.error(error.message);

      toast({
        title: '지원 취소에 실패했습니다.',
        description: '네트워크 에러가 발생했습니다. 잠시 후 다시 시도해주세요.',
        variant: 'warning',
      });
    },
    ...options,
  });
};
