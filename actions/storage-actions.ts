import { createServerSupabaseClient } from '../utils/supabase/server';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const postUploadFile = async (formData: FormData): Promise<void> => {
  const supabase = await createServerSupabaseClient();
  const file = formData.get('file') as File;

  console.log(file);

  // const { data, error } = await supabase.storage
  //   .from(process.env.NEXT_PUBLIC_STORAGE_BUCKET as string)
  //   .upload(file.name, file, { upsert: true });

  // if (error) throw new Error(error.message);

  // return data;
};

export const usePostUploaFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      console.log(data);
      return postUploadFile(data as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [] });
      console.log('success');
    },
    onError: (error) => {
      console.error(error.message);
    },
  });
};
