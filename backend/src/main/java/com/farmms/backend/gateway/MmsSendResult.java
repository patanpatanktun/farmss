package com.farmms.backend.gateway;

/**
 * 문자 발송 업체가 반환한 MMS 접수 결과를 표현합니다.
 */
public record MmsSendResult(
        boolean success,
        String providerMessageId,
        String errorMessage) {

    /**
     * 발송 요청 접수 성공 결과를 생성합니다.
     */
    public static MmsSendResult success(String providerMessageId) {
        return new MmsSendResult(true, providerMessageId, null);
    }

    /**
     * 발송 요청 실패 결과를 생성합니다.
     */
    public static MmsSendResult fail(String errorMessage) {
        return new MmsSendResult(false, null, errorMessage);
    }
}
