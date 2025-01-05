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

  await new Promise((resolve) => setTimeout(resolve, 3000));

  const imageUrls: string[] = [];

  for (const image of data.images) {
    const { data: uploadData, error } = await supabase.storage
      .from('hiring')
      .upload(`hiring/${Date.now()}-${image.name}`, image);

    if (error) {
      throw new Error(`${error.message}`);
    }

    const url = supabase.storage.from('hiring').getPublicUrl(uploadData.path);
    imageUrls.push(url.data.publicUrl);
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
        className: 'bg-[#4C71C0] text-white rounded',
      });
      router.push('/hiring');
    },
    onError: (error: Error) => {
      console.error('채용 공고 등록 중 에러 발생:', error);

      // Supabase 에러 메시지 확인
      if (error.message.includes('You can only post once every hour')) {
        const minutes = error.message.match(/\d+/)?.[0];
        toast({
          title: '연달아 채용공고 게시글을 생성할 수 없어요.',
          description: `도배 방지를 위해 채용 게시글 생성은 1시간 제한이 있습니다.
${minutes}분 후에 다시 시도해 주세요.`,
          className: 'bg-[#4C71C0] text-white rounded',
        });
      } else {
        toast({
          description: '채용 공고 등록에 실패했습니다. 다시 시도해주세요.',
          className: 'bg-[#4C71C0] text-white rounded',
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
        className: 'bg-[#4C71C0] text-white rounded',
      });
    },
    onError: (error: Error) => {
      console.error(error.message);
      toast({
        description:
          '상태 변경에 실패했습니다. 네트워크 에러, 잠시 후 다시 시도해주세요.',
        className: 'bg-[#4C71C0] text-white rounded',
      });
    },
    onSettled: (_, __, variables) => {
      variables.setUpdatingId(null);
    },
    ...options,
  });
};
