package com.farmms.backend.gateway;

public interface MmsGateway {

    /**
     * MMS 발송 또는 예약발송을 요청합니다.
     */
    MmsSendResult send(
            MmsSendCommand command
    );

    /**
     * 문자 업체에서 실제 발송 결과를 확인합니다.
     *
     * Mock 구현체가 바로 깨지지 않도록
     * 기본값은 UNKNOWN으로 지정합니다.
     */
    default MmsDeliveryStatus getDeliveryStatus(
            String providerMessageId
    ) {
        return MmsDeliveryStatus.UNKNOWN;
    }
}