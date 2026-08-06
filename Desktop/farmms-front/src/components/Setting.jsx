import React from 'react';
import { Link } from 'react-router-dom';

export default function Setting() {
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
            <Link to="/setting" className="text-emerald-800 font-bold transition">설정</Link>
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
              <Link to="/checkmms" className="hover:text-emerald-800 transition py-1">발송 내역</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 본문 내용 (중앙 정렬 및 가로 폭 최적화) */}
      <main className="max-w-[900px] mx-auto px-6 py-10 w-full flex-1 space-y-8">

        {/* 페이지 타이틀 영역 */}
        <div className="mb-2 px-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">환경 설정</h1>
          <p className="text-gray-600 font-medium text-base">계정 정보 관리 및 서비스 환경을 설정할 수 있습니다.</p>
        </div>

        {/* 1. 가입 정보 카드 */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">가입 정보</h2>
            <button type="button" className="px-4 py-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5">
              <span>✏️</span> 회원수정
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <span className="text-gray-400 font-bold text-xs block">아이디</span>
              <p className="text-gray-900 font-bold text-base">hong_farm</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 font-bold text-xs block">이메일</span>
              <p className="text-gray-900 font-bold text-base">smhrd123@gmail.com</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 font-bold text-xs block">이름</span>
              <p className="text-gray-900 font-bold text-base">홍길동</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 font-bold text-xs block">성별</span>
              <p className="text-gray-900 font-bold text-base">남성</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 font-bold text-xs block">가입 생년월일</span>
              <p className="text-gray-900 font-bold text-base">1985년 04월 12일</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 font-bold text-xs block">휴대폰 번호</span>
              <p className="text-gray-900 font-bold text-base">010-1234-5678</p>
            </div>
          </div>
        </div>

        {/* 2. 계정 관리 (로그아웃 및 회원 탈퇴) */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-black text-gray-900 tracking-tight border-b border-gray-100 pb-4">계정 관리</h2>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-gray-900 text-sm">로그아웃</p>
              <p className="text-gray-400 text-xs">현재 접속 중인 계정에서 안전하게 로그아웃합니다.</p>
            </div>
            <Link to="/login" className="w-full sm:w-auto px-5 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 transition shadow-sm text-center">
              로그아웃하기
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <div>
              <p className="font-bold text-red-600 text-sm">회원 탈퇴</p>
              <p className="text-gray-400 text-xs">탈퇴 시 모든 주소록 및 이미지, 발송 내역 데이터가 영구적으로 삭제됩니다.</p>
            </div>
            <Link to="/start" className="w-full sm:w-auto px-5 py-2.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold transition shadow-sm text-center">
              회원 탈퇴하기
            </Link>
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