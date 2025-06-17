'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createServerSupabaseClient = async (
  cookieStore: ReturnType<typeof cookies> = cookies(),
  admin: boolean = false,
) => {
  const cookieInstance = await cookieStore;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    admin ? process.env.NEXT_SUPABASE_SERVICE_ROLE! : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieInstance.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieInstance.set({ name, value, ...options });
          } catch (error) {
            console.log(error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieInstance.set({ name, value: '', ...options });
          } catch (error) {
            console.log(error);
          }
        },
      },
    },
  );
};

export const createServerSupabaseAdminClient = async (
  cookieStore: ReturnType<typeof cookies> = cookies(),
) => {
  return createServerSupabaseClient(cookieStore, true);
};
