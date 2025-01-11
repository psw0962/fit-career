import { createServerSupabaseClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import NoAuthority from '@/components/common/no-authority';
import HiringEditView from './hiring-edit-view';

export default async function HiringDetailPage({
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

    const { data: hiring, error } = await supabase
      .from('hiring')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !hiring) {
      notFound();
    }

    // 필요한 경우 권한 체크 추가
    if (!user || hiring.user_id !== user.id) {
      return <NoAuthority />;
    }

    return <HiringEditView hiringId={id} />;
  } catch (error) {
    notFound();
  }
}
