import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Start() {
  const [modalImage, setModalImage] = useState(null);

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
      {/* SUIT */}
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
            <a
              href="#service"
              className="hover:text-[#17372a] transition"
            >
              서비스 소개
            </a>

            <a
              href="#process"
              className="hover:text-[#17372a] transition"
            >
              이용 방법
            </a>

            {/* StartNotice 컴포넌트 경로로 이동 */}
            <Link
              to="/StartNotice"
              className="hover:text-[#17372a] transition"
            >
              공지사항
            </Link>

            <Link
              to="/pricing"
              className="hover:text-[#17372a] transition"
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

      <main>
        {/* Hero */}
        <section
          className="
            max-w-[1440px]
            mx-auto
            px-5
            sm:px-8
            lg:px-12
            pt-8
            lg:pt-10
            pb-20
          "
        >
          <div
            className="
              relative
              min-h-[680px]
              lg:min-h-[720px]
              overflow-hidden
              rounded-[48px_12px_48px_12px]
              shadow-[0_28px_80px_rgba(40,48,42,0.14)]
            "
          >
            <img
              src="/image3.png"
              alt="농업 현장"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-r
                from-[#0b241a]/95
                via-[#17372a]/78
                to-[#17372a]/20
              "
            />

            <div
              className="
                absolute
                -right-[110px]
                -bottom-[140px]
                w-[420px]
                h-[420px]
                rounded-full
                border
                border-white/10
              "
            />

            <div
              className="
                absolute
                right-[20px]
                bottom-[-70px]
                w-[260px]
                h-[260px]
                rounded-full
                border
                border-white/10
              "
            />

            <div
              className="
                relative
                z-10
                min-h-[680px]
                lg:min-h-[720px]
                flex
                items-center
                px-8
                sm:px-12
                lg:px-20
              "
            >
              <div className="max-w-[720px]">
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    text-[#c8d7c6]
                    text-[12px]
                    sm:text-[13px]
                    font-medium
                    tracking-[0.12em]
                    uppercase
                    mb-7
                  "
                >
                  <span className="w-9 h-[1px] bg-[#c8d7c6]/60" />

                  FARM MARKETING SERVICE
                </div>

                <h1
                  className="
                    text-white
                    text-[43px]
                    sm:text-[58px]
                    lg:text-[68px]
                    font-bold
                    leading-[1.18]
                    tracking-[-0.035em]
                  "
                >
                  농자재 홍보를
                  <br />

                  더 쉽고,
                  <br />

                  <span className="text-emerald-300">
                    더 자연스럽게.
                  </span>
                </h1>

                <p
                  className="
                    mt-8
                    max-w-[600px]
                    text-white/75
                    text-[16px]
                    sm:text-[18px]
                    leading-[1.95]
                    font-normal
                  "
                >
                  고객 관리부터 AI 홍보 이미지 제작,
                  문자 발송까지.
                  <br className="hidden sm:block" />

                  복잡했던 농자재 홍보 업무를
                  FarMMS 하나로 간편하게 관리하세요.
                </p>

                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    gap-4
                    mt-11
                  "
                >
                  <Link
                    to="/signup"
                    className="
                      group
                      inline-flex
                      items-center
                      gap-8
                      px-7
                      h-[58px]
                      bg-[#eee3bd]
                      hover:bg-[#f4ebce]
                      text-[#17372a]
                      font-semibold
                      text-[15px]
                      rounded-[22px_6px_22px_6px]
                      transition-all
                      duration-300
                      shadow-[0_14px_35px_rgba(0,0,0,0.18)]
                      hover:-translate-y-0.5
                    "
                  >
                    무료로 시작하기

                    <span
                      className="
                        w-8
                        h-8
                        rounded-full
                        bg-[#17372a]
                        text-white
                        flex
                        items-center
                        justify-center
                        group-hover:translate-x-1
                        transition-transform
                      "
                    >
                      →
                    </span>
                  </Link>

                  <a
                    href="#service"
                    className="
                      px-7
                      h-[58px]
                      flex
                      items-center
                      justify-center
                      border
                      border-white/30
                      text-white
                      text-[15px]
                      font-medium
                      rounded-full
                      bg-white/[0.05]
                      hover:bg-white/[0.12]
                      backdrop-blur-sm
                      transition
                    "
                  >
                    서비스 알아보기
                  </a>
                </div>
              </div>
            </div>

            <div
              className="
                absolute
                left-8
                sm:left-12
                lg:left-20
                bottom-8
                flex
                items-center
                gap-3
                text-white/55
                text-[11px]
                sm:text-xs
                font-medium
              "
            >
              <span>AI</span>
              <span className="w-[3px] h-[3px] rounded-full bg-white/40" />
              <span>CUSTOMER</span>
              <span className="w-[3px] h-[3px] rounded-full bg-white/40" />
              <span>MMS</span>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section
          id="service"
          className="
            max-w-[1440px]
            mx-auto
            px-7
            sm:px-10
            lg:px-14
            py-20
            lg:py-28
            scroll-mt-28
          "
        >
          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-12
              gap-14
              lg:gap-24
              items-start
            "
          >
            <div className="lg:col-span-5">
              <div
                className="
                  flex
                  items-center
                  gap-3
                  text-[#758178]
                  text-[12px]
                  font-medium
                  tracking-[0.12em]
                  uppercase
                  mb-6
                "
              >
                <span className="w-8 h-[1px] bg-[#758178]/60" />

                ABOUT FARMMMS
              </div>

              <h2
                className="
                  text-[#17372a]
                  text-[36px]
                  sm:text-[46px]
                  lg:text-[50px]
                  font-bold
                  leading-[1.3]
                  tracking-[-0.035em]
                "
              >
                복잡했던 홍보를
                <br />

                누구나 쉽게
                <br />

                사용할 수 있도록.
              </h2>
            </div>

            <div className="lg:col-span-7 lg:pt-12">
              <p
                className="
                  max-w-[680px]
                  text-[#59675f]
                  text-[17px]
                  sm:text-[19px]
                  leading-[2]
                  font-normal
                "
              >
                매번 홍보물을 직접 만들고,
                연락처를 찾아 일일이 문자를 보내는 일은
                생각보다 많은 시간이 필요합니다.
                FarMMS는 꼭 필요한 기능만 남겨
                쉽고 빠르게 사용할 수 있도록 만들었습니다.
              </p>

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-3
                  gap-8
                  mt-14
                "
              >
                <div className="border-t border-[#17372a]/25 pt-5">
                  <span className="text-[#829087] text-xs font-medium">
                    01
                  </span>

                  <p className="mt-3 text-[23px] font-semibold text-[#17372a]">
                    쉽게
                  </p>

                  <p className="mt-2 text-[#6d7971] text-[16px] font-normal">
                    처음 써도 익숙하게
                  </p>
                </div>

                <div className="border-t border-[#17372a]/25 pt-5">
                  <span className="text-[#829087] text-xs font-medium">
                    02
                  </span>

                  <p className="mt-3 text-[23px] font-semibold text-[#17372a]">
                    빠르게
                  </p>

                  <p className="mt-2 text-[#6d7971] text-[16px] font-normal">
                    AI로 홍보물 제작
                  </p>
                </div>

                <div className="border-t border-[#17372a]/25 pt-5">
                  <span className="text-[#829087] text-xs font-medium">
                    03
                  </span>

                  <p className="mt-3 text-[23px] font-semibold text-[#17372a]">
                    한 번에
                  </p>

                  <p className="mt-2 text-[#6d7971] text-[16px] font-normal">
                    고객에게 바로 발송
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section
          id="process"
          className="
            bg-[#17372a]
            text-white
            py-24
            lg:py-32
            scroll-mt-24
          "
        >
          <div
            className="
              max-w-[1440px]
              mx-auto
              px-7
              sm:px-10
              lg:px-14
            "
          >
            <div
              className="
                flex
                flex-col
                lg:flex-row
                lg:items-end
                lg:justify-between
                gap-10
                mb-20
              "
            >
              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    text-[#b6cab1]
                    text-[12px]
                    font-medium
                    tracking-[0.12em]
                    uppercase
                    mb-6
                  "
                >
                  <span className="w-8 h-[1px] bg-[#b6cab1]/60" />

                  HOW IT WORKS
                </div>

                <h2
                  className="
                    text-[38px]
                    sm:text-[50px]
                    lg:text-[54px]
                    font-bold
                    leading-[1.28]
                    tracking-[-0.035em]
                  "
                >
                  필요한 기능을
                  <br />

                  순서대로 사용하세요.
                </h2>
              </div>

              <p
                className="
                  max-w-[480px]
                  text-white/60
                  text-[25px]
                  leading-[1.95]
                  font-normal
                "
              >
                고객을 관리하고,
                홍보 이미지를 만든 뒤,
                필요한 고객에게 바로 발송할 수 있습니다.
              </p>
            </div>

            {/* Step 1 */}
            <ProcessSection
              number="01"
              label="CONTACT"
              title={
                <>
                  고객을
                  <br />
                  <span className="text-emerald-300">
                    알기 쉽게 정리하세요.
                  </span>
                </>
              }
              description="지역과 재배 작물에 따라 고객을 분류하고, 필요한 고객을 빠르게 찾아 관리할 수 있습니다."
              tags={['작물별 관리', '지역별 검색']}
              image="/image4.png"
              imageAlt="연락처 관리"
              onOpen={() => setModalImage('/image4.png')}
            />

            {/* Step 2 */}
            <ProcessSection
              reverse
              number="02"
              label="AI IMAGE"
              title={
                <>
                  홍보 이미지는
                  <br />
                  <span className="text-emerald-300">
                    AI에게 맡기세요.
                  </span>
                </>
              }
              description="상품과 홍보 내용을 입력하면 농자재 판매에 필요한 홍보 이미지를 간편하게 만들어드립니다."
              tags={['이미지 자동 생성', '홍보 문구 반영']}
              image="/image5.png"
              imageAlt="AI 이미지 생성"
              onOpen={() => setModalImage('/image5.png')}
            />

            {/* Step 3 */}
            <ProcessSection
              number="03"
              label="MMS"
              title={
                <>
                  완성된 홍보물을
                  <br />
                  <span className="text-emerald-300">
                    바로 보내세요.
                  </span>
                </>
              }
              description="만든 이미지와 안내 문구를 고객에게 간편하게 전달할 수 있습니다."
              tags={['고객 선택', 'MMS 일괄 발송']}
              image="/image6.png"
              imageAlt="MMS 발송"
              onOpen={() => setModalImage('/image6.png')}
              last
            />
          </div>
        </section>

        {/* Message Preview */}
        <section
          className="
            max-w-[1440px]
            mx-auto
            px-7
            sm:px-10
            lg:px-14
            py-24
            lg:py-32
          "
        >
          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-12
              gap-14
              lg:gap-20
              items-center
            "
          >
            <div className="lg:col-span-6">
              <div
                className="
                  flex
                  items-center
                  gap-3
                  text-[#758178]
                  text-xs
                  font-medium
                  tracking-[0.12em]
                  mb-6
                "
              >
                <span className="w-8 h-[1px] bg-[#758178]/60" />

                ONE SIMPLE FLOW
              </div>

              <h2
                className="
                  text-[#17372a]
                  text-[36px]
                  sm:text-[48px]
                  font-bold
                  leading-[1.3]
                  tracking-[-0.035em]
                "
              >
                만든 홍보물이
                <br />

                고객에게 전달되기까지.
              </h2>

              <p
                className="
                  mt-7
                  text-[#65736a]
                  text-[19px]
                  leading-[1.95]
                  max-w-[560px]
                  font-normal
                "
              >
                디자인 프로그램을 배우거나
                여러 서비스를 옮겨 다닐 필요 없이,
                FarMMS 안에서 홍보에 필요한 과정을
                순서대로 진행할 수 있습니다.
              </p>
            </div>

            <div className="lg:col-span-6 flex justify-center">
              <div className="relative">
                <div
                  className="
                    absolute
                    -inset-8
                    bg-[#17372a]/8
                    rounded-full
                    blur-3xl
                  "
                />

                <div
                  className="
                    relative
                    w-full
                    max-w-[360px]
                    bg-[#faf8f2]
                    rounded-[42px_15px_42px_15px]
                    p-4
                    border
                    border-[#17372a]/10
                    shadow-[0_30px_70px_rgba(39,48,42,0.15)]
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      px-2
                      pb-3
                      border-b
                      border-[#17372a]/10
                    "
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#17372a]" />

                      <span className="text-[#17372a] text-xs font-semibold">
                        농자재 홍보 MMS
                      </span>
                    </div>

                    <span className="text-[#879087] text-[10px]">
                      010-••••-5678
                    </span>
                  </div>

                  <div className="mt-3 overflow-hidden rounded-[26px_8px_26px_8px]">
                    <img
                      src="/image1.png"
                      alt="홍보 MMS 예시"
                      className="w-full h-auto object-cover"
                    />
                  </div>

                  <div
                    className="
                      mt-3
                      bg-[#f0eee7]
                      px-4
                      py-4
                      rounded-[8px_22px_8px_22px]
                      text-[#4c5a52]
                      text-xs
                      leading-relaxed
                    "
                  >
                    <p className="font-semibold text-[#17372a]">
                      [FarMMS] 유기질비료 지원안내
                    </p>

                    <p className="mt-1.5">
                      정부 지원 유기질비료 안내드립니다.
                    </p>

                    <p className="mt-1 font-semibold text-[#326849]">
                      ■ 포대당 최대 1,600원 보조
                    </p>

                    <p className="mt-2 text-[#8a948d] text-[10px]">
                      문의: 010-1234-5678
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          className="
            max-w-[1440px]
            mx-auto
            px-5
            sm:px-8
            lg:px-12
            pb-24
          "
        >
          <div
            className="
              relative
              overflow-hidden
              bg-[#dfd3aa]
              px-9
              sm:px-14
              lg:px-20
              py-16
              lg:py-20
              rounded-[42px_10px_42px_10px]
              flex
              flex-col
              lg:flex-row
              lg:items-center
              lg:justify-between
              gap-10
            "
          >
            <div
              className="
                absolute
                -right-20
                -bottom-24
                w-[300px]
                h-[300px]
                rounded-full
                border
                border-[#17372a]/10
              "
            />

            <div className="relative z-10">
              <p
                className="
                  text-[#66705e]
                  text-xs
                  font-medium
                  tracking-[0.12em]
                  mb-5
                "
              >
                START FARMMMS
              </p>

              <h2
                className="
                  text-[#17372a]
                  text-[34px]
                  sm:text-[46px]
                  font-bold
                  leading-[1.3]
                  tracking-[-0.035em]
                "
              >
                농자재 홍보,
                <br />

                이제 어렵게 하지 마세요.
              </h2>
            </div>

            <Link
              to="/signup"
              className="
                group
                relative
                z-10
                shrink-0
                h-[60px]
                px-7
                bg-[#17372a]
                hover:bg-[#214b39]
                text-white
                rounded-[22px_6px_22px_6px]
                flex
                items-center
                gap-10
                font-semibold
                text-[15px]
                transition-all
                hover:-translate-y-0.5
              "
            >
              무료로 시작하기

              <span
                className="
                  w-8
                  h-8
                  rounded-full
                  border
                  border-white/20
                  flex
                  items-center
                  justify-center
                  group-hover:bg-white
                  group-hover:text-[#17372a]
                  transition
                "
              >
                →
              </span>
            </Link>
          </div>
        </section>
      </main>

      {/* Modal */}
      {modalImage && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            bg-black/85
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-4
            sm:p-8
          "
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-w-6xl w-full"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalImage(null)}
              className="
                absolute
                -top-14
                right-0
                w-11
                h-11
                rounded-full
                bg-[#eee9df]
                text-[#17372a]
                font-semibold
                flex
                items-center
                justify-center
                shadow-xl
              "
            >
              ✕
            </button>

            <img
              src={modalImage}
              alt="확대 화면"
              className="
                w-full
                max-h-[82vh]
                object-contain
                bg-[#eee9df]
                p-2
                rounded-[34px_8px_34px_8px]
                shadow-2xl
              "
            />
          </div>
        </div>
      )}

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
              <a href="#service" className="hover:text-white transition">
                서비스 소개
              </a>

              <a href="#process" className="hover:text-white transition">
                이용 방법
              </a>

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

function ProcessSection({
  number,
  label,
  title,
  description,
  tags,
  image,
  imageAlt,
  onOpen,
  reverse = false,
  last = false,
}) {
  return (
    <div
      className={`
        grid
        grid-cols-1
        lg:grid-cols-12
        gap-12
        lg:gap-16
        items-center
        py-16
        lg:py-20
        border-t
        border-white/15
        ${last ? 'border-b' : ''}
      `}
    >
      <div
        className={`
          lg:col-span-5
          ${reverse ? 'lg:order-2' : ''}
        `}
      >
        <div className="flex items-center gap-4 mb-7">
          <span className="text-emerald-300 font-semibold text-sm">
            {number}
          </span>

          <span className="w-10 h-[1px] bg-emerald-300/40" />

          <span className="text-white/45 text-xs font-medium tracking-[0.12em]">
            {label}
          </span>
        </div>

        <h3
          className="
            text-[32px]
            sm:text-[40px]
            font-bold
            leading-[1.35]
            tracking-[-0.03em]
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-6
            text-white/62
            text-[20px]
            leading-[1.95]
            max-w-[440px]
            font-normal
          "
        >
          {description}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {tags.map((tag, index) => (
            <React.Fragment key={tag}>
              <span className="text-sm text-[#c9d8c6] font-medium">
                ✓ {tag}
              </span>

              {index !== tags.length - 1 && (
                <span className="text-white/25">
                  ·
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div
        className={`
          lg:col-span-7
          ${reverse ? 'lg:order-1' : ''}
        `}
      >
        <button
          type="button"
          onClick={onOpen}
          className={`
            group
            relative
            w-full
            overflow-hidden
            ${
              reverse
                ? 'rounded-[8px_36px_8px_36px]'
                : 'rounded-[36px_8px_36px_8px]'
            }
            shadow-[0_28px_65px_rgba(0,0,0,0.27)]
            text-left
          `}
        >
          <img
            src={image}
            alt={imageAlt}
            className="
              w-full
              h-auto
              object-cover
              transition
              duration-500
              group-hover:scale-[1.02]
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-black/0
              group-hover:bg-black/20
              transition
              flex
              items-center
              justify-center
            "
          >
            <span
              className="
                opacity-0
                group-hover:opacity-100
                bg-[#eee9df]
                text-[#17372a]
                px-5
                py-3
                rounded-full
                text-sm
                font-semibold
                transition
              "
            >
              화면 크게 보기
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}