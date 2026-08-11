/**
 * mms.js - MMS 발송(sendmms.html) 및 발송 내역 조회(checkmms.html) 로직
 * (common.js가 먼저 로드되어 있어야 작동합니다.)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. 요소 참조
  const sendMmsForm = document.getElementById('send-mms-form');
  const mmsHistoryContainer = document.getElementById('mms-history-list');

  // ----------------------------------------------------
  // A. MMS 작성 및 발송 처리 (sendmms.html)
  // ----------------------------------------------------
  if (sendMmsForm) {
    // SessionStorage에서 전달받은 이미지 정보 확인 및 세팅
    MmsManager.initSelectedImage();

    // 예약 발송 토글 체크박스 이벤트 처리
    const isReservedCheckbox = document.getElementById('is-reserved');
    const reservationDateWrapper = document.getElementById('reservation-date-wrapper');

    if (isReservedCheckbox && reservationDateWrapper) {
      isReservedCheckbox.addEventListener('change', (e) => {
        reservationDateWrapper.style.display = e.target.checked ? 'block' : 'none';
      });
    }

    // 폼 제출 이벤트
    sendMmsForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const receiverInput = document.getElementById('receiver-phone');
      const messageInput = document.getElementById('message-content');
      const imageIdInput = document.getElementById('selected-image-id');
      const isReserved = isReservedCheckbox ? isReservedCheckbox.checked : false;
      const reservedAtInput = document.getElementById('reserved-at');

      const receiver = receiverInput ? receiverInput.value.trim() : '';
      const content = messageInput ? messageInput.value.trim() : '';
      const imageId = imageIdInput ? imageIdInput.value : null;
      const reservedAt = reservedAtInput ? reservedAtInput.value : null;

      // 유효성 검사
      if (!receiver) {
        alert('수신자 전화번호를 입력해 주세요.');
        receiverInput?.focus();
        return;
      }

      if (!content) {
        alert('메시지 내용을 입력해 주세요.');
        messageInput?.focus();
        return;
      }

      if (isReserved && !reservedAt) {
        alert('예약 발송 일시를 선택해 주세요.');
        reservedAtInput?.focus();
        return;
      }

      const payload = {
        receiver: Utils.formatPhoneNumber(receiver),
        content,
        imageId,
        isReserved,
        reservedAt: isReserved ? reservedAt : null
      };

      // API MMS 발송 요청
      const data = await API.post('/mms/send', payload);

      if (data) {
        alert(isReserved ? 'MMS 예약 발송이 설정되었습니다.' : 'MMS가 성공적으로 발송되었습니다.');
        sessionStorage.removeItem('selectedImage'); // 사용한 이미지 세션 제거
        window.location.href = 'checkmms.html';
      }
    });
  }

  // ----------------------------------------------------
  // B. MMS 발송 내역 조회 (checkmms.html)
  // ----------------------------------------------------
  if (mmsHistoryContainer) {
    MmsManager.loadHistory();
  }
});

// MMS 관련 공통 핸들러 객체
const MmsManager = {
  // 이전 페이지(createimage / manageimage)에서 넘어온 이미지 정보 자동 바인딩
  initSelectedImage() {
    const rawData = sessionStorage.getItem('selectedImage');
    if (!rawData) return;

    try {
      const selectedImage = JSON.parse(rawData);
      const hiddenInput = document.getElementById('selected-image-id');
      const previewImg = document.getElementById('selected-image-preview');

      if (hiddenInput) hiddenInput.value = selectedImage.id;
      if (previewImg) {
        previewImg.src = selectedImage.url;
        previewImg.style.display = 'block';
      }
    } catch (e) {
      console.error('이미지 데이터 파싱 실패:', e);
    }
  },

  // 발송 내역 목록 불러오기
  async loadHistory() {
    const container = document.getElementById('mms-history-list');
    if (!container) return;

    const historyList = await API.get('/mms/history');

    if (!historyList || historyList.length === 0) {
      container.innerHTML = '<tr><td colspan="6" class="empty-msg">발송 내역이 없습니다.</td></tr>';
      return;
    }

    // 발송 내역 테이블 Row 렌더링
    container.innerHTML = historyList.map(item => `
      <tr>
        <td>${Utils.formatDate(item.createdAt)}</td>
        <td>${Utils.escapeHtml(item.receiver)}</td>
        <td>${Utils.escapeHtml(item.content)}</td>
        <td>${item.imageUrl ? `<img src="${Utils.escapeHtml(item.imageUrl)}" width="50" height="50" alt="첨부 이미지" />` : '없음'}</td>
        <td><span class="status-badge status-${item.status}">${this.getStatusLabel(item.status)}</span></td>
        <td>
          ${item.status === 'RESERVED' ? `<button onclick="MmsManager.cancelReservation('${item.id}')" class="btn-cancel">예약 취소</button>` : '-'}
        </td>
      </tr>
    `).join('');
  },

  // 예약 발송 취소
  async cancelReservation(mmsId) {
    if (!confirm('예약된 MMS 발송을 취소하시겠습니까?')) return;

    const result = await API.delete(`/mms/reservation/${mmsId}`);
    if (result) {
      alert('예약 발송이 취소되었습니다.');
      this.loadHistory(); // 목록 갱신
    }
  },

  // 발송 상태 텍스트 라벨 변환
  getStatusLabel(status) {
    switch (status) {
      case 'SUCCESS': return '발송 성공';
      case 'FAILED': return '발송 실패';
      case 'RESERVED': return '발송 대기(예약)';
      case 'CANCELLED': return '예약 취소됨';
      default: return '대기 중';
    }
  }
};