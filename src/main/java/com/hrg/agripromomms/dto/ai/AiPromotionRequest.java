package com.hrg.agripromomms.dto.ai;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * GPT-4.1에 전달할 농자재 홍보 콘텐츠 생성 요청입니다.
 *
 * 상품 정보를 바탕으로 다음 내용을 생성합니다.
 * 1. 홍보 문자 제목
 * 2. 홍보 문자 내용
 * 3. 이미지 생성용 프롬프트
 * 4. 실제 홍보 이미지
 */
public record AiPromotionRequest(

        @NotBlank(message = "상품명은 필수입니다.")
        @Size(max = 100, message = "상품명은 100자 이하여야 합니다.")
        String productName,

        @NotBlank(message = "카테고리는 필수입니다.")
        @Size(max = 50, message = "카테고리는 50자 이하여야 합니다.")
        String category,

        @Min(value = 0, message = "가격은 0원 이상이어야 합니다.")
        Integer price,

        @Size(max = 100, message = "제조사명은 100자 이하여야 합니다.")
        String company,

        @Size(max = 100, message = "작물 정보는 100자 이하여야 합니다.")
        String crop,

        @Size(max = 1000, message = "상품 설명은 1000자 이하여야 합니다.")
        String productDescription,

        @NotBlank(message = "대상 고객은 필수입니다.")
        @Size(max = 200, message = "대상 고객은 200자 이하여야 합니다.")
        String targetCustomer,

        @NotBlank(message = "홍보 목적은 필수입니다.")
        @Size(max = 300, message = "홍보 목적은 300자 이하여야 합니다.")
        String promotionPurpose,

        @Size(max = 100, message = "문체는 100자 이하여야 합니다.")
        String tone,

        @Size(max = 500, message = "추가 요청은 500자 이하여야 합니다.")
        String additionalRequest,

        /**
         * true면 홍보 문구 생성 후 실제 이미지까지 생성합니다.
         * 값을 보내지 않으면 기본값은 true입니다.
         */
        Boolean generateImage,

        /**
         * 생성할 이미지 크기입니다.
         */
        @Pattern(
                regexp = "^(1024x1024|1024x1536|1536x1024|auto)$",
                message = "이미지 크기는 1024x1024, 1024x1536, 1536x1024, auto 중 하나여야 합니다."
        )
        String imageSize
) {

    /**
     * 요청 JSON에서 이미지 옵션을 생략했을 때 적용할 기본값입니다.
     */
    public AiPromotionRequest {

        // generateImage를 보내지 않으면 이미지까지 생성합니다.
        if (generateImage == null) {
            generateImage = true;
        }

        // imageSize를 보내지 않으면 정사각형 이미지를 생성합니다.
        if (imageSize == null || imageSize.isBlank()) {
            imageSize = "1024x1024";
        }
    }

    /**
     * 서비스 코드에서 이미지 생성 여부를 편리하게 확인합니다.
     */
    public boolean shouldGenerateImage() {
        return Boolean.TRUE.equals(generateImage);
    }

    /**
     * 기본값이 적용된 이미지 크기를 반환합니다.
     */
    public String resolvedImageSize() {
        return imageSize;
    }
}