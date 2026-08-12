import {
  Link,
  NavLink,
  useNavigate,
} from 'react-router-dom';

/**
 * 저장된 JWT가 유효한지 확인합니다.
 */
function checkAuthentication() {
  const token =
    localStorage.getItem('accessToken');

  if (!token) {
    return false;
  }

  try {
    const tokenParts = token.split('.');

    if (tokenParts.length !== 3) {
      return false;
    }

    let payloadText = tokenParts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    while (payloadText.length % 4 !== 0) {
      payloadText += '=';
    }

    const decodedPayload =
      atob(payloadText);

    const payload = JSON.parse(
      decodeURIComponent(
        decodedPayload
          .split('')
          .map(
            (character) =>
              `%${character
                .charCodeAt(0)
                .toString(16)
                .padStart(2, '0')}`
          )
          .join('')
      )
    );

    if (!payload.exp) {
      return false;
    }

    return (
      payload.exp * 1000 >
      Date.now()
    );
  } catch {
    return false;
  }
}

export default function Header() {
  const navigate = useNavigate();

  const isLoggedIn =
    checkAuthentication();

  const userId =
    localStorage.getItem('userId') ||
    '회원';

  /**
   * 로그아웃 처리
   */
  const handleLogout = () => {
    localStorage.removeItem(
      'accessToken'
    );

    localStorage.removeItem(
      'userNum'
    );

    localStorage.removeItem(
      'userId'
    );

    navigate('/login', {
      replace: true,
    });
  };

  /**
   * 현재 페이지에 해당하는 메뉴를
   * 초록색으로 표시합니다.
   */
  const getMenuClassName = ({
    isActive,
  }) => {
    const defaultClassName =
      'py-1 whitespace-nowrap ' +
      'transition border-b-2';

    if (isActive) {
      return (
        `${defaultClassName} ` +
        'text-emerald-700 ' +
        'border-emerald-700'
      );
    }

    return (
      `${defaultClassName} ` +
      'text-gray-800 ' +
      'border-transparent ' +
      'hover:text-emerald-700'
    );
  };

  /**
   * 로그인하지 않은 사용자의 헤더입니다.
   *
   * 공지사항은 확인할 수 있지만
   * 회원 전용 기능은 표시하지 않습니다.
   */
  if (!isLoggedIn) {
    return (
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        {/* 상단 영역 */}
        <div className="max-w-[1360px] mx-auto px-6 lg:px-10 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-gray-100">
          <Link
            to="/start"
            className="flex items-center gap-2.5"
          >
            <span className="text-emerald-800 font-black text-xl tracking-tight">
              FarMMS
            </span>

            <span className="text-gray-300 font-light">
              |
            </span>

            <span className="text-gray-600 font-semibold text-xs tracking-wide">
              농업의 가치를 더하다
            </span>
          </Link>

          <div className="flex items-center gap-4 text-sm font-bold">
            <Link
              to="/login"
              className="text-gray-700 hover:text-emerald-700 transition"
            >
              로그인
            </Link>

            <Link
              to="/signup"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black transition"
            >
              회원가입
            </Link>
          </div>
        </div>

        {/* 공개 메뉴 영역 */}
        <div className="max-w-[1360px] mx-auto px-6 lg:px-10 py-4 overflow-x-auto">
          <div className="flex items-center gap-10 min-w-max">
            <Link
              to="/start"
              className="text-2xl font-black text-emerald-800 tracking-tight"
            >
              FarMMS
            </Link>

            <nav className="flex items-center gap-7 font-bold text-base">
              <NavLink
                to="/start"
                className={
                  getMenuClassName
                }
              >
                홈
              </NavLink>

              <NavLink
                to="/notice"
                className={
                  getMenuClassName
                }
              >
                공지사항
              </NavLink>
            </nav>
          </div>
        </div>
      </header>
    );
  }

  /**
   * 로그인한 사용자의 헤더입니다.
   */
  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* 최상단 사용자 영역 */}
      <div className="max-w-[1360px] mx-auto px-6 lg:px-10 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-gray-100 text-sm">
        <div className="flex items-center gap-2.5">
          <Link
            to="/main"
            className="text-emerald-800 font-black text-xl tracking-tight"
          >
            FarMMS
          </Link>

          <span className="text-gray-300 font-light">
            |
          </span>

          <span className="text-gray-600 font-semibold text-xs tracking-wide">
            농업의 가치를 더하다
          </span>
        </div>

        <div className="flex items-center gap-5 text-gray-700 font-bold text-sm">
          <span>
            <strong
              className="font-black"
              style={{
                color: '#013220',
              }}
            >
              {userId}
            </strong>

            님 환영합니다
          </span>

          <span className="text-gray-300">
            |
          </span>

          <NavLink
            to="/setting"
            className={({
              isActive,
            }) =>
              isActive
                ? 'text-emerald-700 font-black'
                : 'hover:text-emerald-700 transition'
            }
          >
            설정
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600 transition"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 로그인 사용자 전체 메뉴 */}
      <div className="max-w-[1360px] mx-auto px-6 lg:px-10 py-4 overflow-x-auto">
        <div className="flex items-center gap-10 min-w-max">
          <Link
            to="/main"
            className="text-2xl font-black text-emerald-800 tracking-tight"
          >
            FarMMS
          </Link>

          <nav className="flex items-center gap-7 font-bold text-base">
            <NavLink
              to="/main"
              className={
                getMenuClassName
              }
            >
              홈
            </NavLink>

            <NavLink
              to="/notice"
              className={
                getMenuClassName
              }
            >
              공지사항
            </NavLink>

            <NavLink
              to="/contact"
              className={
                getMenuClassName
              }
            >
              연락처 관리
            </NavLink>

            <NavLink
              to="/product"
              className={
                getMenuClassName
              }
            >
              상품 관리
            </NavLink>

            <NavLink
              to="/createimage"
              className={
                getMenuClassName
              }
            >
              이미지 만들기
            </NavLink>

            <NavLink
              to="/manageimage"
              className={
                getMenuClassName
              }
            >
              이미지 관리
            </NavLink>

            <NavLink
              to="/sendmms"
              className={
                getMenuClassName
              }
            >
              MMS 발송
            </NavLink>

            <NavLink
              to="/checkmms"
              className={
                getMenuClassName
              }
            >
              발송 내역
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}