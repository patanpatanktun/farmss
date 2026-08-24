import React, { useState } from 'react';
import Header from './Header'; // 공통 헤더 임포트

export default function UserToken() {
  // localStorage에서 보유 토큰을 가져오고, 없으면 15로 초기화
  const [tokenCount, setTokenCount] = useState(() => {
    return parseInt(localStorage.getItem('userTokens') || '15', 10);
  });

  // 30개, 100개, 300개, 600개 패키지 목록 (1토큰 = 50원 기준)
  const tokenPackages = [
    {
      id: 1,
      title: '스타터 패키지',
      tokens: 30,
      price: '1,500원',
      badge: null,
    },
    {
      id: 2,
      title: '인기 실속 패키지',
      tokens: 100,
      price: '5,000원',
      badge: '인기',
    },
    {
      id: 3,
      title: '프로 농가 패키지',
      tokens: 300,
      price: '15,000원',
      badge: 'BEST',
    },
    {
      id: 4,
      title: '비즈니스 마스터 패키지',
      tokens: 600,
      price: '30,000원',
      badge: 'MAX',
    },
  ];

  // 결제 버튼 클릭 시 실행되는 함수
  const handlePurchase = (pkg) => {
    // 1. 결제 완료 팝업 띄우기
    alert(`[결제 완료]\n${pkg.title} (${pkg.tokens}개) 결제가 완료되었습니다!`);

    // 2. 보유 토큰 개수 계산
    const newTotal = tokenCount + pkg.tokens;

    // 3. 로컬 스토리지 업데이트
    localStorage.setItem('userTokens', newTotal);

    // 4. 상태 변경 및 헤더 연동을 위한 새로고침
    setTokenCount(newTotal);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#eee9df]" style={{ fontFamily: '"SUIT Variable", SUIT, -apple-system, BlinkMacSystemFont, "Noto Sans KR", sans-serif' }}>
      {/* 상단 네비게이션 바 */}
      <Header />

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-[1100px] mx-auto px-6 py-12">
        {/* 상단 타이틀 및 현재 보유 토큰 현황 */}
        <div className="bg-white border border-[#17372a]/20 p-8 shadow-[0_10px_30px_rgba(40,48,42,0.06)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <div>
            <p className="text-[#17372a] text-[12px] font-bold tracking-[0.1em] uppercase mb-1">
              FarMMS Token System
            </p>
            <h1 className="text-[26px] font-bold text-[#17372a]">
              토큰 충전소
            </h1>
            <p className="text-[#6b7971] text-[14px] mt-1">
              홍보 이미지 생성 및 MMS 대량 발송에 필요한 토큰을 간편하게 충전하세요. (기준: 1토큰 = 50원)
            </p>
          </div>

          <div className="bg-[#f0e8dc] border border-[#17372a]/20 px-6 py-4 flex items-center gap-5 w-full md:w-auto justify-between md:justify-start">
            <div>
              <p className="text-[12px] text-[#6b7971] font-medium">현재 보유 중인 토큰</p>
              <p className="text-[24px] font-bold text-[#17372a] mt-0.5">
                {tokenCount}개
              </p>
            </div>
          </div>
        </div>

        {/* 토큰 사용 안내 박스 */}
        <div className="bg-[#17372a] text-white p-6 mb-10 rounded-none shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-[15px] font-bold mb-1">💡 토큰 사용 안내</p>
            <p className="text-[13px] text-white/80">
              • <strong className="text-emerald-300">홍보 이미지 생성 및 재생성 시:</strong> 2토큰 차감 (회당 100원)<br />
              • <strong className="text-emerald-300">MMS 문자 발송 시:</strong> 1인당 3토큰 차감 (건당 150원)
            </p>
          </div>
          <div className="bg-white/10 px-4 py-2 border border-white/20 text-[13px] font-medium text-center shrink-0">
            기본 환산: 1토큰 = 50원
          </div>
        </div>

        {/* 토큰 상품 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tokenPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white border border-[#17372a]/20 p-6 flex flex-col justify-between relative transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(40,48,42,0.1)]"
            >
              {/* 뱃지가 있는 경우 표시 */}
              {pkg.badge && (
                <span className="absolute top-4 right-4 bg-[#17372a] text-white text-[10px] font-bold px-2.5 py-1">
                  {pkg.badge}
                </span>
              )}

              <div>
                <p className="text-[13px] font-semibold text-[#6b7971]">{pkg.title}</p>
                
                {/* 토큰 수량 레이아웃 */}
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-[32px] font-extrabold text-[#17372a]">
                    {pkg.tokens}
                  </span>
                  <span className="text-[15px] font-bold text-[#17372a]">개</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#17372a]/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] text-[#6b7971]">결제 금액</span>
                  <span className="text-[18px] font-bold text-[#17372a]">{pkg.price}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handlePurchase(pkg)}
                  className="w-full bg-[#17372a] text-white py-3 text-[14px] font-semibold transition hover:bg-[#254f3d]"
                >
                  충전하기
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 안내 사항 */}
        <div className="mt-12 bg-[#f7f4ee] border border-[#17372a]/15 p-6 text-[13px] text-[#59675f] space-y-2">
          <p className="font-bold text-[#17372a] mb-2">📌 이용 안내</p>
          <p>• 충전된 토큰은 이미지 생성 및 MMS 발송 시 자동으로 차감됩니다.</p>
          <p>• 결제 관련 문의나 환불 요청은 상단 [고객지원]의 [문의하기]를 이용해 주세요.</p>
        </div>
      </main>
    </div>
  );
}