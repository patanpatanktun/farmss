package com.hrg.agripromomms.gateway;

/**
 * SOLAPI에 전달할 수신자 한 명의 문자 발송 정보입니다.
 *
 * 현재 단계에서는 이미지 첨부를 하지 않으므로 제목과 본문만 전달합니다.
 * 실제 MMS 이미지를 추가할 때 imageId 필드를 확장하면 됩니다.
 */
public record MmsSendCommand(
        String toNumber,
        String title,
        String content) {
}
