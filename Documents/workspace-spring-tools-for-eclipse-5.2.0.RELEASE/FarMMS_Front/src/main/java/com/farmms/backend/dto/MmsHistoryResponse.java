package com.farmms.backend.dto;

/**
 * MMS 발송 이력을 반환하는 DTO입니다.
 */
public record MmsHistoryResponse(

        Long mmsNum,
        Long imageId,
        String mmsText,
        String sendStatus,
        String reserveFlag

) {
}