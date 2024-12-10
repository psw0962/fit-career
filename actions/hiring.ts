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
type HiringData = {
  address: {
    zoneCode: string;
    zoneAddress: string;
    detailAddress: string;
  };
  position: {
    job: string;
    etc?: string;
  };
  periodValue: number[];
  title: string;
  content: string;
  deadLine: string;
  images: File[];
  enterprise_name: string;
  enterprise_logo: string;
  enterprise_establishment: string;
  enterprise_description: string;
};

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
      enterprise_name: data.enterprise_name,
      enterprise_logo: data.enterprise_logo,
      enterprise_establishment: data.enterprise_establishment,
      enterprise_description: data.enterprise_description,
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
type HiringDataProps = {
  id: string;
  created_at: string;
  address: string;
  position: string;
  position_etc: boolean;
  period: number[];
  title: string;
  content: string;
  dead_line: string;
  images: string[];
  short_address: string;
  user_id: string;
  enterprise_name: string;
  enterprise_logo: string;
  enterprise_establishment: string;
  enterprise_description: string;
};

const getHiring = async (id?: string): Promise<HiringDataProps[]> => {
  const supabase = createBrowserSupabaseClient();
  const query = supabase.from('hiring').select('*');

  if (id) {
    query.eq('id', id);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`${error.message}`);
  }

  return data as HiringDataProps[];
};

export const useGetHiring = (
  id?: string,
  options?: UseQueryOptions<HiringDataProps[], Error>
) => {
  return useQuery<HiringDataProps[], Error>({
    queryKey: ['hiringList', id],
    queryFn: () => getHiring(id),
    ...options,
  });
};
