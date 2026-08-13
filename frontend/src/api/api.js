const API_PREFIX = '/api';

/**
 * 브라우저에 저장된 로그인 정보를 삭제합니다.
 *
 * savedUserId는 아이디 저장 기능에 사용하므로
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
async function request(
  endpoint,
  options = {}
) {
  const accessToken =
    localStorage.getItem('accessToken');

  const headers = {
    ...options.headers,
  };

  /**
   * FormData 요청은 브라우저가
   * multipart boundary를 자동으로 설정해야 하므로
   * Content-Type을 직접 지정하지 않습니다.
   */
  if (
    options.body !== undefined &&
    !(options.body instanceof FormData)
  ) {
    headers['Content-Type'] =
      'application/json';
  }

  /**
   * 로그인한 사용자의 JWT를
   * Authorization 헤더에 추가합니다.
   */
  if (accessToken) {
    headers.Authorization =
      `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${API_PREFIX}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  /**
   * 토큰이 없거나 만료된 경우
   * 로그인 정보를 삭제하고 로그인 화면으로 이동합니다.
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
   * DELETE 또는 PATCH 성공처럼
   * 응답 본문이 없는 경우입니다.
   */
  if (response.status === 204) {
    return null;
  }

  const responseText =
    await response.text();

  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  /**
   * 정상 응답이 아니면 백엔드가 반환한
   * 오류 메시지를 Error로 전달합니다.
   */
  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        '요청 처리 중 오류가 발생했습니다.'
    );
  }

  return data;
}

/**
 * 각 HTTP 요청에서 사용하는 공통 API 함수입니다.
 */
export const api = {

  /**
   * 데이터를 조회합니다.
   */
  get(endpoint) {
    return request(
      endpoint,
      {
        method: 'GET',
      }
    );
  },

  /**
   * 새로운 데이터를 등록합니다.
   */
  post(endpoint, body) {
    return request(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  },

  /**
   * 데이터를 전체 수정합니다.
   */
  put(endpoint, body) {
    return request(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      }
    );
  },

  /**
   * 데이터 일부를 수정합니다.
   */
  patch(endpoint, body) {
    return request(
      endpoint,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      }
    );
  },

  /**
   * 데이터를 삭제합니다.
   *
   * 회원탈퇴처럼 DELETE 요청에 데이터가 필요한 경우
   * 두 번째 매개변수에 요청 본문을 전달할 수 있습니다.
   *
   * 요청 본문이 필요하지 않은 일반 DELETE 요청도
   * 기존과 동일하게 사용할 수 있습니다.
   */
  delete(endpoint, body) {
    return request(
      endpoint,
      {
        method: 'DELETE',

        body:
          body === undefined
            ? undefined
            : JSON.stringify(body),
      }
    );
  },

  /**
   * 이미지 등의 파일을
   * multipart/form-data 형식으로 전송합니다.
   *
   * Content-Type은 브라우저가 자동으로 설정합니다.
   */
  upload(endpoint, formData) {
    if (!(formData instanceof FormData)) {
      throw new Error(
        '파일 업로드 요청에는 FormData가 필요합니다.'
      );
    }

    return request(
      endpoint,
      {
        method: 'POST',
        body: formData,
      }
    );
  },
};