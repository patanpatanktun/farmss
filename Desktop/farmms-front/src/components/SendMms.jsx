import React from 'react';
import { Link } from 'react-router-dom';

export default function SendMms() {
  return (
    <div className="bg-slate-100 text-gray-900 min-h-screen flex flex-col justify-between font-sans antialiased [-webkit-font-smoothing:antialiased]">

      {/* 상단 네비게이션 영역 */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        {/* 최상단 유틸리티 바 */}
        <div className="max-w-[1360px] mx-auto px-10 py-3 flex justify-between items-center border-b border-gray-100 text-sm">
          <div className="flex items-center gap-2">
            <Link to="/main" className="text-emerald-800 font-black text-xl tracking-tight">FarMMS</Link>
            <span className="text-gray-300 font-light">|</span>
            <span className="text-gray-600 font-semibold text-xs tracking-wide">농업의 가치를 더하다</span>
          </div>
          <div className="flex items-center gap-5 text-gray-700 font-bold text-sm">
            <span><strong className="text-gray-900 font-black">홍길동</strong> 님 환영합니다</span>
            <span className="text-gray-300">|</span>
            <Link to="/setting" className="hover:text-emerald-800 transition">설정</Link>
            <Link to="/login" className="text-red-500 hover:text-red-600 transition">로그아웃</Link>
          </div>
        </div>

        {/* 메인 네비게이션 메뉴 바 */}
        <div className="max-w-[1360px] mx-auto px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link to="/main" className="text-2xl font-black text-emerald-800 tracking-tight">FarMMS</Link>
            <nav className="flex items-center gap-8 font-bold text-base text-gray-700">
              <Link to="/main" className="hover:text-emerald-800 transition py-1">홈</Link>
              <Link to="/contact" className="hover:text-emerald-800 transition py-1">연락처 관리</Link>
              <Link to="/createimage" className="hover:text-emerald-800 transition py-1">이미지 만들기</Link>
              <Link to="/manageimage" className="hover:text-emerald-800 transition py-1">이미지 관리</Link>
              <Link to="/sendmms" className="text-emerald-800 border-b-2 border-emerald-800 py-1 transition">MMS 발송</Link>
              <Link to="/checkmms" className="hover:text-emerald-800 transition py-1">발송 내역</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 본문 내용 (중앙 정렬 및 가로 폭 최적화) */}
      <main className="max-w-[880px] mx-auto px-6 py-10 w-full flex-1 space-y-6">

        {/* 페이지 타이틀 영역 */}
        <div className="mb-6 px-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">MMS 발송</h1>
          <p className="text-gray-600 font-medium text-base">메시지를 수신받을 그룹을 선택하시고 이미지와 문구를 통해 홍보 문자를 발송하세요.</p>
        </div>

        {/* 수신자 그룹 선택 카드 */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">수신자 그룹 선택</h2>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center px-4 py-3 border-2 border-emerald-700 bg-emerald-50 rounded-2xl cursor-pointer font-bold text-emerald-900 text-sm">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-800 focus:ring-emerald-500 mr-2 rounded" /> 전체
            </label>
            <label className="flex items-center px-4 py-3 border-2 border-gray-200 hover:border-emerald-700 hover:bg-emerald-50/30 rounded-2xl cursor-pointer font-bold text-gray-700 text-sm transition">
              <input type="checkbox" className="w-4 h-4 text-emerald-800 focus:ring-emerald-500 mr-2 rounded" /> 과수 농가
            </label>
            <label className="flex items-center px-4 py-3 border-2 border-gray-200 hover:border-emerald-700 hover:bg-emerald-50/30 rounded-2xl cursor-pointer font-bold text-gray-700 text-sm transition">
              <input type="checkbox" className="w-4 h-4 text-emerald-800 focus:ring-emerald-500 mr-2 rounded" /> 채소 농가
            </label>
            <label className="flex items-center px-4 py-3 border-2 border-gray-200 hover:border-emerald-700 hover:bg-emerald-50/30 rounded-2xl cursor-pointer font-bold text-gray-700 text-sm transition">
              <input type="checkbox" className="w-4 h-4 text-emerald-800 focus:ring-emerald-500 mr-2 rounded" /> 충청남도
            </label>
            <label className="flex items-center px-4 py-3 border-2 border-gray-200 hover:border-emerald-700 hover:bg-emerald-50/30 rounded-2xl cursor-pointer font-bold text-gray-700 text-sm transition">
              <input type="checkbox" className="w-4 h-4 text-emerald-800 focus:ring-emerald-500 mr-2 rounded" /> 경상북도
            </label>
            <label className="flex items-center px-4 py-3 border-2 border-gray-200 hover:border-emerald-700 hover:bg-emerald-50/30 rounded-2xl cursor-pointer font-bold text-gray-700 text-sm transition">
              <input type="checkbox" className="w-4 h-4 text-emerald-800 focus:ring-emerald-500 mr-2 rounded" /> 전라남도
            </label>
            <label className="flex items-center px-4 py-3 border-2 border-gray-200 hover:border-emerald-700 hover:bg-emerald-50/30 rounded-2xl cursor-pointer font-bold text-gray-700 text-sm transition">
              <input type="checkbox" className="w-4 h-4 text-emerald-800 focus:ring-emerald-500 mr-2 rounded" /> 강원도
            </label>
          </div>
        </div>

        {/* 요약 정보 카드 */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <span className="block text-xs text-gray-400 font-bold mb-1">선택 그룹</span>
            <span className="text-sm font-black text-gray-900">전체 (24명)</span>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <span className="block text-xs text-gray-400 font-bold mb-1">수신자</span>
            <span className="text-sm font-black text-gray-900">24명</span>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <span className="block text-xs text-gray-400 font-bold mb-1">예상 비용</span>
            <span className="text-sm font-black text-emerald-800">약 4,800원</span>
          </div>
        </div>

        {/* 발송할 생성 이미지 선택 카드 */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">발송할 생성 이미지 선택</h2>
          
          <div className="relative flex items-center gap-3">
            {/* 좌측 이동 버튼 */}
            <button type="button" className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 text-gray-600 flex items-center justify-center text-lg transition shadow-md flex-shrink-0 z-10 -ml-2">
              <span>‹</span>
            </button>

            {/* 이미지 카드 3개 노출 컨테이너 */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 w-full justify-center">
              {/* 이미지 카드 1 (선택됨) */}
              <div className="w-[200px] flex-shrink-0 border-2 border-emerald-700 bg-emerald-50/40 rounded-2xl p-4 cursor-pointer relative space-y-3 shadow-sm">
                <div className="w-full aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200">
                  <span className="text-sm text-gray-400 font-bold">이미지 1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">선택됨</span>
                  <span className="text-emerald-800 text-lg font-black">✓</span>
                </div>
              </div>

              {/* 이미지 카드 2 */}
              <div className="w-[200px] flex-shrink-0 border-2 border-gray-200 hover:border-emerald-700 bg-white rounded-2xl p-4 cursor-pointer relative space-y-3 transition shadow-sm">
                <div className="w-full aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200">
                  <span className="text-sm text-gray-300 font-bold">이미지 2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">선택</span>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                </div>
              </div>

              {/* 이미지 카드 3 */}
              <div className="w-[200px] flex-shrink-0 border-2 border-gray-200 hover:border-emerald-700 bg-white rounded-2xl p-4 cursor-pointer relative space-y-3 transition shadow-sm">
                <div className="w-full aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200">
                  <span className="text-sm text-gray-300 font-bold">이미지 3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">선택</span>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                </div>
              </div>
            </div>

            {/* 우측 이동 버튼 */}
            <button type="button" className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 text-gray-600 flex items-center justify-center text-lg transition shadow-md flex-shrink-0 z-10 -mr-2">
              <span>›</span>
            </button>
          </div>
        </div>

        {/* 발송 문구 입력 카드 */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">발송 문구 입력</h2>
          <div className="relative">
            <textarea 
              rows="5" 
              maxLength="2000" 
              defaultValue={`안녕하세요.\n유기질비료 지원사업 안내드립니다.\n\n- 포대당 최대 1,600원 보조`}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 transition text-gray-800 resize-none"
            ></textarea>
            <div className="absolute right-4 bottom-4 text-xs font-bold text-gray-400">
              91 / 2,000자
            </div>
          </div>
        </div>

        {/* 발송 시간 설정 카드 */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">발송 시간 설정</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 좌측: 즉시 발송하기 */}
            <div className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-200 flex flex-col justify-between space-y-4 hover:border-emerald-700 transition cursor-pointer">
              <label className="flex items-center font-bold text-gray-800 text-base cursor-pointer">
                <input type="radio" name="sendTime" className="w-5 h-5 text-emerald-800 focus:ring-emerald-500 mr-3" /> 즉시 발송하기
              </label>
              <div className="flex-1 flex items-center justify-center text-center py-4">
                <p className="text-sm text-gray-500 font-medium">버튼을 누르는 즉시 지정된 수신자에게<br />문자가 발송됩니다.</p>
              </div>
            </div>

            {/* 우측: 예약 발송하기 */}
            <div className="p-6 bg-gray-50 rounded-2xl border-2 border-emerald-700 flex flex-col justify-between space-y-4">
              <label className="flex items-center font-bold text-emerald-900 text-base cursor-pointer">
                <input type="radio" name="sendTime" defaultChecked className="w-5 h-5 text-emerald-800 focus:ring-emerald-500 mr-3" /> 예약 발송하기
              </label>

              <div className="space-y-3 pt-2 border-t border-gray-200">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">예약일 선택</label>
                  <select className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-700" defaultValue="2026-08-04 (오늘)">
                    <option>2026-08-04 (오늘)</option>
                    <option>2026-08-05 (수요일)</option>
                    <option>2026-08-06 (목요일)</option>
                    <option>2026-08-07 (금요일)</option>
                    <option>2026-08-08 (토요일)</option>
                    <option>2026-08-09 (일요일)</option>
                    <option>2026-08-10 (월요일)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">예약 시간 선택</label>
                  <select className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-700" defaultValue="09:00 (오전 9시)">
                    <option>00:00 (오전 12시 / 자정)</option>
                    <option>01:00 (오전 1시)</option>
                    <option>02:00 (오전 2시)</option>
                    <option>03:00 (오전 3시)</option>
                    <option>04:00 (오전 4시)</option>
                    <option>05:00 (오전 5시)</option>
                    <option>06:00 (오전 6시)</option>
                    <option>07:00 (오전 7시)</option>
                    <option>08:00 (오전 8시)</option>
                    <option>09:00 (오전 9시)</option>
                    <option>10:00 (오전 10시)</option>
                    <option>11:00 (오전 11시)</option>
                    <option>12:00 (오후 12시 / 낮)</option>
                    <option>13:00 (오후 1시)</option>
                    <option>14:00 (오후 2시)</option>
                    <option>15:00 (오후 3시)</option>
                    <option>16:00 (오후 4시)</option>
                    <option>17:00 (오후 5시)</option>
                    <option>18:00 (오후 6시)</option>
                    <option>19:00 (오후 7시)</option>
                    <option>20:00 (오후 8시)</option>
                    <option>21:00 (오후 9시)</option>
                    <option>22:00 (오후 10시)</option>
                    <option>23:00 (오후 11시)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 통합 MMS 발송하기 버튼 */}
        <div className="pt-2">
          <button type="button" className="w-full py-4 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xl rounded-2xl shadow-md transition hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-3">
            <span>✈️</span> MMS 발송하기
          </button>
        </div>

      </main>

      {/* 푸터 */}
      <footer className="w-full bg-white border-t border-gray-200 py-6 px-10 text-center text-gray-400 text-xs mt-12">
        <p>© 2026 FarMMS. All rights reserved.</p>
      </footer>

    </div>
  );
}