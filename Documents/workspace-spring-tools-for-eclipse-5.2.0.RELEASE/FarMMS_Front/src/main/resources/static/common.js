/**
 * common.js - 공통 API 통신, 인증, 유틸리티 및 UI 핸들러
 */

// 1. 기본 설정 및 글로벌 변수
const CONFIG = {
  BASE_URL: 'https://api.yourdomain.com', // 실제 API 백엔드 서버 주소로 변경
  TOKEN_KEY: 'AUTH_TOKEN'
};

// 2. 인증 & 토큰 관리 (Auth Helper)
const Auth = {
  // 토큰 저장 (로그인 성공 시)
  setToken(token) {
    localStorage.setItem(CONFIG.TOKEN_KEY, token);
  },

  // 토큰 가져오기
  getToken() {
    return localStorage.getItem(CONFIG.TOKEN_KEY);
  },

  // 로그인 여부 확인
  isLoggedIn() {
    return !!this.getToken();
  },

  // 로그아웃
  logout() {
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    window.location.href = 'login.html';
  },

  // 인증이 필요한 페이지 보호 (미로그인 시 로그인 페이지로 리다이렉트)
  checkAuthGuard() {
    const publicPages = ['login.html', 'signup.html', 'start.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (!publicPages.includes(currentPage) && !this.isLoggedIn()) {
      alert('로그인이 필요한 서비스입니다.');
      window.location.href = 'login.html';
    }
  }
};

// 3. API 통신 모듈 (HTTP Fetch Wrapper)
const API = {
  async request(endpoint, options = {}) {
    const url = `${CONFIG.BASE_URL}${endpoint}`;
    const token = Auth.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      UI.showLoading();
      const response = await fetch(url, config);

      // 토큰 만료 처리 (401 Unauthorized)
      if (response.status === 401) {
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        Auth.logout();
        return null;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      alert(error.message);
      return null;
    } finally {
      UI.hideLoading();
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};

// 4. 유틸리티 함수 (Formatters & Helpers)
const Utils = {
  // 날짜 포맷 변환 (예: YYYY-MM-DD HH:mm)
  formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  // 전화번호 포맷팅 (01012345678 -> 010-1234-5678)
  formatPhoneNumber(phone) {
    if (!phone) return '';
    return phone
      .replace(/[^0-9]/g, '')
      .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
  },

  // HTML 태그 이스케이프 (XSS 방지)
  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

// 5. 공통 UI 조작 (Loading & Notifications)
const UI = {
  showLoading() {
    let spinner = document.getElementById('global-loading-spinner');
    if (!spinner) {
      spinner = document.createElement('div');
      spinner.id = 'global-loading-spinner';
      spinner.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.3); display: flex; justify-content: center;
        align-items: center; z-index: 9999; color: white; font-weight: bold;
      `;
      spinner.innerText = '처리 중...';
      document.body.appendChild(spinner);
    }
    spinner.style.display = 'flex';
  },

  hideLoading() {
    const spinner = document.getElementById('global-loading-spinner');
    if (spinner) spinner.style.display = 'none';
  }
};

// DOM 로드 완료 시 초기화 실행
document.addEventListener('DOMContentLoaded', () => {
  // 인증 체크 실행
  Auth.checkAuthGuard();
});