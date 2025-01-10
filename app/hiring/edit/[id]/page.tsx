import { createServerSupabaseClient } from '@/utils/supabase/server';
import NoAuthority from '@/components/common/no-authority';
import HiringEditView from './hiring-edit-view';

const HiringEditPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> => {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: hiringData, error: hiringError } = await supabase
    .from('hiring')
    .select('*')
    .eq('id', id)
    .single();

  if (hiringError || !user || hiringData?.user_id !== user.id) {
    return <NoAuthority />;
  }

  return <HiringEditView hiringId={id} />;
};

export default HiringEditPage;
