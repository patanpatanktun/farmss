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

  const calculateAge = () => {
    const year = Number(form.birthYear);
    const month = Number(form.birthMonth);
    const day = Number(form.birthDay);

    const birthDate = new Date(
      year,
      month - 1,
      day
    );

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

    let age =
      today.getFullYear() - year;

    const birthdayPassed =
      today.getMonth() > month - 1 ||
      (
        today.getMonth() === month - 1 &&
        today.getDate() >= day
      );

    if (!birthdayPassed) {
      age -= 1;
    }

    return age;
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    const age = calculateAge();

    const normalizedPhone =
      form.phone.replace(/[^0-9]/g, '');

    if (!form.name.trim()) {
      setErrorMessage(
        '이름을 입력해주세요.'
      );
      return;
    }

    if (!form.gender) {
      setErrorMessage(
        '성별을 선택해주세요.'
      );
      return;
    }

    if (age === null || age < 0) {
      setErrorMessage(
        '올바른 생년월일을 입력해주세요.'
      );
      return;
    }

    if (
      !/^01[0-9]{8,9}$/.test(
        normalizedPhone
      )
    ) {
      setErrorMessage(
        '올바른 휴대폰 번호를 입력해주세요.'
      );
      return;
    }

    if (!form.email.trim()) {
      setErrorMessage(
        '이메일을 입력해주세요.'
      );
      return;
    }

    if (!form.userId.trim()) {
      setErrorMessage(
        '아이디를 입력해주세요.'
      );
      return;
    }

    if (form.password.length < 8) {
      setErrorMessage(
        '비밀번호는 8자리 이상 입력해주세요.'
      );
      return;
    }

    if (
      form.password !==
      form.passwordConfirm
    ) {
      setErrorMessage(
        '비밀번호 확인이 일치하지 않습니다.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const response =
        await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
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

      const responseText =
        await response.text();

      let data = {};

      if (responseText) {
        try {
          data =
            JSON.parse(responseText);
        } catch {
          data = {};
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            '회원가입 처리에 실패했습니다.'
        );
      }

      alert(
        '회원가입이 완료되었습니다.'
      );

      navigate('/login', {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(
        error.message ||
          '회원가입 처리 중 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName = `
    w-full
    bg-transparent
    py-3.5
    text-[15px]
    font-normal
    text-[#17372a]
    placeholder:text-[#9ba69f]
    focus:outline-none
  `;

  return (
    <div
      className="
        min-h-screen
        bg-[#eee9df]
        text-[#17372a]
        antialiased
        flex
        flex-col
        selection:bg-[#17372a]
        selection:text-white
      "
      style={{
        fontFamily:
          '"SUIT Variable", SUIT, -apple-system, BlinkMacSystemFont, "Noto Sans KR", sans-serif',
      }}
    >
      {/* SUIT */}
      <style>
        {`
          @import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/woff2/SUIT-Variable.css');

          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0px 1000px #f7f3eb inset;
            -webkit-text-fill-color: #17372a;
            transition: background-color 5000s ease-in-out 0s;
          }
        `}
      </style>

      {/* Header */}
      <header
        className="
          w-full
          border-b
          border-[#17372a]/10
          bg-[#eee9df]/95
          backdrop-blur-md
          relative
          z-30
        "
      >
        <div
          className="
            max-w-[1440px]
            mx-auto
            px-7
            sm:px-10
            lg:px-14
            h-[88px]
            flex
            items-center
            justify-between
          "
        >
          <Link
            to="/start"
            className="flex items-center gap-3"
          >
            <span
              className="
                text-[#17372a]
                font-bold
                text-[29px]
                tracking-[-0.035em]
              "
            >
              FarMMS
            </span>

            <span className="w-[1px] h-5 bg-[#17372a]/20" />

            <span
              className="
                hidden
                sm:block
                text-[#68766e]
                font-medium
                text-[12px]
              "
            >
              농업의 가치를 더하다
            </span>
          </Link>

          <div className="flex items-center gap-5">
            <span
              className="
                hidden
                sm:block
                text-[13px]
                text-[#7b877f]
                font-normal
              "
            >
              이미 회원이신가요?
            </span>

            <Link
              to="/login"
              className="
                group
                flex
                items-center
                gap-3
                text-[14px]
                font-medium
                text-[#59685f]
                hover:text-[#17372a]
                transition
              "
            >
              로그인

              <span
                className="
                  w-9
                  h-9
                  border
                  border-[#17372a]/20
                  rounded-full
                  flex
                  items-center
                  justify-center
                  group-hover:bg-[#17372a]
                  group-hover:text-white
                  transition
                "
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main
        className="
          flex-1
          flex
          items-center
          justify-center
          px-5
          sm:px-8
          lg:px-12
          py-10
          lg:py-14
        "
      >
        <div
          className="
            w-full
            max-w-[1320px]
            grid
            grid-cols-1
            lg:grid-cols-12
            bg-[#f7f3eb]
            overflow-hidden
            border
            border-[#17372a]/10
            shadow-[0_28px_80px_rgba(40,48,42,0.12)]
            rounded-[48px_12px_48px_12px]
          "
        >
          {/* Left */}
          <section
            className="
              lg:col-span-5
              relative
              min-h-[430px]
              lg:min-h-full
              overflow-hidden
            "
          >
            <img
              src="/image3.png"
              alt="농업 현장"
              className="
                absolute
                inset-0
                w-full
                h-full
                object-cover
              "
            />

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-tr
                from-[#0d281e]/95
                via-[#17372a]/78
                to-[#17372a]/28
              "
            />

            <div
              className="
                absolute
                -right-28
                -bottom-28
                w-[340px]
                h-[340px]
                rounded-full
                border
                border-white/12
              "
            />

            <div
              className="
                absolute
                -right-8
                -bottom-8
                w-[210px]
                h-[210px]
                rounded-full
                border
                border-white/10
              "
            />

            <div
              className="
                relative
                z-10
                h-full
                min-h-[430px]
                flex
                flex-col
                justify-between
                p-9
                sm:p-12
                lg:p-14
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                  text-[#c9d9c2]
                  text-xs
                  font-medium
                  tracking-[0.12em]
                "
              >
                <span className="w-8 h-[1px] bg-[#c9d9c2]/60" />

                JOIN FARMMMS
              </div>

              <div className="max-w-[470px] text-white">
                <p
                  className="
                    text-[14px]
                    font-medium
                    text-[#cbd8cd]
                    mb-5
                  "
                >
                  FarMMS
                </p>

                <h1
                  className="
                    text-[38px]
                    sm:text-[48px]
                    lg:text-[52px]
                    font-bold
                    leading-[1.25]
                    tracking-[-0.035em]
                  "
                >
                  농업 홍보를
                  <br />

                  더 쉽고,
                  <br />

                  <span className="text-emerald-300">
                    더 편리하게.
                  </span>
                </h1>

                <p
                  className="
                    mt-7
                    text-white/70
                    text-[15px]
                    sm:text-[16px]
                    leading-[1.95]
                    font-normal
                  "
                >
                  고객 관리부터 홍보 이미지 제작,
                  문자 발송까지.
                  <br />

                  FarMMS와 함께 간편한 홍보를 시작해보세요.
                </p>
              </div>

              <div
                className="
                  text-white/45
                  text-[11px]
                  font-normal
                  tracking-[0.06em]
                "
              >
                AI · CUSTOMER · MMS
              </div>
            </div>
          </section>

          {/* Form */}
          <section
            className="
              lg:col-span-7
              bg-[#f7f3eb]
            "
          >
            <div
              className="
                w-full
                max-w-[720px]
                mx-auto
                px-8
                sm:px-12
                lg:px-14
                py-14
                lg:py-16
              "
            >
              <div className="mb-12">
                <p
                  className="
                    text-[#728176]
                    text-[12px]
                    font-medium
                    tracking-[0.12em]
                    uppercase
                    mb-4
                  "
                >
                  Create account
                </p>

                <h2
                  className="
                    text-[36px]
                    sm:text-[42px]
                    font-bold
                    tracking-[-0.035em]
                    leading-[1.3]
                    text-[#17372a]
                  "
                >
                  FarMMS를
                  <br />

                  시작해보세요.
                </h2>

                <p
                  className="
                    mt-4
                    text-[#748078]
                    text-[15px]
                    leading-[1.8]
                    font-normal
                  "
                >
                  기본 정보를 입력하면 바로 시작할 수 있습니다.
                </p>
              </div>

              <form
                onSubmit={handleSignup}
                className="space-y-9"
              >
                {/* 이름 / 성별 */}
                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-8
                  "
                >
                  <div>
                    <label className="block text-[13px] font-semibold text-[#536159] mb-2">
                      이름
                    </label>

                    <div
                      className="
                        border-b
                        border-[#17372a]/25
                        focus-within:border-[#17372a]
                        transition
                      "
                    >
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="이름을 입력하세요"
                        className={inputClassName}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-[#536159] mb-3">
                      성별
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className="
                          cursor-pointer
                          flex
                          items-center
                          justify-center
                          h-[48px]
                          border
                          border-[#17372a]/15
                          text-[#66736b]
                          font-medium
                          text-sm
                          rounded-[16px_5px_16px_5px]
                          transition
                          has-[:checked]:bg-[#17372a]
                          has-[:checked]:text-white
                          has-[:checked]:border-[#17372a]
                        "
                      >
                        <input
                          type="radio"
                          name="gender"
                          value="M"
                          checked={form.gender === 'M'}
                          onChange={handleChange}
                          className="sr-only"
                        />

                        남자
                      </label>

                      <label
                        className="
                          cursor-pointer
                          flex
                          items-center
                          justify-center
                          h-[48px]
                          border
                          border-[#17372a]/15
                          text-[#66736b]
                          font-medium
                          text-sm
                          rounded-[5px_16px_5px_16px]
                          transition
                          has-[:checked]:bg-[#17372a]
                          has-[:checked]:text-white
                          has-[:checked]:border-[#17372a]
                        "
                      >
                        <input
                          type="radio"
                          name="gender"
                          value="F"
                          checked={form.gender === 'F'}
                          onChange={handleChange}
                          className="sr-only"
                        />

                        여자
                      </label>
                    </div>
                  </div>
                </div>

                {/* Birth */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#536159] mb-3">
                    생년월일
                  </label>

                  <div
                    className="
                      grid
                      grid-cols-3
                      border-y
                      border-[#17372a]/15
                    "
                  >
                    <div className="border-r border-[#17372a]/12 px-3">
                      <input
                        type="text"
                        name="birthYear"
                        value={form.birthYear}
                        onChange={handleChange}
                        maxLength="4"
                        placeholder="YYYY"
                        className={`${inputClassName} text-center`}
                      />
                    </div>

                    <div className="border-r border-[#17372a]/12 px-3">
                      <input
                        type="text"
                        name="birthMonth"
                        value={form.birthMonth}
                        onChange={handleChange}
                        maxLength="2"
                        placeholder="MM"
                        className={`${inputClassName} text-center`}
                      />
                    </div>

                    <div className="px-3">
                      <input
                        type="text"
                        name="birthDay"
                        value={form.birthDay}
                        onChange={handleChange}
                        maxLength="2"
                        placeholder="DD"
                        className={`${inputClassName} text-center`}
                      />
                    </div>
                  </div>
                </div>

                {/* Phone / Email */}
                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-8
                  "
                >
                  <FormLineInput
                    label="휴대폰 번호"
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="'-' 없이 입력"
                    inputClassName={inputClassName}
                  />

                  <FormLineInput
                    label="이메일"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    inputClassName={inputClassName}
                  />
                </div>

                <FormLineInput
                  label="아이디"
                  type="text"
                  name="userId"
                  value={form.userId}
                  onChange={handleChange}
                  placeholder="사용할 아이디를 입력하세요"
                  inputClassName={inputClassName}
                />

                {/* Password */}
                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-8
                  "
                >
                  <FormLineInput
                    label="비밀번호"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="8자리 이상"
                    inputClassName={inputClassName}
                  />

                  <FormLineInput
                    label="비밀번호 확인"
                    type="password"
                    name="passwordConfirm"
                    value={form.passwordConfirm}
                    onChange={handleChange}
                    placeholder="한 번 더 입력하세요"
                    inputClassName={inputClassName}
                  />
                </div>

                {errorMessage && (
                  <div
                    className="
                      bg-[#f8e7e3]
                      border-l-[3px]
                      border-[#b45a47]
                      px-4
                      py-3.5
                      text-[13px]
                      font-medium
                      text-[#873c2e]
                      rounded-[4px_14px_4px_14px]
                    "
                  >
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    group
                    w-full
                    h-[60px]
                    bg-[#17372a]
                    hover:bg-[#214b39]
                    disabled:bg-[#9ca7a0]
                    disabled:cursor-not-allowed
                    text-white
                    px-7
                    rounded-[22px_6px_22px_6px]
                    transition-all
                    duration-300
                    flex
                    items-center
                    justify-between
                    shadow-[0_14px_30px_rgba(23,55,42,0.15)]
                    hover:-translate-y-0.5
                  "
                >
                  <span
                    className="
                      text-[15px]
                      font-semibold
                    "
                  >
                    {isLoading
                      ? '가입 처리 중...'
                      : '가입 완료하기'}
                  </span>

                  {!isLoading && (
                    <span
                      className="
                        w-8
                        h-8
                        rounded-full
                        border
                        border-white/20
                        flex
                        items-center
                        justify-center
                        group-hover:bg-white
                        group-hover:text-[#17372a]
                        transition
                      "
                    >
                      →
                    </span>
                  )}
                </button>
              </form>

              <div
                className="
                  mt-10
                  pt-8
                  border-t
                  border-[#17372a]/10
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  justify-between
                  gap-4
                "
              >
                <div>
                  <p
                    className="
                      text-[#78847c]
                      text-[12px]
                      font-normal
                      mb-1
                    "
                  >
                    이미 FarMMS를 사용하고 계신가요?
                  </p>

                  <p
                    className="
                      text-[#17372a]
                      text-[14px]
                      font-semibold
                    "
                  >
                    기존 계정으로 로그인하세요.
                  </p>
                </div>

                <Link
                  to="/login"
                  className="
                    group
                    shrink-0
                    flex
                    items-center
                    gap-2
                    text-[#17372a]
                    font-semibold
                    text-[14px]
                  "
                >
                  로그인

                  <span
                    className="
                      group-hover:translate-x-1
                      transition-transform
                    "
                  >
                    →
                  </span>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer
        className="
          max-w-[1440px]
          w-full
          mx-auto
          px-7
          sm:px-10
          lg:px-14
          pb-8
        "
      >
        <div
          className="
            border-t
            border-[#17372a]/10
            pt-6
            flex
            flex-col
            sm:flex-row
            items-center
            justify-between
            gap-3
            text-[#829087]
            text-[11px]
            font-normal
          "
        >
          <span>
            © 2026 FarMMS
          </span>

          <span>
            농업의 가치를 더하다
          </span>
        </div>
      </footer>
    </div>
  );
}

function FormLineInput({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  inputClassName,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="
          block
          text-[13px]
          font-semibold
          text-[#536159]
          mb-2
        "
      >
        {label}
      </label>

      <div
        className="
          border-b
          border-[#17372a]/25
          focus-within:border-[#17372a]
          transition
        "
      >
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputClassName}
        />
      </div>
    </div>
  );
}