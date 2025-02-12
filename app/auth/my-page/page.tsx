import { createServerSupabaseClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import MyPageView from './my-page-view';

export default async function MyPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth?message=login_required');
  }

  return <MyPageView />;
}
