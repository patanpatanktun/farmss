import {
  useEffect,
  useState,
} from 'react';

import { Link } from 'react-router-dom';
import { api } from '../api/api';
import Header from './Header';

const EMPTY_DASHBOARD = {
  contactCount: 0,
  productCount: 0,
  imageCount: 0,
  mmsTotalCount: 0,
};

const PROMOTION_SLIDES = [
  {
    src: '/promotion-fertilizer-pear.png',
    alt: '배 재배 농가를 위한 유기능 비료 홍보물',
  },
  {
    src: '/promotion-fertilizer-field.png',
    alt: '광주 농가를 위한 유기질 비료 홍보물',
  },
  {
    src: '/promotion-pepper-seed.png',
    alt: '프리미엄 고추 종자 홍보물',
  },
  {
    src: '/promotion-pest-control.png',
    alt: '친환경 병충해 관리제 홍보물',
  },
];

const PROMPT_SUGGESTIONS = [
  {
    title: '배 유기농 비료 홍보',
    tag: '과수·비료',
    prompt: '배 재배 농가를 위한 고품질 유기질 비료 홍보 이미지. 신선한 초록빛 배경에 20kg 포장지와 특가 가격을 강조해줘.',
  },
  {
    title: '광주 맞춤형 유기질 비료',
    tag: '지역·특가',
    prompt: '광주 지역 농가를 타깃으로 한 친환경 유기질 비료 배너. 풍성한 수확을 연상시키는 벼 일러스트와 깔끔한 폰트 배치.',
  },
  {
    title: '프리미엄 고추 종자',
    tag: '종자·작물',
    prompt: '발아율 95% 프리미엄 고추 종자 홍보물. 붉은 고추가 가득한 신뢰감 주는 배경에 튼튼한 생육 강조 문구 삽입.',
  },
  {
    title: '친환경 병충해 관리제',
    tag: '방제·보호',
    prompt: '안심하고 사용할 수 있는 친환경 병충해 관리제 500ml 제품 배너. 작물 보호와 수확량 향상을 직관적으로 표현.',
  },
];

