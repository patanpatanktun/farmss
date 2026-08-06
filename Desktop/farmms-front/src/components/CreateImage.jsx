import React from 'react';
import { Link } from 'react-router-dom';

export default function CreateImage() {
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
              <Link to="/createimage" className="text-emerald-700 border-b-2 border-emerald-700 py-1 transition">이미지 만들기</Link>
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
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">AI 홍보 이미지 만들기</h1>
          <p className="text-gray-700 font-bold text-base">상품 정보를 입력하면 AI가 자동으로 세련된 홍보 이미지를 만들어 드립니다.</p>
        </div>

        {/* 좌우 2분할 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* 좌측: AI 홍보 이미지 만들기 입력 폼 (6 컬럼) */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-200 p-8 shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-1">기본 상품 정보</h2>
                <p className="text-gray-600 font-bold text-sm">이미지에 들어갈 핵심 상품 정보를 입력해 주세요.</p>
              </div>

              {/* 상품명 */}
              <div className="space-y-1.5">
                <label className="block text-sm font-black text-gray-800">상품명</label>
                <input 
                  type="text" 
                  placeholder="예) 유기질 비료 20kg"
                  className="w-full px-4 py-3.5 text-sm font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-700 transition-all text-gray-900 bg-slate-50/50 placeholder:text-gray-400"
                />
              </div>

              {/* 상품 특징 */}
              <div className="space-y-1.5">
                <label className="block text-sm font-black text-gray-800">상품 특징</label>
                <input 
                  type="text" 
                  placeholder="예) 친환경 인증, 작물 수확량 30% 향상"
                  className="w-full px-4 py-3.5 text-sm font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-700 transition-all text-gray-900 bg-slate-50/50 placeholder:text-gray-400"
                />
              </div>

              {/* 상품 가격 */}
              <div className="space-y-1.5">
                <label className="block text-sm font-black text-gray-800">상품 가격</label>
                <input 
                  type="text" 
                  placeholder="예) 35,000원 (할인 28,000원)"
                  className="w-full px-4 py-3.5 text-sm font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-700 transition-all text-gray-900 bg-slate-50/50 placeholder:text-gray-400"
                />
              </div>

              {/* 문의 연락처 */}
              <div className="space-y-1.5">
                <label className="block text-sm font-black text-gray-800">문의 연락처</label>
                <input 
                  type="text" 
                  placeholder="예) 010-1234-5678"
                  className="w-full px-4 py-3.5 text-sm font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-700 transition-all text-gray-900 bg-slate-50/50 placeholder:text-gray-400"
                />
              </div>

              {/* 참고 이미지 업로드 (선택) */}
              <div className="space-y-1.5">
                <label className="block text-sm font-black text-gray-800">참고 이미지 업로드 <span className="text-gray-400 font-normal">(선택)</span></label>
                <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-2xl p-6 text-center hover:bg-emerald-50 transition cursor-pointer flex flex-col items-center justify-center gap-2">
                  <p className="text-sm font-black text-gray-800">여기에 이미지를 드래그하거나 클릭하여 업로드</p>
                  <p className="text-xs text-gray-500 font-bold">JPG, PNG 파일 지원 (최대 10MB)</p>
                </div>
              </div>
            </div>

            {/* 생성 버튼 */}
            <button type="button" className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-lg rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-3 mt-6">
              AI 이미지 생성하기
            </button>
          </div>

          {/* 우측: 추가 요청사항 입력 패널 (6 컬럼) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-md space-y-6">
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-1">추가 요청사항 입력</h2>
                <p className="text-gray-600 font-bold text-sm">이미지에 반영할 내용을 자유롭게 입력해 주세요. 왼쪽 기본 정보 외에 AI에게 추가로 전달할 내용입니다.</p>
              </div>

              {/* 예시 프롬프트 칩 목록 */}
              <div className="space-y-3">
                <p className="text-sm font-black text-gray-800">이런 느낌으로 작성해 보세요 <span className="text-xs text-emerald-700 font-bold">(클릭하면 자동으로 입력됩니다)</span></p>
                
                <div className="p-4 bg-slate-50 border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-800 cursor-pointer hover:border-emerald-700 transition">
                  [예시 1] 비료 포대가 논밭에 놓여 있고 글씨가 매우 크게 보이게 해주세요.
                </div>
                <div className="p-4 bg-slate-50 border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-800 cursor-pointer hover:border-emerald-700 transition">
                  [예시 2] 정부 보조금 지원 문구가 잘 보이도록 밝은 배경으로 만들어 주세요.
                </div>
                <div className="p-4 bg-slate-50 border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-800 cursor-pointer hover:border-emerald-700 transition">
                  [예시 3] 상품 가격이 한눈에 들어오는 깔끔한 이미지로 만들어 주세요.
                </div>
              </div>

              {/* 자유 입력 (프롬프트) */}
              <div className="space-y-1.5">
                <label className="block text-sm font-black text-gray-800">자유 입력 (프롬프트)</label>
                <div className="relative">
                  <textarea 
                    rows="7" 
                    placeholder="예) 비료 포대가 논 위에 놓여 있고, 글씨 크게 가격이 강조된 이미지로 만들어 주세요. 배경은 초록색 계열로 해 주세요." 
                    className="w-full px-4 py-3.5 text-sm font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-700 transition-all text-gray-900 bg-slate-50/50 resize-none pb-8 placeholder:text-gray-400"
                  ></textarea>
                  <div className="absolute bottom-3 right-4 text-xs font-bold text-gray-500">0자</div>
                </div>
              </div>
            </div>

            {/* 안내 박스 */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-7 text-amber-900 space-y-2 shadow-sm">
              <h3 className="font-black text-base">
                작성에 도움이 필요하신가요?
              </h3>
              <p className="text-sm font-bold leading-relaxed opacity-90">
                강조하고 싶은 문구나 색상을 자유롭게 적어주시면 AI가 반영합니다.<br />
                글씨를 크게 해달라고 요청하시면 어르신들이 읽기 편한 포스터가 만들어집니다.<br />
                어려우시면 아무것도 적지 않으셔도 기본 정보만으로 멋진 이미지를 만들어 드립니다.
              </p>
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