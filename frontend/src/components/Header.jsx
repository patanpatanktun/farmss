import {
  Link,
  NavLink,
  useNavigate,
} from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const userId =
    localStorage.getItem('userId') || '회원';

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
      <div className="max-w-[1360px] mx-auto px-6 lg:px-10 py-4 flex items-center justify-between gap-8">
        <div className="flex items-center gap-9 min-w-0 overflow-x-auto">
          <Link
            to="/main"
            className="text-2xl font-black text-emerald-800 tracking-tight shrink-0"
          >
            FarMMS
          </Link>

          <nav className="flex items-center gap-7 font-bold text-base min-w-max">
            <NavLink to="/main" className={getMenuClassName}>
              홈
            </NavLink>

            <NavLink to="/notice" className={getMenuClassName}>
              공지사항
            </NavLink>

            <NavLink to="/contact" className={getMenuClassName}>
              연락처 관리
            </NavLink>

            <NavLink to="/product" className={getMenuClassName}>
              상품 관리
            </NavLink>

            <NavLink to="/createimage" className={getMenuClassName}>
              이미지 만들기
            </NavLink>

            <NavLink to="/manageimage" className={getMenuClassName}>
              이미지 관리
            </NavLink>

            <NavLink to="/sendmms" className={getMenuClassName}>
              MMS 발송
            </NavLink>

            <NavLink to="/checkmms" className={getMenuClassName}>
              발송 내역
            </NavLink>
          </nav>
        </div>

        <div className="hidden xl:flex items-center gap-4 text-gray-700 font-bold text-sm shrink-0">
          <span className="whitespace-nowrap">
            <strong className="text-emerald-800 font-black">
              {userId}님
            </strong>
            &nbsp;환영합니다
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
            마이페이지
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

      <div className="xl:hidden px-6 pb-3 flex items-center justify-end gap-4 text-sm font-bold">
        <span className="text-emerald-800 font-black">
          {userId}님
        </span>

        <NavLink to="/setting" className="text-gray-700">
          설정
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className="text-red-500"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}