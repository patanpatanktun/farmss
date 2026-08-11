package com.farmms.backend.dto.product;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 농자재 상품 수정 요청 데이터입니다.
 */
public record ProductUpdateRequest(

        @NotBlank(message = "상품명을 입력해주세요.")
        @Size(
                max = 100,
                message = "상품명은 100자 이하여야 합니다."
        )
        String proName,

        @NotBlank(message = "상품 분류를 입력해주세요.")
        @Size(
                max = 50,
                message = "상품 분류는 50자 이하여야 합니다."
        )
        String category,

        @NotNull(message = "상품 가격을 입력해주세요.")
        @Min(
                value = 0,
                message = "상품 가격은 0원 이상이어야 합니다."
        )
        @Max(
                value = 1000000000,
                message = "상품 가격이 허용 범위를 초과했습니다."
        )
        Integer price,

        @NotBlank(message = "제조사를 입력해주세요.")
        @Size(
                max = 100,
                message = "제조사는 100자 이하여야 합니다."
        )
        String company,

        @Size(
                max = 3000,
                message = "상품 설명은 3000자 이하여야 합니다."
        )
        String proDescription

) {
}