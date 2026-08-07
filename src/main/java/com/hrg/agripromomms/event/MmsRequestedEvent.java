package com.hrg.agripromomms.event;

import java.util.List;

/** DB 커밋 후 실제 문자 발송을 시작하기 위한 이벤트입니다. */
public record MmsRequestedEvent(
        List<Long> mmsNums,
        String title,
        String content) {
}
