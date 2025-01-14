import { createServerSupabaseClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import CompanyView from './company-view';

export default async function CompanyPage({
  searchParams,
}: {
  searchParams: Promise<{ hiring_id?: string }>;
}) {
  const { hiring_id: hiringId } = await searchParams;
  if (!hiringId) notFound();

  const supabase = await createServerSupabaseClient();

  try {
    const { data: hiring, error } = await supabase
      .from('hiring')
      .select('*')
      .eq('id', hiringId)
      .single();

    if (error || !hiring) {
      notFound();
    }

    return <CompanyView hiringId={hiringId} />;
  } catch (error) {
    notFound();
  }
}
