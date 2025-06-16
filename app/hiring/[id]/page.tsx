import { createServerSupabaseClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import HiringDetailView from './hiring-detail-view';

export const dynamic = 'force-static';

export default async function HiringDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  try {
    const { data: hiring, error } = await supabase.from('hiring').select('*').eq('id', id).single();

    if (error || !hiring) {
      notFound();
    }

    return <HiringDetailView hiringId={id} />;
  } catch (error) {
    notFound();
  }
}
