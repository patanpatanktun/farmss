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
    <div className="bg-slate-100 text-gray-900 min-h-screen flex flex-col justify-between font-sans antialiased">
      <Header />

      <main className="max-w-[1360px] mx-auto px-6 sm:px-10 py-10 w-full flex-1 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            발송 내역
          </h1>

          <p className="text-gray-700 font-bold mt-2">
            고객별 MMS 발송 결과와 사용한 홍보
            이미지를 확인할 수 있습니다.
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <SummaryCard
            label="총 발송 건수"
            value={`${summary.totalCount}건`}
          />

          <SummaryCard
            label="발송 성공"
            value={`${summary.successCount}건`}
            color="text-emerald-700"
          />

          <SummaryCard
            label="발송 실패"
            value={`${summary.failCount}건`}
            color="text-red-600"
          />

          <SummaryCard
            label="전체 수신 고객"
            value={`${summary.recipientCount}명`}
          />
        </section>

        <section className="bg-white rounded-3xl border border-gray-200 p-6 shadow-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_220px_auto] gap-3">
            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              placeholder="고객명, 전화번호, 상품명, 문구 검색"
              className="px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-700"
            />

            <input
              type="text"
              name="region"
              value={filters.region}
              onChange={handleFilterChange}
              placeholder="지역 검색 (예: 광주, 나주)"
              className="px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-700"
            />

            <input
              type="text"
              name="crop"
              value={filters.crop}
              onChange={handleFilterChange}
              placeholder="작물 검색 (예: 배, 벼)"
              className="px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-700"
            />

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm font-black bg-white focus:outline-none focus:border-emerald-700"
            >
              <option value="">
                전체 발송 상태
              </option>

              <option value="SUCCESS">
                발송 성공
              </option>

              <option value="FAILED">
                발송 실패
              </option>
            </select>

            <button
              type="button"
              onClick={handleFilterReset}
              className="px-5 py-3 border-2 border-gray-200 hover:bg-gray-50 rounded-2xl text-sm font-black"
            >
              초기화
            </button>
          </div>

          <p className="text-sm font-black text-gray-600 px-1">
            검색 결과{' '}
            <span className="text-emerald-700">
              {filteredHistories.length}
            </span>
            건
          </p>
        </section>

        <section className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center text-gray-500 font-bold">
              MMS 발송 내역을 불러오는 중입니다.
            </div>
          ) : filteredHistories.length === 0 ? (
            <div className="py-20 px-6 text-center">
              <p className="text-xl font-black text-gray-800">
                조회된 발송 내역이 없습니다.
              </p>

              <p className="text-sm text-gray-500 font-bold mt-2">
                고객을 선택해서 첫 MMS를
                발송해보세요.
              </p>

              <Link
                to="/sendmms"
                className="inline-block mt-6 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-sm"
              >
                MMS 발송하러 가기
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-slate-50 text-xs font-black text-gray-600">
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

                <tbody className="divide-y divide-gray-100">
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
                          className="hover:bg-slate-50"
                        >
                          <td className="px-5 py-5 text-sm font-bold text-gray-700 whitespace-nowrap">
                            {formatDateTime(
                              history.sendDate
                            )}
                          </td>

                          <td className="px-5 py-5">
                            <p className="font-black text-gray-900 whitespace-nowrap">
                              {contact?.conName ||
                                '고객 정보 없음'}
                            </p>

                            <p className="text-xs text-gray-500 font-bold mt-1 whitespace-nowrap">
                              {formatPhone(
                                contact?.phone
                              )}
                            </p>
                          </td>

                          <td className="px-5 py-5 text-sm font-bold text-gray-700">
                            <p>
                              {contact?.region ||
                                '-'}
                            </p>

                            <p className="text-emerald-700 mt-1">
                              {contact?.crop ||
                                '-'}
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <p className="font-black text-gray-900 whitespace-nowrap">
                              {product?.proName ||
                                '상품 정보 없음'}
                            </p>

                            <p className="text-xs text-gray-500 font-bold mt-1">
                              {product?.company ||
                                '-'}
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <StatusBadge
                              status={
                                history.sendStatus
                              }
                            />
                          </td>

                          <td className="px-5 py-5 text-sm font-black text-gray-700 whitespace-nowrap">
                            {history.reserveFlag ===
                            'Y'
                              ? '예약 발송'
                              : '즉시 발송'}
                          </td>

                          <td className="px-5 py-5 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedHistory(
                                  history
                                )
                              }
                              className="px-4 py-2 border-2 border-gray-200 hover:border-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-black"
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

      <footer className="w-full bg-white border-t border-gray-200 py-6 px-10 text-center text-gray-600 text-xs mt-12 shadow-sm">
        <p className="font-bold">
          © 2026 FarMMS. All rights reserved.
        </p>
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
      className="fixed inset-0 z-[100] bg-black/60 px-4 py-8 flex items-center justify-center"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-4xl max-h-full overflow-y-auto bg-white rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              MMS 발송 상세
            </h2>

            <p className="text-xs text-gray-500 font-bold mt-1">
              {formatDateTime(
                history.sendDate
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 font-black"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 p-6">
          <div>
            {image?.imageUrl ? (
              <img
                src={image.imageUrl}
                alt="MMS 발송 홍보 이미지"
                className="w-full aspect-square object-cover rounded-2xl border border-gray-200 bg-slate-50"
              />
            ) : (
              <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-gray-300 bg-slate-50 flex items-center justify-center text-gray-400 font-bold">
                이미지 정보 없음
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem
                label="수신 고객"
                value={
                  contact?.conName ||
                  '고객 정보 없음'
                }
              />

              <DetailItem
                label="전화번호"
                value={formatPhone(
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

            <div className="rounded-2xl bg-slate-50 border border-gray-200 p-5">
              <p className="text-xs font-black text-gray-500">
                발송 문구
              </p>

              <p className="mt-3 text-sm font-bold text-gray-800 whitespace-pre-wrap leading-relaxed">
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
  color = 'text-gray-900',
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-md">
      <p className="text-xs font-black text-gray-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-black ${color}`}
      >
        {value}
      </p>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-gray-200 p-4">
      <p className="text-xs font-black text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-black text-gray-900">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const isSuccess = status === 'SUCCESS';

  return (
    <span
      className={`inline-block px-3 py-1 rounded-xl border text-xs font-black ${
        isSuccess
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-red-50 border-red-200 text-red-600'
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

function formatPhone(phone) {
  if (!phone) {
    return '-';
  }

  const numbers = String(phone).replace(
    /[^0-9]/g,
    ''
  );

  if (numbers.length === 11) {
    return numbers.replace(
      /(\d{3})(\d{4})(\d{4})/,
      '$1-$2-$3'
    );
  }

  if (numbers.length === 10) {
    return numbers.replace(
      /(\d{3})(\d{3})(\d{4})/,
      '$1-$2-$3'
    );
  }

  return phone;
}