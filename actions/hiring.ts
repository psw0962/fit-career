import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '../utils/supabase/client';
import { HiringData, HiringDataResponse } from '@/types/hiring/hiring';
import { formatKRTime } from '@/functions/formatKRTime';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// =========================================
// ============== post hiring
// =========================================
const postHiring = async (data: HiringData) => {
  const supabase = createBrowserSupabaseClient();

  const imageUrls: string[] = [];

  for (const image of data.images) {
    if (typeof image !== 'string') {
      const { data: uploadData, error } = await supabase.storage
        .from('hiring')
        .upload(`hiring/${Date.now()}-${image.name}`, image);

      if (error) {
        throw new Error(`${error.message}`);
      }

      const url = supabase.storage.from('hiring').getPublicUrl(uploadData.path);
      imageUrls.push(url.data.publicUrl);
    } else {
      imageUrls.push(image);
    }
  }

  const makeShortAddress = data.address.zoneAddress.split(' ');
  const shortAddres =
    makeShortAddress[0] === '세종특별자치시'
      ? makeShortAddress[0].slice(0, 2)
      : `${makeShortAddress[0].slice(0, 2)} ${makeShortAddress[1]}`;

  const { error } = await supabase.from('hiring').insert([
    {
      address: `${data.address.zoneCode} ${data.address.zoneAddress} ${data.address.detailAddress}`,
      position:
        data.position.job === '기타' ? data.position.etc : data.position.job,
      position_etc: data.position.job === '기타' ? true : false,
      period: data.periodValue,
      title: data.title,
      content: data.content,
      dead_line: data.deadLine,
      images: imageUrls,
      short_address: shortAddres,
      address_search_key: data.address.zoneAddress,
      created_at: formatKRTime(),
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }
};

export const usePostHiring = (
  options?: UseMutationOptions<void, Error, HiringData, void>
) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation<void, Error, HiringData, void>({
    mutationFn: postHiring,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['hiringList'],
        refetchType: 'active',
        exact: false,
      });
      toast({
        title: '채용 공고가 성공적으로 등록되었습니다.',
        description: '이제부터 지원자가 해당 채용공고를 볼 수 있어요.',
        variant: 'default',
      });
      router.push('/');
    },
    onError: (error: Error) => {
      console.error('채용 공고 등록 중 에러 발생:', error);

      if (error.message.includes('You can only post once every 24 hour.')) {
        const minutes = error.message.match(/(\d+)\s*minutes/)?.[1] ?? '';
        toast({
          title: '연달아 채용공고 게시글을 생성할 수 없어요.',
          description: `도배 방지를 위해 채용 게시글 생성은 24시간마다 한 번만 할 수 있어요.
${minutes}분 후에 다시 시도해 주세요.`,
          variant: 'warning',
        });
      } else {
        toast({
          title:
            '채용 공고 등록에 실패했습니다. 네트워크 에러, 잠시 후 다시 시도해주세요.',
          variant: 'warning',
        });
      }
    },
    ...options,
  });
};

// =========================================
// ============== get hiring
// =========================================
type FilterParams = {
  id?: string;
  user_id?: string;
  page?: number;
  pageSize?: number;
  getAllData?: boolean;
  isVisibleFilter?: boolean;
  filters?: {
    regions?: string[];
    positions?: string[];
    periodRange?: [number, number];
  };
};

