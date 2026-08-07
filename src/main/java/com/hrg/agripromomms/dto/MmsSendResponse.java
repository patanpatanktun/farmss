package com.hrg.agripromomms.dto;

import java.util.List;

/** MMS 발송 접수 결과입니다. */
public record MmsSendResponse(
        List<Long> mmsNums,
        int requestedCount,
        String status,
        String message) {
}
