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

export default function Notice() {
  const [notices, setNotices] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [editingNotice, setEditingNotice] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadNotices = useCallback(async (searchKeyword = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const normalizedKeyword = searchKeyword.trim();
      const endpoint = normalizedKeyword
        ? `/notices?keyword=${encodeURIComponent(normalizedKeyword)}`
        : '/notices';
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

  const handleSearch = async (event) => {
    event.preventDefault();
    const normalizedKeyword = keyword.trim();
    setAppliedKeyword(normalizedKeyword);
    await loadNotices(normalizedKeyword);
  };

  const handleReset = async () => {
    setKeyword('');
    setAppliedKeyword('');
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
      await loadNotices(appliedKeyword);
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
      await loadNotices(appliedKeyword);
    } catch (error) {
      setErrorMessage(
        error.message || '공지사항 삭제에 실패했습니다.'
      );
    }
  };

  return (
    <div className="bg-slate-100 text-gray-900 min-h-screen flex flex-col font-sans antialiased">
      <Header />

      <main className="max-w-[1100px] mx-auto px-6 sm:px-10 py-10 w-full flex-1 space-y-7">
        <section className="bg-gradient-to-br from-white via-emerald-50 to-green-100 rounded-3xl border border-emerald-200 p-8 shadow-md">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <div className="inline-flex px-4 py-1.5 bg-white/80 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-black">
                FarMMS 안내
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight">
                공지사항
              </h1>

              <p className="mt-2 text-gray-700 font-bold">
                FarMMS 서비스의 새로운 소식과 주요 안내를 확인하세요.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm font-bold text-gray-600">
                총 <strong className="text-3xl text-emerald-700">{notices.length}</strong> 건
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-sm font-black"
                >
                  공지 등록
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-gray-200 p-6 shadow-md">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              maxLength={100}
              placeholder="공지사항 제목 또는 내용 검색"
              className="flex-1 px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-700"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="px-7 py-3.5 bg-emerald-700 disabled:bg-gray-400 text-white rounded-2xl text-sm font-black"
            >
              검색
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="px-7 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-black"
            >
              초기화
            </button>
          </form>
        </section>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
          {isLoading ? (
            <p className="p-16 text-center font-black text-gray-500">
              공지사항을 불러오는 중입니다.
            </p>
          ) : notices.length === 0 ? (
            <div className="p-16 text-center">
              <h2 className="text-xl font-black">등록된 공지사항이 없습니다.</h2>
              <p className="mt-2 text-sm font-bold text-gray-500">
                {appliedKeyword
                  ? '다른 검색어를 입력해보세요.'
                  : '새로운 소식이 등록되면 이곳에 표시됩니다.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr className="text-xs font-black text-gray-600">
                    <th className="w-24 px-6 py-4 text-center">번호</th>
                    <th className="px-6 py-4">제목</th>
                    <th className="w-40 px-6 py-4">작성일</th>
                    {isAdmin && (
                      <th className="w-40 px-6 py-4 text-center">관리</th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {notices.map((notice) => (
                    <tr key={notice.boardNum} className="hover:bg-emerald-50/40">
                      <td className="px-6 py-5 text-center text-sm font-black text-gray-500">
                        {notice.boardNum}
                      </td>

                      <td className="px-6 py-5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(notice.boardNum)}
                          className="text-left font-black hover:text-emerald-700"
                        >
                          {notice.title}
                        </button>
                      </td>

                      <td className="px-6 py-5 text-sm font-bold text-gray-600 whitespace-nowrap">
                        {formatDate(notice.createDate)}
                      </td>

                      {isAdmin && (
                        <td className="px-6 py-5">
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(notice)}
                              className="px-3 py-2 border border-gray-300 rounded-xl text-xs font-black"
                            >
                              수정
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(notice)}
                              className="px-3 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-black"
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

      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs font-bold text-gray-600">
        © 2026 FarMMS. All rights reserved.
      </footer>
    </div>
  );
}

function NoticeDetailModal({ notice, isAdmin, onEdit, onDelete, onClose }) {
  return (
    <ModalFrame onClose={onClose}>
      <div className="flex items-start justify-between gap-5 p-6 border-b">
        <div>
          <p className="text-xs font-black text-emerald-700">
            공지사항 #{notice.boardNum}
          </p>
          <h2 className="mt-2 text-2xl font-black">{notice.title}</h2>
          <p className="mt-2 text-sm font-bold text-gray-500">
            {formatDateTime(notice.createDate)}
          </p>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      <div className="p-6">
        <div className="min-h-56 rounded-2xl border bg-slate-50 p-6 text-sm font-bold leading-7 whitespace-pre-wrap break-words">
          {notice.content}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          {isAdmin && (
            <>
              <button type="button" onClick={onDelete} className="px-5 py-3 border border-red-200 text-red-600 rounded-2xl font-black">
                삭제
              </button>
              <button type="button" onClick={onEdit} className="px-5 py-3 bg-emerald-700 text-white rounded-2xl font-black">
                수정
              </button>
            </>
          )}
          <button type="button" onClick={onClose} className="px-5 py-3 border-2 border-gray-200 rounded-2xl font-black">
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
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-2xl font-black">
          공지사항 {isEditing ? '수정' : '등록'}
        </h2>
        <CloseButton onClick={onClose} />
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-5">
        <div>
          <label htmlFor="noticeTitle" className="block text-sm font-black mb-2">제목</label>
          <input
            id="noticeTitle"
            name="title"
            value={form.title}
            onChange={onChange}
            maxLength={200}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-700"
          />
        </div>

        <div>
          <label htmlFor="noticeContent" className="block text-sm font-black mb-2">내용</label>
          <textarea
            id="noticeContent"
            name="content"
            value={form.content}
            onChange={onChange}
            rows={12}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl resize-y focus:outline-none focus:border-emerald-700"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-3 border-2 border-gray-200 rounded-2xl font-black">취소</button>
          <button type="submit" disabled={isSaving} className="px-6 py-3 bg-emerald-700 disabled:bg-gray-400 text-white rounded-2xl font-black">
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
      className="fixed inset-0 z-[100] bg-black/60 px-4 py-8 flex items-center justify-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl max-h-full overflow-y-auto bg-white rounded-3xl shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function CloseButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="w-10 h-10 shrink-0 rounded-full bg-gray-100 hover:bg-gray-200 font-black" aria-label="닫기">
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
