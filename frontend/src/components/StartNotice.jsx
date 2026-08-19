import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api';

const EMPTY_FORM = {
  title: '',
  content: '',
};

export default function StartNotice() {
  const [notices, setNotices] = useState([]);
  const [searchType, setSearchType] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [appliedSearchType, setAppliedSearchType] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [editingNotice, setEditingNotice] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadNotices = useCallback(async (searchKeyword = '', type = 'all') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const normalizedKeyword = searchKeyword.trim();
      let endpoint = '/notices';
      
      if (normalizedKeyword) {
        endpoint = `/notices?keyword=${encodeURIComponent(normalizedKeyword)}&type=${type}`;
      }
      
      const data = await api.get(endpoint);
      setNotices(Array.isArray(data) ? data : []);
    } catch (error) {
      setNotices([]);
      setErrorMessage(
        error.message || '공지사항을 불러오지 못했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  useEffect(() => {
    const loadMyRole = async () => {
      if (!localStorage.getItem('accessToken')) {
        setIsAdmin(false);
        return;
      }

      try {
        const profile = await api.get('/users/me');
        setIsAdmin(profile?.role === 'ADMIN');
      } catch {
        setIsAdmin(false);
      }
    };

    loadMyRole();
  }, []);

  const sortedNotices = [...notices].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.createDate) - new Date(a.createDate);
    } else if (sortBy === 'oldest') {
      return new Date(a.createDate) - new Date(b.createDate);
    } else if (sortBy === 'number') {
      return b.boardNum - a.boardNum;
    }
    return 0;
  });

  const handleSearch = async (event) => {
    event.preventDefault();
    const normalizedKeyword = keyword.trim();
    setAppliedKeyword(normalizedKeyword);
    setAppliedSearchType(searchType);
    await loadNotices(normalizedKeyword, searchType);
  };

  const handleReset = async () => {
    setSearchType('all');
    setKeyword('');
    setAppliedKeyword('');
    setAppliedSearchType('all');
    setSortBy('latest');
    await loadNotices();
  };

  const handleOpenDetail = async (boardNum) => {
    setErrorMessage('');

    try {
      setSelectedNotice(await api.get(`/notices/${boardNum}`));
    } catch (error) {
      setErrorMessage(
        error.message || '공지사항 상세 내용을 불러오지 못했습니다.'
      );
    }
  };

  const openCreateModal = () => {
    setEditingNotice(null);
    setForm(EMPTY_FORM);
    setIsEditorOpen(true);
  };

  const openEditModal = (notice) => {
    setSelectedNotice(null);
    setEditingNotice(notice);
    setForm({
      title: notice.title || '',
      content: notice.content || '',
    });
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setEditingNotice(null);
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

      if (editingNotice?.boardNum) {
        await api.patch(
          `/notices/${editingNotice.boardNum}`,
          request
        );
      } else {
        await api.post('/notices', request);
      }

      closeEditor();
      await loadNotices(appliedKeyword, appliedSearchType);
    } catch (error) {
      setErrorMessage(
        error.message || '공지사항 저장에 실패했습니다.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (notice) => {
    const confirmed = window.confirm(
      `“${notice.title}” 공지사항을 삭제하시겠습니까?`
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage('');

    try {
      await api.delete(`/notices/${notice.boardNum}`);
      setSelectedNotice(null);
      await loadNotices(appliedKeyword, appliedSearchType);
    } catch (error) {
      setErrorMessage(
        error.message || '공지사항 삭제에 실패했습니다.'
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

      {/* 헤더 */}
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
              href="/start#service"
              className="hover:text-[#17372a] transition"
            >
              서비스 소개
            </a>

            <a
              href="/start#process"
              className="hover:text-[#17372a] transition"
            >
              이용 방법
            </a>

            <Link
              to="/StartNotice"
              className="text-[#17372a] transition"
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

                FARMMS NOTICE
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
                공지사항
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
                FarMMS 서비스의 새로운 소식과 주요 안내를 확인하세요.
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
                  rounded-none
                "
              >
                <span className="text-[13px] font-semibold text-[#536159]">
                  총
                </span>

                <strong className="text-[18px] font-bold text-[#17372a] mx-2">
                  {sortedNotices.length}
                </strong>

                <span className="text-[13px] font-semibold text-[#536159]">
                  건
                </span>
              </div>

              {isAdmin && (
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
                  공지 등록
                </button>
              )}
            </div>
          </div>
        </section>

        <section
          className="
            bg-[#f8f0e2]
            border
            border-[#17372a]/25
            rounded-none
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
                rounded-none
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
              <option value="writer">작성자</option>
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
                rounded-none
                text-[15px]
                font-normal
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
                disabled:cursor-not-allowed
                text-white
                rounded-none
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
                rounded-none
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
              rounded-none
            "
          >
            {errorMessage}
          </div>
        )}

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
                  rounded-none
                  text-[13px]
                  text-[#17372a]
                  font-medium
                  focus:outline-none
                  focus:border-[#17372a]
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
            <p className="p-16 text-center text-[#748078] text-[15px] font-normal">
              공지사항을 불러오는 중입니다.
            </p>
          ) : sortedNotices.length === 0 ? (
            <div className="p-16 text-center">
              <h2 className="text-[20px] font-bold text-[#17372a]">등록된 공지사항이 없습니다.</h2>
              <p className="mt-2 text-[14px] font-normal text-[#59675f]">
                {appliedKeyword
                  ? '다른 검색어를 입력해보세요.'
                  : '새로운 소식이 등록되면 이곳에 표시됩니다.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#17372a]/25 bg-[#f0e8dc] text-[13px] font-semibold text-[#59675f]">
                    <th className="w-24 px-6 py-4 text-center">번호</th>
                    <th className="px-6 py-4">제목</th>
                    <th className="w-40 px-6 py-4">작성일</th>
                    {isAdmin && (
                      <th className="w-40 px-6 py-4 text-center">관리</th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#17372a]/15">
                  {sortedNotices.map((notice) => (
                    <tr key={notice.boardNum} className="hover:bg-[#f2ebd9] transition">
                      <td className="px-6 py-4 text-center text-[14px] font-normal text-[#748078]">
                        {notice.boardNum}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(notice.boardNum)}
                          className="text-left font-semibold text-[14px] text-[#17372a] hover:text-[#214b39] transition"
                        >
                          {notice.title}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-[14px] font-normal text-[#59675f] whitespace-nowrap">
                        {formatDate(notice.createDate)}
                      </td>

                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(notice)}
                              className="
                                px-3
                                py-1.5
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
                              수정
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(notice)}
                              className="
                                px-3
                                py-1.5
                                border
                                border-[#b45a47]/40
                                text-[#b45a47]
                                hover:bg-[#b45a47]/10
                                rounded-none
                                text-[12px]
                                font-semibold
                                transition
                              "
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {selectedNotice && (
        <NoticeDetailModal
          notice={selectedNotice}
          isAdmin={isAdmin}
          onEdit={() => openEditModal(selectedNotice)}
          onDelete={() => handleDelete(selectedNotice)}
          onClose={() => setSelectedNotice(null)}
        />
      )}

      {isAdmin && isEditorOpen && (
        <NoticeEditorModal
          form={form}
          isEditing={Boolean(editingNotice?.boardNum)}
          isSaving={isSaving}
          onChange={handleFormChange}
          onSubmit={handleSave}
          onClose={closeEditor}
        />
      )}

      {/* 푸터 */}
      <footer className="bg-[#10291f] text-white mt-14">
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
              <a href="/start#service" className="hover:text-white transition">
                서비스 소개
              </a>

              <a href="/start#process" className="hover:text-white transition">
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

function NoticeDetailModal({ notice, isAdmin, onEdit, onDelete, onClose }) {
  return (
    <ModalFrame onClose={onClose}>
      <div className="flex items-start justify-between gap-5 p-6 border-b border-[#17372a]/20">
        <div>
          <p className="text-[12px] font-semibold text-[#64756b] tracking-[0.1em]">
            공지사항 #{notice.boardNum}
          </p>
          <h2 className="mt-2 text-[22px] font-bold text-[#17372a]">{notice.title}</h2>
          <p className="mt-1 text-[12px] font-normal text-[#748078]">
            {formatDateTime(notice.createDate)}
          </p>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      <div className="p-6 space-y-6">
        <div className="min-h-[220px] rounded-none border border-[#17372a]/20 bg-[#f0e8dc] p-6 text-[14px] font-normal text-[#17372a] leading-relaxed whitespace-pre-wrap break-words">
          {notice.content}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          {isAdmin && (
            <>
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
                  rounded-none
                  text-[13px]
                  font-semibold
                  transition
                "
              >
                삭제
              </button>
              <button
                type="button"
                onClick={onEdit}
                className="
                  px-5
                  py-2.5
                  border
                  border-[#17372a]/30
                  bg-[#17372a]
                  text-white
                  hover:bg-[#214b39]
                  rounded-none
                  text-[13px]
                  font-semibold
                  transition
                "
              >
                수정
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onClose}
            className="
              px-5
              py-2.5
              border
              border-[#17372a]/25
              hover:bg-[#17372a]/[0.05]
              rounded-none
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

function NoticeEditorModal({ form, isEditing, isSaving, onChange, onSubmit, onClose }) {
  return (
    <ModalFrame onClose={onClose}>
      <div className="flex items-center justify-between p-6 border-b border-[#17372a]/20">
        <h2 className="text-[22px] font-bold text-[#17372a]">
          공지사항 {isEditing ? '수정' : '등록'}
        </h2>
        <CloseButton onClick={onClose} />
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-5">
        <div className="space-y-2">
          <label htmlFor="noticeTitle" className="block text-[13px] font-semibold text-[#536159]">제목</label>
          <input
            id="noticeTitle"
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
              rounded-none
              text-[15px]
              font-normal
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
          <label htmlFor="noticeContent" className="block text-[13px] font-semibold text-[#536159]">내용</label>
          <textarea
            id="noticeContent"
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
              rounded-none
              text-[15px]
              font-normal
              text-[#17372a]
              bg-[#f7f3eb]
              focus:outline-none
              focus:border-[#17372a]
              resize-y
              placeholder:text-[#8a968e]
            "
            placeholder="공지 내용을 입력해주세요."
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
              rounded-none
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
              disabled:cursor-not-allowed
              text-white
              rounded-none
              text-[14px]
              font-bold
              transition
              shadow-[0_10px_25px_rgba(23,55,42,0.15)]
            "
          >
            {isSaving ? '저장 중...' : '저장'}
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
      <div className="w-full max-w-3xl max-h-full overflow-y-auto bg-[#f8f0e2] border border-[#17372a]/25 rounded-none shadow-2xl">
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
      className="w-9 h-9 shrink-0 rounded-none border border-[#17372a]/25 bg-[#f0e8dc] hover:bg-[#17372a]/10 flex items-center justify-center text-[#17372a] font-bold transition"
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