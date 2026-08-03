const BASE_URL = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * MMS 발송
 * @param {Object} mmsData - { customerIds, imageId, message, scheduledAt }
 */
export async function sendMms(mmsData) {
  const response = await fetch(`${BASE_URL}/mms/send`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(mmsData),
  });
  if (!response.ok) throw new Error('MMS 발송 실패');
  return response.json();
}

/**
 * MMS 발송 예약
 * @param {Object} mmsData - { customerIds, imageId, message, scheduledAt }
 */
export async function scheduleMms(mmsData) {
  const response = await fetch(`${BASE_URL}/mms/schedule`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(mmsData),
  });
  if (!response.ok) throw new Error('MMS 예약 실패');
  return response.json();
}

/**
 * MMS 발송 내역 조회
 * @param {Object} params - 필터 파라미터 (page, size, startDate, endDate, status)
 */
export async function getMmsHistory(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/mms/history?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('MMS 내역 조회 실패');
  return response.json();
}

/**
 * MMS 발송 상세 조회
 * @param {number} mmsId
 */
export async function getMmsDetail(mmsId) {
  const response = await fetch(`${BASE_URL}/mms/${mmsId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('MMS 상세 조회 실패');
  return response.json();
}

/**
 * 예약 MMS 취소
 * @param {number} mmsId
 */
export async function cancelMms(mmsId) {
  const response = await fetch(`${BASE_URL}/mms/${mmsId}/cancel`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('MMS 취소 실패');
  return response.json();
}
