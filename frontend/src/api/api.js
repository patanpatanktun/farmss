const API_PREFIX = '/api';

/**
 * 로그인 정보를 삭제합니다.
 *
 * savedUserId는 아이디 저장 기능에 사용되므로
 * 삭제하지 않습니다.
 */
function clearLoginData() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userNum');
  localStorage.removeItem('userId');
}

/**
 * Spring REST API에 공통으로 요청합니다.
 */
async function request(endpoint, options = {}) {
  const accessToken =
    localStorage.getItem('accessToken');

  const headers = {
    ...options.headers,
  };

  /**
   * FormData 요청은 브라우저가 multipart boundary를
   * 자동으로 설정해야 하므로 Content-Type을 직접
   * 지정하지 않습니다.
   */
  if (
    options.body !== undefined &&
    !(options.body instanceof FormData)
  ) {
    headers['Content-Type'] = 'application/json';
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${API_PREFIX}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  /**
   * 토큰이 없거나 만료된 경우 로그인 화면으로 이동합니다.
   */
  if (
    response.status === 401 ||
    response.status === 403
  ) {
    clearLoginData();

    alert(
      '로그인이 만료되었습니다. 다시 로그인해주세요.'
    );

    window.location.href = '/login';

    return null;
  }

  /**
   * DELETE 성공처럼 응답 본문이 없는 경우입니다.
   */
  if (response.status === 204) {
    return null;
  }

  const responseText = await response.text();

  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        '요청 처리 중 오류가 발생했습니다.'
    );
  }

  return data;
}

export const api = {
  get(endpoint) {
    return request(endpoint, {
      method: 'GET',
    });
  },

  post(endpoint, body) {
    return request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body) {
    return request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  patch(endpoint, body) {
    return request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return request(endpoint, {
      method: 'DELETE',
    });
  },

  /**
   * 이미지 등의 파일을 multipart/form-data로 전송합니다.
   *
   * Content-Type은 브라우저가 자동으로 설정합니다.
   */
  upload(endpoint, formData) {
    if (!(formData instanceof FormData)) {
      throw new Error(
        '파일 업로드 요청에는 FormData가 필요합니다.'
      );
    }

    return request(endpoint, {
      method: 'POST',
      body: formData,
    });
  },
};