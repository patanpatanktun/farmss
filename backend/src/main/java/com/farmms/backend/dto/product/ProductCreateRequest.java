package com.farmms.backend.dto.product;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 농자재 상품 등록 요청 데이터입니다.
 */
public record ProductCreateRequest(

        @NotBlank(
                message = "상품명을 입력해주세요."
        )
        @Size(
                max = 100,
                message = "상품명은 100자 이하여야 합니다."
        )
        String proName,

        @NotBlank(
                message = "상품 분류를 입력해주세요."
        )
        @Size(
                max = 50,
                message = "상품 분류는 50자 이하여야 합니다."
        )
        String category,

        @NotNull(
                message = "상품 가격을 입력해주세요."
        )
        @Min(
                value = 0,
                message = "상품 가격은 0원 이상이어야 합니다."
        )
        @Max(
                value = 1000000000,
                message = "상품 가격이 허용 범위를 초과했습니다."
        )
        Integer price,

        @NotBlank(
                message = "판매 업체명을 입력해주세요."
        )
        @Size(
                max = 100,
                message = "판매 업체명은 100자 이하여야 합니다."
        )
        String company,

        @NotBlank(
                message = "판매 업체 전화번호를 입력해주세요."
        )
        @Pattern(
                regexp = "^[0-9-]{9,13}$",
                message = "판매 업체 전화번호 형식이 올바르지 않습니다."
        )
        String companyPhone,

        @Size(
                max = 3000,
                message = "상품 설명은 3000자 이하여야 합니다."
        )
        String proDescription

) {
}