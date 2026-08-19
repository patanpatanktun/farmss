import { useEffect, useState } from 'react';
import { api } from '../api/api';
import Header from './Header';
import DeleteAccountButton from './DeleteAccountButton';

const emptyUser = {
  userNum: null,
  userId: '',
  email: '',
  name: '',
  gender: '',
  age: '',
  phone: '',
  joinDate: '',
};

const emptyPasswordForm = {
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
};

export default function Setting() {
  const [user, setUser] = useState(emptyUser);
  const [editForm, setEditForm] = useState(emptyUser);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [showPasswordVerify, setShowPasswordVerify] =
    useState(false);
  const [verifyPassword, setVerifyPassword] =
    useState('');
  const [verifiedPassword, setVerifiedPassword] =
    useState('');
  const [isVerifying, setIsVerifying] =
    useState(false);

  const [showPasswordChange, setShowPasswordChange] =
    useState(false);
  const [passwordForm, setPasswordForm] =
    useState(emptyPasswordForm);
  const [isChangingPassword, setIsChangingPassword] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] =
    useState('');
  const [passwordError, setPasswordError] =
    useState('');

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        setErrorMessage('');

        const data = await api.get('/users/me');

        if (data) {
          setUser(data);
          setEditForm(data);

          if (data.userId) {
            localStorage.setItem('userId', data.userId);
          }

          if (
            data.userNum !== undefined &&
            data.userNum !== null
          ) {
            localStorage.setItem(
              'userNum',
              String(data.userNum)
            );
          }
        }
      } catch (error) {
        setErrorMessage(
          error.message ||
            '회원정보를 불러오지 못했습니다.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const handleEditStart = () => {
    setVerifyPassword('');
    setVerifiedPassword('');
    setErrorMessage('');
    setSuccessMessage('');
    setPasswordError('');
    setShowPasswordVerify(true);
    setIsEditing(false);
  };

  const handleVerifyPassword = async (event) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (!verifyPassword) {
      setErrorMessage(
        '현재 비밀번호를 입력해주세요.'
      );
      return;
    }

    setIsVerifying(true);

    try {
      await api.post('/users/me/password/verify', {
        currentPassword: verifyPassword,
      });

      setVerifiedPassword(verifyPassword);
      setEditForm(user);
      setShowPasswordVerify(false);
      setIsEditing(true);

      setSuccessMessage(
        '본인 확인이 완료되었습니다. 회원정보를 수정해주세요.'
      );
    } catch (error) {
      setErrorMessage(
        error.message ||
          '현재 비밀번호 확인에 실패했습니다.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCancel = () => {
    setVerifyPassword('');
    setVerifiedPassword('');
    setShowPasswordVerify(false);
    setErrorMessage('');
  };

  const handleEditCancel = () => {
    setEditForm(user);
    setVerifyPassword('');
    setVerifiedPassword('');
    setPasswordForm(emptyPasswordForm);
    setIsEditing(false);
    setShowPasswordChange(false);
    setErrorMessage('');
    setSuccessMessage('');
    setPasswordError('');
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (!verifiedPassword) {
      setErrorMessage(
        '본인 확인 정보가 없습니다. 다시 확인해주세요.'
      );
      return;
    }

    if (!editForm.email.trim()) {
      setErrorMessage('이메일을 입력해주세요.');
      return;
    }

    if (!editForm.name.trim()) {
      setErrorMessage('이름을 입력해주세요.');
      return;
    }

    if (!editForm.gender) {
      setErrorMessage('성별을 선택해주세요.');
      return;
    }

    const ageNumber = Number(editForm.age);

    if (
      !Number.isInteger(ageNumber) ||
      ageNumber < 1 ||
      ageNumber > 120
    ) {
      setErrorMessage(
        '나이는 1세 이상 120세 이하의 정수로 입력해주세요.'
      );
      return;
    }

    if (!editForm.phone.trim()) {
      setErrorMessage(
        '휴대폰 번호를 입력해주세요.'
      );
      return;
    }

    setIsSaving(true);

    try {
      const data = await api.patch('/users/me', {
        currentPassword: verifiedPassword,
        email: editForm.email.trim(),
        name: editForm.name.trim(),
        gender: editForm.gender,
        age: ageNumber,
        phone: editForm.phone.trim(),
      });

      if (data) {
        setUser(data);
        setEditForm(data);
      }

      setVerifyPassword('');
      setVerifiedPassword('');
      setIsEditing(false);
      setShowPasswordChange(false);

      setSuccessMessage(
        '회원정보가 수정되었습니다.'
      );
    } catch (error) {
      setErrorMessage(
        error.message ||
          '회원정보 수정 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordInputChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePasswordChangeOpen = () => {
    setPasswordForm(emptyPasswordForm);
    setPasswordError('');
    setShowPasswordChange(true);
  };

  const handlePasswordChangeCancel = () => {
    setPasswordForm(emptyPasswordForm);
    setPasswordError('');
    setShowPasswordChange(false);
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    setPasswordError('');
    setSuccessMessage('');

    if (!passwordForm.currentPassword) {
      setPasswordError(
        '현재 비밀번호를 입력해주세요.'
      );
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError(
        '새 비밀번호는 8자리 이상 입력해주세요.'
      );
      return;
    }

    if (
      passwordForm.currentPassword ===
      passwordForm.newPassword
    ) {
      setPasswordError(
        '새 비밀번호는 현재 비밀번호와 달라야 합니다.'
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.newPasswordConfirm
    ) {
      setPasswordError(
        '새 비밀번호 확인이 일치하지 않습니다.'
      );
      return;
    }

    const confirmed = window.confirm(
      '비밀번호를 변경하시겠습니까?'
    );

    if (!confirmed) {
      return;
    }

    setIsChangingPassword(true);

    try {
      await api.patch('/users/me/password', {
        currentPassword:
          passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm(emptyPasswordForm);
      setVerifyPassword('');
      setVerifiedPassword('');
      setShowPasswordChange(false);
      setIsEditing(false);
      setPasswordError('');

      setSuccessMessage(
        '비밀번호가 변경되었습니다. 다음 로그인부터 새 비밀번호를 사용해주세요.'
      );
    } catch (error) {
      setPasswordError(
        error.message ||
          '비밀번호 변경 중 오류가 발생했습니다.'
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatGender = (gender) => {
    if (gender === 'M') {
      return '남성';
    }

    if (gender === 'F') {
      return '여성';
    }

    return gender || '-';
  };

  const formatJoinDate = (joinDate) => {
    if (!joinDate) {
      return '-';
    }

    const date = new Date(joinDate);

    if (Number.isNaN(date.getTime())) {
      return joinDate;
    }

    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
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
          max-w-[960px]
          mx-auto
          px-6
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

            MY PAGE
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
            마이 페이지
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
            계정 정보 관리 및 서비스 환경을 설정할 수 있습니다.
          </p>
        </div>

        {/* 가입 정보 */}
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
          <div className="flex justify-between items-center border-b border-[#17372a]/20 pb-4">
            <h2
              className="
                text-[24px]
                font-bold
                text-[#17372a]
                tracking-[-0.02em]
              "
            >
              가입 정보
            </h2>

            {!isEditing && !showPasswordVerify && (
              <button
                type="button"
                onClick={handleEditStart}
                disabled={
                  isLoading || Boolean(errorMessage)
                }
                className="
                  px-4
                  py-2.5
                  border
                  border-[#17372a]/30
                  text-[#17372a]
                  hover:bg-[#17372a]/[0.06]
                  disabled:border-[#17372a]/10
                  disabled:text-[#17372a]/40
                  rounded-none
                  text-[13px]
                  font-semibold
                  transition
                "
              >
                회원수정
              </button>
            )}
          </div>

          {isLoading && (
            <div className="py-10 text-center text-[#748078] text-[15px] font-normal">
              회원정보를 불러오는 중입니다...
            </div>
          )}

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

          {!isLoading &&
            !isEditing &&
            !showPasswordVerify && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem
                  label="아이디"
                  value={user.userId}
                />

                <InfoItem
                  label="이메일"
                  value={user.email}
                />

                <InfoItem
                  label="이름"
                  value={user.name}
                />

                <InfoItem
                  label="성별"
                  value={formatGender(user.gender)}
                />

                <InfoItem
                  label="나이"
                  value={
                    user.age !== null
                      ? `${user.age}세`
                      : '-'
                  }
                />

                <InfoItem
                  label="휴대폰 번호"
                  value={user.phone}
                />

                <InfoItem
                  label="가입일"
                  value={formatJoinDate(user.joinDate)}
                  wide
                />
              </div>
            )}

          {/* 본인 확인 */}
          {showPasswordVerify && (
            <form
              onSubmit={handleVerifyPassword}
              className="max-w-md mx-auto space-y-5 py-5"
            >
              <div className="text-center space-y-2">
                <h3 className="text-[20px] font-bold text-[#17372a]">
                  본인 확인
                </h3>

                <p className="text-[14px] text-[#59675f] font-normal">
                  회원정보 수정을 위해 현재 비밀번호를 입력해주세요.
                </p>
              </div>

              <PasswordInput
                label="현재 비밀번호"
                name="verifyPassword"
                value={verifyPassword}
                onChange={(event) =>
                  setVerifyPassword(event.target.value)
                }
                autoComplete="current-password"
                placeholder="현재 비밀번호를 입력하세요"
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleVerifyCancel}
                  disabled={isVerifying}
                  className="
                    flex-1
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
                  disabled={isVerifying}
                  className="
                    flex-1
                    h-[50px]
                    bg-[#17372a]
                    hover:bg-[#214b39]
                    disabled:bg-[#9ca7a0]
                    disabled:cursor-not-allowed
                    text-white
                    font-bold
                    text-[15px]
                    rounded-none
                    transition
                    shadow-[0_10px_25px_rgba(23,55,42,0.15)]
                  "
                >
                  {isVerifying
                    ? '확인 중...'
                    : '본인 확인'}
                </button>
              </div>
            </form>
          )}

          {/* 회원정보 수정 */}
          {isEditing && (
            <div className="space-y-8">
              <form
                onSubmit={handleUpdate}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="아이디"
                    value={editForm.userId}
                    disabled
                  />

                  <FormInput
                    label="이메일"
                    name="email"
                    type="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    required
                  />

                  <FormInput
                    label="이름"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    required
                  />

                  <div className="space-y-2">
                    <label
                      htmlFor="gender"
                      className="
                        block
                        text-[13px]
                        font-semibold
                        text-[#536159]
                      "
                    >
                      성별
                    </label>

                    <select
                      id="gender"
                      name="gender"
                      value={editForm.gender}
                      onChange={handleInputChange}
                      required
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
                      <option value="">선택</option>
                      <option value="M">남성</option>
                      <option value="F">여성</option>
                    </select>
                  </div>

                  <FormInput
                    label="나이"
                    name="age"
                    type="number"
                    min="1"
                    max="120"
                    value={editForm.age}
                    onChange={handleInputChange}
                    required
                  />

                  <FormInput
                    label="휴대폰 번호"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleInputChange}
                    required
                  />

                  <FormInput
                    label="가입일"
                    value={formatJoinDate(
                      editForm.joinDate
                    )}
                    disabled
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-[#17372a]/20">
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    disabled={isSaving}
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
                    disabled={isSaving}
                    className="
                      px-6
                      h-[50px]
                      bg-[#17372a]
                      hover:bg-[#214b39]
                      disabled:bg-[#9ca7a0]
                      disabled:cursor-not-allowed
                      text-white
                      font-bold
                      text-[15px]
                      rounded-none
                      transition
                      shadow-[0_10px_25px_rgba(23,55,42,0.15)]
                    "
                  >
                    {isSaving
                      ? '저장 중...'
                      : '회원정보 저장'}
                  </button>
                </div>
              </form>

              {/* 비밀번호 변경 */}
              <div className="pt-6 border-t border-[#17372a]/20">
                {!showPasswordChange && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <p className="font-bold text-[16px] text-[#17372a]">
                        비밀번호 변경
                      </p>

                      <p className="text-[13px] font-normal text-[#59675f] mt-0.5">
                        현재 비밀번호를 확인하고 새로운 비밀번호로 변경합니다.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handlePasswordChangeOpen}
                      className="
                        w-full
                        sm:w-auto
                        px-5
                        py-3
                        border
                        border-[#17372a]/30
                        text-[#17372a]
                        hover:bg-[#17372a]/[0.06]
                        rounded-none
                        text-[14px]
                        font-semibold
                        transition
                      "
                    >
                      비밀번호 변경
                    </button>
                  </div>
                )}

                {showPasswordChange && (
                  <form
                    onSubmit={handlePasswordChange}
                    className="space-y-5 bg-[#f0e8dc] border border-[#17372a]/20 p-6 rounded-none"
                  >
                    <h3 className="text-[18px] font-bold text-[#17372a]">
                      비밀번호 변경
                    </h3>

                    {passwordError && (
                      <div
                        className="
                          bg-[#f8e7e3]
                          border-l-[3px]
                          border-[#b45a47]
                          px-4
                          py-3
                          text-[13px]
                          font-medium
                          text-[#873c2e]
                          rounded-none
                        "
                      >
                        {passwordError}
                      </div>
                    )}

                    <PasswordInput
                      label="현재 비밀번호"
                      name="currentPassword"
                      value={
                        passwordForm.currentPassword
                      }
                      onChange={
                        handlePasswordInputChange
                      }
                      autoComplete="current-password"
                      placeholder="현재 비밀번호"
                    />

                    <PasswordInput
                      label="바꿀 비밀번호"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={
                        handlePasswordInputChange
                      }
                      autoComplete="new-password"
                      placeholder="8자리 이상 입력"
                    />

                    <PasswordInput
                      label="바꿀 비밀번호 확인"
                      name="newPasswordConfirm"
                      value={
                        passwordForm.newPasswordConfirm
                      }
                      onChange={
                        handlePasswordInputChange
                      }
                      autoComplete="new-password"
                      placeholder="새 비밀번호 다시 입력"
                    />

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={
                          handlePasswordChangeCancel
                        }
                        disabled={isChangingPassword}
                        className="
                          px-6
                          h-[46px]
                          border
                          border-[#17372a]/25
                          hover:bg-[#17372a]/[0.05]
                          rounded-none
                          font-semibold
                          text-[14px]
                          text-[#536159]
                          transition
                        "
                      >
                        취소
                      </button>

                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="
                          px-6
                          h-[46px]
                          bg-[#17372a]
                          hover:bg-[#214b39]
                          disabled:bg-[#9ca7a0]
                          disabled:cursor-not-allowed
                          text-white
                          font-bold
                          text-[14px]
                          rounded-none
                          transition
                        "
                      >
                        {isChangingPassword
                          ? '변경 중...'
                          : '비밀번호 변경 완료'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </section>

        {/* 계정 관리 */}
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
          <h2
            className="
              text-[24px]
              font-bold
              text-[#17372a]
              tracking-[-0.02em]
              border-b
              border-[#17372a]/20
              pb-4
            "
          >
            계정 관리
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-[16px] text-[#17372a]">
                로그아웃
              </p>

              <p className="text-[13px] font-normal text-[#59675f] mt-0.5">
                현재 접속 중인 계정에서 안전하게 로그아웃합니다.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const confirmed = window.confirm(
                  '로그아웃하시겠습니까?'
                );

                if (!confirmed) {
                  return;
                }

                localStorage.removeItem(
                  'accessToken'
                );
                localStorage.removeItem('userNum');
                localStorage.removeItem('userId');

                window.location.replace('/login');
              }}
              className="
                w-full
                sm:w-auto
                px-6
                py-3
                border
                border-[#17372a]/30
                text-[#17372a]
                hover:bg-[#17372a]/[0.06]
                rounded-none
                text-[14px]
                font-semibold
                transition
              "
            >
              로그아웃하기
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#17372a]/20">
            <div>
              <p className="font-bold text-[16px] text-[#b45a47]">
                회원 탈퇴
              </p>

              <p className="text-[13px] font-normal text-[#59675f] mt-0.5">
                탈퇴 시 모든 주소록, 상품, 이미지 및 발송 내역이 영구적으로 삭제됩니다.
              </p>
            </div>

            <DeleteAccountButton />
          </div>
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

function InfoItem({
  label,
  value,
  wide = false,
}) {
  return (
    <div
      className={`space-y-1 ${
        wide ? 'md:col-span-2' : ''
      }`}
    >
      <span className="text-[#748078] font-semibold text-[12px] tracking-[0.05em] block">
        {label}
      </span>

      <p className="text-[#17372a] font-bold text-[16px]">
        {value || '-'}
      </p>
    </div>
  );
}

function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  disabled = false,
  required = false,
  min,
  max,
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
        id={name}
        name={name}
        type={type}
        value={value ?? ''}
        onChange={onChange}
        disabled={disabled}
        required={required}
        min={min}
        max={max}
        className="
          w-full
          px-4
          py-3.5
          text-[15px]
          font-normal
          text-[#17372a]
          border
          border-[#17372a]/25
          rounded-none
          focus:outline-none
          focus:border-[#17372a]
          bg-[#f7f3eb]
          disabled:bg-[#f0e8dc]
          disabled:text-[#748078]
        "
      />
    </div>
  );
}

function PasswordInput({
  label,
  name,
  value,
  onChange,
  autoComplete,
  placeholder,
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
        id={name}
        name={name}
        type="password"
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        className="
          w-full
          px-4
          py-3.5
          text-[15px]
          font-normal
          text-[#17372a]
          border
          border-[#17372a]/25
          rounded-none
          focus:outline-none
          focus:border-[#17372a]
          bg-[#f7f3eb]
          placeholder:text-[#8a968e]
        "
      />
    </div>
  );
}