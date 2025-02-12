import { createServerSupabaseClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import NoAuthority from '@/components/common/no-authority';
import HiringEditDynamicImport from './hiring-edit-view-dynamic-import';

export default async function HiringEditPage({
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

    const { data: hiring } = await supabase
      .from('hiring')
      .select('*')
      .eq('id', id)
      .single();

    if (!user || hiring.user_id !== user.id) {
      return <NoAuthority />;
    }

    return <HiringEditDynamicImport hiringId={id} />;
  } catch (error) {
    notFound();
  }
}
