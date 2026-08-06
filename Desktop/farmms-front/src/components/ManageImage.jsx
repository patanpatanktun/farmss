import React from 'react';
import { Link } from 'react-router-dom';

export default function ManageImage() {
  return (
    <div className="bg-slate-100 text-gray-900 min-h-screen flex flex-col justify-between font-sans antialiased [-webkit-font-smoothing:antialiased]">

      {/* 상단 네비게이션 영역 */}
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
              <Link to="/main" className="hover:text-emerald-700 transition py-1">홈</Link>
              <Link to="/contact" className="hover:text-emerald-700 transition py-1">연락처 관리</Link>
              <Link to="/createimage" className="hover:text-emerald-700 transition py-1">이미지 만들기</Link>
              <Link to="/manageimage" className="text-emerald-700 border-b-2 border-emerald-700 py-1 transition">이미지 관리</Link>
              <Link to="/sendmms" className="hover:text-emerald-700 transition py-1">MMS 발송</Link>
              <Link to="/checkmms" className="hover:text-emerald-700 transition py-1">발송 내역</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 본문 내용 */}
      <main className="max-w-[1360px] mx-auto px-10 py-10 w-full flex-1 space-y-8">

        {/* 페이지 타이틀 & 설명 영역 */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-md space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">이미지 관리</h1>
          <p className="text-gray-700 font-bold text-base">생성된 홍보 이미지를 저장하고 관리하세요. 총 <span className="text-emerald-700 font-black">6개</span></p>
        </div>

        {/* 이미지 카드 그리드 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden flex flex-col justify-between p-8 space-y-5">
                <div className="text-sm font-black text-gray-500">2026.07.28 생성</div>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex justify-center">
                    <div className="w-full aspect-[4/5] bg-white rounded-xl border border-emerald-200 overflow-hidden shadow-inner flex items-center justify-center">
                        <img src="/image1.png" alt="여름 농자재 특별 할인 미리보기" className="w-full h-full object-cover" />
                    </div>
                </div>
                <div className="font-black text-gray-900 text-center text-xl tracking-tight">여름 농자재 특별 할인</div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                    <button type="button" className="py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-2xl transition-colors shadow-sm">저장하기</button>
                    <button type="button" className="py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-sm rounded-2xl transition-colors">수정하기</button>
                    <Link to="/sendmms" className="py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-sm rounded-2xl transition-colors text-center flex items-center justify-center">MMS 발송</Link>
                </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden flex flex-col justify-between p-8 space-y-5">
                <div className="text-sm font-black text-gray-500">2026.07.20 생성</div>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex justify-center">
                    <div className="w-full aspect-[4/5] bg-slate-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 text-base font-bold">
                        <span>이미지 준비중</span>
                    </div>
                </div>
                <div className="font-black text-gray-900 text-center text-xl tracking-tight">과수 농가 전용 비료</div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                    <button type="button" className="py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-2xl transition-colors shadow-sm">저장하기</button>
                    <button type="button" className="py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-sm rounded-2xl transition-colors">수정하기</button>
                    <Link to="/sendmms" className="py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-sm rounded-2xl transition-colors text-center flex items-center justify-center">MMS 발송</Link>
                </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden flex flex-col justify-between p-8 space-y-5">
                <div className="text-sm font-black text-gray-500">2026.07.10 생성</div>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex justify-center">
                    <div className="w-full aspect-[4/5] bg-slate-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 text-base font-bold">
                        <span>이미지 준비중</span>
                    </div>
                </div>
                <div className="font-black text-gray-900 text-center text-xl tracking-tight">토양개량제 무상지원 안내</div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                    <button type="button" className="py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-2xl transition-colors shadow-sm">저장하기</button>
                    <button type="button" className="py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-sm rounded-2xl transition-colors">수정하기</button>
                    <Link to="/sendmms" className="py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-sm rounded-2xl transition-colors text-center flex items-center justify-center">MMS 발송</Link>
                </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden flex flex-col justify-between p-8 space-y-5">
                <div className="text-sm font-black text-gray-500">2026.07.01 생성</div>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex justify-center">
                    <div className="w-full aspect-[4/5] bg-slate-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 text-base font-bold">
                        <span>이미지 준비중</span>
                    </div>
                </div>
                <div className="font-black text-gray-900 text-center text-xl tracking-tight">모내기 시즌 비료 특가</div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                    <button type="button" className="py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-2xl transition-colors shadow-sm">저장하기</button>
                    <button type="button" className="py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-sm rounded-2xl transition-colors">수정하기</button>
                    <Link to="/sendmms" className="py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-sm rounded-2xl transition-colors text-center flex items-center justify-center">MMS 발송</Link>
                </div>
            </div>

            {/* Card 5 */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden flex flex-col justify-between p-8 space-y-5">
                <div className="text-sm font-black text-gray-500">2026.06.25 생성</div>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex justify-center">
                    <div className="w-full aspect-[4/5] bg-slate-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 text-base font-bold">
                        <span>이미지 준비중</span>
                    </div>
                </div>
                <div className="font-black text-gray-900 text-center text-xl tracking-tight">친환경 유기농 영양제</div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                    <button type="button" className="py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-2xl transition-colors shadow-sm">저장하기</button>
                    <button type="button" className="py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-sm rounded-2xl transition-colors">수정하기</button>
                    <Link to="/sendmms" className="py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-sm rounded-2xl transition-colors text-center flex items-center justify-center">MMS 발송</Link>
                </div>
            </div>

            {/* Card 6 */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden flex flex-col justify-between p-8 space-y-5">
                <div className="text-sm font-black text-gray-500">2026.06.15 생성</div>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex justify-center">
                    <div className="w-full aspect-[4/5] bg-slate-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 text-base font-bold">
                        <span>이미지 준비중</span>
                    </div>
                </div>
                <div className="font-black text-gray-900 text-center text-xl tracking-tight">고추 벼 병해충 방제 안내</div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                    <button type="button" className="py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-2xl transition-colors shadow-sm">저장하기</button>
                    <button type="button" className="py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-sm rounded-2xl transition-colors">수정하기</button>
                    <Link to="/sendmms" className="py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-sm rounded-2xl transition-colors text-center flex items-center justify-center">MMS 발송</Link>
                </div>
            </div>

        </div>

      </main>

      {/* 푸터 */}
      <footer className="w-full bg-white border-t border-gray-200 py-6 px-10 text-center text-gray-600 text-xs mt-12 shadow-sm">
        <p className="font-bold">© 2026 FarMMS. All rights reserved.</p>
      </footer>

    </div>
  );
}