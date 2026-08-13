import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Start() {
  const [modalImage, setModalImage] = useState(null);

  return (
    <div
      className="text-white min-h-screen flex flex-col justify-between font-sans antialiased selection:bg-emerald-500 selection:text-white"
      style={{
        backgroundImage: 'linear-gradient(rgba(13, 40, 30, 0.76), rgba(8, 25, 19, 0.84)), url("/image3.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >

      {/* Header */}
      <header className="w-full bg-[#0d281e]/85 backdrop-blur-md border-b border-white/15 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-12 h-20 flex items-center justify-between">
          <Link to="/start" className="flex items-center gap-2.5">
            <span className="text-white font-black text-2xl tracking-tight">FarMMS</span>
            <span className="text-white/30 font-light">|</span>
            <span className="text-white/70 font-semibold text-xs tracking-wide">농업의 가치를 더하다</span>
          </Link>

          <nav className="hidden md:flex items-center gap-10 font-bold text-[15px] text-white/90">
            <a href="#service" className="hover:text-emerald-400 transition">서비스 소개</a>
            <Link to="/notice" className="hover:text-emerald-400 transition">공지사항</Link>
            <Link to="/pricing" className="hover:text-emerald-400 transition">요금 안내</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="px-4 py-2 text-white/90 font-bold text-sm hover:text-emerald-400 transition">로그인</Link>
            <Link to="/signup" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-900/40 border border-emerald-400/30">회원가입</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-8 lg:px-12 py-12 w-full flex-1 space-y-28">

        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-4">
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold tracking-tight backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              AI 이미지 생성 및 스마트 홍보 시스템
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black text-white leading-[1.18] tracking-tight drop-shadow-sm">
              농자재 홍보,<br />
              <span className="text-emerald-400">AI로 자동 완성</span>하고<br />
              편하게 홍보하세요
            </h1>

            <p className="text-white/80 text-base sm:text-lg font-medium leading-relaxed">
              AI가 홍보 이미지를 자동으로 만들고, 농가에 전달합니다.<br />
              복잡한 프로그램 없이 누구나 쉽게 사용할 수 있습니다.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="px-3.5 py-2 bg-white/10 border border-white/15 rounded-full text-xs font-semibold text-white/95">• AI 이미지 자동 생성</span>
              <span className="px-3.5 py-2 bg-white/10 border border-white/15 rounded-full text-xs font-semibold text-white/95">• MMS 일괄 발송</span>
              <span className="px-3.5 py-2 bg-white/10 border border-white/15 rounded-full text-xs font-semibold text-white/95">• 연락처 그룹 관리</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link to="/signup" className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base rounded-2xl transition-all shadow-lg shadow-emerald-900/50">
                무료로 시작하기
              </Link>
              <a href="#service" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-base rounded-2xl transition-all border border-white/20 backdrop-blur-sm">
                서비스 소개 보기
              </a>
            </div>
          </div>

          {/* Phone Mockup Preview */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="w-full max-w-[320px] bg-white text-gray-900 rounded-[32px] p-4 shadow-2xl border-4 border-gray-700 space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-100 pb-2.5 font-bold px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span className="text-gray-900 font-bold text-xs">농자재 홍보 MMS</span>
                </div>
                <span>수신: 010-••••-5678</span>
              </div>

              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <img src="/image1.png" alt="AI 생성 홍보 이미지" className="w-full h-auto object-cover" />
              </div>

              <div className="text-xs text-gray-700 bg-gray-50 p-3.5 rounded-2xl leading-relaxed space-y-1 font-medium">
                <p className="font-bold text-gray-900 text-xs">[FarMMS] 유기질비료 지원안내</p>
                <p>안녕하세요. 정부 지원 유기질비료 안내드립니다.</p>
                <p className="text-emerald-700 font-bold pt-0.5">■ 포대당 최대 1,600원 보조</p>
                <p className="text-gray-500 pt-1 text-[10px]">문의: 010-1234-5678</p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Section (Step-by-Step Scroll Showcase) */}
        <section id="service" className="space-y-24 pt-12 scroll-mt-28">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">FarMMS 사용 방법</h2>
            <p className="text-white/75 text-base font-medium">단 3단계만 거치면 우리 농가 홍보가 완벽하게 끝납니다.</p>
          </div>

          <div className="space-y-20">

            {/* Step 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-black/35 p-8 lg:p-12 rounded-[32px] border border-white/15 backdrop-blur-md shadow-2xl">
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 rounded-full text-xs font-bold tracking-tight">
                  Step 01
                </div>
                <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
                  스마트한<br /><span className="text-emerald-400">연락처 및 그룹 관리</span>
                </h3>
                <p className="text-white/80 text-base leading-relaxed font-medium">
                  작물별, 지역별로 고객 그룹을 체계적으로 분류하고 관리하세요! 발송 대상을 그룹으로 간편하게 선택할 수 있습니다.
                </p>
                <div className="flex items-center gap-3 text-sm font-semibold text-emerald-300">
                  <span>✓ 그룹별 맞춤 관리</span>
                  <span>•</span>
                  <span>✓ 간편 주소록 연동</span>
                </div>
              </div>
              <div className="lg:col-span-7 flex justify-center">
                <div
                  className="w-full max-w-[560px] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black/50 cursor-pointer group relative"
                  onClick={() => setModalImage('/image4.png')}
                >
                  <img src="/image4.png" alt="연락처 및 그룹 관리 화면" className="w-full h-auto object-cover group-hover:scale-105 transition duration-300" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center text-white font-bold text-sm gap-2">
                    🔍 클릭해서 크게 보기
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-black/35 p-8 lg:p-12 rounded-[32px] border border-white/15 backdrop-blur-md shadow-2xl">
              <div className="lg:col-span-7 flex justify-center order-2 lg:order-1">
                <div
                  className="w-full max-w-[560px] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black/50 cursor-pointer group relative"
                  onClick={() => setModalImage('/image5.png')}
                >
                  <img src="/image5.png" alt="AI 이미지 생성 화면" className="w-full h-auto object-cover group-hover:scale-105 transition duration-300" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center text-white font-bold text-sm gap-2">
                    🔍 클릭해서 크게 보기
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 rounded-full text-xs font-bold tracking-tight">
                  Step 02
                </div>
                <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
                  쉽게 간편하게!<br /><span className="text-emerald-400">AI 이미지 자동 생성</span>
                </h3>
                <p className="text-white/80 text-base leading-relaxed font-medium">
                  홍보하고 싶은 작물명과 상품 특징만 입력하면, AI가 전문가 수준의 시각적인 홍보 이미지를 뚝딱 만들어 드립니다!
                </p>
                <div className="flex items-center gap-3 text-sm font-semibold text-emerald-300">
                  <span>✓ 자동 홍보문구 생성</span>
                  <span>•</span>
                  <span>✓ 높은 시각적 완성도</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-black/35 p-8 lg:p-12 rounded-[32px] border border-white/15 backdrop-blur-md shadow-2xl">
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 rounded-full text-xs font-bold tracking-tight">
                  Step 03
                </div>
                <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
                  버튼 하나로 끝!<br /><span className="text-emerald-400">MMS 일괄 발송</span>
                </h3>
                <p className="text-white/80 text-base leading-relaxed font-medium">
                  만들어둔 AI 이미지와 안내 문구를 선택한 그룹에 맞춰 버튼 클릭 한 번으로 수천 명의 농가에 동시 전송하세요.
                </p>
                <div className="flex items-center gap-3 text-sm font-semibold text-emerald-300">
                  <span>✓ 대량 동시 전송</span>
                  <span>•</span>
                  <span>✓ 예약 발송 가능</span>
                </div>
              </div>
              <div className="lg:col-span-7 flex justify-center">
                <div
                  className="w-full max-w-[560px] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black/50 cursor-pointer group relative"
                  onClick={() => setModalImage('/image6.png')}
                >
                  <img src="/image6.png" alt="MMS 일괄 발송 화면" className="w-full h-auto object-cover group-hover:scale-105 transition duration-300" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center text-white font-bold text-sm gap-2">
                    🔍 클릭해서 크게 보기
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Image Zoom Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setModalImage(null)}
        >
          <div className="relative max-w-5xl w-full bg-[#0d281e] p-3 rounded-2xl border border-white/20 shadow-2xl">
            <button
              className="absolute -top-12 right-0 text-white bg-white/20 hover:bg-white/30 w-10 h-10 rounded-full font-bold text-lg flex items-center justify-center transition"
              onClick={() => setModalImage(null)}
            >
              ✕
            </button>
            <img src={modalImage} alt="확대된 화면" className="w-full h-auto rounded-xl object-contain max-h-[80vh]" />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-[#081b14]/90 backdrop-blur-md border-t border-white/15 py-10 px-8 lg:px-12 text-center text-white/60 text-xs mt-32">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-bold text-white/90 text-sm">FarMMS</p>
          <p className="font-medium">© 2026 FarMMS. 농업의 가치를 더하다.</p>
        </div>
      </footer>

    </div>
  );
}