import { createServerSupabaseClient } from '@/utils/supabase/server';
import NoAuthority from '@/components/common/no-authority';
import ResumeEditView from './resume-edit-view';

const ResumeEditPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> => {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: resumeData, error: resumeError } = await supabase
    .from('resume')
    .select('*')
    .eq('id', id)
    .single();

  if (resumeError || !user || resumeData?.user_id !== user.id) {
    return <NoAuthority />;
  }

  return <ResumeEditView resumeId={id} />;
};

export default ResumeEditPage;
