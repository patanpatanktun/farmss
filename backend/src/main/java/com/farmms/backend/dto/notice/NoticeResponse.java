package com.farmms.backend.dto.notice;

import java.time.LocalDateTime;

import com.farmms.backend.domain.notice.Notice;

public record NoticeResponse(
        Long boardNum,
        String title,
        String content,
        LocalDateTime createDate
) {
    public static NoticeResponse from(Notice notice) {
        return new NoticeResponse(
                notice.getBoardNum(),
                notice.getTitle(),
                notice.getContent(),
                notice.getCreateDate()
        );
    }
}
