package com.hrg.agripromomms.dto;

import java.time.LocalDateTime;

/** 마이페이지 MMS 발송 이력 한 행을 반환합니다. */
public record MmsHistoryResponse(
        Long mmsNum,
        Long imageNum,
        Long contactNum,
        String contactName,
        String maskedPhone,
        LocalDateTime sendDate,
        String sendStatus,
        String reserveFlag) {
}
