import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { api } from '../api/api';
import Header from './Header';

const EMPTY_FORM = {
  title: '',
  content: '',
};

export default function Inquiry() {
  const [inquiries, setInquiries] = useState([]);
  const [searchType, setSearchType] = useState('all'); // 'all' | 'title' | 'content'
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [appliedSearchType, setAppliedSearchType] = useState('all');
  const [sortBy, setSortBy] = useState('latest'); // 'latest' | 'oldest' | 'number'
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadInquiries = useCallback(async (searchKeyword = '', type = 'all') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const normalizedKeyword = searchKeyword.trim();
      let endpoint = '/inquiries'; // 백엔드 API 엔드포인트에 맞게 조정 필요
      
      if (normalizedKeyword) {
        endpoint = `/inquiries?keyword=${encodeURIComponent(normalizedKeyword)}&type=${type}`;
      }
      
      const data = await api.get(endpoint);
      setInquiries(Array.isArray(data) ? data : []);
    } catch (error) {
      setInquiries([]);
      setErrorMessage(
        error.message || '문의내역을 불러오지 못했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  // 정렬 로직 적용된 목록 계산
  const sortedInquiries = [...inquiries].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.createDate) - new Date(a.createDate);
    } else if (sortBy === 'oldest') {
      return new Date(a.createDate) - new Date(b.createDate);
    } else if (sortBy === 'number') {
      return b.inquiryNum - a.inquiryNum;
    }
    return 0;
  });

  const handleSearch = async (event) => {
    event.preventDefault();
    const normalizedKeyword = keyword.trim();
    setAppliedKeyword(normalizedKeyword);
    setAppliedSearchType(searchType);
    await loadInquiries(normalizedKeyword, searchType);
  };

  const handleReset = async () => {
    setSearchType('all');
    setKeyword('');
    setAppliedKeyword('');
    setAppliedSearchType('all');
    setSortBy('latest');
    await loadInquiries();
  };

  const handleOpenDetail = async (inquiryNum) => {
    setErrorMessage('');
    try {
      setSelectedInquiry(await api.get(`/inquiries/${inquiryNum}`));
    } catch (error) {
      setErrorMessage(
        error.message || '문의 상세 내용을 불러오지 못했습니다.'
      );
    }
  };

  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setForm(EMPTY_FORM);
    setIsEditorOpen(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      setErrorMessage('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const request = {
        title: form.title.trim(),
        content: form.content.trim(),
      };

      await api.post('/inquiries', request);

      closeEditor();
      await loadInquiries(appliedKeyword, appliedSearchType);
    } catch (error) {
      setErrorMessage(
        error.message || '문의 등록에 실패했습니다.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (inquiry) => {
    const confirmed = window.confirm(
      `“${inquiry.title}” 문의를 삭제하시겠습니까?`
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage('');

    try {
      await api.delete(`/inquiries/${inquiry.inquiryNum}`);
      setSelectedInquiry(null);
      await loadInquiries(appliedKeyword, appliedSearchType);
    } catch (error) {
      setErrorMessage(
        error.message || '문의 삭제에 실패했습니다.'
      );
    }
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
          max-w-[1100px]
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
        <section
          className="
            bg-[#f8f0e2]
            border
            border-[#17372a]/25
            rounded-none
            p-8
            lg:p-10
            shadow-[0_18px_50px_rgba(40,48,42,0.08)]
          "
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
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
                CUSTOMER SUPPORT
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
                문의하기
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
                궁금한 점이나 불편한 사항을 남겨주시면 운영자가 빠르게 확인해 드립니다.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="
                  flex
                  items-center
                  justify-center
                  px-5
                  py-2.5
                  bg-[#f0e8dc]
                  border
                  border-[#17372a]/20
                "
              >
                <span className="text-[13px] font-semibold text-[#536159]">
                  총
                </span>

                <strong className="text-[18px] font-bold text-[#17372a] mx-2">
                  {sortedInquiries.length}
                </strong>

                <span className="text-[13px] font-semibold text-[#536159]">
                  건
                </span>
              </div>

              <button
                type="button"
                onClick={openCreateModal}
                className="
                  px-5
                  py-3
                  bg-[#17372a]
                  hover:bg-[#214b39]
                  text-white
                  rounded-none
                  text-[14px]
                  font-bold
                  transition
                  shadow-[0_10px_25px_rgba(23,55,42,0.15)]
                "
              >
                문의 등록
              </button>
            </div>
          </div>
        </section>

        {/* 검색 영역 */}
        <section
          className="
            bg-[#f8f0e2]
            border
            border-[#17372a]/25
            p-6
            shadow-[0_18px_50px_rgba(40,48,42,0.08)]
          "
        >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="
                px-4
                py-3.5
                bg-[#f7f3eb]
                border
                border-[#17372a]/25
                text-[15px]
                font-semibold
                text-[#17372a]
                focus:outline-none
                focus:border-[#17372a]
                cursor-pointer
                w-full
                md:w-36
              "
            >
              <option value="all">전체</option>
              <option value="title">제목</option>
              <option value="content">내용</option>
            </select>

            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              maxLength={100}
              placeholder="검색어를 입력하세요"
              className="
                flex-1
                px-4
                py-3.5
                border
                border-[#17372a]/25
                text-[15px]
                text-[#17372a]
                bg-[#f7f3eb]
                focus:outline-none
                focus:border-[#17372a]
                placeholder:text-[#8a968e]
              "
            />

            <button
              type="submit"
              disabled={isLoading}
              className="
                px-7
                py-3.5
                bg-[#17372a]
                hover:bg-[#214b39]
                disabled:bg-[#9ca7a0]
                text-white
                text-[14px]
                font-bold
                transition
              "
            >
              검색
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="
                px-7
                py-3.5
                border
                border-[#17372a]/25
                hover:bg-[#17372a]/[0.05]
                text-[14px]
                font-semibold
                text-[#536159]
                transition
              "
            >
              초기화
            </button>
          </form>
        </section>

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
            "
          >
            {errorMessage}
          </div>
        )}

        {/* 목록 테이블 영역 */}
        <section
          className="
            bg-[#f8f0e2]
            border
            border-[#17372a]/25
            shadow-[0_18px_50px_rgba(40,48,42,0.08)]
            overflow-hidden
          "
        >
          <div className="px-6 py-3 bg-[#f0e8dc] border-b border-[#17372a]/20 flex items-center justify-between">
            <div className="text-[13px] text-[#59675f] font-medium">
              {appliedKeyword && (
                <span>
                  &ldquo;<strong className="text-[#17372a]">{appliedKeyword}</strong>&rdquo; 검색 결과
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-[#536159]">정렬:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="
                  px-3
                  py-1.5
                  bg-[#f7f3eb]
                  border
                  border-[#17372a]/25
                  text-[13px]
                  text-[#17372a]
                  font-medium
                  focus:outline-none
                  cursor-pointer
                "
              >
                <option value="latest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="number">번호순</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <p className="p-16 text-center text-[#748078] text-[15px]">
              문의 내역을 불러오는 중입니다.
            </p>
          ) : sortedInquiries.length === 0 ? (
            <div className="p-16 text-center">
              <h2 className="text-[20px] font-bold text-[#17372a]">등록된 문의가 없습니다.</h2>
              <p className="mt-2 text-[14px] text-[#59675f]">
                {appliedKeyword
                  ? '다른 검색어를 입력해보세요.'
                  : '궁금한 사항이 있다면 문의를 등록해 주세요.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#17372a]/25 bg-[#f0e8dc] text-[13px] font-semibold text-[#59675f]">
                    <th className="w-24 px-6 py-4 text-center">번호</th>
                    <th className="px-6 py-4">제목</th>
                    <th className="w-32 px-6 py-4 text-center">처리상태</th>
                    <th className="w-40 px-6 py-4">작성일</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#17372a]/15">
                  {sortedInquiries.map((inquiry) => (
                    <tr key={inquiry.inquiryNum} className="hover:bg-[#f2ebd9] transition">
                      <td className="px-6 py-4 text-center text-[14px] text-[#748078]">
                        {inquiry.inquiryNum}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(inquiry.inquiryNum)}
                          className="text-left font-semibold text-[14px] text-[#17372a] hover:text-[#214b39] transition"
                        >
                          {inquiry.title}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`
                            inline-block px-2.5 py-1 text-[12px] font-bold
                            ${inquiry.status === 'ANSWERED' || inquiry.answer
                              ? 'bg-[#17372a] text-white'
                              : 'bg-[#d8cbb5] text-[#17372a]'}
                          `}
                        >
                          {inquiry.status === 'ANSWERED' || inquiry.answer ? '답변완료' : '검토중'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-[14px] text-[#59675f] whitespace-nowrap">
                        {formatDate(inquiry.createDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* 상세 모달 */}
      {selectedInquiry && (
        <InquiryDetailModal
          inquiry={selectedInquiry}
          onDelete={() => handleDelete(selectedInquiry)}
          onClose={() => setSelectedInquiry(null)}
        />
      )}

      {/* 등록 모달 */}
      {isEditorOpen && (
        <InquiryEditorModal
          form={form}
          isSaving={isSaving}
          onChange={handleFormChange}
          onSubmit={handleSave}
          onClose={closeEditor}
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
          <p className="text-[14px] font-bold">FarMMS</p>
          <p className="text-white/50 text-[13px]">© 2026 FarMMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function InquiryDetailModal({ inquiry, onDelete, onClose }) {
  return (
    <ModalFrame onClose={onClose}>
      <div className="flex items-start justify-between gap-5 p-6 border-b border-[#17372a]/20">
        <div>
          <p className="text-[12px] font-semibold text-[#64756b] tracking-[0.1em]">
            문의내역 #{inquiry.inquiryNum}
          </p>
          <h2 className="mt-2 text-[22px] font-bold text-[#17372a]">{inquiry.title}</h2>
          <p className="mt-1 text-[12px] text-[#748078]">
            {formatDateTime(inquiry.createDate)}
          </p>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      <div className="p-6 space-y-6">
        {/* 질문 내용 */}
        <div className="space-y-2">
          <p className="text-[13px] font-semibold text-[#536159]">문의 내용</p>
          <div className="min-h-[140px] border border-[#17372a]/20 bg-[#f0e8dc] p-5 text-[14px] text-[#17372a] leading-relaxed whitespace-pre-wrap break-words">
            {inquiry.content}
          </div>
        </div>

        {/* 운영자 답변 영역 */}
        <div className="space-y-2">
          <p className="text-[13px] font-semibold text-[#536159]">운영자 답변</p>
          <div className="min-h-[100px] border border-[#17372a]/20 bg-[#f7f3eb] p-5 text-[14px] text-[#17372a] leading-relaxed whitespace-pre-wrap break-words">
            {inquiry.answer || '아직 등록된 답변이 없습니다. 조금만 기다려 주세요!'}
          </div>
        </div>

        <div className="flex justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onDelete}
            className="
              px-5
              py-2.5
              border
              border-[#b45a47]/40
              text-[#b45a47]
              hover:bg-[#b45a47]/10
              text-[13px]
              font-semibold
              transition
            "
          >
            문의 삭제
          </button>

          <button
            type="button"
            onClick={onClose}
            className="
              px-5
              py-2.5
              border
              border-[#17372a]/25
              hover:bg-[#17372a]/[0.05]
              text-[13px]
              font-semibold
              text-[#536159]
              transition
            "
          >
            닫기
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}

function InquiryEditorModal({ form, isSaving, onChange, onSubmit, onClose }) {
  return (
    <ModalFrame onClose={onClose}>
      <div className="flex items-center justify-between p-6 border-b border-[#17372a]/20">
        <h2 className="text-[22px] font-bold text-[#17372a]">
          새 문의 등록
        </h2>
        <CloseButton onClick={onClose} />
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-5">
        <div className="space-y-2">
          <label htmlFor="inquiryTitle" className="block text-[13px] font-semibold text-[#536159]">제목</label>
          <input
            id="inquiryTitle"
            name="title"
            value={form.title}
            onChange={onChange}
            maxLength={200}
            className="
              w-full
              px-4
              py-3.5
              border
              border-[#17372a]/25
              text-[15px]
              text-[#17372a]
              bg-[#f7f3eb]
              focus:outline-none
              focus:border-[#17372a]
              placeholder:text-[#8a968e]
            "
            placeholder="제목을 입력해주세요."
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="inquiryContent" className="block text-[13px] font-semibold text-[#536159]">내용</label>
          <textarea
            id="inquiryContent"
            name="content"
            value={form.content}
            onChange={onChange}
            rows={10}
            className="
              w-full
              px-4
              py-3.5
              border
              border-[#17372a]/25
              text-[15px]
              text-[#17372a]
              bg-[#f7f3eb]
              focus:outline-none
              focus:border-[#17372a]
              resize-y
              placeholder:text-[#8a968e]
            "
            placeholder="문의하실 내용을 상세히 적어주세요."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="
              px-6
              py-3
              border
              border-[#17372a]/25
              hover:bg-[#17372a]/[0.05]
              text-[14px]
              font-semibold
              text-[#536159]
              transition
            "
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="
              px-6
              py-3
              bg-[#17372a]
              hover:bg-[#214b39]
              disabled:bg-[#9ca7a0]
              text-white
              text-[14px]
              font-bold
              transition
              shadow-[0_10px_25px_rgba(23,55,42,0.15)]
            "
          >
            {isSaving ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}

function ModalFrame({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm px-4 py-8 flex items-center justify-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl max-h-full overflow-y-auto bg-[#f8f0e2] border border-[#17372a]/25 shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function CloseButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-9 h-9 shrink-0 border border-[#17372a]/25 bg-[#f0e8dc] hover:bg-[#17372a]/10 flex items-center justify-center text-[#17372a] font-bold transition"
      aria-label="닫기"
    >
      ✕
    </button>
  );
}

function formatDate(value) {
  return format(value, false);
}

function formatDateTime(value) {
  return format(value, true);
}

function format(value, includeTime) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  }).format(date);
}