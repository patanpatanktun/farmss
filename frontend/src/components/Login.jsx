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

      localStorage.setItem(
        'accessToken',
        data.accessToken
      );

      localStorage.setItem(
        'userId',
        data.userId || trimmedUserId
      );

      if (
        data.userNum !== undefined &&
        data.userNum !== null
      ) {
        localStorage.setItem(
          'userNum',
          String(data.userNum)
        );
      }

      if (rememberUserId) {
        localStorage.setItem(
          'savedUserId',
          trimmedUserId
        );
      } else {
        localStorage.removeItem('savedUserId');
      }

      navigate('/main', {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(
        error.message ||
          '로그인 처리 중 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

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

          <Link
            to="/start"
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
            <span>
              홈으로 돌아가기
            </span>

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
              ←
            </span>
          </Link>
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
            max-w-[1280px]
            grid
            grid-cols-1
            lg:grid-cols-12
            min-h-[690px]
            bg-[#f7f3eb]
            overflow-hidden
            border
            border-[#17372a]/10
            shadow-[0_28px_80px_rgba(40,48,42,0.12)]
            rounded-[46px_12px_46px_12px]
          "
        >
          {/* Left Image */}
          <section
            className="
              lg:col-span-7
              relative
              min-h-[420px]
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
                via-[#17372a]/72
                to-[#17372a]/15
              "
            />

            {/* Decorative Circles */}
            <div
              className="
                absolute
                -right-20
                -bottom-20
                w-[280px]
                h-[280px]
                border
                border-white/15
                rounded-full
              "
            />

            <div
              className="
                absolute
                -right-5
                -bottom-5
                w-[170px]
                h-[170px]
                border
                border-white/10
                rounded-full
              "
            />

            <div
              className="
                relative
                z-10
                h-full
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
                  inline-flex
                  items-center
                  gap-3
                  text-[#c9d9c2]
                  text-xs
                  font-medium
                  tracking-[0.12em]
                  uppercase
                "
              >
                <span className="w-8 h-[1px] bg-[#c9d9c2]/60" />

                FARM MARKETING SERVICE
              </div>

              <div className="max-w-[560px] text-white">
                <p
                  className="
                    text-[15px]
                    sm:text-[16px]
                    font-medium
                    text-[#cbd8cd]
                    mb-5
                  "
                >
                  FarMMS
                </p>

                <h1
                  className="
                    text-[40px]
                    sm:text-[52px]
                    lg:text-[58px]
                    font-bold
                    leading-[1.23]
                    tracking-[-0.035em]
                  "
                >
                  농업의 가치를
                  <br />

                  더 쉽게
                  <br />

                  <span className="text-emerald-300">
                    전달하는 방법.
                  </span>
                </h1>

                <p
                  className="
                    mt-7
                    text-white/72
                    text-[15px]
                    sm:text-[17px]
                    leading-[1.95]
                    font-normal
                    max-w-[500px]
                  "
                >
                  고객 관리부터 홍보 이미지 제작,
                  문자 발송까지.
                  <br />

                  복잡했던 농자재 홍보를
                  FarMMS 하나로 간편하게 관리하세요.
                </p>
              </div>

              <div
                className="
                  flex
                  items-center
                  justify-between
                  text-white/50
                  text-[11px]
                  font-normal
                  tracking-[0.06em]
                "
              >
                <span>
                  AI · CUSTOMER · MMS
                </span>

                <span>
                  2026
                </span>
              </div>
            </div>
          </section>

          {/* Right Login */}
          <section
            className="
              lg:col-span-5
              flex
              items-center
              justify-center
              bg-[#f7f3eb]
            "
          >
            <div
              className="
                w-full
                max-w-[430px]
                px-8
                sm:px-10
                py-14
                lg:py-16
              "
            >
              {/* Title */}
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
                  Welcome back
                </p>

                <h2
                  className="
                    text-[36px]
                    sm:text-[42px]
                    font-bold
                    tracking-[-0.035em]
                    leading-[1.28]
                    text-[#17372a]
                  "
                >
                  다시 만나
                  <br />

                  반갑습니다.
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
                  FarMMS 계정으로 로그인해 주세요.
                </p>
              </div>

              <form
                onSubmit={handleLogin}
                className="space-y-8"
              >
                {/* ID */}
                <div>
                  <label
                    htmlFor="userId"
                    className="
                      block
                      text-[13px]
                      font-semibold
                      text-[#536159]
                      mb-2
                    "
                  >
                    아이디
                  </label>

                  <div
                    className="
                      relative
                      border-b
                      border-[#17372a]/25
                      focus-within:border-[#17372a]
                      transition-colors
                    "
                  >
                    <input
                      type="text"
                      id="userId"
                      value={userId}
                      onChange={(event) =>
                        setUserId(event.target.value)
                      }
                      placeholder="아이디를 입력하세요"
                      autoComplete="username"
                      required
                      className="
                        w-full
                        bg-transparent
                        py-4
                        pr-10
                        text-[16px]
                        font-normal
                        text-[#17372a]
                        placeholder:text-[#a0aaa3]
                        focus:outline-none
                      "
                    />

                    <span
                      className="
                        absolute
                        right-0
                        top-1/2
                        -translate-y-1/2
                        text-[#8a968e]
                        text-[11px]
                        font-medium
                      "
                    >
                      ID
                    </span>
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label
                    htmlFor="password"
                    className="
                      block
                      text-[13px]
                      font-semibold
                      text-[#536159]
                      mb-2
                    "
                  >
                    비밀번호
                  </label>

                  <div
                    className="
                      relative
                      border-b
                      border-[#17372a]/25
                      focus-within:border-[#17372a]
                      transition-colors
                    "
                  >
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="비밀번호를 입력하세요"
                      autoComplete="current-password"
                      required
                      className="
                        w-full
                        bg-transparent
                        py-4
                        pr-12
                        text-[16px]
                        font-normal
                        text-[#17372a]
                        placeholder:text-[#a0aaa3]
                        focus:outline-none
                      "
                    />

                    <span
                      className="
                        absolute
                        right-0
                        top-1/2
                        -translate-y-1/2
                        text-[#8a968e]
                        text-[10px]
                        font-medium
                        tracking-[0.05em]
                      "
                    >
                      PW
                    </span>
                  </div>
                </div>

                {/* Options */}
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    pt-1
                    text-[13px]
                  "
                >
                  <label
                    className="
                      flex
                      items-center
                      gap-2.5
                      cursor-pointer
                      text-[#65736a]
                      font-normal
                      select-none
                    "
                  >
                    <input
                      type="checkbox"
                      checked={rememberUserId}
                      onChange={(event) =>
                        setRememberUserId(
                          event.target.checked
                        )
                      }
                      className="sr-only peer"
                    />

                    <span
                      className="
                        w-[18px]
                        h-[18px]
                        border
                        border-[#17372a]/30
                        rounded-[6px_2px_6px_2px]
                        flex
                        items-center
                        justify-center
                        transition
                        peer-checked:bg-[#17372a]
                        peer-checked:border-[#17372a]
                        peer-checked:after:content-['✓']
                        peer-checked:after:text-white
                        peer-checked:after:text-[11px]
                        peer-checked:after:font-semibold
                      "
                    />

                    <span>
                      아이디 저장
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        '비밀번호 찾기 기능은 추후 제공될 예정입니다.'
                      )
                    }
                    className="
                      text-[#59675f]
                      font-medium
                      hover:text-[#17372a]
                      transition
                      border-b
                      border-transparent
                      hover:border-[#17372a]/40
                      pb-0.5
                    "
                  >
                    비밀번호 찾기
                  </button>
                </div>

                {/* Error */}
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

                {/* Login */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    group
                    w-full
                    h-[58px]
                    bg-[#17372a]
                    hover:bg-[#214b39]
                    disabled:bg-[#9ca7a0]
                    disabled:cursor-not-allowed
                    text-white
                    mt-2
                    px-6
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
                      ? '로그인 중...'
                      : '로그인하기'}
                  </span>

                  {!isLoading && (
                    <span
                      className="
                        w-8
                        h-8
                        border
                        border-white/20
                        rounded-full
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

              {/* Signup */}
              <div
                className="
                  mt-11
                  pt-8
                  border-t
                  border-[#17372a]/10
                "
              >
                <div
                  className="
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
                      아직 계정이 없으신가요?
                    </p>

                    <p
                      className="
                        text-[#17372a]
                        text-[14px]
                        font-semibold
                      "
                    >
                      지금 FarMMS를 시작해보세요.
                    </p>
                  </div>

                  <Link
                    to="/signup"
                    className="
                      shrink-0
                      inline-flex
                      items-center
                      gap-2
                      text-[#17372a]
                      font-semibold
                      text-[14px]
                      group
                    "
                  >
                    회원가입

                    <span
                      className="
                        inline-block
                        group-hover:translate-x-1
                        transition-transform
                      "
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
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