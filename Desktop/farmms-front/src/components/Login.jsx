import React from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="bg-slate-100 text-gray-900 min-h-screen flex flex-col justify-between font-sans antialiased [-webkit-font-smoothing:antialiased]">

      {/* Header */}
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

      {/* Main Login Form */}
      <main className="max-w-xl mx-auto px-6 py-12 w-full flex-1 flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-gray-200 p-10 shadow-md w-full space-y-8">
          
          {/* Title */}
          <div className="text-center space-y-2 border-b border-gray-100 pb-6">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">로그인</h1>
            <p className="text-gray-600 text-base font-semibold">FarMMS 서비스 이용을 위해 로그인해 주세요.</p>
          </div>

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            
            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-sm font-black text-gray-800">아이디</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                placeholder="아이디를 입력하세요" 
                required
                className="w-full px-4 py-3.5 text-sm font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-700 transition-all text-gray-900 bg-slate-50/50"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-black text-gray-800">비밀번호</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="비밀번호를 입력하세요" 
                required
                className="w-full px-4 py-3.5 text-sm font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-700 transition-all text-gray-900 bg-slate-50/50"
              />
            </div>

            {/* Options */}
            <div className="flex items-center justify-between text-sm font-bold text-gray-700 pt-1">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 border-gray-300" />
                <span>아이디 저장</span>
              </label>
              <a href="#find-password" onClick={(e) => e.preventDefault()} className="hover:text-emerald-700 transition">비밀번호 찾기</a>
            </div>

            {/* Submit Button */}
            <Link 
              to="/main"
              className="block w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-lg rounded-2xl transition-all text-center shadow-md mt-2"
            >
              로그인하기
            </Link>

          </form>

          {/* Signup Link Area */}
          <div className="pt-6 border-t border-gray-200 text-center space-y-3">
            <p className="text-sm text-gray-600 font-bold">아직 FarMMS 회원이 아니신가요?</p>
            <Link 
              to="/signup" 
              className="inline-block w-full py-3.5 border-2 border-emerald-700 text-emerald-700 hover:bg-emerald-50 font-black text-base rounded-2xl transition-colors text-center"
            >
              회원가입 하기
            </Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-6 px-10 text-center text-gray-600 text-xs shadow-sm">
        <p className="font-bold">© 2026 FarMMS. All rights reserved.</p>
      </footer>

    </div>
  );
}