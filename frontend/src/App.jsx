import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Start from './components/Start';
import Login from './components/Login';
import Signup from './components/Signup';
import Main from './components/Main';
import Notice from './components/Notice';
import Contact from './components/Contact';
import Product from './components/Product';
import CreateImage from './components/CreateImage';
import ManageImage from './components/ManageImage';
import SendMms from './components/SendMms';
import CheckMms from './components/CheckMms';
import Setting from './components/Setting';

/**
 * 브라우저의 로그인 정보를 삭제합니다.
 */
function clearLoginData() {
  localStorage.removeItem(
    'accessToken'
  );

  localStorage.removeItem(
    'userNum'
  );

  localStorage.removeItem(
    'userId'
  );
}

/**
 * JWT가 존재하고 만료되지 않았는지 확인합니다.
 */
function isAuthenticated() {
  const token =
    localStorage.getItem(
      'accessToken'
    );

  if (!token) {
    return false;
  }

  try {
    const tokenParts =
      token.split('.');

    if (tokenParts.length !== 3) {
      clearLoginData();
      return false;
    }

    let payloadText =
      tokenParts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    while (
      payloadText.length % 4 !== 0
    ) {
      payloadText += '=';
    }

    const decodedPayload =
      atob(payloadText);

    const payload =
      JSON.parse(
        decodeURIComponent(
          decodedPayload
            .split('')
            .map(
              (character) =>
                `%${character
                  .charCodeAt(0)
                  .toString(16)
                  .padStart(2, '0')}`
            )
            .join('')
        )
      );

    if (!payload.exp) {
      clearLoginData();
      return false;
    }

    if (
      payload.exp * 1000 <=
      Date.now()
    ) {
      clearLoginData();
      return false;
    }

    return true;
  } catch {
    clearLoginData();
    return false;
  }
}

/**
 * 로그인한 사용자만 접근할 수 있습니다.
 */
function ProtectedRoute({
  children,
}) {
  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

/**
 * 로그인하지 않은 사용자만 접근할 수 있습니다.
 */
function PublicOnlyRoute({
  children,
}) {
  if (isAuthenticated()) {
    return (
      <Navigate
        to="/main"
        replace
      />
    );
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 공개 페이지 */}
        <Route
          path="/"
          element={<Start />}
        />

        <Route
          path="/start"
          element={<Start />}
        />

        {/*
         * 공지사항은 로그인 여부와 관계없이
         * 누구나 접근할 수 있습니다.
         */}
        <Route
          path="/notice"
          element={<Notice />}
        />

        {/* 비로그인 사용자 페이지 */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <Signup />
            </PublicOnlyRoute>
          }
        />

        {/* 로그인 필수 페이지 */}
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <Main />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <Contact />
            </ProtectedRoute>
          }
        />

        <Route
          path="/product"
          element={
            <ProtectedRoute>
              <Product />
            </ProtectedRoute>
          }
        />

        <Route
          path="/createimage"
          element={
            <ProtectedRoute>
              <CreateImage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manageimage"
          element={
            <ProtectedRoute>
              <ManageImage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sendmms"
          element={
            <ProtectedRoute>
              <SendMms />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkmms"
          element={
            <ProtectedRoute>
              <CheckMms />
            </ProtectedRoute>
          }
        />

        <Route
          path="/setting"
          element={
            <ProtectedRoute>
              <Setting />
            </ProtectedRoute>
          }
        />

        {/* 존재하지 않는 주소 */}
        <Route
          path="*"
          element={
            <Navigate
              to="/start"
              replace
            />
          }
        />
      </Routes>
    </Router>
  );
}