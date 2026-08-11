import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState(
    localStorage.getItem('savedUserId') || ''
  );
  const [password, setPassword] = useState('');
  const [rememberUserId, setRememberUserId] = useState(
    Boolean(localStorage.getItem('savedUserId'))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    const trimmedUserId = userId.trim();

    if (!trimmedUserId) {
      setErrorMessage('아이디를 입력해주세요.');
      return;
    }

    if (!password) {
      setErrorMessage('비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: trimmedUserId,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || '아이디 또는 비밀번호를 확인해주세요.'
        );
      }

      if (!data.accessToken) {
        throw new Error('로그인 토큰을 전달받지 못했습니다.');
      }

      // 로그인 토큰 저장
      localStorage.setItem('accessToken', data.accessToken);

      // 현재 로그인한 사용자의 아이디 저장
      localStorage.setItem(
        'userId',
        data.userId || trimmedUserId
      );

      // 회원 번호 저장
      if (data.userNum !== undefined && data.userNum !== null) {
        localStorage.setItem('userNum', String(data.userNum));
      }

      // 아이디 저장 체크박스 처리
      if (rememberUserId) {
        localStorage.setItem('savedUserId', trimmedUserId);
      } else {
        localStorage.removeItem('savedUserId');
      }

      navigate('/main', { replace: true });
    } catch (error) {
      setErrorMessage(
        error.message || '로그인 처리 중 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-100 text-gray-900 min-h-screen flex flex-col justify-between font-sans antialiased">
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1360px] mx-auto px-10 py-5 flex items-center justify-between">
          <Link to="/start" className="flex items-center gap-2.5">
            <span className="text-emerald-800 font-black text-2xl tracking-tight">
              FarMMS
            </span>

            <span className="text-gray-300 font-light">|</span>

            <span className="text-gray-600 font-semibold text-sm tracking-wide">
              농업의 가치를 더하다
            </span>
          </Link>

          <Link
            to="/start"
            className="text-sm font-bold text-gray-700 hover:text-emerald-700 transition"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-12 w-full flex-1 flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-gray-200 p-10 shadow-md w-full space-y-8">
          <div className="text-center space-y-2 border-b border-gray-100 pb-6">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              로그인
            </h1>

            <p className="text-gray-600 text-base font-semibold">
              FarMMS 서비스 이용을 위해 로그인해 주세요.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="userId"
                className="block text-sm font-black text-gray-800"
              >
                아이디
              </label>

              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="아이디를 입력하세요"
                autoComplete="username"
                required
                className="w-full px-4 py-3.5 text-sm font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-700 transition-all text-gray-900 bg-slate-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-black text-gray-800"
              >
                비밀번호
              </label>

              <input
                type="password"
                id="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3.5 text-sm font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-700 transition-all text-gray-900 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center justify-between text-sm font-bold text-gray-700 pt-1">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberUserId}
                  onChange={(event) =>
                    setRememberUserId(event.target.checked)
                  }
                  className="w-4 h-4 rounded text-emerald-700 border-gray-300"
                />

                <span>아이디 저장</span>
              </label>

              <button
                type="button"
                onClick={() =>
                  alert('비밀번호 찾기 기능은 추후 제공될 예정입니다.')
                }
                className="hover:text-emerald-700 transition"
              >
                비밀번호 찾기
              </button>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="block w-full py-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl transition-all text-center shadow-md mt-2"
            >
              {isLoading ? '로그인 중...' : '로그인하기'}
            </button>
          </form>

          <div className="pt-6 border-t border-gray-200 text-center space-y-3">
            <p className="text-sm text-gray-600 font-bold">
              아직 FarMMS 회원이 아니신가요?
            </p>

            <Link
              to="/signup"
              className="inline-block w-full py-3.5 border-2 border-emerald-700 text-emerald-700 hover:bg-emerald-50 font-black text-base rounded-2xl transition-colors text-center"
            >
              회원가입 하기
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full bg-white border-t border-gray-200 py-6 px-10 text-center text-gray-600 text-xs shadow-sm">
        <p className="font-bold">
          © 2026 FarMMS. All rights reserved.
        </p>
      </footer>
    </div>
  );
}