import React from 'react';
import { Link } from 'react-router-dom';

export default function Main() {
  return (
    <div className="bg-slate-100 text-gray-900 min-h-screen flex flex-col justify-between font-sans antialiased [-webkit-font-smoothing:antialiased]">

      {/* Top Header & GNB Container */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        {/* 최상단 유틸리티 바 */}
        <div className="max-w-[1360px] mx-auto px-10 py-3 flex justify-between items-center border-b border-gray-100 text-sm">
          <div className="flex items-center gap-2.5">
            <Link to="/main" className="text-emerald-800 font-black text-xl tracking-tight">FarMMS</Link>
            <span className="text-gray-300 font-light">|</span>
            <span className="text-gray-600 font-semibold text-xs tracking-wide">농업의 가치를 더하다</span>
          </div>
          <div className="flex items-center gap-5 text-gray-700 font-bold text-sm">
            <span><strong className="text-gray-900 font-black">홍길동</strong> 님 환영합니다</span>
            <span className="text-gray-300">|</span>
            <Link to="/setting" className="hover:text-emerald-700 transition">설정</Link>
            <Link to="/login" className="text-red-500 hover:text-red-600 transition">로그아웃</Link>
          </div>
        </div>

        {/* 메인 네비게이션 메뉴 바 */}
        <div className="max-w-[1360px] mx-auto px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link to="/main" className="text-2xl font-black text-emerald-800 tracking-tight">FarMMS</Link>
            <nav className="flex items-center gap-8 font-bold text-base text-gray-800">
              <Link to="/main" className="text-emerald-700 border-b-2 border-emerald-700 py-1 transition">홈</Link>
              <Link to="/contact" className="hover:text-emerald-700 transition py-1">연락처 관리</Link>
              <Link to="/createimage" className="hover:text-emerald-700 transition py-1">이미지 만들기</Link>
              <Link to="/manageimage" className="hover:text-emerald-700 transition py-1">이미지 관리</Link>
              <Link to="/sendmms" className="hover:text-emerald-700 transition py-1">MMS 발송</Link>
              <Link to="/checkmms" className="hover:text-emerald-700 transition py-1">발송 내역</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1360px] mx-auto px-10 py-10 w-full flex-1 space-y-8">

        {/* Hero Section */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 border border-gray-200 shadow-md grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          {/* Left Text Banner */}
          <div className="lg:col-span-2 space-y-5">
            <div className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-black tracking-tight">
              쉬운 홍보 서비스
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight tracking-tight">
              내 농자재 홍보,<br />
              <span className="text-emerald-700">이제 쉽고 빠르게 하세요!</span>
            </h1>
            <p className="text-gray-700 text-lg font-bold pt-2 tracking-tight">
              AI 홍보 이미지 생성부터 문자 발송까지 한 번에 해결해 드립니다.
            </p>
          </div>

          {/* Right Preview Box */}
          <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex flex-col items-center justify-center relative shadow-inner">
            <p className="text-xs font-black text-gray-700 mb-3">고객 수신 문자 예시</p>
            <div className="w-56 bg-white rounded-2xl p-4 shadow-md border border-gray-200 text-xs space-y-3">
              <div className="bg-emerald-700 text-white p-3 rounded-xl text-center font-black text-sm shadow-sm">
                유기질비료 특별할인!
              </div>
              <div className="bg-gray-50 p-2.5 rounded-xl text-gray-800 leading-relaxed text-[11px] font-bold border border-gray-200">
                <strong className="text-gray-900 font-black">[FarMMS 홍보안내]</strong><br />
                농가 영농지원 유기질비료 신청 받습니다. 지금 바로 문의해 보세요!
              </div>
            </div>
          </div>

        </div>

        {/* 3-Step Process Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1 Card */}
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-md hover:shadow-lg transition-all flex flex-col justify-between space-y-8">
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">연락처 관리</h3>
              <p className="text-gray-700 text-base font-bold leading-relaxed">
                홍보 문자를 보낼 고객 연락처를 등록하고 그룹으로 관리하세요.
              </p>
            </div>
            <Link to="/contact" className="text-emerald-700 font-black text-lg hover:underline flex items-center space-x-2 pt-2">
              <span>바로가기</span>
              <span>→</span>
            </Link>
          </div>

          {/* Step 2 Card */}
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-md hover:shadow-lg transition-all flex flex-col justify-between space-y-8">
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">이미지 만들기</h3>
              <p className="text-gray-700 text-base font-bold leading-relaxed">
                인공지능(AI)이 농산물과 농자재 홍보 이미지를 자동으로 제작합니다.
              </p>
            </div>
            <Link to="/createimage" className="text-emerald-700 font-black text-lg hover:underline flex items-center space-x-2 pt-2">
              <span>바로가기</span>
              <span>→</span>
            </Link>
          </div>

          {/* Step 3 Card */}
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-md hover:shadow-lg transition-all flex flex-col justify-between space-y-8">
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">MMS 발송</h3>
              <p className="text-gray-700 text-base font-bold leading-relaxed">
                제작한 이미지와 홍보 글을 고객들에게 한 번에 전달하세요.
              </p>
            </div>
            <Link to="/sendmms" className="text-emerald-700 font-black text-lg hover:underline flex items-center space-x-2 pt-2">
              <span>바로가기</span>
              <span>→</span>
            </Link>
          </div>

        </div>

        {/* Bottom Summary Status Bar */}
        <div className="bg-white rounded-3xl p-8 lg:p-10 border border-gray-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">최근 발송 요약 현황</h2>
            <p className="text-gray-600 font-bold text-sm mt-1">실시간 서비스 이용 데이터입니다.</p>
          </div>

          <div className="grid grid-cols-3 gap-8 text-center md:text-right w-full md:w-auto">
            <div className="border-r border-gray-200 pr-8">
              <p className="text-sm font-bold text-gray-500">전체 연락처</p>
              <p className="text-3xl font-black text-gray-900 mt-1">24<span className="text-lg font-bold ml-0.5">명</span></p>
            </div>
            <div className="border-r border-gray-200 pr-8">
              <p className="text-sm font-bold text-gray-500">이번 달 발송</p>
              <p className="text-3xl font-black text-gray-900 mt-1">56<span className="text-lg font-bold ml-0.5">건</span></p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500">최다 수신 그룹</p>
              <p className="text-3xl font-black text-emerald-700 mt-1">전체</p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-6 px-10 text-center text-gray-600 text-xs mt-12 shadow-sm">
        <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <p className="font-black text-gray-800 text-sm">FarMMS - 농가 통합 MMS 발송 시스템</p>
          <p className="font-bold">© 2026 FarMMS. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}