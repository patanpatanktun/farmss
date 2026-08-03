const BASE_URL = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

/**
 * AI 이미지 생성 요청
 * @param {Object} params - { prompt, style, size }
 */
export async function generateImage(params) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/images/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error('이미지 생성 실패');
  return response.json();
}

/**
 * 이미지 업로드
 * @param {File} file
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(`${BASE_URL}/images/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  if (!response.ok) throw new Error('이미지 업로드 실패');
  return response.json();
}

/**
 * 생성된 이미지 목록 조회
 * @param {Object} params - 페이지네이션 파라미터
 */
export async function getImages(params = {}) {
  const token = localStorage.getItem('token');
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/images?${query}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('이미지 목록 조회 실패');
  return response.json();
}

/**
 * 이미지 삭제
 * @param {string} imageId
 */
export async function deleteImage(imageId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/images/${imageId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('이미지 삭제 실패');
}
