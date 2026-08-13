package com.farmms.backend.dto;

import java.time.LocalDateTime;

import com.farmms.backend.domain.mms.MmsHistory;

/**
 * 고객 한 명에 대한 MMS 발송 결과를 반환하는 DTO입니다.
 */
public record MmsHistoryResponse(

        Long mmsNum,

        /**
         * 생성 이미지가 삭제된 경우 NULL일 수 있습니다.
         */
        Long imageId,

        Long conNum,

        /**
         * 발송 당시 상품명입니다.
         */
        String productName,

        /**
         * 발송 당시 사용한 이미지 주소입니다.
         */
        String imageUrl,

        /**
         * 발송한 MMS 문구입니다.
         */
        String mmsText,

        /**
         * MMS 발송 상태입니다.
         *
         * REQUESTED, RESERVED, SUCCESS, FAILED
         */
        String sendStatus,

        /**
         * 예약 발송 여부입니다.
         *
         * Y = 예약 발송
         * N = 즉시 발송
         */
        String reserveFlag,

        /**
         * 발송 요청 또는 상태 변경 시간입니다.
         */
        LocalDateTime sendDate,

        /**
         * 실제 예약 발송 예정 시간입니다.
         *
         * 즉시 발송이면 NULL입니다.
         */
        LocalDateTime reserveDate

) {

    /**
     * MmsHistory Entity를 응답 DTO로 변환합니다.
     */
    public static MmsHistoryResponse from(
            MmsHistory history
    ) {
        return new MmsHistoryResponse(
                history.getMmsNum(),
                history.getImageId(),
                history.getConNum(),
                history.getProductName(),
                history.getImageUrl(),
                history.getMmsText(),
                history.getSendStatus(),
                history.getReserveFlag(),
                history.getSendDate(),
                history.getReserveDate()
        );
    }
}