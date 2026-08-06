import React from 'react';
import { Link } from 'react-router-dom';

export default function CheckMms() {
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
              <Link to="/sendmms" className="hover:text-emerald-800 transition py-1">MMS 발송</Link>
              <Link to="/checkmms" className="text-emerald-800 border-b-2 border-emerald-800 py-1 transition">발송 내역</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 본문 내용 (중앙 정렬 및 가로 폭 최적화) */}
      <main className="max-w-[1100px] mx-auto px-6 py-10 w-full flex-1 space-y-8">

        {/* 페이지 타이틀 영역 */}
        <div className="mb-2 px-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">발송 내역</h1>
          <p className="text-gray-600 font-medium text-base">지금까지의 총 발송 MMS 문자 내역을 확인할 수 있습니다.</p>
        </div>

        {/* 상단 요약 통계 카드 영역 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 카드 1 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-2">
            <span className="text-xs text-gray-400 font-bold block">총 발송 건수</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-900 tracking-tight">56건</span>
            </div>
          </div>
          {/* 카드 2 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-2">
            <span className="text-xs text-gray-400 font-bold block">총 수신자 수</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-900 tracking-tight">329명</span>
            </div>
          </div>
          {/* 카드 3 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-2">
            <span className="text-xs text-gray-400 font-bold block">최다 수신 그룹</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-800 tracking-tight">전체 농가</span>
            </div>
          </div>
          {/* 카드 4 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-2">
            <span className="text-xs text-gray-400 font-bold block">총 발송 금액</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-800 tracking-tight">65,800원</span>
            </div>
          </div>
        </div>

        {/* 발송 내역 테이블 카드 영역 */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 text-xs font-bold bg-gray-50/50">
                  <th className="py-4 px-6">발송 제목</th>
                  <th className="py-4 px-6">발송 일시</th>
                  <th className="py-4 px-6">수신 그룹</th>
                  <th className="py-4 px-6">수신자 수</th>
                  <th className="py-4 px-6 text-center">상세보기</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
                {/* 행 1 */}
                <tr className="hover:bg-gray-50/60 transition">
                  <td className="py-5 px-6 font-bold text-gray-900">유기질 비료 20kg 특가 안내</td>
                  <td className="py-5 px-6 text-gray-500 font-normal">2026-07-28 09:00</td>
                  <td className="py-5 px-6 font-semibold text-emerald-800">전체</td>
                  <td className="py-5 px-6 text-gray-900 font-bold">24명</td>
                  <td className="py-5 px-6 text-center">
                    <button type="button" className="px-4 py-2 border border-gray-200 hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl text-xs font-bold text-gray-600 transition shadow-sm">
                      상세보기
                    </button>
                  </td>
                </tr>
                {/* 행 2 */}
                <tr className="hover:bg-gray-50/60 transition">
                  <td className="py-5 px-6 font-bold text-gray-900">친환경 농약 신제품 출시 안내</td>
                  <td className="py-5 px-6 text-gray-500 font-normal">2026-07-15 10:30</td>
                  <td className="py-5 px-6 font-semibold text-emerald-800">과수 농가, 채소 농가</td>
                  <td className="py-5 px-6 text-gray-900 font-bold">18명</td>
                  <td className="py-5 px-6 text-center">
                    <button type="button" className="px-4 py-2 border border-gray-200 hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl text-xs font-bold text-gray-600 transition shadow-sm">
                      상세보기
                    </button>
                  </td>
                </tr>
                {/* 행 3 */}
                <tr className="hover:bg-gray-50/60 transition">
                  <td className="py-5 px-6 font-bold text-gray-900">여름 농자재 특별 할인 이벤트</td>
                  <td className="py-5 px-6 text-gray-500 font-normal">2026-07-01 08:00</td>
                  <td className="py-5 px-6 font-semibold text-emerald-800">전체</td>
                  <td className="py-5 px-6 text-gray-900 font-bold">24명</td>
                  <td className="py-5 px-6 text-center">
                    <button type="button" className="px-4 py-2 border border-gray-200 hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl text-xs font-bold text-gray-600 transition shadow-sm">
                      상세보기
                    </button>
                  </td>
                </tr>
                {/* 행 4 */}
                <tr className="hover:bg-gray-50/60 transition">
                  <td className="py-5 px-6 font-bold text-gray-900">과수 농가 전용 비료 프로모션</td>
                  <td className="py-5 px-6 text-gray-500 font-normal">2026-06-20 09:30</td>
                  <td className="py-5 px-6 font-semibold text-emerald-800">과수 농가</td>
                  <td className="py-5 px-6 text-gray-900 font-bold">12명</td>
                  <td className="py-5 px-6 text-center">
                    <button type="button" className="px-4 py-2 border border-gray-200 hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl text-xs font-bold text-gray-600 transition shadow-sm">
                      상세보기
                    </button>
                  </td>
                </tr>
                {/* 행 5 */}
                <tr className="hover:bg-gray-50/60 transition">
                  <td className="py-5 px-6 font-bold text-gray-900">모내기 시즌 특가 비료 안내</td>
                  <td className="py-5 px-6 text-gray-500 font-normal">2026-05-10 07:00</td>
                  <td className="py-5 px-6 font-semibold text-emerald-800">전남 광주</td>
                  <td className="py-5 px-6 text-gray-900 font-bold">15명</td>
                  <td className="py-5 px-6 text-center">
                    <button type="button" className="px-4 py-2 border border-gray-200 hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl text-xs font-bold text-gray-600 transition shadow-sm">
                      상세보기
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* 푸터 */}
      <footer className="w-full bg-white border-t border-gray-200 py-6 px-10 text-center text-gray-400 text-xs mt-12">
        <p>© 2026 FarMMS. All rights reserved.</p>
      </footer>

    </div>
  );
}