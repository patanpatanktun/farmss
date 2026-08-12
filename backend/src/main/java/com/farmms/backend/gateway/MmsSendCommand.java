package com.farmms.backend.gateway;

import java.time.OffsetDateTime;

/**
 * MmsGateway에 전달하는 실제 MMS 발송 정보입니다.
 *
 * 즉시발송과 예약발송에 필요한 정보를
 * 하나의 객체에 담아서 Gateway에 전달합니다.
 */
public record MmsSendCommand(

        /**
         * SOLAPI에 등록된 발신번호입니다.
         */
        String fromNumber,

        /**
         * MMS를 받을 고객의 전화번호입니다.
         */
        String toNumber,

        /**
         * MMS 제목입니다.
         */
        String title,

        /**
         * MMS 본문 내용입니다.
         */
        String content,

        /**
         * MMS에 첨부할 이미지 주소입니다.
         */
        String imageUrl,

        /**
         * 예약발송 시간입니다.
         *
         * null
         * → 즉시발송
         *
         * 값이 존재
         * → 예약발송
         *
         * 예:
         * 2026-08-12T09:00:00+09:00
         */
        OffsetDateTime scheduledDate

) {
}