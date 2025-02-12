import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import NoAuthority from '@/components/common/no-authority';
import ResumeEditView from './resume-edit-view';

export default async function ResumeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: resumeData, error: resumeError } = await supabase
      .from('resume')
      .select('*')
      .eq('id', id)
      .single();

    if (resumeError || !resumeData) {
      notFound();
    }

    if (!user || resumeData.user_id !== user.id) {
      return <NoAuthority />;
    }

    return <ResumeEditView resumeId={id} />;
  } catch (error) {
    notFound();
  }
}
