package com.farmms.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * MMS 일괄 발송 결과를 반환하는 DTO입니다.
 */
@Getter
@AllArgsConstructor
public class MmsSendResponse {

    // MMS 발송을 요청한 전체 고객 수입니다.
    private int totalCount;

    // Mock MMS 발송 성공 건수입니다.
    private int successCount;

    // Mock MMS 발송 실패 건수입니다.
    private int failCount;

    // 전체 발송 처리 상태입니다.
    private String status;

    // 사용자에게 보여줄 결과 메시지입니다.
    private String message;
}