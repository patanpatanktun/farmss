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
    <div className="bg-slate-100 text-gray-900 min-h-screen flex flex-col justify-between font-sans antialiased">
      <Header />

      <main className="max-w-[900px] mx-auto px-6 py-10 w-full flex-1 space-y-8">
        <div className="px-2">
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            환경 설정
          </h1>

          <p className="text-gray-700 font-bold">
            계정 정보 관리 및 서비스 환경을 설정할 수
            있습니다.
          </p>
        </div>

        {/* 가입 정보 */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-md space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h2 className="text-xl font-black text-gray-900">
              가입 정보
            </h2>

            {!isEditing && !showPasswordVerify && (
              <button
                type="button"
                onClick={handleEditStart}
                disabled={
                  isLoading || Boolean(errorMessage)
                }
                className="px-5 py-2.5 bg-white border-2 border-gray-200 hover:bg-gray-50 disabled:bg-gray-100 text-gray-800 font-black text-xs rounded-2xl transition"
              >
                회원수정
              </button>
            )}
          </div>

          {isLoading && (
            <div className="py-10 text-center text-gray-500 font-bold">
              회원정보를 불러오는 중입니다...
            </div>
          )}

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
              <div className="text-center">
                <h3 className="text-lg font-black text-gray-900">
                  본인 확인
                </h3>

                <p className="text-sm text-gray-600 font-bold mt-1">
                  회원정보 수정을 위해 현재 비밀번호를
                  입력해주세요.
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

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleVerifyCancel}
                  disabled={isVerifying}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-2xl font-black text-sm"
                >
                  취소
                </button>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-400 text-white rounded-2xl font-black text-sm"
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

                  <div className="space-y-1.5">
                    <label
                      htmlFor="gender"
                      className="block text-xs font-black text-gray-600"
                    >
                      성별
                    </label>

                    <select
                      id="gender"
                      name="gender"
                      value={editForm.gender}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl font-bold text-sm focus:outline-none focus:border-emerald-700"
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

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    disabled={isSaving}
                    className="px-6 py-3 border-2 border-gray-200 rounded-2xl font-black text-sm"
                  >
                    취소
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-400 text-white rounded-2xl font-black text-sm"
                  >
                    {isSaving
                      ? '저장 중...'
                      : '회원정보 저장'}
                  </button>
                </div>
              </form>

              {/* 비밀번호 변경 */}
              <div className="pt-6 border-t border-gray-200">
                {!showPasswordChange && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <p className="font-black text-gray-900">
                        비밀번호 변경
                      </p>

                      <p className="text-xs font-bold text-gray-600">
                        현재 비밀번호를 확인하고 새로운
                        비밀번호로 변경합니다.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handlePasswordChangeOpen}
                      className="w-full sm:w-auto px-5 py-3 border-2 border-emerald-700 text-emerald-700 hover:bg-emerald-50 rounded-2xl font-black text-sm"
                    >
                      비밀번호 변경
                    </button>
                  </div>
                )}

                {showPasswordChange && (
                  <form
                    onSubmit={handlePasswordChange}
                    className="space-y-5"
                  >
                    <h3 className="text-lg font-black text-gray-900">
                      비밀번호 변경
                    </h3>

                    {passwordError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
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

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={
                          handlePasswordChangeCancel
                        }
                        disabled={isChangingPassword}
                        className="px-6 py-3 border-2 border-gray-200 rounded-2xl font-black text-sm"
                      >
                        취소
                      </button>

                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-400 text-white rounded-2xl font-black text-sm"
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
        </div>

        {/* 계정 관리 */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-md space-y-6">
          <h2 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-4">
            계정 관리
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-black text-gray-900">
                로그아웃
              </p>

              <p className="text-xs font-bold text-gray-600">
                현재 접속 중인 계정에서 안전하게
                로그아웃합니다.
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
              className="w-full sm:w-auto px-6 py-3 border-2 border-gray-200 hover:bg-gray-50 rounded-2xl text-xs font-black transition"
            >
              로그아웃하기
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <div>
              <p className="font-black text-red-600">
                회원 탈퇴
              </p>

              <p className="text-xs font-bold text-gray-600">
                탈퇴 시 모든 주소록, 상품, 이미지 및
                발송 내역이 영구적으로 삭제됩니다.
              </p>
            </div>

            <DeleteAccountButton />
          </div>
        </div>
      </main>

      <footer className="w-full bg-white border-t border-gray-200 py-6 text-center text-gray-600 text-xs">
        <p className="font-bold">
          © 2026 FarMMS. All rights reserved.
        </p>
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
      <span className="text-gray-500 font-black text-xs block">
        {label}
      </span>

      <p className="text-gray-900 font-black text-base">
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
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-xs font-black text-gray-600"
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
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl font-bold text-sm focus:outline-none focus:border-emerald-700 disabled:bg-gray-100"
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
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-xs font-black text-gray-600"
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
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl font-bold text-sm focus:outline-none focus:border-emerald-700"
      />
    </div>
  );
}