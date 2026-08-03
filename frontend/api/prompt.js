const BASE_URL = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * AI 마케팅 프롬프트 생성
 * @param {Object} params - { productName, targetAudience, tone, keywords }
 */
export async function generatePrompt(params) {
  const response = await fetch(`${BASE_URL}/prompts/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error('프롬프트 생성 실패');
  return response.json();
}

/**
 * 저장된 프롬프트 목록 조회
 */
export async function getPrompts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/prompts?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('프롬프트 목록 조회 실패');
  return response.json();
}

/**
 * 프롬프트 저장
 * @param {Object} promptData - { title, content }
 */
export async function savePrompt(promptData) {
  const response = await fetch(`${BASE_URL}/prompts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(promptData),
  });
  if (!response.ok) throw new Error('프롬프트 저장 실패');
  return response.json();
}

/**
 * 프롬프트 삭제
 * @param {number} promptId
 */
export async function deletePrompt(promptId) {
  const response = await fetch(`${BASE_URL}/prompts/${promptId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('프롬프트 삭제 실패');
}
