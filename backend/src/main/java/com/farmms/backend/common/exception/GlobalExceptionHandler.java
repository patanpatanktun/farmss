package com.farmms.backend.common.exception;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * Controller에서 발생한 예외를 한 곳에서 처리하는 클래스입니다.
 *
 * 모든 API가 동일한 오류 JSON 형식을 반환하도록 만들어
 * 프론트엔드가 오류를 처리하기 쉽게 합니다.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(
                    GlobalExceptionHandler.class
            );

    /**
     * 요청값의 필수값, 길이, 형식 검사가 실패했을 때 처리합니다.
     */
    @ExceptionHandler(
            MethodArgumentNotValidException.class
    )
    public ResponseEntity<ErrorResponse>
    handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {

        String message =
                exception.getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .map(error ->
                                error.getField()
                                        + ": "
                                        + error.getDefaultMessage()
                        )
                        .collect(
                                Collectors.joining(", ")
                        );

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                message,
                request.getRequestURI()
        );
    }

    /**
     * 지원하지 않는 HTTP Method로 요청했을 때 처리합니다.
     *
     * 예:
     * GET 전용 API를 POST로 호출한 경우
     */
    @ExceptionHandler(
            HttpRequestMethodNotSupportedException.class
    )
    public ResponseEntity<ErrorResponse>
    handleMethodNotAllowed(
            HttpRequestMethodNotSupportedException exception,
            HttpServletRequest request
    ) {

        return buildResponse(
                HttpStatus.METHOD_NOT_ALLOWED,
                "지원하지 않는 HTTP 메서드입니다.",
                request.getRequestURI()
        );
    }

    /**
     * 존재하지 않는 API 또는 리소스를 요청했을 때 처리합니다.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse>
    handleNoResourceFound(
            NoResourceFoundException exception,
            HttpServletRequest request
    ) {

        return buildResponse(
                HttpStatus.NOT_FOUND,
                "요청한 API를 찾을 수 없습니다.",
                request.getRequestURI()
        );
    }

    /**
     * 요청 Body가 없거나
     * JSON 형식이 올바르지 않을 때 처리합니다.
     *
     * 예:
     * POST 요청인데 Body를 보내지 않은 경우
     */
    @ExceptionHandler(
            HttpMessageNotReadableException.class
    )
    public ResponseEntity<ErrorResponse>
    handleMessageNotReadable(
            HttpMessageNotReadableException exception,
            HttpServletRequest request
    ) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "요청 본문이 없거나 JSON 형식이 올바르지 않습니다.",
                request.getRequestURI()
        );
    }

    /**
     * 요청한 데이터를 찾지 못했을 때 처리합니다.
     */
    @ExceptionHandler(
            EntityNotFoundException.class
    )
    public ResponseEntity<ErrorResponse>
    handleNotFound(
            EntityNotFoundException exception,
            HttpServletRequest request
    ) {

        return buildResponse(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request.getRequestURI()
        );
    }

    /**
     * 사용자의 요청값이 올바르지 않을 때 처리합니다.
     */
    @ExceptionHandler(
            IllegalArgumentException.class
    )
    public ResponseEntity<ErrorResponse>
    handleBadRequest(
            IllegalArgumentException exception,
            HttpServletRequest request
    ) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                request.getRequestURI()
        );
    }

    /**
     * OpenAI API 연결, 이미지 저장 등
     * 외부 처리 중 발생한 오류를 처리합니다.
     *
     * 상세 예외 메시지나 내부 경로는
     * 사용자에게 그대로 노출하지 않습니다.
     */
    @ExceptionHandler(
            IllegalStateException.class
    )
    public ResponseEntity<ErrorResponse>
    handleIllegalState(
            IllegalStateException exception,
            HttpServletRequest request
    ) {

        log.error(
                "외부 서비스 또는 파일 처리 오류가 발생했습니다."
                        + " path={}, exceptionType={}",
                request.getRequestURI(),
                exception.getClass()
                        .getSimpleName()
        );

        return buildResponse(
                HttpStatus.BAD_GATEWAY,
                "외부 서비스 처리 중 오류가 발생했습니다.",
                request.getRequestURI()
        );
    }

    /**
     * 예상하지 못한 서버 내부 오류를 처리합니다.
     *
     * 상세 예외 메시지나 스택트레이스는
     * 개인정보 및 내부 정보 노출 방지를 위해
     * 로그에 직접 기록하지 않습니다.
     */
    @ExceptionHandler(
            Exception.class
    )
    public ResponseEntity<ErrorResponse>
    handleUnexpected(
            Exception exception,
            HttpServletRequest request
    ) {

        log.error(
                "예상하지 못한 서버 오류가 발생했습니다."
                        + " path={}, exceptionType={}",
                request.getRequestURI(),
                exception.getClass()
                        .getSimpleName()
        );

        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "서버 처리 중 오류가 발생했습니다.",
                request.getRequestURI()
        );
    }

    /**
     * 공통 ErrorResponse 객체를 만드는 내부 메서드입니다.
     */
    private ResponseEntity<ErrorResponse>
    buildResponse(
            HttpStatus status,
            String message,
            String path
    ) {

        ErrorResponse response =
                new ErrorResponse(
                        LocalDateTime.now(),
                        status.value(),
                        status.getReasonPhrase(),
                        message,
                        path
                );

        return ResponseEntity
                .status(status)
                .body(response);
    }
}