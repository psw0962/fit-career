import { createServerSupabaseClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import EnterpriseProfileEditForm from './enterprise-profile-edit-form';

export default async function EnterpriseProfileEditPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth?message=login_required');
  }

  return <EnterpriseProfileEditForm />;
}
