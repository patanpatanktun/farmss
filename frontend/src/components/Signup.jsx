import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    gender: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    phone: '',
    email: '',
    userId: '',
    password: '',
    passwordConfirm: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // 생년월일을 현재 만 나이로 변환합니다.
  const calculateAge = () => {
    const year = Number(form.birthYear);
    const month = Number(form.birthMonth);
    const day = Number(form.birthDay);

    const birthDate = new Date(year, month - 1, day);

    if (
      !year ||
      !month ||
      !day ||
      birthDate.getFullYear() !== year ||
      birthDate.getMonth() !== month - 1 ||
      birthDate.getDate() !== day
    ) {
      return null;
    }

    const today = new Date();

    if (birthDate > today) {
      return null;
    }

    let age = today.getFullYear() - year;

    const birthdayPassed =
      today.getMonth() > month - 1 ||
      (today.getMonth() === month - 1 && today.getDate() >= day);

    if (!birthdayPassed) {
      age -= 1;
    }

    return age;
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    const age = calculateAge();
    const normalizedPhone = form.phone.replace(/[^0-9]/g, '');

    if (!form.name.trim()) {
      setErrorMessage('이름을 입력해주세요.');
      return;
    }

    if (!form.gender) {
      setErrorMessage('성별을 선택해주세요.');
      return;
    }

    if (age === null || age < 0) {
      setErrorMessage('올바른 생년월일을 입력해주세요.');
      return;
    }

    if (!/^01[0-9]{8,9}$/.test(normalizedPhone)) {
      setErrorMessage('올바른 휴대폰 번호를 입력해주세요.');
      return;
    }

    if (!form.email.trim()) {
      setErrorMessage('이메일을 입력해주세요.');
      return;
    }

    if (!form.userId.trim()) {
      setErrorMessage('아이디를 입력해주세요.');
      return;
    }

    if (form.password.length < 8) {
      setErrorMessage('비밀번호는 8자리 이상 입력해주세요.');
      return;
    }

    if (form.password !== form.passwordConfirm) {
      setErrorMessage('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: form.userId.trim(),
          password: form.password,
          email: form.email.trim(),
          name: form.name.trim(),
          gender: form.gender,
          age,
          phone: normalizedPhone,
        }),
      });

      const responseText = await response.text();
      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = {};
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message || '회원가입 처리에 실패했습니다.'
        );
      }

      alert('회원가입이 완료되었습니다.');
      navigate('/login', { replace: true });

    } catch (error) {
      setErrorMessage(
        error.message || '회원가입 처리 중 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3.5 text-sm font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-700 transition-all text-gray-900 bg-slate-50/50';

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
            <h1 className="text-3xl font-black text-gray-900">
              회원가입
            </h1>
            <p className="text-gray-600 text-base font-semibold">
              FarMMS와 함께 스마트한 농업 관리를 시작하세요.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">

            <div className="space-y-1.5">
              <label className="block text-sm font-black">이름</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="홍길동"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-black">성별</label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center justify-center px-4 py-3.5 border-2 border-gray-200 rounded-2xl cursor-pointer has-[:checked]:border-emerald-700 has-[:checked]:bg-emerald-50 font-black text-sm">
                  <input
                    type="radio"
                    name="gender"
                    value="M"
                    checked={form.gender === 'M'}
                    onChange={handleChange}
                    className="w-4 h-4 mr-2"
                  />
                  남자
                </label>

                <label className="flex items-center justify-center px-4 py-3.5 border-2 border-gray-200 rounded-2xl cursor-pointer has-[:checked]:border-emerald-700 has-[:checked]:bg-emerald-50 font-black text-sm">
                  <input
                    type="radio"
                    name="gender"
                    value="F"
                    checked={form.gender === 'F'}
                    onChange={handleChange}
                    className="w-4 h-4 mr-2"
                  />
                  여자
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-black">생년월일</label>

              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  name="birthYear"
                  value={form.birthYear}
                  onChange={handleChange}
                  maxLength="4"
                  placeholder="년(YYYY)"
                  className={`${inputClass} text-center`}
                />

                <input
                  type="text"
                  name="birthMonth"
                  value={form.birthMonth}
                  onChange={handleChange}
                  maxLength="2"
                  placeholder="월(MM)"
                  className={`${inputClass} text-center`}
                />

                <input
                  type="text"
                  name="birthDay"
                  value={form.birthDay}
                  onChange={handleChange}
                  maxLength="2"
                  placeholder="일(DD)"
                  className={`${inputClass} text-center`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-black">휴대폰 번호</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="'-' 없이 숫자만 입력"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-black">이메일</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-black">아이디</label>
              <input
                type="text"
                name="userId"
                value={form.userId}
                onChange={handleChange}
                placeholder="아이디를 입력하세요"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-black">비밀번호</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="8자리 이상 입력"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-black">
                비밀번호 확인
              </label>
              <input
                type="password"
                name="passwordConfirm"
                value={form.passwordConfirm}
                onChange={handleChange}
                placeholder="비밀번호를 한 번 더 입력하세요"
                className={inputClass}
              />
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="block w-full py-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl transition-all mt-4 text-center shadow-md"
            >
              {isLoading ? '가입 처리 중...' : '가입 완료하기'}
            </button>
          </form>
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