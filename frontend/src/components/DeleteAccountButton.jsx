import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';

export default function DeleteAccountButton() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] =
    useState('');
  const [isDeleting, setIsDeleting] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState('');

  /**
   * 회원 탈퇴 확인창을 엽니다.
   */
  const handleOpen = () => {
    setCurrentPassword('');
    setErrorMessage('');
    setIsOpen(true);
  };

  /**
   * 회원 탈퇴 확인창을 닫습니다.
   */
  const handleClose = () => {
    if (isDeleting) {
      return;
    }

    setCurrentPassword('');
    setErrorMessage('');
    setIsOpen(false);
  };

  /**
   * 회원 탈퇴를 요청합니다.
   */
  const handleDeleteAccount = async (event) => {
    event.preventDefault();

    setErrorMessage('');

    if (!currentPassword) {
      setErrorMessage(
        '현재 비밀번호를 입력해주세요.'
      );
      return;
    }

    const confirmed = window.confirm(
      '정말 회원 탈퇴를 진행하시겠습니까?\n\n' +
        '등록한 연락처, 그룹, 상품, 이미지, MMS 발송 내역이 ' +
        '모두 영구적으로 삭제되며 복구할 수 없습니다.'
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await api.delete('/users/me', {
        currentPassword,
      });

      localStorage.removeItem('accessToken');
      localStorage.removeItem('userNum');
      localStorage.removeItem('userId');
      localStorage.removeItem('savedUserId');

      window.alert(
        '회원 탈퇴가 완료되었습니다.'
      );

      navigate('/start', { replace: true });
    } catch (error) {
      setErrorMessage(
        error.message ||
          '회원 탈퇴 처리 중 오류가 발생했습니다.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="
          w-full
          sm:w-auto
          px-6
          py-3
          border
          border-[#b45a47]/30
          hover:bg-[#b45a47]/10
          text-[#b45a47]
          rounded-none
          text-[14px]
          font-semibold
          transition
        "
      >
        회원 탈퇴하기
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* 모달 배경 */}
          <button
            type="button"
            aria-label="회원 탈퇴창 닫기"
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* 회원 탈퇴 모달 */}
          <div
            className="
              relative
              z-10
              w-full
              max-w-md
              bg-[#f8f0e2]
              border
              border-[#17372a]/25
              rounded-none
              shadow-2xl
              p-8
              space-y-6
            "
          >
            <div className="text-center space-y-2">
              <div
                className="
                  mx-auto
                  w-14
                  h-14
                  rounded-none
                  bg-[#b45a47]/10
                  text-[#b45a47]
                  flex
                  items-center
                  justify-center
                  text-2xl
                  font-bold
                "
              >
                !
              </div>

              <h2
                className="
                  text-[22px]
                  font-bold
                  text-[#17372a]
                "
              >
                회원 탈퇴
              </h2>

              <p
                className="
                  text-[14px]
                  text-[#59675f]
                  font-normal
                  leading-relaxed
                "
              >
                회원 탈퇴 시 등록한 연락처, 그룹, 상품,
                이미지 및 MMS 발송 내역이 모두 삭제됩니다.
              </p>

              <p
                className="
                  text-[14px]
                  text-[#b45a47]
                  font-semibold
                "
              >
                삭제된 데이터는 복구할 수 없습니다.
              </p>
            </div>

            {errorMessage && (
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
                {errorMessage}
              </div>
            )}

            <form
              onSubmit={handleDeleteAccount}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label
                  htmlFor="deleteCurrentPassword"
                  className="
                    block
                    text-[13px]
                    font-semibold
                    text-[#536159]
                  "
                >
                  현재 비밀번호
                </label>

                <input
                  id="deleteCurrentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(
                      event.target.value
                    )
                  }
                  autoComplete="current-password"
                  placeholder="현재 비밀번호를 입력하세요"
                  required
                  autoFocus
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
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isDeleting}
                  className="
                    flex-1
                    h-[50px]
                    border
                    border-[#17372a]/25
                    hover:bg-[#17372a]/[0.05]
                    disabled:bg-[#17372a]/10
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
                  disabled={isDeleting}
                  className="
                    flex-1
                    h-[50px]
                    bg-[#b45a47]
                    hover:bg-[#9c4d3d]
                    disabled:bg-[#9ca7a0]
                    disabled:cursor-not-allowed
                    text-white
                    rounded-none
                    font-semibold
                    text-[15px]
                    transition
                  "
                >
                  {isDeleting
                    ? '탈퇴 처리 중...'
                    : '회원 탈퇴'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}