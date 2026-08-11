import React from 'react';
import { Link } from 'react-router-dom';

export default function Start() {
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

          <nav className="hidden md:flex items-center gap-10 font-bold text-base text-gray-800">
            <a href="#service" className="hover:text-emerald-700 transition py-1">서비스 소개</a>
            <a href="#support" className="hover:text-emerald-700 transition py-1">정부 지원사업 소식</a>
            <a href="#pricing" className="hover:text-emerald-700 transition py-1">요금 안내</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2.5 text-gray-800 font-bold text-sm hover:text-emerald-700 transition">로그인</Link>
            <Link to="/signup" className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-xl transition-all shadow-md">회원가입</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1360px] mx-auto px-10 py-12 w-full flex-1 space-y-16">

        {/* Hero Section */}
        <section className="bg-white rounded-3xl p-8 lg:p-14 border border-gray-200 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-block px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-black tracking-tight">
              AI 이미지 생성 및 스마트 홍보 시스템
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black text-gray-900 leading-[1.15] tracking-tight">
              <span className="text-emerald-700">FarMMS</span>로 완성하는<br />
              스마트 농자재 홍보 시스템
            </h1>

            <div className="space-y-3.5 text-gray-800 text-lg font-bold leading-relaxed tracking-tight border-l-4 border-emerald-600 pl-4 py-1">
              <p>• <strong className="text-gray-900 font-black">AI 이미지 자동 생성</strong>으로 눈에 띄는 홍보물 제작</p>
              <p>• <strong className="text-gray-900 font-black">정부 지원 혜택 알림</strong> (&quot;비료 할인 소식을 알려 구매를 유도하세요&quot;)</p>
              <p>• <strong className="text-gray-900 font-black">맞춤 홍보 문구</strong> 작성 후 <strong className="text-gray-900 font-black">MMS 일괄 발송</strong></p>
            </div>

            <p className="text-gray-600 text-base font-semibold">
              수천 명의 농가에게 필요한 혜택과 홍보 문자를 빠르고 간편하게 전달하세요.
            </p>

            <div className="pt-2">
              <Link to="/signup" className="inline-block px-10 py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-lg rounded-2xl transition-all shadow-lg shadow-emerald-700/20">
                무료로 시작하기 ➔
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex justify-center items-center shadow-inner">
            <div className="w-full max-w-[320px] bg-white rounded-2xl p-5 shadow-lg border border-gray-200 space-y-3">
              
              <div className="flex items-center justify-between text-xs text-gray-600 border-b pb-2.5 font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span className="font-extrabold text-gray-900 text-sm">농자재 홍보 MMS</span>
                </div>
                <span className="text-gray-500 text-xs font-bold">수신: 010-••••-5678</span>
              </div>

              <div className="rounded-xl overflow-hidden border border-emerald-200 bg-white shadow-sm">
                <img src="/image1.png" alt="AI 생성 홍보 이미지" className="w-full h-auto object-cover" />
              </div>

              <div className="text-xs text-gray-800 bg-gray-50 p-4 rounded-xl leading-relaxed border border-gray-200 space-y-1 font-semibold">
                <p className="font-black text-gray-900 text-sm tracking-tight">[FarMMS] 유기질비료 지원안내</p>
                <p className="text-gray-700">안녕하세요. 정부 지원 유기질비료 안내드립니다.</p>
                <p className="text-emerald-700 font-black pt-1">■ 포대당 최대 1,600원 보조</p>
                <p className="text-gray-700">■ 신청기간: 6.1 ~ 7.10</p>
                <p className="text-gray-500 pt-1 text-[11px] font-bold">문의: 010-1234-5678</p>
              </div>

            </div>
          </div>
        </section>

        {/* Support Section */}
        <section id="support" className="space-y-8 scroll-mt-24">
          <div className="text-center space-y-2">
            <span className="text-emerald-700 font-black text-base tracking-tight">정부 지원사업 안내</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">정부 지원금 소식, FarMMS로 농가에 제일 먼저 알리세요</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-md flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="inline-block text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">[매년 6-7월 사전 신청]</span>
                <h3 className="text-2xl font-black text-gray-900 pt-1 tracking-tight">유기질비료 지원사업</h3>
                <p className="text-emerald-700 font-black text-xl pt-1 tracking-tight">포대당 최대 1,600원 보조</p>
                <ul className="text-sm text-gray-700 space-y-2 border-t pt-4 font-bold">
                  <li>• 지원 대상: 농업경영체 등록 농가</li>
                  <li>• 지원 품목: 혼합유박, 혼합유기질, 가축분퇴비 등</li>
                </ul>
              </div>
              <button className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-2xl text-base transition shadow-sm">비료 홍보문자 생성하기</button>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-md flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="inline-block text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">[3년 주기 순환 공급]</span>
                <h3 className="text-2xl font-black text-gray-900 pt-1 tracking-tight">토양개량제 공급사업</h3>
                <p className="text-emerald-700 font-black text-xl pt-1 tracking-tight">규산·석회질비료 100% 무상지원</p>
                <ul className="text-sm text-gray-700 space-y-2 border-t pt-4 font-bold">
                  <li>• 지원 대상: 영농조합 및 지역 농가</li>
                  <li>• 지원 품목: 규산질, 석회질, 패화석 (본인 부담금 0원)</li>
                </ul>
              </div>
              <button className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-2xl text-base transition shadow-sm">무상지원 안내문자 생성하기</button>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-md flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="inline-block text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">[시·군·구 자체 예산]</span>
                <h3 className="text-2xl font-black text-gray-900 pt-1 tracking-tight">지자체 반값 농자재 사업</h3>
                <p className="text-emerald-700 font-black text-xl pt-1 tracking-tight">농자재 구매비 최대 50% 절감</p>
                <ul className="text-sm text-gray-700 space-y-2 border-t pt-4 font-bold">
                  <li>• 지원 대상: 지자체별 영농 종사자</li>
                  <li>• 지원 품목: 비료, 농약, 영농자재, 비닐 등</li>
                </ul>
              </div>
              <button className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-2xl text-base transition shadow-sm">지자체 매칭문자 생성하기</button>
            </div>
          </div>
        </section>

        {/* Service Section */}
        <section id="service" className="bg-white p-10 rounded-3xl border border-gray-200 shadow-md text-center space-y-10 scroll-mt-24">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">3단계 이용 안내</h2>
            <p className="text-gray-700 text-base font-bold">복잡한 과정 없이 단 3단계로 농자재 홍보를 시작할 수 있습니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-slate-50 rounded-2xl space-y-4 border border-gray-200">
              <div className="w-12 h-12 bg-emerald-700 text-white font-black text-lg rounded-2xl flex items-center justify-center mx-auto shadow-sm">1</div>
              <h3 className="font-black text-xl text-gray-900 tracking-tight">연락처 선택</h3>
              <p className="text-sm text-gray-700 font-bold leading-relaxed">작물별, 지역별 농가 그룹을 손쉽게 분류하고 선택</p>
            </div>

            <div className="p-8 bg-slate-50 rounded-2xl space-y-4 border border-gray-200">
              <div className="w-12 h-12 bg-emerald-700 text-white font-black text-lg rounded-2xl flex items-center justify-center mx-auto shadow-sm">2</div>
              <h3 className="font-black text-xl text-gray-900 tracking-tight">AI 홍보 이미지 생성</h3>
              <p className="text-sm text-gray-700 font-bold leading-relaxed">상품명, 가격, 특징을 입력하면 AI가 홍보 이미지 자동 완성</p>
            </div>

            <div className="p-8 bg-slate-50 rounded-2xl space-y-4 border border-gray-200">
              <div className="w-12 h-12 bg-emerald-700 text-white font-black text-lg rounded-2xl flex items-center justify-center mx-auto shadow-sm">3</div>
              <h3 className="font-black text-xl text-gray-900 tracking-tight">MMS 일괄 발송</h3>
              <p className="text-sm text-gray-700 font-bold leading-relaxed">지정한 고객그룹에 준비된 홍보 이미지와 문자를 일괄 전송</p>
            </div>
          </div>
        </section>

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