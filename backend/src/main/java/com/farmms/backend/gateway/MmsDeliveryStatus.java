package com.farmms.backend.gateway;

/**
 * 문자 업체에서 확인한 실제 발송 상태입니다.
 */
public enum MmsDeliveryStatus {

    /**
     * 예약 또는 발송 대기 중입니다.
     */
    PENDING,

    /**
     * 실제 발송에 성공했습니다.
     */
    SUCCESS,

    /**
     * 실제 발송에 실패했습니다.
     */
    FAILED,

    /**
     * 상태를 확인할 수 없습니다.
     */
    UNKNOWN
}