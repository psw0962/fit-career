import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '../utils/supabase/client';

// =========================================
// ============== post hiring
// =========================================
const postHiring = async (data: any) => {
  const supabase = createBrowserSupabaseClient();

  const imageUrls: string[] = [];

  for (const image of data.images) {
    const { data, error } = await supabase.storage
      .from('hiring')
      .upload(`hiring/${Date.now()}-${image.name}`, image);

    if (error) {
      throw new Error(`이미지 업로드 실패: ${error.message}`);
    }

    const url = supabase.storage.from('hiring').getPublicUrl(data.path);
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
      period: data.periodValue,
      title: data.title,
      content: data.content,
      dead_line: data.deadLine,
      images: imageUrls,
      short_address: shortAddres,
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }
};

export const usePostHiring = (
  options?: UseMutationOptions<
    void,
    Error,
    {
      address: object;
      position: object;
      periodValue: number[];
      title: string;
      content: string;
      deadLine: string;
      images: File[];
    },
    void
  >
) => {
  return useMutation<
    void,
    Error,
    {
      address: object;
      position: object;
      periodValue: number[];
      title: string;
      content: string;
      deadLine: string;
      images: File[];
    },
    void
  >({
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
const getHiring = async () => {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.from('hiring').select('*');

  if (error) {
    throw new Error(`${error.message}`);
  }

  return data;
};

export const useGetHiring = (options?: UseQueryOptions<any[], Error>) => {
  return useQuery<any[], Error>({
    queryKey: ['hiringList'],
    queryFn: getHiring,
    ...options,
  });
};
