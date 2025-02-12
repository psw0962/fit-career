import { createServerSupabaseClient } from '@/utils/supabase/server';
import LoginForm from './login-form';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/');
  }

  return <LoginForm />;
}
