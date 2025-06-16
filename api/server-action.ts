'use server';

import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function deleteUser(userId: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_SUPABASE_SERVICE_ROLE!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    const { error: deleteUserError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) throw new Error(deleteUserError.message);

    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    allCookies.forEach((cookie) => {
      if (cookie.name.startsWith('sb-')) {
        cookieStore.set(cookie.name, '', { maxAge: 0 });
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    throw new Error('Internal Server Error');
  }
}
