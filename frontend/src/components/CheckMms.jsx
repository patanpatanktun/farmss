import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api';
import Header from './Header';

export default function CheckMms() {
  const [histories, setHistories] =
    useState([]);

  const [contacts, setContacts] =
    useState([]);

  const [images, setImages] =
    useState([]);

  const [products, setProducts] =
    useState([]);

  const [selectedHistory, setSelectedHistory] =
    useState(null);

  const [filters, setFilters] = useState({
    keyword: '',
    region: '',
    crop: '',
    status: '',
  });

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState('');

  /**
   * 발송 이력과 연결 정보를 조회합니다.
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const [
        historyData,
        contactData,
        imageData,
        productData,
      ] = await Promise.all([
        api.get('/mms/history'),
        api.get('/contacts'),
        api.get('/images'),
        api.get('/products'),
      ]);

      setHistories(
        Array.isArray(historyData)
          ? historyData
          : []
      );

      setContacts(
        Array.isArray(contactData)
          ? contactData
          : []
      );

      setImages(
        Array.isArray(imageData)
          ? imageData
          : []
      );

      setProducts(
        Array.isArray(productData)
          ? productData
          : []
      );
    } catch (error) {
      setErrorMessage(
        error.message ||
          'MMS 발송 내역을 불러오지 못했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    /*
     * 예약 발송 결과가 화면을 새로 고치지 않아도
     * 반영되도록 30초마다 발송 내역을 다시 조회합니다.
     */
    const refreshTimer = window.setInterval(
      loadData,
      30000
    );

    return () => {
      window.clearInterval(refreshTimer);
    };
  }, [loadData]);

  /**
   * 고객 번호로 고객 정보를 찾습니다.
   */
  const contactMap = useMemo(() => {
    const result = new Map();

    contacts.forEach((contact) => {
      result.set(
        Number(contact.conNum),
        contact
      );
    });

    return result;
  }, [contacts]);

  /**
   * 이미지 번호로 이미지 정보를 찾습니다.
   */
  const imageMap = useMemo(() => {
    const result = new Map();

    images.forEach((image) => {
      result.set(
        Number(image.imageId),
        image
      );
    });

    return result;
  }, [images]);

  /**
   * 상품 번호로 상품 정보를 찾습니다.
   */
  const productMap = useMemo(() => {
    const result = new Map();

    products.forEach((product) => {
      result.set(
        Number(product.proNum),
        product
      );
    });

    return result;
  }, [products]);

  /**
   * 쉼표로 구분한 검색어를 배열로 만듭니다.
   */
  const splitKeywords = (value) => {
    if (!value || !value.trim()) {
      return [];
    }

    return [
      ...new Set(
        value
          .split(/[,/|]+/)
          .map((keyword) =>
            keyword.trim().toLowerCase()
          )
          .filter(Boolean)
      ),
    ];
  };

  const includesAnyKeyword = (
    target,
    keywords
  ) => {
    if (keywords.length === 0) {
      return true;
    }

    const normalizedTarget = String(
      target || ''
    ).toLowerCase();

    return keywords.some((keyword) =>
      normalizedTarget.includes(keyword)
    );
  };

  /**
   * 고객명, 전화번호, 지역, 작물, 상태 조건으로
   * 발송 내역을 검색합니다.
   */
  const filteredHistories = useMemo(() => {
    const normalizedKeyword =
      filters.keyword
        .trim()
        .toLowerCase();

    const regionKeywords =
      splitKeywords(filters.region);

    const cropKeywords =
      splitKeywords(filters.crop);

    return histories.filter((history) => {
      const contact = contactMap.get(
        Number(history.conNum)
      );

      const image = imageMap.get(
        Number(history.imageId)
      );

      const product = image
        ? productMap.get(
            Number(image.proNum)
          )
        : null;

      const matchesKeyword =
        !normalizedKeyword ||
        String(contact?.conName || '')
          .toLowerCase()
          .includes(normalizedKeyword) ||
        String(contact?.phone || '')
          .replace(/[^0-9]/g, '')
          .includes(
            normalizedKeyword.replace(
              /[^0-9]/g,
              ''
            )
          ) ||
        String(product?.proName || '')
          .toLowerCase()
          .includes(normalizedKeyword) ||
        String(history.mmsText || '')
          .toLowerCase()
          .includes(normalizedKeyword);

      const matchesRegion =
        includesAnyKeyword(
          contact?.region,
          regionKeywords
        );

      const matchesCrop =
        includesAnyKeyword(
          contact?.crop,
          cropKeywords
        );

      const matchesStatus =
        !filters.status ||
        history.sendStatus ===
          filters.status;

      return (
        matchesKeyword &&
        matchesRegion &&
        matchesCrop &&
        matchesStatus
      );
    });
  }, [
    histories,
    contactMap,
    imageMap,
    productMap,
    filters,
  ]);

  const summary = useMemo(() => {
    const successCount =
      histories.filter(
        (history) =>
          history.sendStatus === 'SUCCESS'
      ).length;

    const failCount =
      histories.filter(
        (history) =>
          history.sendStatus === 'FAILED'
      ).length;

    const recipientCount =
      new Set(
        histories.map(
          (history) => history.conNum
        )
      ).size;

    return {
      totalCount: histories.length,
      successCount,
      failCount,
      recipientCount,
    };
  }, [histories]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFilterReset = () => {
    setFilters({
      keyword: '',
      region: '',
      crop: '',
      status: '',
    });
  };

  return (
    <div
      className="
        min-h-screen
        bg-[#eee9df]
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
          space-y-10
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

            MMS HISTORY
          </div>

          <h1
            className="
              text-[32px]
              sm:text-[38px]
              font-bold
              tracking-[-0.03em]
              text-[#17372a]
            "
          >
            발송 내역
          </h1>

          <p
            className="
              text-[#59685f]
              text-[16px]
              sm:text-[17px]
              font-normal
              mt-2
            "
          >
            고객별 MMS 발송 결과와 사용한 홍보 이미지를 확인할 수 있습니다.
          </p>
        </div>

        {errorMessage && (
          <div
            className="
              bg-[#f8e7e3]
              border-l-[3px]
              border-[#b45a47]
              px-5
              py-4
              text-[14px]
              font-medium
              text-[#873c2e]
              rounded-none
            "
          >
            {errorMessage}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="총 발송 건수"
            value={`${summary.totalCount}건`}
          />

          <SummaryCard
            label="발송 성공"
            value={`${summary.successCount}건`}
            color="text-[#17372a]"
          />

          <SummaryCard
            label="발송 실패"
            value={`${summary.failCount}건`}
            color="text-[#b45a47]"
          />

          <SummaryCard
            label="전체 수신 고객"
            value={`${summary.recipientCount}명`}
          />
        </section>

        <section
          className="
            bg-[#f8f0e2]
            border
            border-[#17372a]/25
            rounded-none
            p-6
            lg:p-8
            shadow-[0_18px_50px_rgba(40,48,42,0.08)]
            space-y-4
          "
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_220px_auto] gap-3">
            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              placeholder="고객명, 전화번호, 상품명, 문구 검색"
              className="
                w-full
                px-4
                py-3.5
                border
                border-[#17372a]/25
                rounded-none
                font-normal
                text-[15px]
                text-[#17372a]
                bg-[#f7f3eb]
                focus:outline-none
                focus:border-[#17372a]
                placeholder:text-[#8a968e]
              "
            />

            <input
              type="text"
              name="region"
              value={filters.region}
              onChange={handleFilterChange}
              placeholder="지역 검색 (예: 광주, 나주)"
              className="
                w-full
                px-4
                py-3.5
                border
                border-[#17372a]/25
                rounded-none
                font-normal
                text-[15px]
                text-[#17372a]
                bg-[#f7f3eb]
                focus:outline-none
                focus:border-[#17372a]
                placeholder:text-[#8a968e]
              "
            />

            <input
              type="text"
              name="crop"
              value={filters.crop}
              onChange={handleFilterChange}
              placeholder="작물 검색 (예: 배, 벼)"
              className="
                w-full
                px-4
                py-3.5
                border
                border-[#17372a]/25
                rounded-none
                font-normal
                text-[15px]
                text-[#17372a]
                bg-[#f7f3eb]
                focus:outline-none
                focus:border-[#17372a]
                placeholder:text-[#8a968e]
              "
            />

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="
                w-full
                px-4
                py-3.5
                border
                border-[#17372a]/25
                rounded-none
                font-normal
                text-[15px]
                text-[#17372a]
                bg-[#f7f3eb]
                focus:outline-none
                focus:border-[#17372a]
              "
            >
              <option value="">전체 발송 상태</option>
              <option value="SUCCESS">발송 성공</option>
              <option value="FAILED">발송 실패</option>
              <option value="RESERVED">예약 발송 전</option>
            </select>

            <button
              type="button"
              onClick={handleFilterReset}
              className="
                px-5
                py-3.5
                border
                border-[#17372a]/25
                hover:bg-[#17372a]/[0.05]
                rounded-none
                text-[14px]
                font-semibold
                text-[#536159]
                transition
              "
            >
              초기화
            </button>
          </div>

          <p className="text-[14px] font-semibold text-[#59675f] px-1">
            검색 결과{' '}
            <span className="text-[#17372a] font-bold">
              {filteredHistories.length}
            </span>
            건
          </p>
        </section>

        <section
          className="
            bg-[#f8f0e2]
            border
            border-[#17372a]/25
            rounded-none
            shadow-[0_18px_50px_rgba(40,48,42,0.08)]
            overflow-hidden
          "
        >
          {isLoading ? (
            <div className="py-20 text-center text-[#748078] text-[15px] font-normal">
              MMS 발송 내역을 불러오는 중입니다.
            </div>
          ) : filteredHistories.length === 0 ? (
            <div className="py-20 px-6 text-center">
              <p className="text-[20px] font-bold text-[#17372a]">
                조회된 발송 내역이 없습니다.
              </p>

              <p className="text-[14px] text-[#59675f] font-normal mt-2">
                고객을 선택해서 첫 MMS를 발송해보세요.
              </p>

              <Link
                to="/sendmms"
                className="
                  inline-block
                  mt-6
                  px-6
                  py-3.5
                  bg-[#17372a]
                  hover:bg-[#214b39]
                  text-white
                  rounded-none
                  font-bold
                  text-[15px]
                  transition
                  shadow-[0_10px_25px_rgba(23,55,42,0.15)]
                "
              >
                MMS 발송하러 가기
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#17372a]/25 bg-[#f0e8dc] text-[13px] font-semibold text-[#59675f]">
                    <th className="px-5 py-4">
                      발송 일시
                    </th>

                    <th className="px-5 py-4">
                      수신 고객
                    </th>

                    <th className="px-5 py-4">
                      지역·작물
                    </th>

                    <th className="px-5 py-4">
                      홍보 상품
                    </th>

                    <th className="px-5 py-4">
                      발송 상태
                    </th>

                    <th className="px-5 py-4">
                      발송 방식
                    </th>

                    <th className="px-5 py-4 text-center">
                      상세
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#17372a]/15">
                  {filteredHistories.map(
                    (history) => {
                      const contact =
                        contactMap.get(
                          Number(
                            history.conNum
                          )
                        );

                      const image =
                        imageMap.get(
                          Number(
                            history.imageId
                          )
                        );

                      const product = image
                        ? productMap.get(
                            Number(
                              image.proNum
                            )
                          )
                        : null;

                      return (
                        <tr
                          key={history.mmsNum}
                          className="hover:bg-[#f2ebd9] transition"
                        >
                          <td className="px-5 py-4 text-[14px] font-normal text-[#59675f] whitespace-nowrap">
                            {formatDateTime(
                              history.reserveFlag ===
                                'Y' &&
                                history.reserveDate
                                ? history.reserveDate
                                : history.sendDate
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-semibold text-[14px] text-[#17372a] whitespace-nowrap">
                              {contact?.conName ||
                                '고객 정보 없음'}
                            </p>

                            <p className="text-[12px] text-[#748078] font-normal mt-0.5 whitespace-nowrap">
                              {formatMaskedPhone(
                                contact?.phone
                              )}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-[14px] text-[#59675f] font-normal">
                            <p>
                              {contact?.region ||
                                '-'}
                            </p>

                            <p className="text-[#17372a] mt-0.5">
                              {contact?.crop ||
                                '-'}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-semibold text-[14px] text-[#17372a] whitespace-nowrap">
                              {product?.proName ||
                                '상품 정보 없음'}
                            </p>

                            <p className="text-[12px] text-[#748078] font-normal mt-0.5">
                              {product?.company ||
                                '-'}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge
                              status={
                                history.sendStatus
                              }
                            />
                          </td>

                          <td className="px-5 py-4 text-[14px] font-normal text-[#59675f] whitespace-nowrap">
                            {history.reserveFlag ===
                            'Y'
                              ? '예약 발송'
                              : '즉시 발송'}
                          </td>

                          <td className="px-5 py-4 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedHistory(
                                  history
                                )
                              }
                              className="
                                px-4
                                py-2
                                border
                                border-[#17372a]/30
                                text-[#17372a]
                                hover:bg-[#17372a]/[0.06]
                                rounded-none
                                text-[12px]
                                font-semibold
                                transition
                              "
                            >
                              상세보기
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {selectedHistory && (
        <HistoryDetailModal
          history={selectedHistory}
          contact={contactMap.get(
            Number(selectedHistory.conNum)
          )}
          image={imageMap.get(
            Number(selectedHistory.imageId)
          )}
          product={getProductFromHistory(
            selectedHistory,
            imageMap,
            productMap
          )}
          onClose={() =>
            setSelectedHistory(null)
          }
        />
      )}

      <footer
        className="
          w-full
          bg-[#10291f]
          text-white
          py-8
          text-center
          mt-14
        "
      >
        <div
          className="
            max-w-[1360px]
            mx-auto
            px-6
            sm:px-10
            flex
            flex-col
            sm:flex-row
            items-center
            justify-between
            gap-3
          "
        >
          <p className="text-[14px] font-bold">
            FarMMS
          </p>

          <p className="text-white/50 text-[13px] font-normal">
            © 2026 FarMMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function HistoryDetailModal({
  history,
  contact,
  image,
  product,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm px-4 py-8 flex items-center justify-center"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-4xl max-h-full overflow-y-auto bg-[#f8f0e2] border border-[#17372a]/25 rounded-none shadow-2xl p-8 space-y-6">
        <div className="flex items-center justify-between pb-5 border-b border-[#17372a]/20">
          <div>
            <h2 className="text-[22px] font-bold text-[#17372a]">
              MMS 발송 상세
            </h2>

            <p className="text-[12px] text-[#748078] font-normal mt-1">
              {formatDateTime(
                history.sendDate
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-none border border-[#17372a]/25 bg-[#f0e8dc] hover:bg-[#17372a]/10 flex items-center justify-center text-[#17372a] font-bold transition"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <div>
            {image?.imageUrl ? (
              <img
                src={image.imageUrl}
                alt="MMS 발송 홍보 이미지"
                className="w-full aspect-square object-cover rounded-none border border-[#17372a]/20 bg-[#f0e8dc]"
              />
            ) : (
              <div className="w-full aspect-square rounded-none border border-dashed border-[#17372a]/30 bg-[#f0e8dc] flex items-center justify-center text-[#748078] text-[14px] font-normal">
                이미지 정보 없음
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailItem
                label="수신 고객"
                value={
                  contact?.conName ||
                  '고객 정보 없음'
                }
              />

              <DetailItem
                label="전화번호"
                value={formatMaskedPhone(
                  contact?.phone
                )}
              />

              <DetailItem
                label="재배 지역"
                value={
                  contact?.region || '-'
                }
              />

              <DetailItem
                label="재배작물"
                value={
                  contact?.crop || '-'
                }
              />

              <DetailItem
                label="홍보 상품"
                value={
                  product?.proName ||
                  '상품 정보 없음'
                }
              />

              <DetailItem
                label="발송 상태"
                value={getStatusText(
                  history.sendStatus
                )}
              />
            </div>

            <div className="rounded-none bg-[#f0e8dc] border border-[#17372a]/20 p-5 space-y-2">
              <p className="text-[12px] font-semibold text-[#748078] tracking-[0.05em]">
                발송 문구
              </p>

              <p className="text-[14px] font-normal text-[#17372a] whitespace-pre-wrap leading-relaxed">
                {history.mmsText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color = 'text-[#17372a]',
}) {
  return (
    <div
      className="
        bg-[#f8f0e2]
        border
        border-[#17372a]/25
        rounded-none
        p-6
        shadow-[0_18px_50px_rgba(40,48,42,0.08)]
      "
    >
      <p className="text-[12px] font-semibold text-[#748078] tracking-[0.05em]">
        {label}
      </p>

      <p
        className={`mt-2 text-[24px] font-bold ${color}`}
      >
        {value}
      </p>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-none bg-[#f0e8dc] border border-[#17372a]/20 p-4">
      <p className="text-[12px] font-semibold text-[#748078] tracking-[0.05em]">
        {label}
      </p>

      <p className="mt-1 font-semibold text-[15px] text-[#17372a]">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const colorClasses = {
    SUCCESS:
      'bg-[#e8f3ee] border-[#17372a]/30 text-[#17372a]',
    FAILED:
      'bg-[#f8e7e3] border-[#b45a47]/40 text-[#b45a47]',
    RESERVED:
      'bg-[#f0e8dc] border-[#17372a]/25 text-[#59675f]',
    REQUESTED:
      'bg-[#e8f3ee] border-[#17372a]/30 text-[#17372a]',
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-none border text-[12px] font-semibold ${
        colorClasses[status] ||
        'bg-[#f0e8dc] border-[#17372a]/25 text-[#59675f]'
      }`}
    >
      {getStatusText(status)}
    </span>
  );
}

function getStatusText(status) {
  if (status === 'SUCCESS') {
    return '발송 성공';
  }

  if (status === 'FAILED') {
    return '발송 실패';
  }

  if (status === 'REQUESTED') {
    return '발송 요청';
  }

  if (status === 'RESERVED') {
    return '예약 발송 전';
  }

  return status || '상태 없음';
}

function getProductFromHistory(
  history,
  imageMap,
  productMap
) {
  const image = imageMap.get(
    Number(history.imageId)
  );

  if (!image) {
    return null;
  }

  return (
    productMap.get(
      Number(image.proNum)
    ) || null
  );
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    'ko-KR',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }
  ).format(date);
}

function formatMaskedPhone(phone) {
  if (!phone) {
    return '-';
  }

  const numbers = String(phone).replace(/[^0-9]/g, '');

  if (numbers.length === 11) {
    return numbers.replace(
      /(\d{3})(\d{4})(\d{4})/,
      '$1-****-$3'
    );
  }

  if (
    numbers.startsWith('02') &&
    numbers.length === 10
  ) {
    return numbers.replace(
      /(\d{2})(\d{4})(\d{4})/,
      '$1-****-$3'
    );
  }

  if (numbers.length === 10) {
    return numbers.replace(
      /(\d{3})(\d{3})(\d{4})/,
      '$1-***-$3'
    );
  }

  return phone;
}