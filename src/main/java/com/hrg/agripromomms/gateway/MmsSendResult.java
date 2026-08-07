package com.hrg.agripromomms.gateway;

/** 외부 MMS 업체의 발송 결과를 공통 형식으로 표현합니다. */
public record MmsSendResult(
        boolean success,
        String providerMessageId,
        String errorMessage) {

    public static MmsSendResult success(String providerMessageId) {
        return new MmsSendResult(true, providerMessageId, null);
    }

    public static MmsSendResult fail(String errorMessage) {
        return new MmsSendResult(false, null, errorMessage);
    }
}
