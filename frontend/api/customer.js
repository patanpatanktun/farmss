const BASE_URL = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * 고객 목록 조회
 * @param {Object} params - 검색 파라미터 (page, size, keyword 등)
 */
export async function getCustomers(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/customers?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('고객 목록 조회 실패');
  return response.json();
}

/**
 * 고객 상세 조회
 * @param {number} customerId
 */
export async function getCustomer(customerId) {
  const response = await fetch(`${BASE_URL}/customers/${customerId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('고객 조회 실패');
  return response.json();
}

/**
 * 고객 등록
 * @param {Object} customerData
 */
export async function createCustomer(customerData) {
  const response = await fetch(`${BASE_URL}/customers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(customerData),
  });
  if (!response.ok) throw new Error('고객 등록 실패');
  return response.json();
}

/**
 * 고객 수정
 * @param {number} customerId
 * @param {Object} customerData
 */
export async function updateCustomer(customerId, customerData) {
  const response = await fetch(`${BASE_URL}/customers/${customerId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(customerData),
  });
  if (!response.ok) throw new Error('고객 수정 실패');
  return response.json();
}

/**
 * 고객 삭제
 * @param {number} customerId
 */
export async function deleteCustomer(customerId) {
  const response = await fetch(`${BASE_URL}/customers/${customerId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('고객 삭제 실패');
}

/**
 * 고객 일괄 등록 (CSV)
 * @param {File} file
 */
export async function importCustomers(file) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${BASE_URL}/customers/import`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) throw new Error('고객 일괄 등록 실패');
  return response.json();
}
