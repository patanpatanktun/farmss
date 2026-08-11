/**
 * auth.js - 로그인, 회원가입 및 인증 관련 페이지 로직
 * (common.js가 먼저 로드되어 있어야 작동합니다.)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. 이미 로그인 되었으면 로그인, 회원가입으로 오지 않게 하기
  const currentPage = window.location.pathname.split('/').pop();
  if ((currentPage === 'login.html' || currentPage === 'signup.html') && Auth.isLoggedIn()) {
    window.location.href = 'main.html';
    return;
  }

// 요소 가져오기
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const logoutBtn = document.getElementById('logout-btn');


  // A. 로그인 처리
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');

      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';

      // 유효성 검사
      if (!email) {
        alert('이메일을 입력해 주세요.');
        emailInput?.focus();
        return;
      }

      if (!password) {
        alert('비밀번호를 입력해 주세요.');
        passwordInput?.focus();
        return;
      }

      // API 로그인 요청
      const data = await API.post('/auth/login', { email, password });

      if (data && data.token) {
        // 토큰 저장 후 메인 페이지 이동
        Auth.setToken(data.token);
        alert('로그인되었습니다.');
        window.location.href = 'main.html';
      }
    });
  }


  // B. 회원가입
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      const passwordConfirmInput = document.getElementById('password-confirm');
      const phoneInput = document.getElementById('phone');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';
      const passwordConfirm = passwordConfirmInput ? passwordConfirmInput.value : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';

      // 유효성 검사
      if (!name) {
        alert('이름을 입력해 주세요.');
        nameInput?.focus();
        return;
      }

      if (!email) {
        alert('이메일을 입력해 주세요.');
        emailInput?.focus();
        return;
      }

      // 이메일 형식 확인 (정규식)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('올바른 이메일 형식이 아닙니다.');
        emailInput?.focus();
        return;
      }

      if (!password || password.length < 8) {
        alert('비밀번호는 8자 이상이어야 합니다.');
        passwordInput?.focus();
        return;
      }

      if (password !== passwordConfirm) {
        alert('비밀번호 확인이 일치하지 않습니다.');
        passwordConfirmInput?.focus();
        return;
      }

      // API 회원가입 요청
      const payload = {
        name,
        email,
        password,
        phone: Utils.formatPhoneNumber(phone)
      };

      const data = await API.post('/auth/signup', payload);

      if (data) {
        alert('회원가입이 완료되었습니다. 로그인해 주세요.');
        window.location.href = 'login.html';
      }
    });
  }


  // 공통 로그아웃 버튼 이벤트 바인딩
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('로그아웃 하시겠습니까?')) {
        Auth.logout();
      }
    });
  }
});