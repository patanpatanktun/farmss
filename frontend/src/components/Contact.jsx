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
        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-end
            lg:justify-between
            gap-5
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

              CONTACT MANAGEMENT
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
              연락처 관리
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
              MMS를 발송할 고객과 고객 그룹을 관리할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleGroupCreateOpen}
              className="
                h-[50px]
                px-6
                border
                border-[#17372a]/30
                text-[#17372a]
                hover:bg-[#17372a]/[0.06]
                rounded-none
                font-semibold
                text-[15px]
                transition
              "
            >
              그룹 추가
            </button>

            <button
              type="button"
              onClick={handleContactCreateOpen}
              className="
                h-[50px]
                px-6
                bg-[#17372a]
                hover:bg-[#214b39]
                text-white
                rounded-none
                font-semibold
                text-[15px]
                transition
                shadow-[0_10px_25px_rgba(23,55,42,0.15)]
              "
            >
              고객 추가
            </button>
          </div>
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

        {successMessage && (
          <div
            className="
              bg-[#e8f3ee]
              border-l-[3px]
              border-[#17372a]
              px-5
              py-4
              text-[14px]
              font-medium
              text-[#17372a]
              rounded-none
            "
          >
            {successMessage}
          </div>
        )}

        {showContactForm && (
          <section
            className="
              bg-[#f8f0e2]
              border
              border-[#17372a]/25
              rounded-none
              p-8
              lg:p-10
              shadow-[0_18px_50px_rgba(40,48,42,0.08)]
              space-y-8
            "
          >
            <div
              className="
                border-b
                border-[#17372a]/20
                pb-5
              "
            >
              <h2
                className="
                  text-[24px]
                  font-bold
                  text-[#17372a]
                  tracking-[-0.02em]
                "
              >
                {contactForm.conNum
                  ? '고객 정보 수정'
                  : '새 고객 등록'}
              </h2>

              <p
                className="
                  text-[14px]
                  text-[#68766e]
                  font-normal
                  mt-1.5
                "
              >
                여러 지역과 작물은 쉼표로 구분해서 입력해주세요.
              </p>
            </div>

            <form
              onSubmit={handleContactSubmit}
              className="space-y-7"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="고객 이름"
                  name="conName"
                  value={contactForm.conName}
                  onChange={handleContactFormChange}
                  placeholder="예: 김농부"
                  required
                />

                <FormInput
                  label="휴대폰번호"
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

                <div className="space-y-2 md:col-span-2">
                  <label
                    htmlFor="groupNum"
                    className="
                      block
                      text-[13px]
                      font-semibold
                      text-[#536159]
                    "
                  >
                    고객 그룹
                  </label>

                  <select
                    id="groupNum"
                    name="groupNum"
                    value={contactForm.groupNum}
                    onChange={handleContactFormChange}
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
                      focus:outline-none
                      focus:border-[#17372a]
                      bg-[#f7f3eb]
                    "
                  >
                    <option value="">그룹 없음</option>

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

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowContactForm(false);
                    setContactForm(
                      EMPTY_CONTACT_FORM
                    );
                  }}
                  disabled={isSavingContact}
                  className="
                    px-6
                    h-[50px]
                    border
                    border-[#17372a]/25
                    hover:bg-[#17372a]/[0.05]
                    rounded-none
                    font-semibold
                    text-[15px]
                    text-[#536159]
                    transition
                  "
                >
                  취소
                </button>

                <button
                  type="submit"
                  disabled={isSavingContact}
                  className="
                    px-7
                    h-[50px]
                    bg-[#17372a]
                    hover:bg-[#214b39]
                    disabled:bg-[#9ca7a0]
                    text-white
                    rounded-none
                    font-semibold
                    text-[15px]
                    transition
                  "
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
          <section
            className="
              bg-[#f8f0e2]
              border
              border-[#17372a]/25
              rounded-none
              p-8
              lg:p-10
              shadow-[0_18px_50px_rgba(40,48,42,0.08)]
              space-y-8
            "
          >
            <div
              className="
                border-b
                border-[#17372a]/20
                pb-5
              "
            >
              <h2
                className="
                  text-[24px]
                  font-bold
                  text-[#17372a]
                  tracking-[-0.02em]
                "
              >
                {groupForm.groupNum
                  ? '그룹 정보 수정'
                  : '새 그룹 등록'}
              </h2>
            </div>

            <form
              onSubmit={handleGroupSubmit}
              className="space-y-6"
            >
              <FormInput
                label="그룹 이름"
                name="groupName"
                value={groupForm.groupName}
                onChange={handleGroupFormChange}
                placeholder="예: 과수 농가"
                required
              />

              <div className="space-y-2">
                <label
                  htmlFor="conDescription"
                  className="
                    block
                    text-[13px]
                    font-semibold
                    text-[#536159]
                  "
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
                    resize-none
                    focus:outline-none
                    focus:border-[#17372a]
                    bg-[#f7f3eb]
                  "
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowGroupForm(false);
                    setGroupForm(EMPTY_GROUP_FORM);
                  }}
                  disabled={isSavingGroup}
                  className="
                    px-6
                    h-[50px]
                    border
                    border-[#17372a]/25
                    hover:bg-[#17372a]/[0.05]
                    rounded-none
                    font-semibold
                    text-[15px]
                    text-[#536159]
                    transition
                  "
                >
                  취소
                </button>

                <button
                  type="submit"
                  disabled={isSavingGroup}
                  className="
                    px-7
                    h-[50px]
                    bg-[#17372a]
                    hover:bg-[#214b39]
                    disabled:bg-[#9ca7a0]
                    text-white
                    rounded-none
                    font-semibold
                    text-[15px]
                    transition
                  "
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

        <section
          className="
            bg-[#f8f0e2]
            border
            border-[#17372a]/25
            rounded-none
            p-8
            lg:p-10
            shadow-[0_18px_50px_rgba(40,48,42,0.08)]
            space-y-6
          "
        >
          <div>
            <h2
              className="
                text-[24px]
                font-bold
                text-[#17372a]
                tracking-[-0.02em]
              "
            >
              고객 그룹
            </h2>

            <p
              className="
                text-[15px]
                text-[#59675f]
                font-normal
                mt-1.5
              "
            >
              총 {groups.length}개의 그룹이 등록되어 있습니다.
            </p>
          </div>

          {groups.length === 0 ? (
            <div
              className="
                py-10
                text-center
                text-[#748078]
                text-[16px]
                font-normal
              "
            >
              등록된 고객 그룹이 없습니다.
            </div>
          ) : (
            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                lg:grid-cols-3
                gap-5
              "
            >
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
                    className="
                      rounded-none
                      border
                      border-[#17372a]/25
                      bg-[#f0e8dc]
                      p-6
                      space-y-4
                      flex
                      flex-col
                      justify-between
                    "
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-3">
                        <h3
                          className="
                            text-[18px]
                            font-bold
                            text-[#17372a]
                          "
                        >
                          {group.groupName}
                        </h3>

                        <span
                          className="
                            text-[13px]
                            font-semibold
                            text-[#17372a]
                            bg-[#17372a]/10
                            px-3
                            py-1
                            rounded-none
                          "
                        >
                          {groupContactCount}명
                        </span>
                      </div>

                      <p
                        className="
                          text-[14px]
                          text-[#59675f]
                          font-normal
                          leading-relaxed
                          min-h-[42px]
                        "
                      >
                        {group.conDescription ||
                          '설명이 없습니다.'}
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-[#17372a]/20">
                      <button
                        type="button"
                        onClick={() =>
                          handleGroupEditOpen(group)
                        }
                        className="
                          px-3.5
                          py-2
                          border
                          border-[#17372a]/25
                          rounded-none
                          text-[13px]
                          font-medium
                          text-[#17372a]
                          hover:bg-[#17372a]/[0.05]
                          transition
                        "
                      >
                        수정
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleGroupDelete(group)
                        }
                        className="
                          px-3.5
                          py-2
                          border
                          border-[#b45a47]/30
                          text-[#b45a47]
                          rounded-none
                          text-[13px]
                          font-medium
                          hover:bg-[#b45a47]/10
                          transition
                        "
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
          className="
            bg-[#f8f0e2]
            border
            border-[#17372a]/25
            rounded-none
            p-8
            lg:p-10
            shadow-[0_18px_50px_rgba(40,48,42,0.08)]
            space-y-6
          "
        >
          <div>
            <h2
              className="
                text-[24px]
                font-bold
                text-[#17372a]
                tracking-[-0.02em]
              "
            >
              고객 검색
            </h2>

            <p
              className="
                text-[15px]
                text-[#59675f]
                font-normal
                mt-1.5
              "
            >
              재배 지역 또는 작물의 일부 단어만 입력해도 해당 고객을 검색할 수 있습니다.
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
              className="
                w-full
                px-5
                py-3.5
                border
                border-[#17372a]/25
                rounded-none
                font-normal
                text-[15px]
                text-[#17372a]
                focus:outline-none
                focus:border-[#17372a]
                bg-[#f7f3eb]
                placeholder:text-[#8a968e]
              "
            />

            <button
              type="submit"
              disabled={isLoading}
              className="
                px-7
                h-[50px]
                bg-[#17372a]
                hover:bg-[#214b39]
                disabled:bg-[#9ca7a0]
                text-white
                rounded-none
                font-semibold
                text-[15px]
                transition
              "
            >
              검색
            </button>

            <button
              type="button"
              onClick={handleSearchReset}
              className="
                px-6
                h-[50px]
                border
                border-[#17372a]/25
                hover:bg-[#17372a]/[0.05]
                rounded-none
                font-semibold
                text-[15px]
                text-[#536159]
                transition
              "
            >
              초기화
            </button>
          </div>
        </form>

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
          <div
            className="
              p-8
              lg:p-10
              border-b
              border-[#17372a]/20
            "
          >
            <h2
              className="
                text-[24px]
                font-bold
                text-[#17372a]
                tracking-[-0.02em]
              "
            >
              고객 목록
            </h2>

            <p
              className="
                text-[15px]
                text-[#59675f]
                font-normal
                mt-1.5
              "
            >
              현재 {contacts.length}명의 고객이 조회되었습니다.
            </p>
          </div>

          {isLoading ? (
            <div
              className="
                py-16
                text-center
                text-[#748078]
                text-[16px]
                font-normal
              "
            >
              고객 목록을 불러오는 중입니다.
            </div>
          ) : contacts.length === 0 ? (
            <div
              className="
                py-16
                text-center
                text-[#748078]
                text-[16px]
                font-normal
              "
            >
              검색 조건에 해당하는 고객이 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead
                  className="
                    bg-[#f0e8dc]
                    border-b
                    border-[#17372a]/25
                  "
                >
                  <tr
                    className="
                      text-[14px]
                      text-[#59675f]
                      font-semibold
                    "
                  >
                    <th className="px-6 py-4.5">고객명</th>
                    <th className="px-6 py-4.5">전화번호</th>
                    <th className="px-6 py-4.5">재배 지역</th>
                    <th className="px-6 py-4.5">재배작물</th>
                    <th className="px-6 py-4.5">그룹</th>
                    <th className="px-6 py-4.5 text-center">관리</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#17372a]/20">
                  {contacts.map((contact) => (
                    <tr
                      key={contact.conNum}
                      className="hover:bg-[#f2ebd9] transition"
                    >
                      <td
                        className="
                          px-6
                          py-5
                          font-semibold
                          text-[#17372a]
                          whitespace-nowrap
                        "
                      >
                        {contact.conName}
                      </td>

                      <td
                        className="
                          px-6
                          py-5
                          text-[#59675f]
                          font-normal
                          whitespace-nowrap
                        "
                      >
                        {formatMaskedPhone(contact.phone)}
                      </td>

                      <td
                        className="
                          px-6
                          py-5
                          text-[#59675f]
                          font-normal
                          min-w-[190px]
                        "
                      >
                        {contact.region || '미등록'}
                      </td>

                      <td className="px-6 py-5 min-w-[160px]">
                        <span
                          className="
                            inline-block
                            px-3
                            py-1
                            bg-[#17372a]/10
                            text-[#17372a]
                            rounded-none
                            text-[13px]
                            font-medium
                          "
                        >
                          {contact.crop || '미등록'}
                        </span>
                      </td>

                      <td
                        className="
                          px-6
                          py-5
                          text-[#59675f]
                          font-normal
                          whitespace-nowrap
                        "
                      >
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
                            className="
                              px-3.5
                              py-2
                              border
                              border-[#17372a]/25
                              rounded-none
                              text-[13px]
                              font-medium
                              text-[#17372a]
                              hover:bg-[#17372a]/[0.05]
                              transition
                            "
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
                            className="
                              px-3.5
                              py-2
                              border
                              border-[#b45a47]/30
                              text-[#b45a47]
                              rounded-none
                              text-[13px]
                              font-medium
                              hover:bg-[#b45a47]/10
                              transition
                            "
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
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="
          block
          text-[13px]
          font-semibold
          text-[#536159]
        "
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
          focus:outline-none
          focus:border-[#17372a]
          bg-[#f7f3eb]
          placeholder:text-[#8a968e]
        "
      />

      {helperText && (
        <p className="text-[12px] text-[#748078] font-normal px-1">
          {helperText}
        </p>
      )}
    </div>
  );
}

function formatMaskedPhone(phone) {
  if (!phone) {
    return '-';
  }

  const numbers = phone.replace(/[^0-9]/g, '');

  if (numbers.length === 11) {
    return numbers.replace(
      /(\d{3})(\d{4})(\d{4})/,
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