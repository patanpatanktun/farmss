/**
 * common.js - 공통 API 통신, 인증, 유틸리티 및 UI 처리
 */

// 1. 기본 설정
const CONFIG = {
  // 프론트와 백엔드가 같은 Spring 서버에서 실행되므로 빈 문자열을 사용합니다.
  BASE_URL: '',
  TOKEN_KEY: 'AUTH_TOKEN'
};


// 2. JWT 인증 및 토큰 관리
const Auth = {

  // 로그인 성공 후 JWT 저장
  setToken(token) {
    localStorage.setItem(CONFIG.TOKEN_KEY, token);
  },

  // 저장된 JWT 조회
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

  // 로그인이 필요한 페이지 보호
  checkAuthGuard() {
    const publicPages = [
      'login.html',
      'signup.html',
      'start.html'
    ];

    const currentPage =
      window.location.pathname.split('/').pop();

    if (
      !publicPages.includes(currentPage) &&
      !this.isLoggedIn()
    ) {
      alert('로그인이 필요한 서비스입니다.');
      window.location.href = 'login.html';
    }
  }
};


// 3. 공통 API 통신 모듈
const API = {

  async request(endpoint, options = {}) {
    const url = `${CONFIG.BASE_URL}${endpoint}`;
    const token = Auth.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // 저장된 JWT가 있으면 Authorization 헤더에 추가합니다.
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      UI.showLoading();

      const response = await fetch(url, config);

      // JWT가 만료됐거나 올바르지 않은 경우
      if (response.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해 주세요.');
        Auth.logout();
        return null;
      }

      let data = null;

      // 고객 삭제처럼 204 응답은 JSON 본문이 없습니다.
      if (response.status !== 204) {
        const contentType =
          response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();

          data = text
            ? { message: text }
            : null;
        }
      }

      // 200번대가 아닌 응답은 오류로 처리합니다.
      if (!response.ok) {
        throw new Error(
          data?.message ||
          '요청 처리 중 오류가 발생했습니다.'
        );
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
    return this.request(endpoint, {
      method: 'GET'
    });
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
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
};


// 4. 유틸리티 함수
const Utils = {

  // 날짜를 YYYY-MM-DD HH:mm 형식으로 변환
  formatDate(dateString) {
    if (!dateString) {
      return '-';
    }

    const date = new Date(dateString);

    const year = date.getFullYear();
    const month =
      String(date.getMonth() + 1).padStart(2, '0');
    const day =
      String(date.getDate()).padStart(2, '0');
    const hours =
      String(date.getHours()).padStart(2, '0');
    const minutes =
      String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  // 전화번호를 화면 표시용 형식으로 변환
  formatPhoneNumber(phone) {
    if (!phone) {
      return '';
    }

    return phone
      .replace(/[^0-9]/g, '')
      .replace(
        /^(\d{2,3})(\d{3,4})(\d{4})$/,
        '$1-$2-$3'
      );
  },

  // HTML 특수문자를 변환하여 XSS를 방지
  escapeHtml(value) {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};


// 5. 공통 UI 처리
const UI = {

  showLoading() {
    let spinner =
      document.getElementById('global-loading-spinner');

    if (!spinner) {
      spinner = document.createElement('div');
      spinner.id = 'global-loading-spinner';

      spinner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        color: white;
        font-weight: bold;
      `;

      spinner.innerText = '처리 중...';
      document.body.appendChild(spinner);
    }

    spinner.style.display = 'flex';
  },

  hideLoading() {
    const spinner =
      document.getElementById('global-loading-spinner');

    if (spinner) {
      spinner.style.display = 'none';
    }
  }
};


// 6. 페이지가 열렸을 때 인증 여부 확인
document.addEventListener('DOMContentLoaded', () => {
  Auth.checkAuthGuard();
});