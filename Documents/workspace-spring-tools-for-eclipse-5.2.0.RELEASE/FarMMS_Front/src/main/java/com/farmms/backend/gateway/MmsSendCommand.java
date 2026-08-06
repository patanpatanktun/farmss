package com.farmms.backend.gateway;

/**
 * MmsGateway에 전달하는 실제 MMS 발송 정보입니다.
 */
public record MmsSendCommand(
        String fromNumber,
        String toNumber,
        String title,
        String content,
        String imageUrl) {
}
