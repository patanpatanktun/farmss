package com.hrg.agripromomms.common.exception;

/**
 * OpenAI API 호출 또는 응답 해석 과정에서 문제가 발생했을 때 사용하는 예외입니다.
 */
public class OpenAiApiException extends RuntimeException {

    public OpenAiApiException(String message) {
        super(message);
    }

    public OpenAiApiException(String message, Throwable cause) {
        super(message, cause);
    }
}
