const BASE_URL = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * 대시보드 요약 통계 조회
 */
export async function getDashboardSummary() {
  const response = await fetch(`${BASE_URL}/dashboard/summary`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('대시보드 통계 조회 실패');
  return response.json();
}

/**
 * MMS 발송 통계 (기간별)
 * @param {Object} params - { startDate, endDate, groupBy }
 */
export async function getMmsStats(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/dashboard/mms-stats?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('MMS 통계 조회 실패');
  return response.json();
}

/**
 * 최근 발송 내역
 * @param {number} limit - 조회 건수
 */
export async function getRecentMms(limit = 10) {
  const response = await fetch(`${BASE_URL}/dashboard/recent-mms?limit=${limit}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('최근 발송 내역 조회 실패');
  return response.json();
}

/**
 * 고객 증감 추이
 * @param {Object} params - { startDate, endDate }
 */
export async function getCustomerTrend(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/dashboard/customer-trend?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('고객 추이 조회 실패');
  return response.json();
}
