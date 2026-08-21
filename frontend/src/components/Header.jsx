import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const userId = localStorage.getItem('userId') || '회원';
  // localStorage에서 실시간 토큰 값을 가져옵니다.
  const userTokens = localStorage.getItem('userTokens') || '15';

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userNum');
    localStorage.removeItem('userId');
    localStorage.removeItem('userTokens'); // 로그아웃 시 토큰 정보도 삭제

    navigate('/login', {
      replace: true,
    });
  };

  const isPathActive = (paths) =>
    paths.some((path) =>
      location.pathname.startsWith(path)
    );

  const dropdownItemClass = ({ isActive }) => `
    group
    flex
    items-center
    justify-between
    gap-6
    w-full
    px-4
    py-3
    rounded-none
    text-[14px]
    transition-all
    duration-200
    ${
      isActive
        ? 'bg-[#17372a] text-white'
        : 'text-[#59675f] hover:bg-[#17372a]/[0.06] hover:text-[#17372a]'
    }
  `;

  return (
    <header
      className="
        sticky
        top-0
        z-50
        w-full
        bg-[#eee9df]/95
        backdrop-blur-xl
        border-b
        border-[#17372a]/25
      "
      style={{
        fontFamily:
          '"SUIT Variable", SUIT, -apple-system, BlinkMacSystemFont, "Noto Sans KR", sans-serif',
      }}
    >
      <style>
        {`
          @import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/woff2/SUIT-Variable.css');
        `}
      </style>

      <div
        className="
          max-w-[1360px]
          mx-auto
          px-6
          lg:px-10
          h-[84px]
          flex
          items-center
          justify-between
          gap-8
        "
      >
        {/* LEFT */}
        <div className="flex items-center gap-10 min-w-0">

          {/* Logo */}
          <Link
            to="/main"
            className="
              shrink-0
              flex
              items-center
              gap-3
            "
          >
            <span
              className="
                text-[#17372a]
                text-[28px]
                font-bold
                tracking-[-0.035em]
              "
            >
              FarMMS
            </span>

            <span
              className="
                hidden
                sm:block
                w-[1px]
                h-5
                bg-[#17372a]/20
              "
            />

            <span
              className="
                hidden
                sm:block
                text-[#748078]
                text-[11px]
                font-medium
              "
            >
              농업의 가치를 더하다
            </span>
          </Link>


          {/* MAIN NAV */}
          <nav
            className="
              hidden
              lg:flex
              items-center
              gap-2
            "
          >

            {/* HOME */}
            <NavLink
              to="/main"
              className={({ isActive }) => `
                relative
                px-4
                py-3
                text-[15px]
                font-semibold
                transition
                ${
                  isActive
                    ? 'text-[#17372a]'
                    : 'text-[#66736b] hover:text-[#17372a]'
                }
              `}
            >
              홈
            </NavLink>


            {/* 고객·상품관리 */}
            <div className="relative group">

              <button
                type="button"
                className={`
                  flex
                  items-center
                  gap-2
                  px-4
                  py-3
                  text-[15px]
                  font-semibold
                  transition
                  ${
                    isPathActive([
                      '/contact',
                      '/product',
                    ])
                      ? 'text-[#17372a]'
                      : 'text-[#66736b] group-hover:text-[#17372a]'
                  }
                `}
              >
                고객·상품관리

                <span
                  className="
                    text-[10px]
                    mt-[1px]
                    transition-transform
                    duration-200
                    group-hover:rotate-180
                  "
                >
                  ▾
                </span>
              </button>


              {/* dropdown */}
              <div
                className="
                  absolute
                  left-0
                  top-full
                  pt-3
                  opacity-0
                  invisible
                  translate-y-1
                  group-hover:opacity-100
                  group-hover:visible
                  group-hover:translate-y-0
                  transition-all
                  duration-200
                "
              >
                <div
                  className="
                    w-[230px]
                    bg-white
                    border
                    border-[#17372a]/25
                    rounded-none
                    p-2.5
                    shadow-[0_20px_50px_rgba(40,48,42,0.14)]
                  "
                >
                  <div
                    className="
                      px-3
                      pt-2
                      pb-3
                    "
                  >
                    <p
                      className="
                        text-[#8a958e]
                        text-[10px]
                        font-medium
                        tracking-[0.12em]
                      "
                    >
                      CUSTOMER & PRODUCT
                    </p>

                    <p
                      className="
                        text-[#17372a]
                        text-[13px]
                        font-semibold
                        mt-1
                      "
                    >
                      고객과 상품을 관리하세요
                    </p>
                  </div>

                  <NavLink
                    to="/contact"
                    className={dropdownItemClass}
                  >
                    <div>
                      <p className="font-semibold">
                        연락처 관리
                      </p>

                      <p
                        className="
                          text-[11px]
                          opacity-60
                          mt-0.5
                        "
                      >
                        고객 명부 확인 및 등록
                      </p>
                    </div>

                    <span
                      className="
                        opacity-45
                        group-hover:translate-x-1
                        transition-transform
                      "
                    >
                      →
                    </span>
                  </NavLink>

                  <NavLink
                    to="/product"
                    className={dropdownItemClass}
                  >
                    <div>
                      <p className="font-semibold">
                        상품 관리
                      </p>

                      <p
                        className="
                          text-[11px]
                          opacity-60
                          mt-0.5
                        "
                      >
                        판매 상품 등록 및 수정
                      </p>
                    </div>

                    <span
                      className="
                        opacity-45
                        group-hover:translate-x-1
                        transition-transform
                      "
                    >
                      →
                    </span>
                  </NavLink>
                </div>
              </div>
            </div>


            {/* 이미지 생성·관리 */}
            <div className="relative group">

              <button
                type="button"
                className={`
                  flex
                  items-center
                  gap-2
                  px-4
                  py-3
                  text-[15px]
                  font-semibold
                  transition
                  ${
                    isPathActive([
                      '/createimage',
                      '/manageimage',
                    ])
                      ? 'text-[#17372a]'
                      : 'text-[#66736b] group-hover:text-[#17372a]'
                  }
                `}
              >
                이미지 생성·관리

                <span
                  className="
                    text-[10px]
                    transition-transform
                    duration-200
                    group-hover:rotate-180
                  "
                >
                  ▾
                </span>
              </button>


              <div
                className="
                  absolute
                  left-0
                  top-full
                  pt-3
                  opacity-0
                  invisible
                  translate-y-1
                  group-hover:opacity-100
                  group-hover:visible
                  group-hover:translate-y-0
                  transition-all
                  duration-200
                "
              >
                <div
                  className="
                    w-[240px]
                    bg-white
                    border
                    border-[#17372a]/25
                    rounded-none
                    p-2.5
                    shadow-[0_20px_50px_rgba(40,48,42,0.14)]
                  "
                >
                  <div className="px-3 pt-2 pb-3">
                    <p
                      className="
                        text-[#8a958e]
                        text-[10px]
                        font-medium
                        tracking-[0.12em]
                      "
                    >
                      IMAGE
                    </p>

                    <p
                      className="
                        text-[#17372a]
                        text-[13px]
                        font-semibold
                        mt-1
                      "
                    >
                      홍보 이미지를 만들고 관리하세요
                    </p>
                  </div>

                  <NavLink
                    to="/createimage"
                    className={dropdownItemClass}
                  >
                    <div>
                      <p className="font-semibold">
                        이미지 만들기
                      </p>

                      <p
                        className="
                          text-[11px]
                          opacity-60
                          mt-0.5
                        "
                      >
                        홍보용 이미지 제작
                      </p>
                    </div>

                    <span
                      className="
                        opacity-45
                        group-hover:translate-x-1
                        transition-transform
                      "
                    >
                      →
                    </span>
                  </NavLink>

                  <NavLink
                    to="/manageimage"
                    className={dropdownItemClass}
                  >
                    <div>
                      <p className="font-semibold">
                        이미지 관리
                      </p>

                      <p
                        className="
                          text-[11px]
                          opacity-60
                          mt-0.5
                        "
                      >
                        만든 이미지 모아보기
                      </p>
                    </div>

                    <span
                      className="
                        opacity-45
                        group-hover:translate-x-1
                        transition-transform
                      "
                    >
                      →
                    </span>
                  </NavLink>
                </div>
              </div>
            </div>


            {/* MMS */}
            <div className="relative group">

              <button
                type="button"
                className={`
                  flex
                  items-center
                  gap-2
                  px-4
                  py-3
                  text-[15px]
                  font-semibold
                  transition
                  ${
                    isPathActive([
                      '/sendmms',
                      '/checkmms',
                    ])
                      ? 'text-[#17372a]'
                      : 'text-[#66736b] group-hover:text-[#17372a]'
                  }
                `}
              >
                MMS

                <span
                  className="
                    text-[10px]
                    transition-transform
                    duration-200
                    group-hover:rotate-180
                  "
                >
                  ▾
                </span>
              </button>


              <div
                className="
                  absolute
                  left-0
                  top-full
                  pt-3
                  opacity-0
                  invisible
                  translate-y-1
                  group-hover:opacity-100
                  group-hover:visible
                  group-hover:translate-y-0
                  transition-all
                  duration-200
                "
              >
                <div
                  className="
                    w-[230px]
                    bg-white
                    border
                    border-[#17372a]/25
                    rounded-none
                    p-2.5
                    shadow-[0_20px_50px_rgba(40,48,42,0.14)]
                  "
                >
                  <div className="px-3 pt-2 pb-3">
                    <p
                      className="
                        text-[#8a958e]
                        text-[10px]
                        font-medium
                        tracking-[0.12em]
                      "
                    >
                      MMS
                    </p>

                    <p
                      className="
                        text-[#17372a]
                        text-[13px]
                        font-semibold
                        mt-1
                      "
                    >
                      홍보 메시지를 발송하세요
                    </p>
                  </div>

                  <NavLink
                    to="/sendmms"
                    className={dropdownItemClass}
                  >
                    <div>
                      <p className="font-semibold">
                        MMS 발송
                      </p>

                      <p
                        className="
                          text-[11px]
                          opacity-60
                          mt-0.5
                        "
                      >
                        고객에게 홍보 메시지 보내기
                      </p>
                    </div>

                    <span
                      className="
                        opacity-45
                        group-hover:translate-x-1
                        transition-transform
                      "
                    >
                      →
                    </span>
                  </NavLink>

                  <NavLink
                    to="/checkmms"
                    className={dropdownItemClass}
                  >
                    <div>
                      <p className="font-semibold">
                        발송 내역
                      </p>

                      <p
                        className="
                          text-[11px]
                          opacity-60
                          mt-0.5
                        "
                      >
                        보낸 MMS 내역 확인
                      </p>
                    </div>

                    <span
                      className="
                        opacity-45
                        group-hover:translate-x-1
                        transition-transform
                      "
                    >
                      →
                    </span>
                  </NavLink>
                </div>
              </div>
            </div>


            {/* 고객지원 */}
            <div className="relative group">
              <button
                type="button"
                className={`
                  flex
                  items-center
                  gap-2
                  px-4
                  py-3
                  text-[15px]
                  font-semibold
                  transition
                  ${
                    isPathActive([
                      '/notice',
                      '/inquiry',
                    ])
                      ? 'text-[#17372a]'
                      : 'text-[#66736b] group-hover:text-[#17372a]'
                  }
                `}
              >
                고객지원
                <span
                  className="
                    text-[10px]
                    transition-transform
                    duration-200
                    group-hover:rotate-180
                  "
                >
                  ▾
                </span>
              </button>

              <div
                className="
                  absolute
                  left-0
                  top-full
                  pt-3
                  opacity-0
                  invisible
                  translate-y-1
                  group-hover:opacity-100
                  group-hover:visible
                  group-hover:translate-y-0
                  transition-all
                  duration-200
                "
              >
                <div
                  className="
                    w-[220px]
                    bg-white
                    border
                    border-[#17372a]/25
                    rounded-none
                    p-2.5
                    shadow-[0_20px_50px_rgba(40,48,42,0.14)]
                  "
                >
                  <div className="px-3 pt-2 pb-3">
                    <p
                      className="
                        text-[#8a958e]
                        text-[10px]
                        font-medium
                        tracking-[0.12em]
                      "
                    >
                      SUPPORT
                    </p>
                    <p
                      className="
                        text-[#17372a]
                        text-[13px]
                        font-semibold
                        mt-1
                      "
                    >
                      공지 및 문의를 확인하세요
                    </p>
                  </div>

                  <NavLink
                    to="/notice"
                    className={dropdownItemClass}
                  >
                    <div>
                      <p className="font-semibold">
                        공지사항
                      </p>
                      <p
                        className="
                          text-[11px]
                          opacity-60
                          mt-0.5
                        "
                      >
                        서비스 주요 안내
                      </p>
                    </div>
                    <span
                      className="
                        opacity-45
                        group-hover:translate-x-1
                        transition-transform
                      "
                    >
                      →
                    </span>
                  </NavLink>

                  <NavLink
                    to="/inquiry"
                    className={dropdownItemClass}
                  >
                    <div>
                      <p className="font-semibold">
                        문의하기
                      </p>
                      <p
                        className="
                          text-[11px]
                          opacity-60
                          mt-0.5
                        "
                      >
                        운영진 1:1 문의 및 확인
                      </p>
                    </div>
                    <span
                      className="
                        opacity-45
                        group-hover:translate-x-1
                        transition-transform
                      "
                    >
                      →
                    </span>
                  </NavLink>
                </div>
              </div>
            </div>


            {/* 🌟 토큰 충전 버튼 */}
            <NavLink
              to="/usertoken"
              className={({ isActive }) => `
                relative
                px-4
                py-2
                ml-2
                border
                border-[#17372a]/30
                text-[14px]
                font-bold
                transition
                hover:bg-[#17372a]
                hover:text-white
                ${
                  isActive
                    ? 'bg-[#17372a] text-white border-[#17372a]'
                    : 'bg-[#f0e8dc] text-[#17372a]'
                }
              `}
            >
              토큰 충전
            </NavLink>

          </nav>
        </div>


        {/* RIGHT DESKTOP */}
        <div
          className="
            hidden
            xl:flex
            items-center
            gap-6
            shrink-0
          "
        >
          <div
            className="
              flex
              flex-col
              items-end
              leading-tight
              pr-5
              border-r
              border-[#17372a]/20
            "
          >
            <p
              className="
                text-[14px]
                text-[#17372a]
                font-bold
              "
            >
              {userId}님
            </p>

            <div className="flex items-center gap-1.5 mt-1">
              <span
                className="
                  text-[11px]
                  text-[#6b7971]
                  font-medium
                "
              >
                보유 토큰:
              </span>
              <span
                className="
                  text-[14px]
                  font-bold
                  text-[#17372a]
                "
              >
                {userTokens}개
              </span>
            </div>
          </div>


          <NavLink
            to="/setting"
            className={({ isActive }) =>
              isActive
                ? `
                    text-[#17372a]
                    text-[13px]
                    font-semibold
                  `
                : `
                    text-[#67746c]
                    text-[13px]
                    font-medium
                    hover:text-[#17372a]
                    transition
                  `
            }
          >
            마이페이지
          </NavLink>


          <button
            type="button"
            onClick={handleLogout}
            className="
              group
              flex
              items-center
              gap-2
              text-[#7b6a61]
              hover:text-[#17372a]
              text-[13px]
              font-medium
              transition
            "
          >
            로그아웃

            <span
              className="
                w-8
                h-8
                rounded-none
                border
                border-[#17372a]/25
                flex
                items-center
                justify-center
                text-[14px]
                group-hover:bg-[#17372a]
                group-hover:text-white
                transition
              "
            >
              ↗
            </span>
          </button>
        </div>
      </div>


      {/* MOBILE / TABLET */}
      <div
        className="
          lg:hidden
          border-t
          border-[#17372a]/15
        "
      >
        <div
          className="
            max-w-[1360px]
            mx-auto
            px-6
            py-3
            overflow-x-auto
          "
        >
          <nav
            className="
              flex
              items-center
              gap-6
              min-w-max
              text-[13px]
              font-medium
              text-[#66736b]
            "
          >
            <NavLink
              to="/main"
              className="hover:text-[#17372a]"
            >
              홈
            </NavLink>

            <NavLink
              to="/contact"
              className="hover:text-[#17372a]"
            >
              연락처
            </NavLink>

            <NavLink
              to="/product"
              className="hover:text-[#17372a]"
            >
              상품
            </NavLink>

            <NavLink
              to="/createimage"
              className="hover:text-[#17372a]"
            >
              이미지 생성
            </NavLink>

            <NavLink
              to="/manageimage"
              className="hover:text-[#17372a]"
            >
              이미지 관리
            </NavLink>

            <NavLink
              to="/sendmms"
              className="hover:text-[#17372a]"
            >
              MMS
            </NavLink>

            <NavLink
              to="/checkmms"
              className="hover:text-[#17372a]"
            >
              발송 내역
            </NavLink>

            <NavLink
              to="/notice"
              className="hover:text-[#17372a]"
            >
              공지사항
            </NavLink>

            <NavLink
              to="/inquiry"
              className="hover:text-[#17372a]"
            >
              문의하기
            </NavLink>

            <NavLink
              to="/usertoken"
              className="text-[#17372a] font-bold"
            >
              토큰 충전
            </NavLink>
          </nav>
        </div>

        <div
          className="
            max-w-[1360px]
            mx-auto
            px-6
            pb-3
            flex
            items-center
            justify-between
          "
        >
          <span
            className="
              text-[#17372a]
              text-[12px]
              font-semibold
            "
          >
            {userId}님 (보유 토큰: {userTokens}개)
          </span>

          <div
            className="
              flex
              items-center
              gap-4
              text-[12px]
              font-medium
            "
          >
            <NavLink
              to="/setting"
              className="text-[#66736b]"
            >
              설정
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              className="text-[#806d64]"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}