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

  /**
   * 대시보드 통계를 조회합니다.
   */
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

  /**
   * 홍보물 슬라이드를 4초마다 자동으로 넘깁니다.
   */
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

  /**
   * 로그인한 회원의 이름 또는 상호명을 조회합니다.
   */
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
        // 프로필 조회 실패 시 로그인할 때 저장한 값을 사용합니다.
      }
    };

    loadProfile();
  }, []);

  return (
    <div className="bg-slate-100 text-gray-900 min-h-screen flex flex-col justify-between font-sans antialiased">
      <Header />

      <main className="max-w-[1360px] mx-auto px-6 sm:px-10 py-10 w-full flex-1 space-y-8">
        <section className="bg-gradient-to-br from-white via-emerald-50 to-green-100 rounded-3xl p-8 lg:p-10 border border-emerald-200 shadow-md grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-3 space-y-5">
            <div className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-black tracking-tight">
              농자재 홍보 통합 서비스
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight tracking-tight">
              내 농자재 홍보,
              <br />

              <span className="text-emerald-700">
                이제 쉽고 빠르게 하세요!
              </span>
            </h1>

            <p className="text-gray-700 text-lg font-bold pt-2 tracking-tight">
              고객 관리부터 상품 등록, AI 홍보 이미지
              생성과 MMS 발송까지 한 번에 해결해
              드립니다.
            </p>
          </div>

          <div className="lg:col-span-2">
            <div className="relative max-w-[390px] mx-auto overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-50 shadow-inner group">
              <div className="relative aspect-square">
                {PROMOTION_SLIDES.map(
                  (promotion, index) => (
                    <img
                      key={promotion.src}
                      src={promotion.src}
                      alt={promotion.alt}
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                        index === currentSlide
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-[1.02] pointer-events-none'
                      }`}
                    />
                  )
                )}

                <button
                  type="button"
                  onClick={showPreviousSlide}
                  aria-label="이전 홍보물"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 hover:bg-black/65 text-white text-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={showNextSlide}
                  aria-label="다음 홍보물"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 hover:bg-black/65 text-white text-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  ›
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black/40 px-3 py-2">
                  {PROMOTION_SLIDES.map(
                    (promotion, index) => (
                      <button
                        key={`${promotion.src}-dot`}
                        type="button"
                        onClick={() =>
                          setCurrentSlide(index)
                        }
                        aria-label={`${index + 1}번째 홍보물 보기`}
                        className={`h-2.5 rounded-full transition-all ${
                          index === currentSlide
                            ? 'w-7 bg-emerald-400'
                            : 'w-2.5 bg-white/80 hover:bg-white'
                        }`}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <ServiceCard
            number="1"
            title="연락처 관리"
            description="홍보 문자를 보낼 고객과 그룹을 등록하고 지역과 재배작물로 관리하세요."
            path="/contact"
          />

          <ServiceCard
            number="2"
            title="상품 관리"
            description="홍보할 농자재 상품 정보와 AI 생성에 참고할 상품 이미지를 등록하세요."
            path="/product"
          />

          <ServiceCard
            number="3"
            title="이미지 만들기"
            description="고객과 상품을 선택하면 AI가 맞춤형 농자재 홍보 이미지를 제작합니다."
            path="/createimage"
          />

          <ServiceCard
            number="4"
            title="MMS 발송"
            description="제작한 홍보 이미지와 문구를 선택한 고객들에게 한 번에 전달하세요."
            path="/sendmms"
          />
        </section>

        <section className="bg-white rounded-3xl p-8 lg:p-10 border border-gray-200 shadow-md space-y-7">
          <div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                서비스 이용 현황
              </h2>

              <p className="text-gray-600 font-bold text-sm mt-1">
                <span className="text-emerald-700 font-black">
                  {displayName}님
                </span>
                의 실제 이용 데이터입니다.
              </p>
            </div>

          </div>

          {isLoading && (
            <div className="py-10 text-center text-gray-500 font-bold">
              이용 현황을 불러오는 중입니다.
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard
                label="등록 고객"
                value={dashboard.contactCount}
                unit="명"
                color="gray"
              />

              <DashboardCard
                label="등록 상품"
                value={dashboard.productCount}
                unit="개"
                color="gray"
              />

              <DashboardCard
                label="생성 이미지"
                value={dashboard.imageCount}
                unit="개"
                color="gray"
              />

              <DashboardCard
                label="전체 MMS"
                value={dashboard.mmsTotalCount}
                unit="건"
                color="gray"
              />
            </div>
          )}

          {!isLoading &&
            !errorMessage &&
            dashboard.mmsTotalCount === 0 && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-black text-amber-900">
                    아직 MMS 발송 내역이 없습니다.
                  </p>

                  <p className="text-sm text-amber-800 font-bold mt-1">
                    고객과 홍보 이미지를 선택해 첫
                    MMS를 발송해보세요.
                  </p>
                </div>

                <Link
                  to="/sendmms"
                  className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-sm font-black text-center whitespace-nowrap"
                >
                  MMS 발송하기
                </Link>
              </div>
            )}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GuideCard
            title="고객 정보를 먼저 등록하세요"
            description="고객의 지역과 재배작물을 등록하면 MMS 발송 대상을 정확하게 검색할 수 있습니다."
            path="/contact"
            linkText="연락처 관리"
          />

          <GuideCard
            title="상품 참고 이미지를 활용하세요"
            description="상품의 실제 포장 이미지를 등록하면 향후 실제 AI 연결 시 더 정확한 홍보 이미지를 만들 수 있습니다."
            path="/product"
            linkText="상품 관리"
          />

          <GuideCard
            title="발송 결과를 확인하세요"
            description="고객별 성공과 실패 여부, 발송 시각과 사용한 이미지를 발송 내역에서 확인할 수 있습니다."
            path="/checkmms"
            linkText="발송 내역"
          />
        </section>
      </main>

      <footer className="w-full bg-white border-t border-gray-200 py-6 px-6 sm:px-10 text-center text-gray-600 text-xs mt-12 shadow-sm">
        <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="font-black text-gray-800 text-sm">
            FarMMS - 농자재 홍보 MMS 발송 시스템
          </p>

          <p className="font-bold">
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
      className="group bg-white hover:bg-emerald-700 rounded-3xl border border-gray-200 hover:border-emerald-700 p-7 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-64 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
    >
      <div>
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 group-hover:bg-white border border-emerald-200 group-hover:border-white text-emerald-700 flex items-center justify-center font-black transition-colors duration-300">
          {number}
        </div>

        <h2 className="text-xl font-black text-gray-900 group-hover:text-white mt-5 transition-colors duration-300">
          {title}
        </h2>

        <p className="text-gray-700 group-hover:text-emerald-50 text-sm font-bold leading-relaxed mt-3 transition-colors duration-300">
          {description}
        </p>
      </div>

      <div
        className="text-emerald-700 group-hover:text-white font-black text-base hover:underline flex items-center gap-2 pt-5 transition-colors duration-300"
      >
        <span>바로가기</span>
        <span className="group-hover:translate-x-1 transition-transform duration-300">
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
  color,
}) {
  const colorClasses = {
    gray: {
      card: 'bg-slate-50 border-gray-200',
      label: 'text-gray-500',
      value: 'text-gray-900',
    },
  };

  const selectedColor =
    colorClasses[color] ||
    colorClasses.gray;

  return (
    <div
      className={`rounded-2xl border p-5 text-center ${selectedColor.card}`}
    >
      <p
        className={`text-sm font-bold ${selectedColor.label}`}
      >
        {label}
      </p>

      <p
        className={`text-3xl font-black mt-2 ${selectedColor.value}`}
      >
        {value ?? 0}

        <span className="text-base ml-1">
          {unit}
        </span>
      </p>
    </div>
  );
}

function GuideCard({
  title,
  description,
  path,
  linkText,
}) {
  return (
    <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="font-black text-gray-900">
        {title}
      </h2>

      <p className="text-sm text-gray-600 font-bold leading-relaxed mt-2">
        {description}
      </p>

      <Link
        to={path}
        className="inline-block mt-4 text-sm font-black text-emerald-700 hover:underline"
      >
        {linkText} →
      </Link>
    </article>
  );
}