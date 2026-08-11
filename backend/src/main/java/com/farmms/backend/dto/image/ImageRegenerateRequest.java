package com.farmms.backend.dto.image;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 기존 이미지 재생성 요청 데이터입니다.
 */
public record ImageRegenerateRequest(

        /**
         * 이미지 재생성에 사용할 새로운 프롬프트입니다.
         */
        @NotBlank(message = "재생성 프롬프트는 필수입니다.")
        @Size(max = 3000, message = "프롬프트는 3000자 이하여야 합니다.")
        String promptText

) {
}