import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '../utils/supabase/client';
import { HiringData, HiringDataResponse } from '@/types/hiring/hiring';
import { formatKRTime } from '@/functions/formatKRTime';

// =========================================
// ============== post hiring
// =========================================
const postHiring = async (data: HiringData) => {
  const supabase = createBrowserSupabaseClient();

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
      updated_at: formatKRTime(),
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }
};

export const usePostHiring = (
  options?: UseMutationOptions<void, Error, HiringData, void>
) => {
  return useMutation<void, Error, HiringData, void>({
    mutationFn: postHiring,
    onSuccess: () => {
      alert('채용 공고가 성공적으로 등록되었습니다.');
      window.location.replace('/hiring');
    },
    onError: (error: Error) => {
      console.error('채용 공고 등록 중 에러 발생:', error.message);
      alert('채용 공고 등록에 실패했습니다. 다시 시도해주세요.');
    },
    ...options,
  });
};

// =========================================
// ============== get hiring
// =========================================
const getHiring = async (params: {
  id?: string;
  user_id?: string;
}): Promise<HiringDataResponse[]> => {
  const supabase = createBrowserSupabaseClient();

  let query = supabase.from('hiring').select(`
    *,
    enterprise_profile:enterprise_profile!user_id(*)
  `);

  if (params.user_id) {
    query.eq('user_id', params.user_id);
  } else if (params.id) {
    query.eq('id', params.id);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`${error.message}`);
  }

  return data as HiringDataResponse[];
};

export const useGetHiring = (
  params: { id?: string; user_id?: string },
  options?: UseQueryOptions<HiringDataResponse[], Error>
) => {
  return useQuery<HiringDataResponse[], Error>({
    queryKey: ['hiringList', params.id, params.user_id],
    queryFn: () => getHiring(params),
    ...options,
  });
};
