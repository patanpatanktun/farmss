import React from 'react';
import { Link } from 'react-router-dom';

export default function TokenPricing() {
  return (
    <div
      className="
        min-h-screen
        bg-[#eee9df]
        text-[#17372a]
        antialiased
        selection:bg-[#17372a]
        selection:text-white
      "
      style={{
        fontFamily:
          '"SUIT Variable", SUIT, -apple-system, BlinkMacSystemFont, "Noto Sans KR", sans-serif',
      }}
    >
      <style>
        {`
          @import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/woff2/SUIT-Variable.css');

          html {
            scroll-behavior: smooth;
          }
        `}
      </style>

      {/* Header */}
      <header
        className="
          sticky
          top-0
          z-50
          w-full
          bg-[#eee9df]/95
          backdrop-blur-md
          border-b
          border-[#17372a]/10
        "
      >
        <div
          className="
            max-w-[1440px]
            mx-auto
            px-7
            sm:px-10
            lg:px-14
            h-[88px]
            flex
            items-center
            justify-between
          "
        >
          <Link
            to="/start"
            className="flex items-center gap-3"
          >
            <span
              className="
                text-[#17372a]
                font-bold
                text-[29px]
                tracking-[-0.035em]
              "
            >
              FarMMS
            </span>

            <span className="w-[1px] h-5 bg-[#17372a]/20" />

            <span
              className="
                hidden
                sm:block
                text-[#68766e]
                font-medium
                text-[12px]
                tracking-[0.01em]
              "
            >
              농업의 가치를 더하다
            </span>
          </Link>

          <nav
            className="
              hidden
              lg:flex
              items-center
              gap-10
              text-[15px]
              font-semibold
              text-[#536159]
            "
          >
            <Link
              to="/start#service"
              className="hover:text-[#17372a] transition"
            >
              서비스 소개
            </Link>

            <Link
              to="/start#process"
              className="hover:text-[#17372a] transition"
            >
              이용 방법
            </Link>

            <Link
              to="/StartNotice"
              className="hover:text-[#17372a] transition"
            >
              공지사항
            </Link>

            <Link
              to="/pricing"
              className="text-[#17372a] transition"
            >
              요금 안내
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="
                hidden
                sm:flex
                items-center
                justify-center
                px-5
                py-3
                border
                border-[#17372a]/25
                hover:border-[#17372a]
                text-[#17372a]
                font-semibold
                text-sm
                rounded-[18px_6px_18px_6px]
                transition-all
                duration-300
                bg-transparent
              "
            >
              로그인
            </Link>

            <Link
              to="/signup"
              className="
                group
                flex
                items-center
                justify-center
                px-6
                py-3
                bg-[#17372a]
                hover:bg-[#214b39]
                text-white
                font-semibold
                text-sm
                rounded-[18px_6px_18px_6px]
                transition-all
                duration-300
                shadow-[0_10px_24px_rgba(23,55,42,0.13)]
                hover:-translate-y-0.5
              "
            >
              시작하기

              <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <section
          className="
            max-w-[1440px]
            mx-auto
            px-7
            sm:px-10
            lg:px-14
            pt-16
            pb-12
            text-center
          "
        >
          <div
            className="
              inline-flex
              items-center
              gap-3
              text-[#758178]
              text-[12px]
              font-medium
              tracking-[0.12em]
              uppercase
              mb-4
            "
          >
            <span className="w-8 h-[1px] bg-[#758178]/60" />
            PRICING SYSTEM
            <span className="w-8 h-[1px] bg-[#758178]/60" />
          </div>

          <h1
            className="
              text-[#17372a]
              text-[38px]
              sm:text-[50px]
              lg:text-[58px]
              font-bold
              tracking-[-0.035em]
            "
          >
            합리적이고 투명한 <span className="text-[#2b5845]">토큰 요금제</span>
          </h1>

          <p
            className="
              mt-5
              text-[#59675f]
              text-[17px]
              sm:text-[19px]
              max-w-[640px]
              mx-auto
              leading-[1.8]
            "
          >
            복잡한 월 구독료 없이, 꼭 필요한 기능만큼 토큰을 충전하여 사용하세요.
            <br />
            1토큰 당 50원으로 알뜰하게 농자재 홍보를 시작할 수 있습니다.
          </p>
        </section>

        {/* Pricing Cards */}
        <section
          className="
            max-w-[1440px]
            mx-auto
            px-7
            sm:px-10
            lg:px-14
            pb-24
          "
        >
          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-8
              max-w-[960px]
              mx-auto
            "
          >
            {/* Card 1 */}
            <div
              className="
                bg-[#faf8f2]
                border
                border-[#17372a]/15
                rounded-[36px_12px_36px_12px]
                p-8
                sm:p-10
                flex
                flex-col
                justify-between
                shadow-[0_20px_50px_rgba(23,55,42,0.06)]
                hover:border-[#17372a]/40
                transition-all
              "
            >
              <div>
                <span
                  className="
                    inline-block
                    px-3.5
                    py-1.5
                    bg-[#17372a]/10
                    text-[#17372a]
                    text-xs
                    font-bold
                    rounded-full
                    mb-6
                  "
                >
                  AI IMAGE FEATURE
                </span>

                <h3 className="text-[26px] font-bold text-[#17372a] mb-3">
                  AI 이미지 생성 및 재생성
                </h3>

                <p className="text-[#65736a] text-sm leading-relaxed mb-8">
                  농자재 특성에 맞는 맞춤형 홍보 이미지를 인공지능(AI)으로 간편하게 제작하고 수정합니다.
                </p>

                <div className="bg-[#f0eee7] rounded-2xl p-6 mb-8">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-sm font-medium text-[#65736a]">차감 토큰</span>
                    <span className="text-2xl font-bold text-[#17372a]">2 토큰</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-3 border-t border-[#17372a]/10">
                    <span className="text-sm font-medium text-[#65736a]">실제 소모 비용</span>
                    <span className="text-lg font-bold text-[#326849]">100원 <span className="text-xs font-normal text-[#65736a]">(1회당)</span></span>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-[#4c5a52]">
                  <li className="flex items-center gap-2.5">
                    <span className="text-[#326849] font-bold">✓</span> 상품 홍보 이미지 최초 생성 시
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-[#326849] font-bold">✓</span> 마음에 들지 않아 재생성 요청 시
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-[#326849] font-bold">✓</span> 고화질 이미지 즉시 다운로드 제공
                  </li>
                </ul>
              </div>

              <div className="mt-10">
                <Link
                  to="/signup"
                  className="
                    w-full
                    py-4
                    flex
                    items-center
                    justify-center
                    bg-[#17372a]
                    hover:bg-[#214b39]
                    text-white
                    font-semibold
                    text-sm
                    rounded-[18px_6px_18px_6px]
                    transition
                  "
                >
                  이미지 제작 체험하기 →
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div
              className="
                bg-[#17372a]
                text-white
                border
                border-[#17372a]
                rounded-[36px_12px_36px_12px]
                p-8
                sm:p-10
                flex
                flex-col
                justify-between
                shadow-[0_20px_50px_rgba(23,55,42,0.18)]
                relative
                overflow-hidden
              "
            >
              <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full border border-white/10" />

              <div className="relative z-10">
                <span
                  className="
                    inline-block
                    px-3.5
                    py-1.5
                    bg-[#eee3bd]
                    text-[#17372a]
                    text-xs
                    font-bold
                    rounded-full
                    mb-6
                  "
                >
                  MMS TRANSMISSION
                </span>

                <h3 className="text-[26px] font-bold text-white mb-3">
                  MMS 문자 일괄 발송
                </h3>

                <p className="text-white/70 text-sm leading-relaxed mb-8">
                  정리된 고객 목록에 홍보 이미지와 안내 문구를 담아 안전하게 대량 전송합니다.
                </p>

                <div className="bg-white/[0.08] rounded-2xl p-6 mb-8 border border-white/10">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-sm font-medium text-white/70">차감 토큰</span>
                    <span className="text-2xl font-bold text-emerald-300">3 토큰</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-3 border-t border-white/10">
                    <span className="text-sm font-medium text-white/70">실제 소모 비용</span>
                    <span className="text-lg font-bold text-emerald-300">150원 <span className="text-xs font-normal text-white/60">(건당)</span></span>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-white/80">
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-300 font-bold">✓</span> 이미지 첨부 멀티미디어(MMS) 지원
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-300 font-bold">✓</span> 지역별·작물별 맞춤 고객 선택 발송
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-300 font-bold">✓</span> 안정적인 솔라피(Solapi) 연동 전송
                  </li>
                </ul>
              </div>

              <div className="mt-10 relative z-10">
                <Link
                  to="/signup"
                  className="
                    w-full
                    py-4
                    flex
                    items-center
                    justify-center
                    bg-[#eee3bd]
                    hover:bg-[#f4ebce]
                    text-[#17372a]
                    font-semibold
                    text-sm
                    rounded-[18px_6px_18px_6px]
                    transition
                  "
                >
                  문자 발송 시작하기 →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Banner */}
        <section
          className="
            max-w-[1440px]
            mx-auto
            px-7
            sm:px-10
            lg:px-14
            pb-28
          "
        >
          <div
            className="
              max-w-[960px]
              mx-auto
              bg-[#dfd3aa]
              rounded-[30px_10px_30px_10px]
              p-8
              sm:p-10
              flex
              flex-col
              sm:flex-row
              items-center
              justify-between
              gap-6
              shadow-lg
            "
          >
            <div>
              <p className="text-[#66705e] text-xs font-medium tracking-wider mb-2 uppercase">
                Standard Rate
              </p>
              <h4 className="text-[#17372a] text-2xl font-bold">
                기본 기준 환산 : 1토큰 = 50원
              </h4>
              <p className="text-[#4c5a52] text-sm mt-1">
                필요한 만큼 토큰을 미리 충전하고, 기능별로 차감되는 합리적인 방식을 제공합니다.
              </p>
            </div>

            {/* 🌟 수정된 부분: 토큰 충전하기 -> 서비스 이용하러 가기 (로그인으로 이동) */}
            <Link
              to="/login"
              className="
                shrink-0
                px-7
                py-4
                bg-[#17372a]
                hover:bg-[#214b39]
                text-white
                font-semibold
                text-sm
                rounded-[18px_6px_18px_6px]
                transition
                text-center
              "
            >
              서비스 이용하러 가기
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#10291f] text-white">
        <div
          className="
            max-w-[1440px]
            mx-auto
            px-7
            sm:px-10
            lg:px-14
            py-14
          "
        >
          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-8
            "
          >
            <div>
              <p
                className="
                  text-[26px]
                  font-bold
                  tracking-[-0.03em]
                "
              >
                FarMMS
              </p>

              <p className="mt-2 text-white/45 text-xs font-normal">
                농업의 가치를 더하다
              </p>
            </div>

            <div
              className="
                flex
                flex-wrap
                gap-8
                text-white/60
                text-sm
                font-medium
              "
            >
              <Link to="/start#service" className="hover:text-white transition">
                서비스 소개
              </Link>

              <Link to="/start#process" className="hover:text-white transition">
                이용 방법
              </Link>

              <Link to="/StartNotice" className="hover:text-white transition">
                공지사항
              </Link>

              <Link to="/pricing" className="hover:text-white transition">
                요금 안내
              </Link>
            </div>
          </div>

          <div
            className="
              mt-12
              pt-7
              border-t
              border-white/10
              text-white/35
              text-[11px]
              flex
              flex-col
              sm:flex-row
              justify-between
              gap-3
            "
          >
            <span>
              © 2026 FarMMS. All rights reserved.
            </span>

            <span>
              AI · CUSTOMER · MMS
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}