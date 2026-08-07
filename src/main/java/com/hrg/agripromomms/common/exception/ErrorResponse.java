package com.hrg.agripromomms.common.exception;

import java.time.LocalDateTime;

/** API 오류를 일정한 JSON 형태로 반환합니다. */
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path) {
}