export default function Main() {
  const [displayName, setDisplayName] =
    useState(
      localStorage.getItem('userId')?.trim() ||
        '회원'
    );

  const [dashboard, setDashboard] =
    useState(EMPTY_DASHBOARD);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState('');

  const [currentSlide, setCurrentSlide] =
    useState(0);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data =
          await api.get('/dashboard');

        if (data) {
          setDashboard({
            ...EMPTY_DASHBOARD,
            ...data,
          });
        }
      } catch (error) {
        setErrorMessage(
          error.message ||
            '대시보드 정보를 불러오지 못했습니다.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    const slideTimer = window.setInterval(() => {
      setCurrentSlide((previousSlide) =>
        (previousSlide + 1) %
        PROMOTION_SLIDES.length
      );
    }, 4000);

    return () => {
      window.clearInterval(slideTimer);
    };
  }, []);

  const showPreviousSlide = () => {
    setCurrentSlide((previousSlide) =>
      previousSlide === 0
        ? PROMOTION_SLIDES.length - 1
        : previousSlide - 1
    );
  };

  const showNextSlide = () => {
    setCurrentSlide((previousSlide) =>
      (previousSlide + 1) %
      PROMOTION_SLIDES.length
    );
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile =
          await api.get('/users/me');

        const profileName =
          profile?.name?.trim();

        if (profileName) {
          setDisplayName(profileName);
        }
      } catch {
        // 실패 시 localStorage 값을 사용합니다.
      }
    };

    loadProfile();
  }, []);

  return (
    <div
      className="
        min-h-screen
        bg-[#e8dcc8]
        text-[#17372a]
        antialiased
        flex
        flex-col
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
        `}
      </style>

      <Header />

      <main
        className="
          max-w-[1360px]
          mx-auto
          px-6
          sm:px-10
          py-10
          lg:py-12
          w-full
          flex-1
          space-y-12
        "
      >
        {/* NEW HERO: AI PROMPT SHOWCASE */}
        <section
          className="
            relative
            overflow-hidden
            bg-[#143b2c]
            rounded-[42px_10px_42px_10px]
            p-8
            sm:p-12
            lg:p-14
            text-white
            shadow-[0_24px_70px_rgba(40,48,42,0.14)]
          "
        >
          {/* Background Decorative Patterns */}
          <div
            className="
              absolute
              -left-20
              -top-28
              w-[320px]
              h-[320px]
              border
              border-white/10
              rounded-full
              pointer-events-none
            "
          />

          <div
            className="
              absolute
              left-16
              -top-10
              w-[190px]
              h-[190px]
              border
              border-white/10
              rounded-full
              pointer-events-none
            "
          />

          {/* 🌟 우측 상단 빈 공간에 배치한 새로운 장식 문양 */}
          <div
            className="
              absolute
              -right-16
              -top-16
              w-[280px]
              h-[280px]
              border
              border-white/[0.08]
              rounded-full
              pointer-events-none
              flex
              items-center
              justify-center
            "
          >
            <div
              className="
                w-[180px]
                h-[180px]
                border
                border-white/[0.06]
                rounded-full
              "
            />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Header Info & Image Showcase */}
            <div className="lg:col-span-5 flex flex-col h-full">
              <div className="mb-8">
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    text-[#c6d9bf]
                    text-[13px]
                    font-medium
                    tracking-[0.12em]
                    mb-4
                  "
                >
                  <span className="w-8 h-[1px] bg-[#c6d9bf]/60" />

                  AI PROMPT SHOWCASE
                </div>

                <p
                  className="
                    text-white/70
                    text-[16px]
                    font-medium
                    mb-3
                  "
                >
                  안녕하세요, {displayName}님
                </p>

                <h1
                  className="
                    text-[34px]
                    sm:text-[42px]
                    font-bold
                    leading-[1.3]
                    tracking-[-0.03em]
                  "
                >
                  이런 홍보 문구와 이미지, <br />
                  <span className="text-[#b8e1aa]">클릭 한 번으로 만들어보세요</span>
                </h1>
              </div>

              <div
                className="
                  relative
                  w-full
                  max-w-[400px]
                  mx-auto
                  lg:mx-0
                  overflow-hidden
                  rounded-[32px_8px_32px_8px]
                  border
                  border-white/15
                  shadow-[0_24px_50px_rgba(0,0,0,0.30)]
                  group
                  bg-[#0e271d]
                "
              >
                <div className="relative aspect-square">
                  {PROMOTION_SLIDES.map(
                    (promotion, index) => (
                      <img
                        key={promotion.src}
                        src={promotion.src}
                        alt={promotion.alt}
                        className={`
                          absolute
                          inset-0
                          w-full
                          h-full
                          object-cover
                          transition-all
                          duration-700
                          ${
                            index === currentSlide
                              ? 'opacity-100 scale-100'
                              : 'opacity-0 scale-[1.02] pointer-events-none'
                          }
                        `}
                      />
                    )
                  )}

                  <button
                    type="button"
                    onClick={showPreviousSlide}
                    aria-label="이전 홍보물"
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      w-10
                      h-10
                      rounded-full
                      bg-black/45
                      hover:bg-black/65
                      text-white
                      text-2xl
                      flex
                      items-center
                      justify-center
                      opacity-0
                      group-hover:opacity-100
                      transition
                    "
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={showNextSlide}
                    aria-label="다음 홍보물"
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      w-10
                      h-10
                      rounded-full
                      bg-black/45
                      hover:bg-black/65
                      text-white
                      text-2xl
                      flex
                      items-center
                      justify-center
                      opacity-0
                      group-hover:opacity-100
                      transition
                    "
                  >
                    ›
                  </button>

                  <div
                    className="
                      absolute
                      bottom-4
                      left-1/2
                      -translate-x-1/2
                      flex
                      items-center
                      gap-2
                      rounded-full
                      bg-black/35
                      px-3
                      py-2
                      backdrop-blur
                    "
                  >
                    {PROMOTION_SLIDES.map(
                      (promotion, index) => (
                        <button
                          key={`${promotion.src}-dot`}
                          type="button"
                          onClick={() =>
                            setCurrentSlide(index)
                          }
                          aria-label={`${index + 1}번째 홍보물 보기`}
                          className={`
                            h-2
                            rounded-full
                            transition-all
                            ${
                              index === currentSlide
                                ? 'w-7 bg-[#b8e1aa]'
                                : 'w-2 bg-white/70 hover:bg-white'
                            }
                          `}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Suggested Prompts & Action Button */}
            <div className="lg:col-span-7 flex flex-col h-full justify-end">
              <p
                className="
                  text-white/80
                  text-[16px]
                  sm:text-[17px]
                  mb-6
                  leading-relaxed
                "
              >
                FarMMS가 추천하는 검증된 프롬프트로 고품질 농자재 홍보 이미지를 간편하게 생성할 수 있습니다.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PROMPT_SUGGESTIONS.map((item, idx) => (
                  <div
                    key={item.title}
                    onClick={() => setCurrentSlide(idx % PROMOTION_SLIDES.length)}
                    className={`
                      p-5
                      rounded-2xl
                      border
                      transition
                      cursor-pointer
                      flex
                      flex-col
                      justify-between
                      min-h-[140px]
                      ${
                        currentSlide === (idx % PROMOTION_SLIDES.length)
                          ? 'bg-white/10 border-[#b8e1aa]'
                          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[12px] font-semibold text-[#b8e1aa] px-2.5 py-0.5 rounded-full bg-[#b8e1aa]/10">
                        {item.tag}
                      </span>
                      <span className="text-[11px] text-white/50">예시 {idx + 1}</span>
                    </div>

                    <div>
                      <h3 className="text-[16px] font-bold text-white mb-1.5">
                        {item.title}
                      </h3>

                      <p className="text-[13px] text-white/70 line-clamp-2 leading-relaxed">
                        "{item.prompt}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <Link
                  to="/createimage"
                  className="
                    group
                    h-[54px]
                    px-8
                    bg-[#e2c98e]
                    text-[#17372a]
                    rounded-[20px_6px_20px_6px]
                    flex
                    items-center
                    gap-6
                    font-bold
                    text-[16px]
                    hover:bg-[#ead6a6]
                    transition
                    shadow-[0_10px_25px_rgba(0,0,0,0.2)]
                  "
                >
                  무료로 이미지 생성 시작하기!

                  <span
                    className="
                      w-7
                      h-7
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
              </div>
            </div>
          </div>
        </section>

        {/* Quick Menu */}
        <section>
          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-end
              sm:justify-between
              gap-4
              mb-7
            "
          >
            <div>
              <div
                className="
                  flex
                  items-center
                  gap-3
                  text-[#64756b]
                  text-[13px]
                  font-medium
                  tracking-[0.12em]
                  mb-3
                "
              >
                <span className="w-7 h-[1px] bg-[#64756b]/60" />

                QUICK MENU
              </div>

              <h2
                className="
                  text-[30px]
                  sm:text-[34px]
                  font-bold
                  tracking-[-0.03em]
                "
              >
                자주 사용하는 기능
              </h2>
            </div>

            <p
              className="
                text-[#59685f]
                text-[17px]
                font-normal
              "
            >
              필요한 기능으로 바로 이동하세요.
            </p>
          </div>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              xl:grid-cols-4
              gap-5
            "
          >
            <ServiceCard
              number="01"
              title="연락처 관리"
              description="홍보 문자를 보낼 고객과 그룹을 등록하고 지역과 재배작물로 관리하세요."
              path="/contact"
            />

            <ServiceCard
              number="02"
              title="상품 관리"
              description="홍보할 농자재 상품 정보와 AI 생성에 참고할 상품 이미지를 등록하세요."
              path="/product"
            />

            <ServiceCard
              number="03"
              title="이미지 만들기"
              description="고객과 상품을 선택하면 AI가 맞춤형 농자재 홍보 이미지를 제작합니다."
              path="/createimage"
            />

            <ServiceCard
              number="04"
              title="MMS 발송"
              description="제작한 홍보 이미지와 문구를 선택한 고객들에게 한 번에 전달하세요."
              path="/sendmms"
            />
          </div>
        </section>

        {/* Stats */}
        <section
          className="
            bg-[#f8f0e2]
            border
            border-[#17372a]/12
            rounded-[38px_10px_38px_10px]
            p-8
            lg:p-10
            shadow-[0_18px_50px_rgba(40,48,42,0.08)]
          "
        >
          <div className="mb-8">
            <div
              className="
                flex
                items-center
                gap-3
                text-[#64756b]
                text-[13px]
                font-medium
                tracking-[0.12em]
                mb-3
              "
            >
              <span className="w-7 h-[1px] bg-[#64756b]/60" />

              ACTIVITY
            </div>

            <h2
              className="
                text-[28px]
                sm:text-[32px]
                font-bold
                tracking-[-0.03em]
              "
            >
              서비스 이용 현황
            </h2>

            <p
              className="
                text-[#5e6d64]
                text-[17px]
                mt-2
              "
            >
              <span className="text-[#17372a] font-semibold">
                {displayName}님
              </span>

              의 실제 이용 데이터입니다.
            </p>
          </div>

          {isLoading && (
            <div
              className="
                py-12
                text-center
                text-[#5f6e65]
                text-[17px]
                font-normal
              "
            >
              이용 현황을 불러오는 중입니다.
            </div>
          )}

          {errorMessage && (
            <div
              className="
                bg-[#f8e3dd]
                border-l-[3px]
                border-[#b45a47]
                px-4
                py-3.5
                text-[16px]
                font-medium
                text-[#873c2e]
                rounded-[4px_14px_4px_14px]
              "
            >
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && (
            <div
              className="
                grid
                grid-cols-2
                lg:grid-cols-4
                border-y
                border-[#17372a]/14
              "
            >
              <DashboardCard
                label="등록 고객"
                value={dashboard.contactCount}
                unit="명"
                number="01"
              />

              <DashboardCard
                label="등록 상품"
                value={dashboard.productCount}
                unit="개"
                number="02"
              />

              <DashboardCard
                label="생성 이미지"
                value={dashboard.imageCount}
                unit="개"
                number="03"
              />

              <DashboardCard
                label="전체 MMS"
                value={dashboard.mmsTotalCount}
                unit="건"
                number="04"
              />
            </div>
          )}

          {!isLoading &&
            !errorMessage &&
            dashboard.mmsTotalCount === 0 && (
              <div
                className="
                  mt-8
                  bg-[#e8d4a8]
                  p-5
                  sm:p-6
                  rounded-[20px_6px_20px_6px]
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-5
                "
              >
                <div>
                  <p
                    className="
                      text-[#17372a]
                      text-[17px]
                      font-semibold
                    "
                  >
                    아직 MMS 발송 내역이 없습니다.
                  </p>

                  <p
                    className="
                      text-[#59665e]
                      text-[16px]
                      mt-1
                      leading-relaxed
                    "
                  >
                    고객과 홍보 이미지를 선택해 첫 MMS를 발송해보세요.
                  </p>
                </div>

                <Link
                  to="/sendmms"
                  className="
                    shrink-0
                    px-5
                    py-3
                    bg-[#17372a]
                    hover:bg-[#214b39]
                    text-white
                    rounded-[16px_5px_16px_5px]
                    text-[15px]
                    font-semibold
                    text-center
                    transition
                  "
                >
                  MMS 발송하기
                </Link>
              </div>
            )}
        </section>

        {/* Guide - Moved back to the bottom */}
        <section>
          <div
            className="
              flex
              items-center
              gap-3
              text-[#64756b]
              text-[13px]
              font-medium
              tracking-[0.12em]
              mb-4
            "
          >
            <span className="w-7 h-[1px] bg-[#64756b]/60" />

            GUIDE
          </div>

          <h2
            className="
              text-[28px]
              sm:text-[32px]
              font-bold
              tracking-[-0.03em]
              mb-7
            "
          >
            FarMMS 활용 팁
          </h2>

          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-3
              gap-5
            "
          >
            <GuideCard
              number="01"
              title="고객 정보를 먼저 등록하세요"
              description="고객의 지역과 재배작물을 등록하면 MMS 발송 대상을 정확하게 검색할 수 있습니다."
              path="/contact"
              linkText="연락처 관리"
            />

            <GuideCard
              number="02"
              title="상품 참고 이미지를 활용하세요"
              description="상품의 실제 포장 이미지를 등록하면 향후 실제 AI 연결 시 더 정확한 홍보 이미지를 만들 수 있습니다."
              path="/product"
              linkText="상품 관리"
            />

            <GuideCard
              number="03"
              title="발송 결과를 확인하세요"
              description="고객별 성공과 실패 여부, 발송 시각과 사용한 이미지를 발송 내역에서 확인할 수 있습니다."
              path="/checkmms"
              linkText="발송 내역"
            />
          </div>
        </section>
      </main>

      <footer className="mt-14 bg-[#0f3023] text-white">
        <div
          className="
            max-w-[1360px]
            mx-auto
            px-6
            sm:px-10
            py-9
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-4
          "
        >
          <div>
            <p
              className="
                text-[20px]
                font-bold
                tracking-[-0.03em]
              "
            >
              FarMMS
            </p>

            <p
              className="
                text-white/60
                text-[14px]
                mt-1
              "
            >
              농자재 홍보 MMS 발송 시스템
            </p>
          </div>

          <p
            className="
              text-white/50
              text-[13px]
              font-normal
            "
          >
            © 2026 FarMMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}


function ServiceCard({
  number,
  title,
  description,
  path,
}) {
  return (
    <Link
      to={path}
      aria-label={`${title} 페이지로 이동`}
      className="
        group
        relative
        min-h-[220px]
        bg-[#f8f0e2]
        border
        border-[#17372a]/12
        p-7
        rounded-none
        flex
        flex-col
        justify-between
        overflow-hidden
        shadow-[0_14px_35px_rgba(40,48,42,0.07)]
        hover:bg-[#17372a]
        hover:border-[#17372a]
        hover:-translate-y-1
        hover:shadow-[0_22px_45px_rgba(23,55,42,0.16)]
        transition-all
        duration-300
      "
    >
      <div
        className="
          absolute
          -right-10
          -top-10
          w-[120px]
          h-[120px]
          rounded-none
          border
          border-[#17372a]/7
          group-hover:border-white/10
        "
      />

      <div className="relative z-10">
        <div
          className="
            flex
            items-center
            gap-3
            text-[#69786f]
            group-hover:text-white/60
            text-[13px]
            font-medium
            tracking-[0.1em]
            transition
          "
        >
          <span>
            {number}
          </span>

          <span
            className="
              w-8
              h-[1px]
              bg-[#69786f]/45
              group-hover:bg-white/20
              transition
            "
          />
        </div>

        <h2
          className="
            text-[21px]
            font-semibold
            text-[#17372a]
            group-hover:text-white
            mt-4
            tracking-[-0.02em]
            transition
          "
        >
          {title}
        </h2>

        <p
          className="
            text-[#59675f]
            group-hover:text-white/78
            text-[15px]
            sm:text-[16px]
            font-normal
            leading-[1.7]
            mt-2
            transition
          "
        >
          {description}
        </p>
      </div>

      <div
        className="
          relative
          z-10
          flex
          items-center
          justify-between
          mt-6
          text-[#17372a]
          group-hover:text-white
          text-[14px]
          font-semibold
          transition
        "
      >
        <span>
          바로가기
        </span>

        <span
          className="
            w-7
            h-7
            rounded-none
            border
            border-[#17372a]/15
            group-hover:border-white/20
            flex
            items-center
            justify-center
            group-hover:translate-x-1
            transition
          "
        >
          →
        </span>
      </div>
    </Link>
  );
}


function DashboardCard({
  label,
  value,
  unit,
  number,
}) {
  return (
    <div
      className="
        relative
        px-5
        sm:px-7
        py-7
        lg:py-9
        border-b
        lg:border-b-0
        lg:border-r
        border-[#17372a]/12
        last:border-r-0
      "
    >
      <span
        className="
          text-[#75837a]
          text-[12px]
          font-medium
        "
      >
        {number}
      </span>

      <p
        className="
          text-[#59675f]
          text-[16px]
          font-medium
          mt-4
        "
      >
        {label}
      </p>

      <p
        className="
          text-[#17372a]
          text-[36px]
          sm:text-[40px]
          font-bold
          tracking-[-0.03em]
          mt-2
        "
      >
        {value ?? 0}

        <span
          className="
            text-[16px]
            ml-1.5
            text-[#647269]
            font-medium
          "
        >
          {unit}
        </span>
      </p>
    </div>
  );
}


function GuideCard({
  number,
  title,
  description,
  path,
  linkText,
}) {
  return (
    <article
      className="
        group
        bg-transparent
        border-t
        border-[#17372a]/30
        pt-6
        min-h-[230px]
        flex
        flex-col
        justify-between
      "
    >
      <div>
        <span
          className="
            text-[#6d7c72]
            text-[13px]
            font-medium
          "
        >
          {number}
        </span>

        <h2
          className="
            text-[#17372a]
            text-[21px]
            font-semibold
            tracking-[-0.02em]
            mt-5
          "
        >
          {title}
        </h2>

        <p
          className="
            text-[#59675f]
            text-[16px]
            sm:text-[17px]
            font-normal
            leading-[1.8]
            mt-3
          "
        >
          {description}
        </p>
      </div>

      <Link
        to={path}
        className="
          inline-flex
          items-center
          gap-2
          mt-6
          text-[#17372a]
          text-[15px]
          font-semibold
          group
        "
      >
        {linkText}

        <span
          className="
            group-hover:translate-x-1
            transition-transform
          "
        >
          →
        </span>
      </Link>
    </article>
  );
}