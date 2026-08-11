import { Link, NavLink, useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || '회원';

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userNum');
    localStorage.removeItem('userId');

    navigate('/login', {
      replace: true,
    });
  };

  const getMenuClassName = ({ isActive }) => {
    const defaultClassName =
      'py-1 whitespace-nowrap transition border-b-2';

    if (isActive) {
      return `${defaultClassName} text-emerald-700 border-emerald-700`;
    }

    return `${defaultClassName} text-gray-800 border-transparent hover:text-emerald-700`;
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-10 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-gray-100 text-sm">
        <div className="flex items-center gap-2.5">
          <Link
            to="/main"
            className="text-emerald-800 font-black text-xl tracking-tight"
          >
            FarMMS
          </Link>

          <span className="text-gray-300 font-light">|</span>

          <span className="text-gray-600 font-semibold text-xs tracking-wide">
            농업의 가치를 더하다
          </span>
        </div>

        <div className="flex items-center gap-5 text-gray-700 font-bold text-sm">
          <span>
            <strong
              className="font-black"
              style={{ color: '#013220' }}
            >
              {userId}
            </strong>
            님 환영합니다
          </span>

          <span className="text-gray-300">|</span>

          <NavLink
            to="/setting"
            className={({ isActive }) =>
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
              className={getMenuClassName}
            >
              홈
            </NavLink>

            <NavLink
              to="/contact"
              className={getMenuClassName}
            >
              연락처 관리
            </NavLink>

            <NavLink
              to="/product"
              className={getMenuClassName}
            >
              상품 관리
            </NavLink>

            <NavLink
              to="/createimage"
              className={getMenuClassName}
            >
              이미지 만들기
            </NavLink>

            <NavLink
              to="/manageimage"
              className={getMenuClassName}
            >
              이미지 관리
            </NavLink>

            <NavLink
              to="/sendmms"
              className={getMenuClassName}
            >
              MMS 발송
            </NavLink>

            <NavLink
              to="/checkmms"
              className={getMenuClassName}
            >
              발송 내역
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}