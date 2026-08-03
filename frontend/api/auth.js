const BASE_URL = '/api';

/**
 * 로그인
 * @param {string} username
 * @param {string} password
 */
export async function login(username, password) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error('로그인 실패');
  return response.json();
}

/**
 * 로그아웃
 */
export async function logout() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('로그아웃 실패');
  localStorage.removeItem('token');
}

/**
 * 토큰 갱신
 */
export async function refreshToken() {
  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('토큰 갱신 실패');
  return response.json();
}
