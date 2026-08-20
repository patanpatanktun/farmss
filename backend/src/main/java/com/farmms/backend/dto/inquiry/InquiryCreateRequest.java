package com.farmms.backend.dto.inquiry;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 새로운 문의 등록 요청 DTO입니다.
 */
public record InquiryCreateRequest(

        /**
         * 문의 제목입니다.
         */
        @NotBlank(
                message = "문의 제목을 입력해주세요."
        )
        @Size(
                max = 200,
                message = "문의 제목은 200자 이하여야 합니다."
        )
        String title,

        /**
         * 문의 내용입니다.
         */
        @NotBlank(
                message = "문의 내용을 입력해주세요."
        )
        String content
) {
}