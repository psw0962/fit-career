import { createServerSupabaseClient } from '@/utils/supabase/server';
import SignUpView from '@/app/auth/sign-up/sign-up-view';
import { redirect } from 'next/navigation';

export default async function SignUp() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/');
  }

  return <SignUpView />;
}
