package com.farmms.backend.common.exception;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Controller에서 발생한 예외를 한 곳에서 처리하는 클래스입니다.
 *
 * 모든 API가 동일한 오류 JSON 형식을 반환하도록 만들어
 * 프론트엔드가 오류를 처리하기 쉬워집니다.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 요청 값의 필수값, 길이, 형식 검사가 실패했을 때 처리합니다.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request) {

        String message = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return buildResponse(HttpStatus.BAD_REQUEST, message, request.getRequestURI());
    }

    /**
     * DB에서 요청한 고객, 이미지, 발송 이력을 찾지 못했을 때 처리합니다.
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            EntityNotFoundException exception,
            HttpServletRequest request) {

        return buildResponse(HttpStatus.NOT_FOUND, exception.getMessage(), request.getRequestURI());
    }

    /**
     * 발송 대상이 없거나 잘못된 고객 번호가 포함된 경우처럼
     * 사용자의 요청 내용이 올바르지 않을 때 처리합니다.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
            IllegalArgumentException exception,
            HttpServletRequest request) {

        return buildResponse(HttpStatus.BAD_REQUEST, exception.getMessage(), request.getRequestURI());
    }

    /**
     * 위에서 예상하지 못한 서버 내부 오류를 처리합니다.
     * 보안을 위해 사용자에게 상세한 내부 오류 내용은 노출하지 않습니다.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(
            Exception exception,
            HttpServletRequest request) {

        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "서버 처리 중 오류가 발생했습니다.",
                request.getRequestURI()
        );
    }

    /**
     * 공통 ErrorResponse 객체를 만드는 내부 메서드입니다.
     */
    private ResponseEntity<ErrorResponse> buildResponse(
            HttpStatus status,
            String message,
            String path) {

        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                path
        );

        return ResponseEntity.status(status).body(response);
    }
}
