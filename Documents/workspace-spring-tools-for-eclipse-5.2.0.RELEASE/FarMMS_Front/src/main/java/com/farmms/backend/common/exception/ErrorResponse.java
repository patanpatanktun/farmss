package com.farmms.backend.common.exception;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * API 오류가 발생했을 때 프론트엔드에 공통으로 반환하는 응답 형식입니다.
 */
@Getter
@AllArgsConstructor
public class ErrorResponse {

    // 오류가 발생한 시간
    private LocalDateTime timestamp;

    // HTTP 상태 코드
    private int status;

    // 오류 종류
    private String error;

    // 사용자에게 보여줄 오류 메시지
    private String message;

    // 오류가 발생한 API 주소
    private String path;
}
