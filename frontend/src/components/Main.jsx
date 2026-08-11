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
  mmsSuccessCount: 0,
  mmsFailCount: 0,
  mmsSuccessRate: 0,
  totalDownloadCount: 0,
};

export default function Main() {
  const [dashboard, setDashboard] =
    useState(EMPTY_DASHBOARD);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState('');

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

  return (
    <div className="bg-slate-100 text-gray-900 min-h-screen flex flex-col justify-between font-sans antialiased">
      <Header />

      <main className="max-w-[1360px] mx-auto px-6 sm:px-10 py-10 w-full flex-1 space-y-8">
        <section className="bg-white rounded-3xl p-8 lg:p-12 border border-gray-200 shadow-md grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-5">
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

          <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex flex-col items-center justify-center shadow-inner">
            <p className="text-xs font-black text-gray-700 mb-3">
              고객 수신 문자 예시
            </p>

            <div className="w-56 bg-white rounded-2xl p-4 shadow-md border border-gray-200 text-xs space-y-3">
              <div className="bg-emerald-700 text-white p-3 rounded-xl text-center font-black text-sm shadow-sm">
                유기질비료 특별 할인
              </div>

              <div className="bg-gray-50 p-2.5 rounded-xl text-gray-800 leading-relaxed text-[11px] font-bold border border-gray-200">
                <strong className="text-gray-900 font-black">
                  [FarMMS 홍보 안내]
                </strong>

                <br />

                농가 영농지원 유기질비료 신청을
                받습니다. 지금 바로 문의해보세요!
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
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                서비스 이용 현황
              </h2>

              <p className="text-gray-600 font-bold text-sm mt-1">
                현재 로그인한 사용자의 실제 이용
                데이터입니다.
              </p>
            </div>

            <Link
              to="/checkmms"
              className="text-sm font-black text-emerald-700 hover:underline"
            >
              발송 내역 자세히 보기 →
            </Link>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                label="이미지 다운로드"
                value={dashboard.totalDownloadCount}
                unit="회"
                color="blue"
              />

              <DashboardCard
                label="전체 MMS"
                value={dashboard.mmsTotalCount}
                unit="건"
                color="gray"
              />

              <DashboardCard
                label="발송 성공"
                value={dashboard.mmsSuccessCount}
                unit="건"
                color="green"
              />

              <DashboardCard
                label="발송 실패"
                value={dashboard.mmsFailCount}
                unit="건"
                color="red"
              />

              <DashboardCard
                label="발송 성공률"
                value={formatRate(
                  dashboard.mmsSuccessRate
                )}
                unit="%"
                color="green"
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
            linkText="고객 관리"
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
    <article className="bg-white rounded-3xl border border-gray-200 p-7 shadow-md hover:border-emerald-300 transition flex flex-col justify-between min-h-64">
      <div>
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-black">
          {number}
        </div>

        <h2 className="text-xl font-black text-gray-900 mt-5">
          {title}
        </h2>

        <p className="text-gray-700 text-sm font-bold leading-relaxed mt-3">
          {description}
        </p>
      </div>

      <Link
        to={path}
        className="text-emerald-700 font-black text-base hover:underline flex items-center gap-2 pt-5"
      >
        <span>바로가기</span>
        <span>→</span>
      </Link>
    </article>
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
    green: {
      card: 'bg-emerald-50 border-emerald-200',
      label: 'text-emerald-700',
      value: 'text-emerald-700',
    },
    red: {
      card: 'bg-red-50 border-red-200',
      label: 'text-red-600',
      value: 'text-red-600',
    },
    blue: {
      card: 'bg-blue-50 border-blue-200',
      label: 'text-blue-700',
      value: 'text-blue-700',
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

function formatRate(value) {
  const rate = Number(value);

  if (Number.isNaN(rate)) {
    return 0;
  }

  if (Number.isInteger(rate)) {
    return rate;
  }

  return rate.toFixed(1);
}