package com.farmms.backend.dto.image;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * AI 홍보 이미지 생성을 요청할 때 사용하는 DTO입니다.
 */
public record ImageGenerateRequest(

        @NotNull(message = "고객을 선택해야 합니다.")
        Long conNum,

        @NotNull(message = "상품을 선택해야 합니다.")
        Long proNum,

        @NotBlank(message = "프롬프트는 필수입니다.")
        @Size(
                max = 3000,
                message = "프롬프트는 3000자 이하로 입력하세요."
        )
        String promptText

) {
}