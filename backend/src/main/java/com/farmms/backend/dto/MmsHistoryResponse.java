package com.farmms.backend.dto;

import java.time.LocalDateTime;

import com.farmms.backend.domain.mms.MmsHistory;

/**
 * 고객 한 명에 대한 MMS 발송 결과를 반환하는 DTO입니다.
 */
public record MmsHistoryResponse(

        Long mmsNum,

        /*
         * 생성 이미지가 삭제된 경우에는 NULL이 될 수 있습니다.
         */
        Long imageId,

        Long conNum,

        /*
         * 발송 당시 상품명입니다.
         */
        String productName,

        /*
         * 발송 당시 사용한 이미지 주소입니다.
         */
        String imageUrl,

        String mmsText,

        String sendStatus,

        String reserveFlag,

        LocalDateTime sendDate

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
                history.getSendDate()
        );
    }
}