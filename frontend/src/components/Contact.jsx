import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from '../api/api';
import Header from './Header';

const EMPTY_CONTACT_FORM = {
  conNum: null,
  groupNum: '',
  conName: '',
  phone: '',
  region: '',
  crop: '',
};

const EMPTY_GROUP_FORM = {
  groupNum: null,
  groupName: '',
  conDescription: '',
};

export default function Contact() {
  const [contacts, setContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [groups, setGroups] = useState([]);

  const [contactForm, setContactForm] = useState(
    EMPTY_CONTACT_FORM
  );

  const [groupForm, setGroupForm] = useState(
    EMPTY_GROUP_FORM
  );

  const [searchKeyword, setSearchKeyword] =
    useState('');

  const [showContactForm, setShowContactForm] =
    useState(false);

  const [showGroupForm, setShowGroupForm] =
    useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [isSavingContact, setIsSavingContact] =
    useState(false);

  const [isSavingGroup, setIsSavingGroup] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  const [successMessage, setSuccessMessage] =
    useState('');

  /**
   * 전체 고객과 그룹을 불러옵니다.
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const [contactData, groupData] =
        await Promise.all([
          api.get('/contacts'),
          api.get('/contact-groups'),
        ]);

      const loadedContacts = Array.isArray(contactData)
        ? contactData
        : [];

      const loadedGroups = Array.isArray(groupData)
        ? groupData
        : [];

      setContacts(loadedContacts);
      setAllContacts(loadedContacts);
      setGroups(loadedGroups);
    } catch (error) {
      setErrorMessage(
        error.message ||
          '연락처 정보를 불러오지 못했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * 그룹 번호로 그룹명을 찾기 위한 Map입니다.
   */
  const groupNameMap = useMemo(() => {
    const result = new Map();

    groups.forEach((group) => {
      result.set(
        Number(group.groupNum),
        group.groupName
      );
    });

    return result;
  }, [groups]);

  /**
   * 고객 추가 화면을 엽니다.
   */
  const handleContactCreateOpen = () => {
    setContactForm(EMPTY_CONTACT_FORM);
    setShowContactForm(true);
    setShowGroupForm(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  /**
   * 고객 수정 화면을 엽니다.
   */
  const handleContactEditOpen = (contact) => {
    setContactForm({
      conNum: contact.conNum,
      groupNum: contact.groupNum ?? '',
      conName: contact.conName || '',
      phone: contact.phone || '',
      region: contact.region || '',
      crop: contact.crop || '',
    });

    setShowContactForm(true);
    setShowGroupForm(false);
    setErrorMessage('');
    setSuccessMessage('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleContactFormChange = (event) => {
    const { name, value } = event.target;

    setContactForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /**
   * 고객을 등록하거나 수정합니다.
   */
  const handleContactSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (!contactForm.conName.trim()) {
      setErrorMessage('고객 이름을 입력해주세요.');
      return;
    }

    if (!contactForm.phone.trim()) {
      setErrorMessage('전화번호를 입력해주세요.');
      return;
    }

    if (!contactForm.region.trim()) {
      setErrorMessage('지역을 입력해주세요.');
      return;
    }

    if (!contactForm.crop.trim()) {
      setErrorMessage('재배작물을 입력해주세요.');
      return;
    }

    const requestBody = {
      groupNum: contactForm.groupNum
        ? Number(contactForm.groupNum)
        : null,
      conName: contactForm.conName.trim(),
      phone: contactForm.phone.trim(),
      region: contactForm.region.trim(),
      crop: contactForm.crop.trim(),
    };

    setIsSavingContact(true);

    try {
      if (contactForm.conNum) {
        await api.patch(
          `/contacts/${contactForm.conNum}`,
          requestBody
        );

        setSuccessMessage(
          '고객 정보가 수정되었습니다.'
        );
      } else {
        await api.post('/contacts', requestBody);

        setSuccessMessage(
          '새 고객이 등록되었습니다.'
        );
      }

      setContactForm(EMPTY_CONTACT_FORM);
      setShowContactForm(false);

      await loadData();
    } catch (error) {
      setErrorMessage(
        error.message ||
          '고객 저장 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSavingContact(false);
    }
  };

  /**
   * 고객을 삭제합니다.
   */
  const handleContactDelete = async (contact) => {
    const confirmed = window.confirm(
      `${contact.conName} 고객을 삭제하시겠습니까?`
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    try {
      await api.delete(
        `/contacts/${contact.conNum}`
      );

      setSuccessMessage(
        '고객이 삭제되었습니다.'
      );

      await loadData();
    } catch (error) {
      setErrorMessage(
        error.message ||
          '고객 삭제 중 오류가 발생했습니다.'
      );
    }
  };

  /**
   * 그룹 추가 화면을 엽니다.
   */
  const handleGroupCreateOpen = () => {
    setGroupForm(EMPTY_GROUP_FORM);
    setShowGroupForm(true);
    setShowContactForm(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  /**
   * 그룹 수정 화면을 엽니다.
   */
  const handleGroupEditOpen = (group) => {
    setGroupForm({
      groupNum: group.groupNum,
      groupName: group.groupName || '',
      conDescription:
        group.conDescription || '',
    });

    setShowGroupForm(true);
    setShowContactForm(false);
    setErrorMessage('');
    setSuccessMessage('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleGroupFormChange = (event) => {
    const { name, value } = event.target;

    setGroupForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /**
   * 그룹을 등록하거나 수정합니다.
   */
  const handleGroupSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (!groupForm.groupName.trim()) {
      setErrorMessage('그룹 이름을 입력해주세요.');
      return;
    }

    const requestBody = {
      groupName: groupForm.groupName.trim(),
      conDescription:
        groupForm.conDescription.trim() || null,
    };

    setIsSavingGroup(true);

    try {
      if (groupForm.groupNum) {
        await api.patch(
          `/contact-groups/${groupForm.groupNum}`,
          requestBody
        );

        setSuccessMessage(
          '그룹 정보가 수정되었습니다.'
        );
      } else {
        await api.post(
          '/contact-groups',
          requestBody
        );

        setSuccessMessage(
          '새 고객 그룹이 등록되었습니다.'
        );
      }

      setGroupForm(EMPTY_GROUP_FORM);
      setShowGroupForm(false);

      await loadData();
    } catch (error) {
      setErrorMessage(
        error.message ||
          '그룹 저장 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSavingGroup(false);
    }
  };

  /**
   * 그룹을 삭제합니다.
   */
  const handleGroupDelete = async (group) => {
    const confirmed = window.confirm(
      `${group.groupName} 그룹을 삭제하시겠습니까?\n\n` +
        '그룹에 속한 고객은 삭제되지 않고 미분류 고객으로 변경됩니다.'
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    try {
      await api.delete(
        `/contact-groups/${group.groupNum}`
      );

      setSuccessMessage(
        '고객 그룹이 삭제되었습니다.'
      );

      await loadData();
    } catch (error) {
      setErrorMessage(
        error.message ||
          '그룹 삭제 중 오류가 발생했습니다.'
      );
    }
  };

  /**
   * 하나의 검색어로 고객의 재배 지역과 작물을 함께 검색합니다.
   */
  const handleSearch = (event) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    const normalizedKeyword =
      searchKeyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      setContacts(allContacts);
      return;
    }

    const searchedContacts = allContacts.filter(
      (contact) => {
        const region = String(
          contact.region || ''
        ).toLowerCase();

        const crop = String(
          contact.crop || ''
        ).toLowerCase();

        return (
          region.includes(normalizedKeyword) ||
          crop.includes(normalizedKeyword)
        );
      }
    );

    setContacts(searchedContacts);
  };

  /**
   * 검색 조건을 초기화합니다.
   */
  const handleSearchReset = () => {
    setSearchKeyword('');

    setErrorMessage('');
    setSuccessMessage('');
    setContacts(allContacts);
  };

  return (
    <div className="bg-slate-100 text-gray-900 min-h-screen flex flex-col justify-between font-sans antialiased">
      <Header />

      <main className="max-w-[1360px] mx-auto px-6 sm:px-10 py-10 w-full flex-1 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              연락처 관리
            </h1>

            <p className="text-gray-700 font-bold mt-2">
              MMS를 발송할 고객과 고객 그룹을
              관리할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleGroupCreateOpen}
              className="px-5 py-3 border-2 border-emerald-700 text-emerald-700 hover:bg-emerald-50 rounded-2xl font-black text-sm transition"
            >
              그룹 추가
            </button>

            <button
              type="button"
              onClick={handleContactCreateOpen}
              className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-sm transition shadow-sm"
            >
              고객 추가
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {successMessage}
          </div>
        )}

        {showContactForm && (
          <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-md space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black text-gray-900">
                {contactForm.conNum
                  ? '고객 정보 수정'
                  : '새 고객 등록'}
              </h2>

              <p className="text-sm text-gray-600 font-bold mt-1">
                여러 지역과 작물은 쉼표로 구분해서
                입력해주세요.
              </p>
            </div>

            <form
              onSubmit={handleContactSubmit}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput
                  label="고객 이름"
                  name="conName"
                  value={contactForm.conName}
                  onChange={handleContactFormChange}
                  placeholder="예: 김농부"
                  required
                />

                <FormInput
                  label="전화번호"
                  name="phone"
                  value={contactForm.phone}
                  onChange={handleContactFormChange}
                  placeholder="예: 010-1234-5678"
                  required
                />

                <FormInput
                  label="재배 지역"
                  name="region"
                  value={contactForm.region}
                  onChange={handleContactFormChange}
                  placeholder="예: 전남 나주시, 전남 담양군"
                  helperText="여러 지역은 쉼표로 구분해주세요."
                  required
                />

                <FormInput
                  label="재배작물"
                  name="crop"
                  value={contactForm.crop}
                  onChange={handleContactFormChange}
                  placeholder="예: 배, 벼"
                  helperText="여러 작물은 쉼표로 구분해주세요."
                  required
                />

                <div className="space-y-1.5 md:col-span-2">
                  <label
                    htmlFor="groupNum"
                    className="block text-xs font-black text-gray-700"
                  >
                    고객 그룹
                  </label>

                  <select
                    id="groupNum"
                    name="groupNum"
                    value={contactForm.groupNum}
                    onChange={handleContactFormChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl font-bold text-sm focus:outline-none focus:border-emerald-700 bg-white"
                  >
                    <option value="">
                      그룹 없음
                    </option>

                    {groups.map((group) => (
                      <option
                        key={group.groupNum}
                        value={group.groupNum}
                      >
                        {group.groupName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowContactForm(false);
                    setContactForm(
                      EMPTY_CONTACT_FORM
                    );
                  }}
                  disabled={isSavingContact}
                  className="px-6 py-3 border-2 border-gray-200 hover:bg-gray-50 rounded-2xl font-black text-sm transition"
                >
                  취소
                </button>

                <button
                  type="submit"
                  disabled={isSavingContact}
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-400 text-white rounded-2xl font-black text-sm transition"
                >
                  {isSavingContact
                    ? '저장 중...'
                    : contactForm.conNum
                      ? '수정 완료'
                      : '고객 등록'}
                </button>
              </div>
            </form>
          </section>
        )}

        {showGroupForm && (
          <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-md space-y-6">
            <h2 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-4">
              {groupForm.groupNum
                ? '그룹 정보 수정'
                : '새 그룹 등록'}
            </h2>

            <form
              onSubmit={handleGroupSubmit}
              className="space-y-5"
            >
              <FormInput
                label="그룹 이름"
                name="groupName"
                value={groupForm.groupName}
                onChange={handleGroupFormChange}
                placeholder="예: 과수 농가"
                required
              />

              <div className="space-y-1.5">
                <label
                  htmlFor="conDescription"
                  className="block text-xs font-black text-gray-700"
                >
                  그룹 설명
                </label>

                <textarea
                  id="conDescription"
                  name="conDescription"
                  value={groupForm.conDescription}
                  onChange={handleGroupFormChange}
                  rows="3"
                  placeholder="그룹에 대한 설명을 입력하세요."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl font-bold text-sm resize-none focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowGroupForm(false);
                    setGroupForm(EMPTY_GROUP_FORM);
                  }}
                  disabled={isSavingGroup}
                  className="px-6 py-3 border-2 border-gray-200 hover:bg-gray-50 rounded-2xl font-black text-sm"
                >
                  취소
                </button>

                <button
                  type="submit"
                  disabled={isSavingGroup}
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-400 text-white rounded-2xl font-black text-sm"
                >
                  {isSavingGroup
                    ? '저장 중...'
                    : groupForm.groupNum
                      ? '수정 완료'
                      : '그룹 등록'}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-md space-y-5">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              고객 그룹
            </h2>

            <p className="text-sm text-gray-600 font-bold mt-1">
              총 {groups.length}개의 그룹이 등록되어
              있습니다.
            </p>
          </div>

          {groups.length === 0 ? (
            <div className="py-8 text-center text-gray-500 font-bold">
              등록된 고객 그룹이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => {
                const groupContactCount =
                  allContacts.filter(
                    (contact) =>
                      Number(contact.groupNum) ===
                      Number(group.groupNum)
                  ).length;

                return (
                  <div
                    key={group.groupNum}
                    className="rounded-2xl border border-gray-200 bg-slate-50 p-5 space-y-4"
                  >
                    <div>
                      <div className="flex justify-between gap-3">
                        <h3 className="font-black text-gray-900">
                          {group.groupName}
                        </h3>

                        <span className="text-xs font-black text-emerald-700">
                          {groupContactCount}명
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 font-bold mt-2 min-h-8">
                        {group.conDescription ||
                          '설명이 없습니다.'}
                      </p>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleGroupEditOpen(group)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-xl text-xs font-black hover:bg-white"
                      >
                        수정
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleGroupDelete(group)
                        }
                        className="px-3 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-black hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <form
          onSubmit={handleSearch}
          className="bg-white rounded-3xl border border-gray-200 p-6 shadow-md"
        >
          <div className="mb-4">
            <h2 className="text-lg font-black text-gray-900">
              고객 검색
            </h2>

            <p className="text-xs text-gray-500 font-bold mt-1">
              재배 지역 또는 작물의 일부 단어만 입력해도
              해당 고객을 검색할 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
            <input
              type="text"
              value={searchKeyword}
              onChange={(event) =>
                setSearchKeyword(event.target.value)
              }
              placeholder="재배 지역 또는 작물 검색 (예: 나주, 배)"
              className="px-4 py-3 border-2 border-gray-200 rounded-2xl font-bold text-sm focus:outline-none focus:border-emerald-700"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-400 text-white rounded-2xl font-black text-sm"
            >
              검색
            </button>

            <button
              type="button"
              onClick={handleSearchReset}
              className="px-6 py-3 border-2 border-gray-200 hover:bg-gray-50 rounded-2xl font-black text-sm"
            >
              초기화
            </button>
          </div>
        </form>

        <section className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-black text-gray-900">
              고객 목록
            </h2>

            <p className="text-sm text-gray-600 font-bold mt-1">
              현재 {contacts.length}명의 고객이
              조회되었습니다.
            </p>
          </div>

          {isLoading ? (
            <div className="py-14 text-center text-gray-500 font-bold">
              고객 목록을 불러오는 중입니다.
            </div>
          ) : contacts.length === 0 ? (
            <div className="py-14 text-center text-gray-500 font-bold">
              검색 조건에 해당하는 고객이 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr className="text-sm text-gray-600 font-black">
                    <th className="px-6 py-4">
                      고객명
                    </th>

                    <th className="px-6 py-4">
                      전화번호
                    </th>

                    <th className="px-6 py-4">
                      재배 지역
                    </th>

                    <th className="px-6 py-4">
                      재배작물
                    </th>

                    <th className="px-6 py-4">
                      그룹
                    </th>

                    <th className="px-6 py-4 text-center">
                      관리
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {contacts.map((contact) => (
                    <tr
                      key={contact.conNum}
                      className="hover:bg-slate-50 transition"
                    >
                      <td className="px-6 py-5 font-black text-gray-900 whitespace-nowrap">
                        {contact.conName}
                      </td>

                      <td className="px-6 py-5 font-bold text-gray-700 whitespace-nowrap">
                        {formatPhone(contact.phone)}
                      </td>

                      <td className="px-6 py-5 font-bold text-gray-700 min-w-48">
                        {contact.region || '미등록'}
                      </td>

                      <td className="px-6 py-5 min-w-40">
                        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-black">
                          {contact.crop || '미등록'}
                        </span>
                      </td>

                      <td className="px-6 py-5 font-bold text-gray-700 whitespace-nowrap">
                        {contact.groupNum
                          ? groupNameMap.get(
                              Number(
                                contact.groupNum
                              )
                            ) || '알 수 없는 그룹'
                          : '미분류'}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleContactEditOpen(
                                contact
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-xl text-xs font-black hover:bg-white"
                          >
                            수정
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleContactDelete(
                                contact
                              )
                            }
                            className="px-3 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-black hover:bg-red-50"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer className="w-full bg-white border-t border-gray-200 py-6 text-center text-gray-600 text-xs mt-12">
        <p className="font-bold">
          © 2026 FarMMS. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  helperText,
  required = false,
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-xs font-black text-gray-700"
      >
        {label}
      </label>

      <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl font-bold text-sm focus:outline-none focus:border-emerald-700"
      />

      {helperText && (
        <p className="text-xs text-gray-500 font-bold px-1">
          {helperText}
        </p>
      )}
    </div>
  );
}

function formatPhone(phone) {
  if (!phone) {
    return '-';
  }

  const numbers = phone.replace(/[^0-9]/g, '');

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