const getHiring = async (params: FilterParams) => {
  const supabase = createBrowserSupabaseClient();
  const {
    page = 0,
    pageSize = 12,
    getAllData = false,
    isVisibleFilter = false,
    filters,
  } = params;

  let query = supabase.from('hiring').select(`
      *,
      enterprise_profile:enterprise_profile!user_id(*)
    `);

  let countQuery = supabase
    .from('hiring')
    .select('*', { count: 'exact', head: true });

  // 기본 조건
  const matchCondition = params.id
    ? { id: params.id }
    : params.user_id
      ? { user_id: params.user_id }
      : {};

  query = query.match(matchCondition);
  countQuery = countQuery.match(matchCondition);

  // 숨김 여부 필터
  if (isVisibleFilter) {
    query = query.eq('is_visible', true);
    countQuery = countQuery.eq('is_visible', true);
  }

  // 지역 필터
  if (filters?.regions?.length) {
    const regionFilter = filters.regions
      .map((region) => `address.ilike.%${region}%`)
      .join(',');
    query = query.or(regionFilter);
    countQuery = countQuery.or(regionFilter);
  }

  // 포지션 필터
  if (filters?.positions?.length) {
    if (filters.positions.includes('기타')) {
      const positionFilter = `position_etc.eq.true,position.in.(${filters.positions
        .filter((p) => p !== '기타')
        .join(',')})`;
      query = query.or(positionFilter);
      countQuery = countQuery.or(positionFilter);
    } else {
      query = query.in('position', filters.positions);
      countQuery = countQuery.in('position', filters.positions);
    }
  }

  // 경력 기간 필터
  if (filters?.periodRange) {
    const [start, end] = filters.periodRange;

    // 전체 범위 필터 없이 통과
    if (start === 0 && end === 10) {
      // 단일 값 필터링
    } else if (start === end) {
      query = query.gte('period->>0', start).lte('period->>1', end);
      countQuery = countQuery.gte('period->>0', start).lte('period->>1', end);
      // 범위 내 값 필터링
    } else {
      query = query.gte('period->>0', start).lte('period->>1', end);
      countQuery = countQuery.gte('period->>0', start).lte('period->>1', end);
    }
  }

  // 정렬
  query = query.order('created_at', { ascending: false });

  // 페이지네이션
  if (!getAllData) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
  }

  const [{ data, error }, { count, error: countError }] = await Promise.all([
    query,
    countQuery,
  ]);

  if (error || countError) {
    throw new Error(error?.message || countError?.message);
  }

  return {
    data: data as HiringDataResponse[],
    count: count || 0,
  };
};

export const useGetHiring = (
  params: FilterParams,
  options?: UseQueryOptions<
    { data: HiringDataResponse[]; count: number },
    Error
  >
) => {
  return useQuery<{ data: HiringDataResponse[]; count: number }, Error>({
    queryKey: ['hiringList', params],
    queryFn: () => getHiring(params),
    ...options,
  });
};

