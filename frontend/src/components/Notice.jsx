import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { api } from '../api/api';
import Header from './Header';

export default function Notice() {
  const [notices, setNotices] =
    useState([]);

  const [keyword, setKeyword] =
    useState('');

  const [appliedKeyword, setAppliedKeyword] =
    useState('');

  const [selectedNotice, setSelectedNotice] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isDetailLoading, setIsDetailLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  /**
   * 정부 지원사업 공고 목록을 조회합니다.
   */
  const loadNotices = useCallback(
    async (searchKeyword = '') => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const normalizedKeyword =
          searchKeyword.trim();

        const endpoint = normalizedKeyword
          ? `/notices?keyword=${encodeURIComponent(
              normalizedKeyword
            )}`
          : '/notices';

        const data =
          await api.get(endpoint);

        setNotices(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        setNotices([]);

        setErrorMessage(
          error.message ||
            '지원사업 공고를 불러오지 못했습니다.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadNotices('');
  }, [loadNotices]);

  /**
   * 검색 버튼을 누르거나 Enter 키를 눌렀을 때
   * 공고 검색을 실행합니다.
   */
  const handleSearch = async (event) => {
    event.preventDefault();

    const normalizedKeyword =
      keyword.trim();

    setAppliedKeyword(
      normalizedKeyword
    );

    await loadNotices(
      normalizedKeyword
    );
  };

  /**
   * 검색 조건을 초기화하고
   * 전체 공고를 다시 조회합니다.
   */
  const handleReset = async () => {
    setKeyword('');
    setAppliedKeyword('');

    await loadNotices('');
  };

  /**
   * 선택한 공고의 상세정보를 조회합니다.
   */
  const handleOpenDetail = async (
    noticeId
  ) => {
    setIsDetailLoading(true);
    setErrorMessage('');

    try {
      const data = await api.get(
        `/notices/${noticeId}`
      );

      setSelectedNotice(data);
    } catch (error) {
      setErrorMessage(
        error.message ||
          '공고 상세정보를 불러오지 못했습니다.'
      );
    } finally {
      setIsDetailLoading(false);
    }
  };

  /**
   * 원본 공고 URL을 새 창으로 엽니다.
   */
  const handleOpenOriginal = (
    noticeUrl
  ) => {
    if (!isSafeHttpUrl(noticeUrl)) {
      setErrorMessage(
        '올바르지 않은 공고 주소입니다.'
      );
      return;
    }

    window.open(
      noticeUrl,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="bg-slate-100 text-gray-900 min-h-screen flex flex-col justify-between font-sans antialiased">
      <Header />

      <main className="max-w-[1200px] mx-auto px-6 sm:px-10 py-10 w-full flex-1 space-y-8">
        {/* 페이지 소개 */}
        <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-md">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <div className="inline-flex px-4 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-black">
                농업 지원사업 정보
              </div>

              <h1 className="mt-4 text-3xl font-black text-gray-900 tracking-tight">
                공지사항
              </h1>

              <p className="mt-2 text-gray-700 font-bold">
                농업인과 농자재 판매업체에 필요한
                정부 지원사업 공고를 확인할 수 있습니다.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
              <span>조회 결과</span>

              <strong className="text-3xl font-black text-emerald-700">
                {notices.length}
              </strong>

              <span>건</span>
            </div>
          </div>
        </section>

        {/* 검색 영역 */}
        <section className="bg-white rounded-3xl border border-gray-200 p-6 shadow-md">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-3"
          >
            <input
              type="text"
              value={keyword}
              onChange={(event) =>
                setKeyword(
                  event.target.value
                )
              }
              maxLength={100}
              placeholder="공고 제목, 출처 또는 내용 검색"
              className="flex-1 px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-700"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="px-7 py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-400 text-white rounded-2xl text-sm font-black transition"
            >
              검색
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="px-7 py-3.5 border-2 border-gray-200 hover:bg-slate-50 disabled:text-gray-400 rounded-2xl text-sm font-black transition"
            >
              초기화
            </button>
          </form>

          {appliedKeyword && (
            <p className="mt-4 px-1 text-sm font-bold text-gray-600">
              검색어{' '}

              <strong className="text-emerald-700">
                “{appliedKeyword}”
              </strong>

              에 대한 결과입니다.
            </p>
          )}
        </section>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        {/* 공고 목록 */}
        {isLoading ? (
          <section className="bg-white rounded-3xl border border-gray-200 p-16 shadow-md text-center">
            <p className="font-black text-gray-600">
              정부 지원사업 공고를 불러오는 중입니다...
            </p>
          </section>
        ) : notices.length === 0 ? (
          <section className="bg-white rounded-3xl border border-gray-200 p-16 shadow-md text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-2xl">
              📋
            </div>

            <h2 className="mt-5 text-xl font-black text-gray-900">
              조회된 공고가 없습니다.
            </h2>

            <p className="mt-2 text-sm font-bold text-gray-500">
              검색어를 변경하거나 전체 공고를 확인해 주세요.
            </p>

            {appliedKeyword && (
              <button
                type="button"
                onClick={handleReset}
                className="mt-6 px-6 py-3 border-2 border-emerald-700 text-emerald-700 hover:bg-emerald-50 rounded-2xl text-sm font-black"
              >
                전체 공고 보기
              </button>
            )}
          </section>
        ) : (
          <section className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr className="text-xs font-black text-gray-600">
                    <th className="w-24 px-6 py-4 text-center">
                      번호
                    </th>

                    <th className="px-6 py-4">
                      공고 제목
                    </th>

                    <th className="w-44 px-6 py-4">
                      출처
                    </th>

                    <th className="w-40 px-6 py-4">
                      수집일
                    </th>

                    <th className="w-28 px-6 py-4 text-center">
                      상세
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {notices.map(
                    (notice) => (
                      <tr
                        key={notice.noticeId}
                        className="hover:bg-emerald-50/40 transition"
                      >
                        <td className="px-6 py-5 text-center text-sm font-black text-gray-500">
                          {notice.noticeId}
                        </td>

                        <td className="px-6 py-5">
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenDetail(
                                notice.noticeId
                              )
                            }
                            className="text-left"
                          >
                            <p className="font-black text-gray-900 hover:text-emerald-700 transition">
                              {notice.title}
                            </p>

                            <p className="mt-2 text-xs font-bold text-gray-500 line-clamp-2 leading-relaxed">
                              {notice.summary ||
                                '등록된 공고 요약이 없습니다.'}
                            </p>
                          </button>
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-black">
                            {notice.sourceName}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm font-bold text-gray-600 whitespace-nowrap">
                          {formatDate(
                            notice.crawledAt
                          )}
                        </td>

                        <td className="px-6 py-5 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenDetail(
                                notice.noticeId
                              )
                            }
                            disabled={
                              isDetailLoading
                            }
                            className="px-4 py-2 border-2 border-gray-200 hover:border-emerald-700 hover:bg-emerald-50 disabled:bg-gray-100 rounded-xl text-xs font-black transition"
                          >
                            상세보기
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {selectedNotice && (
        <NoticeDetailModal
          notice={selectedNotice}
          onOpenOriginal={() =>
            handleOpenOriginal(
              selectedNotice.noticeUrl
            )
          }
          onClose={() =>
            setSelectedNotice(null)
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

/**
 * 공고 상세정보 모달입니다.
 */
function NoticeDetailModal({
  notice,
  onOpenOriginal,
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
      <div className="w-full max-w-3xl max-h-full overflow-y-auto bg-white rounded-3xl shadow-2xl">
        <div className="flex items-start justify-between gap-5 px-6 py-5 border-b border-gray-200">
          <div>
            <span className="inline-flex px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-black">
              {notice.sourceName}
            </span>

            <h2 className="mt-3 text-xl sm:text-2xl font-black text-gray-900 leading-snug">
              {notice.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="공지사항 상세보기 닫기"
            className="w-10 h-10 flex-shrink-0 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NoticeDetailItem
              label="공고 번호"
              value={notice.noticeId}
            />

            <NoticeDetailItem
              label="수집 일시"
              value={formatDateTime(
                notice.crawledAt
              )}
            />
          </div>

          <div>
            <h3 className="text-sm font-black text-gray-800">
              공고 요약
            </h3>

            <div className="mt-3 min-h-44 rounded-2xl border border-gray-200 bg-slate-50 p-5">
              <p className="text-sm font-bold text-gray-700 leading-7 whitespace-pre-wrap break-words">
                {notice.summary ||
                  '등록된 공고 요약이 없습니다.'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-bold text-amber-800 leading-relaxed">
              지원 대상, 신청 기간 및 제출 서류 등 정확한 내용은
              반드시 원본 공고에서 확인해 주세요.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-200 hover:bg-gray-50 rounded-2xl text-sm font-black"
            >
              닫기
            </button>

            <button
              type="button"
              onClick={onOpenOriginal}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-sm font-black"
            >
              원본 공고 확인하기 ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NoticeDetailItem({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
      <p className="text-xs font-black text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-gray-900">
        {value ?? '-'}
      </p>
    </div>
  );
}

/**
 * 날짜만 표시합니다.
 */
function formatDate(value) {
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
    }
  ).format(date);
}

/**
 * 날짜와 시간을 표시합니다.
 */
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

/**
 * http 또는 https 주소인지 검사합니다.
 */
function isSafeHttpUrl(value) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === 'http:' ||
      url.protocol === 'https:'
    );
  } catch {
    return false;
  }
}