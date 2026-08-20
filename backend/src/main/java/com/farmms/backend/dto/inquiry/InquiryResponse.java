package com.farmms.backend.dto.inquiry;

import java.time.LocalDateTime;

import com.farmms.backend.domain.inquiry.Inquiry;

/**
 * 문의사항 응답 DTO입니다.
 */
public record InquiryResponse(

        /**
         * 문의 고유 번호입니다.
         *
         * DB의 board_num을 프론트에서
         * inquiryNum이라는 이름으로 사용합니다.
         */
        Long inquiryNum,

        /**
         * 문의 제목입니다.
         */
        String title,

        /**
         * 문의 내용입니다.
         */
        String content,

        /**
         * 문의 작성일입니다.
         */
        LocalDateTime createDate,

        /**
         * 답변 처리 상태입니다.
         *
         * WAITING 또는 ANSWERED입니다.
         */
        String status,

        /**
         * 운영자 답변 내용입니다.
         *
         * 답변 전에는 null입니다.
         */
        String answer
) {

    /**
     * Inquiry 엔티티를 프론트 응답 형태로 변환합니다.
     */
    public static InquiryResponse from(
            Inquiry inquiry
    ) {
        return new InquiryResponse(
                inquiry.getBoardNum(),
                inquiry.getTitle(),
                inquiry.getContent(),
                inquiry.getCreateDate(),
                inquiry.getAnswerStatus(),
                inquiry.getAnswerContent()
        );
    }
}