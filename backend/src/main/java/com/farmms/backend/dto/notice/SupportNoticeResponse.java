package com.farmms.backend.dto.notice;

import java.time.LocalDateTime;

import com.farmms.backend.domain.notice.SupportNotice;

/**
 * 정부 지원사업 공고 정보를
 * 프론트엔드에 반환하는 DTO입니다.
 */
public record SupportNoticeResponse(

        /**
         * 공고 번호
         */
        Long noticeId,

        /**
         * 공고 수집 일시
         */
        LocalDateTime crawledAt,

        /**
         * 원본 공고 URL
         */
        String noticeUrl,

        /**
         * 공고 출처명
         */
        String sourceName,

        /**
         * 공고 요약
         */
        String summary,

        /**
         * 공고 제목
         */
        String title

) {

    /**
     * SupportNotice Entity를
     * 응답 DTO로 변환합니다.
     */
    public static SupportNoticeResponse from(
            SupportNotice notice
    ) {
        return new SupportNoticeResponse(
                notice.getNoticeId(),
                notice.getCrawledAt(),
                notice.getNoticeUrl(),
                notice.getSourceName(),
                notice.getSummary(),
                notice.getTitle()
        );
    }
}