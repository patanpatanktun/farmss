import React from 'react';
import { Link } from 'react-router-dom';

export default function Signup() {
  return (
    <div className="bg-slate-100 text-gray-900 min-h-screen flex flex-col justify-between font-sans antialiased [-webkit-font-smoothing:antialiased]">

      {/* 상단 헤더 */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1360px] mx-auto px-10 py-5 flex items-center justify-between">
          <Link to="/start" className="flex items-center gap-2.5">
            <span className="text-emerald-800 font-black text-2xl tracking-tight">FarMMS</span>
            <span className="text-gray-300 font-light">|</span>
            <span className="text-gray-600 font-semibold text-sm tracking-wide">농업의 가치를 더하다</span>
          </Link>
          <div className="text-sm font-bold text-gray-700">
            <Link to="/start" className="hover:text-emerald-700 transition py-1">
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </header>

      {/* 본문 회원가입 폼 영역 */}
      <main className="max-w-xl mx-auto px-6 py-12 w-full flex-1 flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-gray-200 p-10 shadow-md w-full space-y-8">
          
          {/* 타이틀 */}
          <div className="text-center space-y-2 border-b border-gray-100 pb-6">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">회원가입</h1>
            <p className="text-gray-600 text-base font-semibold">FarMMS와 함께 스마트한 농업 관리를 시작하세요.</p>
          </div>

          {/* 입력 폼 */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            
            {/* 이름 */}
            <div className="space-y-1.5">
              <label className="block text-sm font-black text-gray-800">이름</label>
              <input 
                type="text" 
                placeholder="홍길동"
                className="w-full px-4 py-3.5 text-sm font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-700 transition-all text-gray-900 bg-slate-50/50"
              />
            </div>

            {/* 성별 선택 */}
            <div className="space-y-1.5">
              <label className="block text-sm font-black text-gray-800">성별</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center justify-center px-4 py-3.5 border-2 border-gray-200 rounded-2xl cursor-pointer hover:border-emerald-700 transition-all has-[:checked]:border-emerald-700 has-[:checked]:bg-emerald-50/50 font-black text-gray-800 text-sm">
                  <input type="radio" name="gender" value="male" className="w-4 h-4 text-emerald-700 focus:ring-emerald-600 mr-2" /> 남자
                </label>
                <label className="flex items-center justify-center px-4 py-3.5 border-2 border-gray-200 rounded-2xl cursor-pointer hover:border-emerald-700 transition-all has-[:checked]:border-emerald-700 has-[:checked]:bg-emerald-50/50 font-black text-gray-800 text-sm">
                  <input type="radio" name="gender" value="female" className="w-4 h-4 text-emerald-700 focus:ring-emerald-600 mr-2" /> 여자
                </label>
              </div>
            </div>

            {/* 생년월일 직접 입력 */}
            <div className="space-y-1.5">
              <label className="block text-sm font-black text-gray-800">생년월일</label>
              <div className="grid grid-cols-3 gap-3">
                <input 
                  type="text" 
                  maxLength="4"
                  placeholder="년 (YYYY)" 
                  className="w-full px-4 py-3.5 text-sm font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-700 transition-all text-gray-900 text-center bg-slate-50/50"
                />
                <input 
                  type="text" 
                  maxLength="2"
                  placeholder="월 (MM)" 
                  className="w-full px-4 py-3.5 text-sm font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-700 transition-all text-gray-900 text-center bg-slate-50/50"
                />
                <input 
                  type="text" 
                  maxLength="2"
                  placeholder="일 (DD)" 
                  className="w-full px-4 py-3.5 text-sm font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-700 transition-all text-gray-900 text-center bg-slate-50/50"
                />
              </div>
            </div>

            {/* 휴대폰 번호 */}
            <div className="space-y-1.5">
              <label className="block text-sm font-black text-gray-800">휴대폰 번호</label>
              <input 
                type="text" 
                placeholder="'-' 없이 숫자만 입력"
                className="w-full px-4 py-3.5 text-sm font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-700 transition-all text-gray-900 bg-slate-50/50"
              />
            </div>

            {/* 아이디 */}
            <div className="space-y-1.5">
              <label className="block text-sm font-black text-gray-800">아이디</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="아이디를 입력하세요"
                  className="flex-1 px-4 py-3.5 text-sm font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-700 transition-all text-gray-900 bg-slate-50/50"
                />
                <button type="button" className="px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-xs rounded-2xl transition-colors whitespace-nowrap">중복확인</button>
              </div>
            </div>

            {/* 비밀번호 */}
            <div className="space-y-1.5">
              <label className="block text-sm font-black text-gray-800">비밀번호</label>
              <input 
                type="password" 
                placeholder="영문, 숫자, 특수문자 조합 8자리 이상"
                className="w-full px-4 py-3.5 text-sm font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-700 transition-all text-gray-900 bg-slate-50/50"
              />
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-1.5">
              <label className="block text-sm font-black text-gray-800">비밀번호 확인</label>
              <input 
                type="password" 
                placeholder="비밀번호를 한번 더 입력하세요"
                className="w-full px-4 py-3.5 text-sm font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-700 transition-all text-gray-900 bg-slate-50/50"
              />
            </div>

            {/* 가입하기 버튼 */}
            <Link to="/login" className="block w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-lg rounded-2xl transition-all mt-4 text-center shadow-md">
              가입 완료하기
            </Link>

          </form>

        </div>
      </main>

      {/* 푸터 */}
      <footer className="w-full bg-white border-t border-gray-200 py-6 px-10 text-center text-gray-600 text-xs shadow-sm">
        <p className="font-bold">© 2026 FarMMS. All rights reserved.</p>
      </footer>

    </div>
  );
}