'use client';

import { createBrowserSupabaseClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignUpView() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('인증 메일을 확인해주세요!');
    }
  };

  return (
    <div>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder='이메일' />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder='비밀번호'
        type='password'
      />
      <button onClick={handleSignUp}>회원가입</button>
      <p>{message}</p>
    </div>
  );
}
