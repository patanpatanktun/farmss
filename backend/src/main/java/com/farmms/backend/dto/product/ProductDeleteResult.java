package com.farmms.backend.dto.product;

import java.util.List;

/**
 * 상품 삭제 후 서버에서 실제로 제거해야 하는
 * 이미지 파일 주소를 전달하는 DTO입니다.
 */
public record ProductDeleteResult(

        /**
         * 상품에 등록됐던 참고 이미지 주소입니다.
         */
        String referenceImageUrl,

        /**
         * 해당 상품으로 생성한 OpenAI 이미지 주소 목록입니다.
         */
        List<String> generatedImageUrls

) {

    public ProductDeleteResult {
        generatedImageUrls =
                generatedImageUrls == null
                        ? List.of()
                        : List.copyOf(
                                generatedImageUrls
                        );
    }
}