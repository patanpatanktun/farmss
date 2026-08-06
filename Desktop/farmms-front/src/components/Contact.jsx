import React from 'react';
import { Link } from 'react-router-dom';

export default function Contact() {
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
              <Link to="/contact" className="text-emerald-700 border-b-2 border-emerald-700 py-1 transition">연락처 관리</Link>
              <Link to="/createimage" className="hover:text-emerald-700 transition py-1">이미지 만들기</Link>
              <Link to="/manageimage" className="hover:text-emerald-700 transition py-1">이미지 관리</Link>
              <Link to="/sendmms" className="hover:text-emerald-700 transition py-1">MMS 발송</Link>
              <Link to="/checkmms" className="hover:text-emerald-700 transition py-1">발송 내역</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 본문 내용 */}
      <main className="max-w-[1360px] mx-auto px-10 py-10 w-full flex-1">

        {/* 페이지 타이틀 영역 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">연락처 관리</h1>
            <p className="text-gray-700 font-bold text-base">홍보 문자를 발송할 농가 및 고객 연락처를 등록하고 관리하세요.</p>
          </div>

          {/* 액션 버튼 영역 */}
          <div className="flex flex-wrap gap-3">
            {/* 그룹 관리 버튼 */}
            <button type="button" className="flex items-center gap-2 px-5 py-3.5 bg-white border-2 border-gray-200 rounded-2xl text-sm font-black text-gray-800 hover:bg-gray-50 shadow-sm transition">
              그룹 관리
            </button>
            {/* 엑셀 파일로 연락처 추가 버튼 */}
            <button type="button" onClick={() => document.getElementById('excelFileinput').click()} className="flex items-center gap-2 px-5 py-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-sm font-black text-emerald-800 hover:bg-emerald-100 shadow-sm transition">
              엑셀로 추가
            </button>
            <input type="file" id="excelFileinput" accept=".xlsx, .xls, .csv" className="hidden" />
            
            {/* 새 고객 등록 버튼 */}
            <button type="button" className="flex items-center gap-2 px-6 py-3.5 bg-emerald-700 rounded-2xl text-sm font-black text-white hover:bg-emerald-800 shadow-md transition">
              + 새 고객 등록
            </button>
          </div>
        </div>

        {/* 검색 및 전체 인원수 툴바 카드 */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-md mb-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative w-full md:w-[900px]">
            <input 
              type="text" 
              id="searchInput" 
              placeholder="고객명, 전화번호, 지역, 그룹 검색" 
              className="w-full pl-5 pr-4 py-3.5 bg-slate-50/50 border-2 border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-700 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* 전체 등록 연락처 수 */}
          <div className="text-base font-bold text-gray-700 whitespace-nowrap ml-auto pr-2 flex items-center gap-1.5">
            <span>전체</span>
            <span id="totalCount" className="text-emerald-700 font-black text-3xl">5</span>
            <span>명</span>
          </div>
        </div>

        {/* 데이터 테이블 컨트롤 바 */}
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="flex items-center gap-3">
            {/* 선택 항목 그룹 설정 버튼 */}
            <button type="button" className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-xs font-black text-gray-800 hover:bg-gray-50 shadow-sm transition">
              선택 항목 그룹 설정
            </button>
            {/* 선택 항목 삭제 버튼 */}
            <button type="button" className="px-4 py-2.5 bg-white border-2 border-red-200 rounded-xl text-xs font-black text-red-600 hover:bg-red-50 shadow-sm transition">
              선택 항목 삭제
            </button>
          </div>
        </div>

        {/* 데이터 테이블 카드 */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-visible">
          <div className="overflow-x-auto">
            <table id="contactTable" className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-gray-200 text-sm font-black text-gray-600">
                  <th className="py-4 px-6 w-16 text-center">
                    <input type="checkbox" id="selectAll" className="w-4 h-4 rounded border-gray-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer" />
                  </th>
                  
                  {/* 고객명 */}
                  <th className="py-4 px-8">
                    <div className="flex items-center justify-between cursor-pointer select-none group pr-6">
                      <span className="group-hover:text-emerald-700 transition">고객명</span>
                      <span className="text-gray-400 text-xs bg-white px-2 py-1 rounded-lg border border-gray-200">↕</span>
                    </div>
                  </th>

                  <th className="py-4 px-6">전화번호</th>
                  <th className="py-4 px-6">지역</th>
                  
                  {/* 그룹명 */}
                  <th className="py-4 px-8">
                    <div className="flex items-center justify-between cursor-pointer select-none group pr-6">
                      <span className="group-hover:text-emerald-700 transition">그룹명</span>
                      <span className="text-gray-400 text-xs bg-white px-2 py-1 rounded-lg border border-gray-200">↕</span>
                    </div>
                  </th>

                  <th className="py-4 px-6">메모</th>
                  <th className="py-4 px-6 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-bold text-gray-800">
                
                {/* Row 1 */}
                <tr className="hover:bg-slate-50 transition">
                  <td className="py-4 px-6 text-center"><input type="checkbox" className="row-checkbox w-4 h-4 rounded border-gray-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer" /></td>
                  <td className="py-4 px-8 font-black text-gray-900">
                    <span className="name-text">김농부</span>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-800">010-2345-6789</td>
                  <td className="py-4 px-6 font-semibold text-gray-700">전남 나주시</td>
                  <td className="py-4 px-8"><span className="group-text px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black border border-indigo-200">단골고객</span></td>
                  <td className="py-4 px-6 text-gray-600 font-semibold">우수 단골 고객 / 유기질비료 사용</td>
                  <td className="py-4 px-6 text-center space-x-1.5">
                    <button type="button" className="px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-black text-gray-700 hover:bg-gray-50 transition shadow-sm">수정</button>
                    <button type="button" className="px-3 py-1.5 bg-white border border-red-200 rounded-xl text-xs font-black text-red-600 hover:bg-red-50 transition shadow-sm">삭제</button>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-slate-50 transition">
                  <td className="py-4 px-6 text-center"><input type="checkbox" className="row-checkbox w-4 h-4 rounded border-gray-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer" /></td>
                  <td className="py-4 px-8 font-black text-gray-900">
                    <span className="name-text">이과수</span>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-800">010-3456-7890</td>
                  <td className="py-4 px-6 font-semibold text-gray-700">전남 담양군</td>
                  <td className="py-4 px-8"><span className="group-text px-3 py-1 bg-blue-50 text-blue-700 rounded-xl text-xs font-black border border-blue-200">일반농가</span></td>
                  <td className="py-4 px-6 text-gray-600 font-semibold">석회질비료 사용</td>
                  <td className="py-4 px-6 text-center space-x-1.5">
                    <button type="button" className="px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-black text-gray-700 hover:bg-gray-50 transition shadow-sm">수정</button>
                    <button type="button" className="px-3 py-1.5 bg-white border border-red-200 rounded-xl text-xs font-black text-red-600 hover:bg-red-50 transition shadow-sm">삭제</button>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-slate-50 transition">
                  <td className="py-4 px-6 text-center"><input type="checkbox" className="row-checkbox w-4 h-4 rounded border-gray-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer" /></td>
                  <td className="py-4 px-8 font-black text-gray-900">
                    <span className="name-text">박고추</span>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-800">010-4567-8901</td>
                  <td className="py-4 px-6 font-semibold text-gray-700">전북 전주시</td>
                  <td className="py-4 px-8"><span className="group-text px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black border border-indigo-200">단골고객</span></td>
                  <td className="py-4 px-6 text-gray-600 font-semibold">단골 고객 / 복합비료 선호</td>
                  <td className="py-4 px-6 text-center space-x-1.5">
                    <button type="button" className="px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-black text-gray-700 hover:bg-gray-50 transition shadow-sm">수정</button>
                    <button type="button" className="px-3 py-1.5 bg-white border border-red-200 rounded-xl text-xs font-black text-red-600 hover:bg-red-50 transition shadow-sm">삭제</button>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="hover:bg-slate-50 transition">
                  <td className="py-4 px-6 text-center"><input type="checkbox" className="row-checkbox w-4 h-4 rounded border-gray-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer" /></td>
                  <td className="py-4 px-8 font-black text-gray-900">
                    <span className="name-text">최마늘</span>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-800">010-5678-9012</td>
                  <td className="py-4 px-6 font-semibold text-gray-700">전남 화순군</td>
                  <td className="py-4 px-8"><span className="group-text px-3 py-1 bg-purple-50 text-purple-700 rounded-xl text-xs font-black border border-purple-200">도매처</span></td>
                  <td className="py-4 px-6 text-gray-600 font-semibold">유기질비료 사용</td>
                  <td className="py-4 px-6 text-center space-x-1.5">
                    <button type="button" className="px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-black text-gray-700 hover:bg-gray-50 transition shadow-sm">수정</button>
                    <button type="button" className="px-3 py-1.5 bg-white border border-red-200 rounded-xl text-xs font-black text-red-600 hover:bg-red-50 transition shadow-sm">삭제</button>
                  </td>
                </tr>

                {/* Row 5 */}
                <tr className="hover:bg-slate-50 transition">
                  <td className="py-4 px-6 text-center"><input type="checkbox" className="row-checkbox w-4 h-4 rounded border-gray-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer" /></td>
                  <td className="py-4 px-8 font-black text-gray-900">
                    <span className="name-text">정배추</span>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-800">010-6789-0123</td>
                  <td className="py-4 px-6 font-semibold text-gray-700">전남 담양군</td>
                  <td className="py-4 px-8"><span className="group-text px-3 py-1 bg-green-50 text-green-700 rounded-xl text-xs font-black border border-green-200">신규고객</span></td>
                  <td className="py-4 px-6 text-gray-600 font-semibold">신규 고객 / 석회질비료 사용</td>
                  <td className="py-4 px-6 text-center space-x-1.5">
                    <button type="button" className="px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-black text-gray-700 hover:bg-gray-50 transition shadow-sm">수정</button>
                    <button type="button" className="px-3 py-1.5 bg-white border border-red-200 rounded-xl text-xs font-black text-red-600 hover:bg-red-50 transition shadow-sm">삭제</button>
                  </td>
                </tr>

              </tbody>
            </table>
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