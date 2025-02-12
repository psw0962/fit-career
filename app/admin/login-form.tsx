'use client';

import { useSignInWithEmail } from '@/actions/auth';
import GlobalSpinner from '@/components/common/global-spinner';
import { validateInput } from '@/functions/validateInput';
import { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const { mutate: login, status: loginStatus } = useSignInWithEmail();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (email.length === 0 || password.length === 0) {
      setEmailError(true);
      setPasswordError(true);
      return;
    }

    const isEmailValid = validateInput(email, 'email');

    setEmailError(!isEmailValid);

    if (isEmailValid) {
      login({ email, password });
    }
  };

  if (loginStatus === 'pending') return <GlobalSpinner />;

  return (
    <div className="w-full mx-auto min-h-[50vh] flex flex-col justify-center">
      <div className="flex flex-col gap-2 justify-center items-center">
        <p className="text-center text-2xl font-bold break-keep">
          {`[관리자 로그인]`}
        </p>

        <p className="text-center text-2xl font-bold break-keep">
          피트니스의 모든 정보, FIT Career
        </p>

        <p className="flex items-center text-base text-center text-[#8F9091] font-bold break-keep">
          취업, 이직, 커리어 콘텐츠, 중고 거래, 대회 정보까지
          <br />
          피트니스 정보의 모든 것
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 mx-auto mt-10"
      >
        <div className="flex flex-col gap-1">
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => {
              const newEmail = e.target.value;
              setEmail(newEmail);
              if (newEmail) {
                setEmailError(!validateInput(newEmail, 'email'));
              } else {
                setEmailError(false);
              }
            }}
            className={`w-[250px] py-2 px-4 border rounded ${
              emailError ? 'border-red-500' : 'border-gray-300'
            }`}
            autoComplete="email"
          />
          {emailError && (
            <span className="text-red-500 text-sm">
              올바른 이메일 형식이 아닙니다.
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(false);
            }}
            className={`w-[250px] py-2 px-4 border rounded ${
              passwordError ? 'border-red-500' : 'border-gray-300'
            }`}
            autoComplete="current-password"
          />
          {passwordError && (
            <span className="text-red-500 text-sm">
              비밀번호를 입력해주세요.
            </span>
          )}
        </div>

        <button
          className="w-fit flex items-center justify-center bg-[#4C71BF] text-white text-sm font-bold mx-auto py-2 px-4 rounded"
          onClick={handleSubmit}
        >
          로그인
        </button>
      </form>
    </div>
  );
}