// =========================================
// ============== get hiring by id
// =========================================
const getHiringById = async (hiringId: string) => {
  const supabase = createBrowserSupabaseClient();

  const { data, error } = await supabase
    .from('hiring')
    .select(
      `
      *,
      enterprise_profile:enterprise_profile!user_id(*)
    `
    )
    .eq('id', hiringId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as HiringDataResponse;
};

export const useGetHiringById = (
  hiringId: string,
  options?: UseQueryOptions<HiringDataResponse, Error>
) => {
  return useQuery<HiringDataResponse, Error>({
    queryKey: ['hiring', hiringId],
    queryFn: () => getHiringById(hiringId),
    ...options,
  });
};

// =========================================
// ============== get hirings by user submission
// =========================================
const getHiringByUserSubmission = async (
  userId: string,
  { page, pageSize }: { page: number; pageSize: number }
): Promise<{ data: HiringDataResponse[]; count: number }> => {
  const supabase = createBrowserSupabaseClient();

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const [{ data, error }, { count, error: countError }] = await Promise.all([
    supabase
      .from('hiring')
      .select(
        `
        *,
        enterprise_profile:enterprise_profile!user_id(*)
      `
      )
      .contains('resume_received', JSON.stringify([{ user_id: userId }]))
      .range(from, to)
      .order('resume_received->0->>submitted_at', { ascending: false }),

    supabase
      .from('hiring')
      .select('*', { count: 'exact', head: true })
      .contains('resume_received', JSON.stringify([{ user_id: userId }])),
  ]);

  if (error || countError) {
    throw new Error(error?.message || countError?.message);
  }

  return {
    data: data as HiringDataResponse[],
    count: count || 0,
  };
};

export const useGetHiringByUserSubmission = (
  userId: string,
  { page = 0, pageSize = 12 }: { page?: number; pageSize?: number } = {},
  options?: Partial<
    UseQueryOptions<{ data: HiringDataResponse[]; count: number }, Error>
  >
) => {
  return useQuery<{ data: HiringDataResponse[]; count: number }, Error>({
    queryKey: ['hiringListByUserSubmission', userId, page, pageSize],
    queryFn: () => getHiringByUserSubmission(userId, { page, pageSize }),
    placeholderData: (previousData) => previousData,
    ...options,
  });
};

// =========================================
// ============== update hiring visibility
// =========================================
const updateHiringVisibility = async ({
  hiringId,
  isVisible,
}: {
  hiringId: string;
  isVisible: boolean;
}) => {
  const supabase = createBrowserSupabaseClient();

  const { error } = await supabase
    .from('hiring')
    .update({ is_visible: isVisible })
    .eq('id', hiringId);

  if (error) {
    throw new Error(error.message);
  }
};

export const useUpdateHiringVisibility = (
  options?: UseMutationOptions<
    void,
    Error,
    { hiringId: string; isVisible: boolean },
    void
  >
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<
    void,
    Error,
    {
      hiringId: string;
      isVisible: boolean;
      setUpdatingId: (id: string | null) => void;
    },
    void
  >({
    mutationFn: updateHiringVisibility,
    onMutate: (variables) => {
      variables.setUpdatingId(variables.hiringId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['hiringList'],
        refetchType: 'active',
        exact: false,
      });

      toast({
        title: variables.isVisible
          ? '채용공고가 표시되었습니다.'
          : '채용공고가 숨김 표시되었습니다.',
        description: variables.isVisible
          ? '이제부터 지원자가 해당 채용공고를 볼 수 있어요.'
          : '이제부터 지원자가 해당 채용공고를 볼 수 없어요.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error(error.message);
      toast({
        description:
          '상태 변경에 실패했습니다. 네트워크 에러, 잠시 후 다시 시도해주세요.',
        variant: 'warning',
      });
    },
    onSettled: (_, __, variables) => {
      variables.setUpdatingId(null);
    },
    ...options,
  });
};

// =========================================
// ============== delete hiring
// =========================================
const deleteHiring = async (hiringId: string) => {
  const supabase = createBrowserSupabaseClient();

  const { data: hiringData, error: hiringError } = await supabase
    .from('hiring')
    .select('*')
    .eq('id', hiringId)
    .single();

  if (hiringError) {
    throw new Error(hiringError.message);
  }

  const { error: bookmarkDeleteError } = await supabase
    .from('bookmarks_hiring')
    .delete()
    .eq('hiring_id', hiringId);

  if (bookmarkDeleteError) {
    console.error(`Failed to delete bookmarks: ${bookmarkDeleteError.message}`);
  }

  const { error: deleteError } = await supabase
    .from('hiring')
    .delete()
    .eq('id', hiringId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const currentImages: string[] = hiringData?.images || [];

  for (const imageUrl of currentImages) {
    const path = imageUrl.split('/').slice(-1)[0];
    const { error: storageDeleteError } = await supabase.storage
      .from('hiring')
      .remove([`hiring/${path}`]);

    if (storageDeleteError) {
      console.error(`Failed to delete image: ${storageDeleteError.message}`);
    }
  }
};

export const useDeleteHiring = (
  options?: UseMutationOptions<void, Error, string, void>
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string, void>({
    mutationFn: deleteHiring,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['hiringList'],
        refetchType: 'active',
        exact: false,
      });

      toast({
        title: '채용공고가 삭제되었습니다.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('채용 공고 삭제 중 에러 발생:', error);
      toast({
        title: '채용 공고 삭제에 실패했습니다.',
        description: '네트워크 에러, 잠시 후 다시 시도해주세요.',
        variant: 'warning',
      });
    },
    ...options,
  });
};

// =========================================
// ============== patch hiring
// =========================================
const patchHiring = async (data: HiringData) => {
  const supabase = createBrowserSupabaseClient();

  const { data: hiringData, error: hiringDataError } = await supabase
    .from('hiring')
    .select('images')
    .eq('id', data.id)
    .single();

  if (hiringDataError) throw new Error(hiringDataError.message);

  const existingImages: string[] = hiringData?.images || [];

  const finalImageUrls: string[] = await Promise.all(
    data.images.map(async (img: File | string) => {
      if (typeof img === 'string') {
        return img;
      } else {
        const { data: uploadData, error } = await supabase.storage
          .from('hiring')
          .upload(`hiring/${Date.now()}-${img.name}`, img);
        if (error) throw new Error(error.message);
        const url = supabase.storage
          .from('hiring')
          .getPublicUrl(uploadData.path);
        return url.data.publicUrl;
      }
    })
  );

  for (const imageUrl of existingImages) {
    if (!finalImageUrls.includes(imageUrl)) {
      const path = imageUrl.split('/').slice(-1)[0];
      await supabase.storage.from('hiring').remove([`hiring/${path}`]);
    }
  }

  const makeShortAddress = data.address.zoneAddress.split(' ');
  const shortAddress =
    makeShortAddress[0] === '세종특별자치시'
      ? makeShortAddress[0].slice(0, 2)
      : `${makeShortAddress[0].slice(0, 2)} ${makeShortAddress[1]}`;

  const { error } = await supabase
    .from('hiring')
    .update({
      address: `${data.address.zoneCode} ${data.address.zoneAddress} ${data.address.detailAddress}`,
      position:
        data.position.job === '기타' ? data.position.etc : data.position.job,
      position_etc: data.position.job === '기타',
      period: data.periodValue,
      title: data.title,
      content: data.content,
      dead_line: data.deadLine,
      images: finalImageUrls,
      short_address: shortAddress,
      address_search_key: data.address.zoneAddress,
      updated_at: formatKRTime(),
    })
    .eq('id', data.id);

  if (error) throw new Error(error.message);
};

export const usePatchHiring = (
  options?: UseMutationOptions<void, Error, HiringData, void>
) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation<void, Error, HiringData, void>({
    mutationFn: patchHiring,
    onSuccess: () => {
      router.push('/auth/my-page');

      queryClient.invalidateQueries({
        queryKey: ['hiringList'],
        refetchType: 'active',
        exact: false,
      });

      toast({
        title: '채용공고가 수정되었습니다.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('채용 공고 수정 중 에러 발생:', error);
      toast({
        title: '채용 공고 수정에 실패했습니다.',
        description: '네트워크 에러, 잠시 후 다시 시도해주세요.',
        variant: 'warning',
      });
    },
    ...options,
  });
};

// =========================================
// ============== toggle bookmark
// =========================================
type BookmarkContext = {
  previousBookmark: unknown;
};

const toggleBookmark = async (hiringId: string): Promise<void> => {
  const supabase = createBrowserSupabaseClient();

  await new Promise((resolve) => setTimeout(resolve, 500));

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error('user not found');

  const { data: existingBookmark, error: checkError } = await supabase
    .from('bookmarks_hiring')
    .select()
    .eq('user_id', user.id)
    .eq('hiring_id', hiringId)
    .maybeSingle();

  if (checkError && checkError.code !== 'PGRST116') {
    throw new Error(checkError.message);
  }

  if (existingBookmark) {
    const { error: deleteError } = await supabase
      .from('bookmarks_hiring')
      .delete()
      .eq('user_id', user.id)
      .eq('hiring_id', hiringId);

    if (deleteError) throw new Error(deleteError.message);
  } else {
    const { error: insertError } = await supabase
      .from('bookmarks_hiring')
      .insert([{ user_id: user.id, hiring_id: hiringId }]);

    if (insertError) throw new Error(insertError.message);
  }
};

export const useToggleBookmark = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();
  return useMutation<void, Error, string, BookmarkContext>({
    mutationFn: toggleBookmark,
    onMutate: async (hiringId) => {
      await queryClient.cancelQueries({
        queryKey: ['bookmarksHiring', hiringId],
      });

      const previousBookmark =
        queryClient.getQueryData<boolean>(['bookmarksHiring', hiringId]) ??
        false;

      queryClient.setQueryData(
        ['bookmarksHiring', hiringId],
        !previousBookmark
      );

      return { previousBookmark };
    },
    onSuccess: async (_, hiringId) => {
      const isBookmarked = queryClient.getQueryData<boolean>([
        'bookmarksHiring',
        hiringId,
      ]);

      toast({
        title: isBookmarked
          ? '북마크가 추가되었습니다.'
          : '북마크가 삭제되었습니다.',
        variant: 'default',
      });

      await queryClient.invalidateQueries({
        queryKey: ['bookmarksHiring', hiringId],
      });

      await queryClient.invalidateQueries({
        queryKey: ['bookmarksHiring'],
        refetchType: 'active',
        exact: false,
      });
    },
    onError: (error, hiringId, context) => {
      if (error.message === 'Auth session missing!') {
        router.push('/auth');

        toast({
          title: '로그인이 필요한 서비스입니다.',
          description: '로그인 후 다시 시도해주세요.',
          variant: 'warning',
        });

        return;
      }

      if (context?.previousBookmark !== undefined) {
        queryClient.setQueryData(
          ['bookmarksHiring', hiringId],
          context.previousBookmark
        );
      }
      console.error(error.message);
      toast({
        title: '북마크 상태 변경에 실패했습니다.',
        description: '네트워크 에러가 발생했습니다. 잠시 후 다시 시도해주세요.',
        variant: 'warning',
      });
    },
  });
};

// =========================================
// ============== check if post is bookmarked
// =========================================
const checkIsBookmarked = async (
  hiringIds: string[]
): Promise<Record<string, boolean>> => {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return {};

  const { data, error } = await supabase
    .from('bookmarks_hiring')
    .select('hiring_id')
    .eq('user_id', user.id)
    .in('hiring_id', hiringIds);

  if (error) throw new Error(error.message);

  const bookmarkedIds = data.map(
    (item: { hiring_id: string }) => item.hiring_id
  );
  const bookmarkStatus = Object.fromEntries(
    hiringIds.map((id) => [id, bookmarkedIds.includes(id)])
  );

  return bookmarkStatus;
};

export const useCheckIsBookmarked = (hiringIds: string[]) => {
  return useQuery({
    queryKey: ['bookmarksHiring', ...hiringIds],
    queryFn: () => checkIsBookmarked(hiringIds),
    throwOnError: true,
  });
};

// =========================================
// ============== get bookmarked hirings by user id
// =========================================
const getBookmarkedHiringsByUserId = async (
  page: number = 0,
  pageSize: number = 12
): Promise<{ data: HiringDataResponse[]; count: number }> => {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error('User not found');

  const { data: bookmarkData, error: bookmarkError } = await supabase
    .from('bookmarks_hiring')
    .select('hiring_id')
    .eq('user_id', user.id);

  if (bookmarkError) throw new Error(bookmarkError.message);

  const hiringIds = bookmarkData.map(
    (item: { hiring_id: string }) => item.hiring_id
  );

  if (hiringIds.length === 0) {
    return { data: [], count: 0 };
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const [{ data, error }, { count, error: countError }] = await Promise.all([
    supabase
      .from('hiring')
      .select(
        `
        *,
        enterprise_profile:enterprise_profile!user_id(*)
      `
      )
      .in('id', hiringIds)
      .order('created_at', { ascending: false })
      .range(from, to),

    supabase
      .from('hiring')
      .select('*', { count: 'exact', head: true })
      .in('id', hiringIds),
  ]);

  if (error || countError) {
    throw new Error(error?.message || countError?.message);
  }

  return {
    data: data as HiringDataResponse[],
    count: count || 0,
  };
};

export const useGetBookmarkedHiringsByUserId = (
  page: number = 0,
  pageSize: number = 12,
  options?: UseQueryOptions<
    { data: HiringDataResponse[]; count: number },
    Error
  >
) => {
  return useQuery<{ data: HiringDataResponse[]; count: number }, Error>({
    queryKey: ['bookmarkedHiringsByUserId', page, pageSize],
    queryFn: () => getBookmarkedHiringsByUserId(page, pageSize),
    ...options,
  });
};

// =========================================
// ============== delete bookmark
// =========================================
const deleteBookmark = async (hiringId: string): Promise<void> => {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error('User not found');

  const { error: deleteError } = await supabase
    .from('bookmarks_hiring')
    .delete()
    .eq('user_id', user.id)
    .eq('hiring_id', hiringId);

  if (deleteError) throw new Error(deleteError.message);
};

export const useDeleteBookmark = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: deleteBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['bookmarkedHiringsByUserId'],
        refetchType: 'active',
        exact: false,
      });
      toast({
        title: '북마크가 삭제되었습니다.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('북마크 삭제 중 에러 발생:', error);
      toast({
        title: '북마크 삭제에 실패했습니다.',
        description: '네트워크 에러, 잠시 후 다시 시도해주세요.',
        variant: 'warning',
      });
    },
  });
};
